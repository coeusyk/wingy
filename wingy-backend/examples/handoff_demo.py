"""
Example: Demonstrating agent handoffs.
"""

import asyncio
from agents import Runner

from wingy.agents import orchestrator_agent
from wingy.sessions import SessionManager
from wingy.utils import setup_logging, load_config


async def main():
    """Demonstrate how agents hand off to specialists."""
    setup_logging(level="INFO")
    config = load_config()
    
    session_manager = SessionManager("handoff_demo", config["session_db_path"])
    
    queries = [
        "What's the best strategy to climb ranked in Valorant?",  # → Game Strategy
        "Teach me the basics of Counter-Strike movement",          # → Tutorial
        "Quick tip for improving my aim",                          # → Tips
        "What does 'economy' mean in tactical shooters?",          # → Q&A
    ]
    
    print("\n🎮 Agent Handoff Demonstration\n")
    
    for query in queries:
        print(f"\n{'='*60}")
        print(f"Query: {query}")
        print(f"{'='*60}\n")
        
        result = await Runner.run(
            orchestrator_agent,
            query,
            session=session_manager.session,
        )
        
        print(f"✓ Handled by: {result.last_agent.name}")
        print(f"Response: {result.final_output[:200]}...")  # First 200 chars
        
        await asyncio.sleep(0.5)


if __name__ == "__main__":
    asyncio.run(main())
