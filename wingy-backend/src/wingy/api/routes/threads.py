"""API routes for thread management."""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List

from ...sessions.db_manager import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/threads", tags=["threads"])


# Request/Response Models
class CreateThreadRequest(BaseModel):
    """Request model for creating a thread."""
    user_id: str = Field(..., description="User identifier")
    title: Optional[str] = Field(None, description="Thread title")


class ThreadResponse(BaseModel):
    """Response model for thread data."""
    id: str = Field(..., description="Thread identifier")
    user_id: str = Field(..., description="User identifier")
    title: str = Field(..., description="Thread title")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Last update timestamp")


class UpdateThreadTitleRequest(BaseModel):
    """Request model for updating thread title."""
    title: str = Field(..., description="New thread title")


class MessageResponse(BaseModel):
    """Response model for message data."""
    id: str = Field(..., description="Message identifier")
    thread_id: str = Field(..., description="Thread identifier")
    role: str = Field(..., description="Message role (user or assistant)")
    content: str = Field(..., description="Message content")
    created_at: str = Field(..., description="Creation timestamp")


@router.post("/create", response_model=ThreadResponse)
async def create_thread(request: CreateThreadRequest) -> ThreadResponse:
    """
    Create a new chat thread for a user.
    
    Args:
        request: Thread creation data
    """
    try:
        db = get_db()
        
        # Verify user exists
        user = db.get_user(request.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create thread
        thread = db.create_thread(
            user_id=request.user_id,
            title=request.title
        )
        
        return ThreadResponse(**thread)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating thread: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create thread: {str(e)}"
        )


@router.get("/user/{user_id}", response_model=List[ThreadResponse])
async def get_user_threads(user_id: str) -> List[ThreadResponse]:
    """
    Get all threads for a user.
    
    Args:
        user_id: User identifier
    """
    try:
        db = get_db()
        
        # Verify user exists
        user = db.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get threads
        threads = db.get_user_threads(user_id)
        
        return [ThreadResponse(**thread) for thread in threads]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user threads: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get user threads: {str(e)}"
        )


@router.get("/{thread_id}", response_model=ThreadResponse)
async def get_thread(thread_id: str) -> ThreadResponse:
    """
    Get thread by ID.
    
    Args:
        thread_id: Thread identifier
    """
    try:
        db = get_db()
        thread = db.get_thread(thread_id)
        
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found")
        
        return ThreadResponse(**thread)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting thread: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get thread: {str(e)}"
        )


@router.get("/{thread_id}/messages", response_model=List[MessageResponse])
async def get_thread_messages(
    thread_id: str,
    limit: Optional[int] = None
) -> List[MessageResponse]:
    """
    Get all messages in a thread.
    
    Args:
        thread_id: Thread identifier
        limit: Optional maximum number of messages to return
    """
    try:
        db = get_db()
        
        # Verify thread exists
        thread = db.get_thread(thread_id)
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found")
        
        # Get messages
        messages = db.get_thread_messages(thread_id, limit=limit)
        
        return [MessageResponse(**msg) for msg in messages]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting thread messages: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get thread messages: {str(e)}"
        )


@router.put("/{thread_id}/title")
async def update_thread_title(thread_id: str, request: UpdateThreadTitleRequest):
    """
    Update thread title.
    
    Args:
        thread_id: Thread identifier
        request: New title data
    """
    try:
        db = get_db()
        
        # Verify thread exists
        thread = db.get_thread(thread_id)
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found")
        
        # Update title
        success = db.update_thread_title(thread_id, request.title)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update title")
        
        return {
            "message": "Thread title updated successfully",
            "thread_id": thread_id,
            "title": request.title
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating thread title: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update thread title: {str(e)}"
        )


@router.delete("/{thread_id}")
async def delete_thread(thread_id: str):
    """
    Delete a thread and all its messages.
    
    Args:
        thread_id: Thread identifier
    """
    try:
        db = get_db()
        
        # Verify thread exists
        thread = db.get_thread(thread_id)
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found")
        
        # Delete thread
        success = db.delete_thread(thread_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete thread")
        
        return {
            "message": "Thread deleted successfully",
            "thread_id": thread_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting thread: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete thread: {str(e)}"
        )
