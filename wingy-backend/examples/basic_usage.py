"""
Example: Basic usage of Wingy with a single query.
"""

import asyncio
from agents import Runner

from wingy.agents import orchestrator_agent
from wingy.sessions import SessionManager
from wingy.utils import setup_logging, load_config


async def main():
    """Simple example of using Wingy."""
    # Setup
    setup_logging(level="INFO")
    config = load_config()
    
    # Create session
    session_manager = SessionManager("example_user", config["session_db_path"])
    
    # Run a query
    result = await Runner.run(
        orchestrator_agent,
        "Teach me how to improve at League of Legends",
        session=session_manager.session,
    )
    
    print(f"\nResponse: {result.final_output}")
    print(f"Agent used: {result.last_agent.name}")


if __name__ == "__main__":
    asyncio.run(main())
