"""
Example: Session management and user profiles.
"""

import asyncio
from agents import Runner

from wingy.agents import orchestrator_agent
from wingy.sessions import SessionManager, SkillLevel
from wingy.utils import setup_logging, load_config


async def main():
    """Demonstrate session persistence and user profiles."""
    setup_logging(level="INFO")
    config = load_config()
    
    # Create session with user profile
    session_manager = SessionManager("profile_demo", config["session_db_path"])
    
    # Update user profile
    session_manager.update_profile(
        game_name="League of Legends",
        skill_level=SkillLevel.INTERMEDIATE,
    )
    
    print("\n👤 User Profile Demo\n")
    print("="*60)
    print(session_manager.get_context_summary())
    print("="*60)
    
    # First conversation
    print("\n📝 First Query:")
    result = await Runner.run(
        orchestrator_agent,
        "I want to improve my support gameplay",
        session=session_manager.session,
    )
    print(f"Response: {result.final_output[:200]}...")
    
    # Second conversation - agent remembers context
    print("\n📝 Second Query (with context):")
    result = await Runner.run(
        orchestrator_agent,
        "What about warding strategies?",  # Continues previous topic
        session=session_manager.session,
    )
    print(f"Response: {result.final_output[:200]}...")
    
    # Show updated profile
    print("\n📊 Updated Profile:")
    print("="*60)
    print(session_manager.get_context_summary())
    print("="*60)


if __name__ == "__main__":
    asyncio.run(main())
