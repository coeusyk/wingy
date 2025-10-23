"""
Example: Testing guardrails for input validation.
"""

import asyncio
from agents import Runner
from agents.exceptions import InputGuardrailTripwireTriggered

from wingy.agents import orchestrator_agent
from wingy.sessions import SessionManager
from wingy.utils import setup_logging, load_config


async def main():
    """Demonstrate guardrails blocking off-topic requests."""
    setup_logging(level="INFO")
    config = load_config()
    
    session_manager = SessionManager("guardrail_demo", config["session_db_path"])
    
    test_cases = [
        ("Tell me about League of Legends strategies", True),    # Should pass
        ("What's the weather today?", False),                     # Should be blocked
        ("Help me with my math homework", False),                 # Should be blocked
        ("How do I improve my CS:GO gameplay?", True),           # Should pass
    ]
    
    print("\n🛡️  Guardrail Testing\n")
    
    for query, should_pass in test_cases:
        print(f"\n{'='*60}")
        print(f"Query: {query}")
        print(f"Expected: {'✓ Pass' if should_pass else '✗ Block'}")
        print(f"{'='*60}\n")
        
        try:
            result = await Runner.run(
                orchestrator_agent,
                query,
                session=session_manager.session,
            )
            print(f"Result: ✓ Passed guardrails")
            print(f"Response: {result.final_output[:150]}...")
        
        except InputGuardrailTripwireTriggered:
            print(f"Result: ✗ Blocked by guardrails")
        
        await asyncio.sleep(0.5)


if __name__ == "__main__":
    asyncio.run(main())
