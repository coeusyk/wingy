"""Chat API routes for agent interaction."""

import logging
from dotenv import load_dotenv

from pathlib import Path
from typing import AsyncIterator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from agents import Runner, SQLiteSession

from ...agents.orchestrator import orchestrator_agent
from ...sessions.db_manager import get_db as get_sessions_db

logger = logging.getLogger(__name__)
load_dotenv()

router = APIRouter(prefix="/chat", tags=["chat"])

# Ensure data directory exists
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)
DB_PATH = DATA_DIR / "agent_sessions.db"


# Request/Response Models
class ChatMessage(BaseModel):
    """A single chat message."""
    role: str = Field(..., description="Role of the message sender (user or assistant)")
    content: str = Field(..., description="Content of the message")


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    message: str = Field(..., description="User's message to the agent")
    session_id: str = Field(..., description="Unique session identifier for the conversation (deprecated, use thread_id)")
    thread_id: str | None = Field(None, description="Thread identifier for multi-thread support")
    user_id: str | None = Field(None, description="Optional user identifier")
    games: list[str] | None = Field(None, description="List of games the user plays")
    preferences: list[str] | None = Field(None, description="User's assistance preferences")


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    message: str = Field(..., description="Agent's response message")
    session_id: str = Field(..., description="Session identifier")
    agent_name: str | None = Field(None, description="Name of the agent that responded")


class ChatHistoryResponse(BaseModel):
    """Response model for chat history."""
    session_id: str
    messages: list[ChatMessage]
    count: int


@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest) -> ChatResponse:
    """
    Send a message to the agent and get a response.
    
    This endpoint:
    1. Creates or loads the user's session/thread
    2. Runs the orchestrator agent with the user's message
    3. Returns the agent's response
    4. Saves messages to database if thread_id is provided
    
    The orchestrator will automatically:
    - Hand off to specialized agents as needed
    - Maintain conversation context
    - Apply guardrails for safety
    """
    try:
        # Use thread_id if provided, otherwise fall back to session_id
        session_id = request.thread_id or request.session_id
        logger.info(f"Received message for session {session_id}")
        
        # Create SQLite session for conversation history (used by agents library)
        agent_session = SQLiteSession(
            session_id=session_id,
            db_path=str(DB_PATH)
        )
        
        # Prepare context from user profile
        context_message = ""
        if request.games:
            games_list = ", ".join(request.games)
            context_message += f"User plays: {games_list}. "
        if request.preferences:
            prefs_list = ", ".join(request.preferences)
            context_message += f"User preferences: {prefs_list}. "
        
        # Combine context with user message
        full_message = request.message
        if context_message:
            full_message = f"[Context: {context_message}]\n\nUser: {request.message}"
        
        # Run the orchestrator agent
        result = await Runner.run(
            orchestrator_agent,
            input=full_message,
            session=agent_session,
        )
        
        # Extract response
        response_text = result.final_output or "I'm sorry, I couldn't process that request."
        
        # Save messages to database if thread_id is provided
        if request.thread_id:
            sessions_db = get_sessions_db()
            
            # Verify thread exists
            thread = sessions_db.get_thread(request.thread_id)
            if thread:
                # Save user message
                sessions_db.add_message(
                    thread_id=request.thread_id,
                    role="user",
                    content=request.message
                )
                
                # Save agent response
                sessions_db.add_message(
                    thread_id=request.thread_id,
                    role="assistant",
                    content=response_text
                )
                logger.info(f"Messages saved to thread: {request.thread_id}")
        
        logger.info(f"Agent response generated for session {session_id}")
        
        return ChatResponse(
            message=response_text,
            session_id=session_id,
            agent_name="Wingy",
        )
        
    except Exception as e:
        logger.error(f"Error processing chat message: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process message: {str(e)}"
        )


@router.post("/message/stream")
async def send_message_stream(request: ChatRequest):
    """
    Send a message to the agent and stream the response in real-time.
    
    This endpoint streams the agent's response token-by-token for a better UX.
    """
    async def generate_stream() -> AsyncIterator[str]:
        try:
            logger.info(f"Starting stream for session {request.session_id}")
            
            # Create SQLite session
            agent_session = SQLiteSession(
                session_id=request.session_id,
                db_path=str(DB_PATH)
            )
            
            # Prepare context
            context_message = ""
            if request.games:
                games_list = ", ".join(request.games)
                context_message += f"User plays: {games_list}. "
            if request.preferences:
                prefs_list = ", ".join(request.preferences)
                context_message += f"User preferences: {prefs_list}. "
            
            full_message = request.message
            if context_message:
                full_message = f"[Context: {context_message}]\n\nUser: {request.message}"
            
            # Run agent with streaming
            from openai.types.responses import ResponseTextDeltaEvent
            
            result = Runner.run_streamed(
                orchestrator_agent,
                input=full_message,
                session=agent_session,
            )
            
            async for event in result.stream_events():
                if event.type == "raw_response_event":
                    if isinstance(event.data, ResponseTextDeltaEvent):
                        # Stream text delta
                        yield f"data: {event.data.delta}\n\n"
            
            # Send completion marker
            yield "data: [DONE]\n\n"
            
            logger.info(f"Stream completed for session {request.session_id}")
            
        except Exception as e:
            logger.error(f"Error in stream: {e}", exc_info=True)
            yield f"data: [ERROR] {str(e)}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.get("/history/{session_id}", response_model=ChatHistoryResponse)
async def get_chat_history(
    session_id: str,
    limit: int | None = None
) -> ChatHistoryResponse:
    """
    Retrieve chat history for a session.
    
    Args:
        session_id: The session identifier
        limit: Optional maximum number of messages to return
    """
    try:
        agent_session = SQLiteSession(
            session_id=session_id,
            db_path=str(DB_PATH)
        )
        
        # Get items from session
        items = await agent_session.get_items(limit=limit)
        
        # Convert to ChatMessage format
        messages = []
        for item in items:
            if isinstance(item, dict):
                # Extract content as string
                content = item.get("content", "")
                if isinstance(content, str):
                    content_str = content
                else:
                    # Handle non-string content
                    content_str = str(content)
                
                messages.append(ChatMessage(
                    role=item.get("role", "user"),
                    content=content_str,
                ))
        
        return ChatHistoryResponse(
            session_id=session_id,
            messages=messages,
            count=len(messages),
        )
        
    except Exception as e:
        logger.error(f"Error retrieving chat history: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve chat history: {str(e)}"
        )


@router.delete("/history/{session_id}")
async def clear_chat_history(session_id: str):
    """
    Clear chat history for a session.
    
    Args:
        session_id: The session identifier
    """
    try:
        agent_session = SQLiteSession(
            session_id=session_id,
            db_path=str(DB_PATH)
        )
        
        # Clear all items from the session
        await agent_session.clear_session()
        
        return {"message": "Chat history cleared successfully", "session_id": session_id}
        
    except Exception as e:
        logger.error(f"Error clearing chat history: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clear chat history: {str(e)}"
        )
