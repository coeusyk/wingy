"""
Wingy - Intelligent Game Helper and Learning Assistant

Example usage demonstrating the multi-agent system with handoffs, guardrails, and sessions.
"""

import asyncio
import logging
from agents import Runner
from agents.exceptions import InputGuardrailTripwireTriggered

from wingy.agents import orchestrator_agent
from wingy.sessions import SessionManager
from wingy.utils import setup_logging, load_config


async def interactive_mode(session_manager: SessionManager):
    """Run Wingy in interactive mode."""
    print("\n" + "="*60)
    print("🎮 Welcome to Wingy - Your Game Learning Assistant!")
    print("="*60)
    print("\nType 'quit' or 'exit' to end the session")
    print("Type 'clear' to start a new conversation")
    print("Type 'profile' to view your profile\n")
    
    while True:
        try:
            # Get user input
            user_input = input("\nYou: ").strip()
            
            if not user_input:
                continue
            
            # Handle commands
            if user_input.lower() in ['quit', 'exit']:
                print("\n👋 Thanks for using Wingy! Happy gaming!")
                break
            
            if user_input.lower() == 'clear':
                await session_manager.clear_session()
                print("\n✅ Session cleared. Starting fresh conversation.")
                continue
            
            if user_input.lower() == 'profile':
                print("\n" + "="*60)
                print("📊 Your Profile")
                print("="*60)
                print(session_manager.get_context_summary())
                print("="*60)
                continue
            
            # Run the agent
            print("\n🤖 Wingy: ", end="", flush=True)
            
            try:
                result = await Runner.run(
                    orchestrator_agent,
                    user_input,
                    session=session_manager.session,
                )

                # Record interaction
                session_manager.record_interaction(result.last_agent.name)
                
                # Print response
                print(result.final_output)
                
                # Show which agent handled the request (for demo purposes)
                if result.last_agent.name != "Wingy Orchestrator":
                    print(f"\n[Handled by: {result.last_agent.name}]")

            except InputGuardrailTripwireTriggered as e:
                print(
                    "\n⚠️  I can only help with gaming-related questions. "
                    "Please ask about games, strategies, or learning to play!"
                )
                logging.warning(f"Guardrail triggered: {e}")
        
        except KeyboardInterrupt:
            print("\n\n👋 Session interrupted. Thanks for using Wingy!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            logging.error(f"Error in interactive mode: {e}", exc_info=True)


async def demo_mode(session_manager: SessionManager):
    """Run a demo showcasing Wingy's capabilities."""
    print("\n" + "="*60)
    print("🎮 Wingy Demo - Multi-Agent Game Assistant")
    print("="*60)
    
    demo_queries = [
        {
            "query": "Hi! I want to learn League of Legends",
            "description": "Initial greeting + onboarding",
        },
        {
            "query": "Teach me how to play support role",
            "description": "Tutorial request → Tutorial Agent",
        },
        {
            "query": "What's the best strategy to win lane as support?",
            "description": "Strategy question → Game Strategy Agent",
        },
        {
            "query": "Give me a quick tip for improving my warding",
            "description": "Quick tip → Tips Agent",
        },
        {
            "query": "What does crowd control mean in League?",
            "description": "Factual question → Q&A Agent",
        },
    ]
    
    for i, item in enumerate(demo_queries, 1):
        print(f"\n{'─'*60}")
        print(f"Demo {i}/{len(demo_queries)}: {item['description']}")
        print(f"{'─'*60}")
        print(f"User: {item['query']}")
        print(f"\n🤖 Wingy: ", end="", flush=True)
        
        try:
            result = await Runner.run(
                orchestrator_agent,
                item['query'],
                session=session_manager.session,
            )
            
            # Record interaction
            session_manager.record_interaction(result.last_agent.name)
            
            # Print response
            print(result.final_output)
            print(f"\n[Agent: {result.last_agent.name}]")

            # Pause between queries
            await asyncio.sleep(1)
            
        except InputGuardrailTripwireTriggered:
            print("⚠️ Guardrail triggered - query blocked")
        except Exception as e:
            print(f"❌ Error: {e}")
            logging.error(f"Error in demo mode: {e}", exc_info=True)
    
    print("\n" + "="*60)
    print("📊 Session Summary")
    print("="*60)
    print(session_manager.get_context_summary())
    print("="*60)


async def main():
    """Main entry point for Wingy."""
    # Setup logging
    setup_logging(level="INFO")
    
    # Load configuration
    try:
        config = load_config()
        logging.info("Configuration loaded successfully")
        logging.info(f"Using Ollama at {config['ollama_base_url']} with model {config['llm_model']}")
    except ValueError as e:
        logging.error(f"Configuration error: {e}")
        print(f"\n❌ {e}")
        print("\nPlease ensure Ollama is running at http://localhost:11434")
        print("Or set OLLAMA_BASE_URL and LLM_MODEL in your .env file")
        return
    
    # Create session manager
    session_manager = SessionManager(
        user_id="demo_user",
        db_path=config["session_db_path"],
    )
    
    # Check command line arguments for mode
    import sys
    mode = sys.argv[1] if len(sys.argv) > 1 else "interactive"
    
    if mode == "demo":
        await demo_mode(session_manager)
    else:
        await interactive_mode(session_manager)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
