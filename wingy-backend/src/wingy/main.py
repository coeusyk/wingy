""""""

Wingy - Intelligent Game Helper and Learning AssistantWingy - Intelligent Game Helper and Learning Assistant



Example usage demonstrating the multi-agent system with handoffs, guardrails, and sessions.Example usage demonstrating the multi-agent system with handoffs, guardrails, and sessions.

""""""



import asyncioimport asyncio

import loggingimport logging

from agents import Runnerfrom agents import Runner

from agents.exceptions import InputGuardrailTripwireTriggeredfrom agents.exceptions import InputGuardrailTripwireTriggered



from wingy.agents import orchestrator_agentfrom wingy.agents import orchestrator_agent

from wingy.sessions import SessionManagerfrom wingy.sessions import SessionManager

from wingy.utils import setup_logging, load_configfrom wingy.utils import setup_logging, load_config





async def interactive_mode(session_manager: SessionManager):async def interactive_mode(session_manager: SessionManager):

    """Run Wingy in interactive mode."""    """Run Wingy in interactive mode."""

    print("\n" + "="*60)    print("\n" + "="*60)

    print("🎮 Welcome to Wingy - Your Game Learning Assistant!")    print("🎮 Welcome to Wingy - Your Game Learning Assistant!")

    print("="*60)    print("="*60)

    print("\nType 'quit' or 'exit' to end the session")    print("\nType 'quit' or 'exit' to end the session")

    print("Type 'clear' to start a new conversation")    print("Type 'clear' to start a new conversation")

    print("Type 'profile' to view your profile\n")    print("Type 'profile' to view your profile\n")

        

    while True:    while True:

        try:        try:

            # Get user input            # Get user input

            user_input = input("\nYou: ").strip()            user_input = input("\nYou: ").strip()

                        

            if not user_input:            if not user_input:

                continue                continue

                        

            # Handle commands            # Handle commands

            if user_input.lower() in ['quit', 'exit']:            if user_input.lower() in ['quit', 'exit']:

                print("\n👋 Thanks for using Wingy! Happy gaming!")                print("\n👋 Thanks for using Wingy! Happy gaming!")

                break                break

                        

            if user_input.lower() == 'clear':            if user_input.lower() == 'clear':

                await session_manager.clear_session()                await session_manager.clear_session()

                print("\n✅ Session cleared. Starting fresh conversation.")                print("\n✅ Session cleared. Starting fresh conversation.")

                continue                continue

                        

            if user_input.lower() == 'profile':            if user_input.lower() == 'profile':

                print("\n" + "="*60)                print("\n" + "="*60)

                print("📊 Your Profile")                print("📊 Your Profile")

                print("="*60)                print("="*60)

                print(session_manager.get_context_summary())                print(session_manager.get_context_summary())

                print("="*60)                print("="*60)

                continue                continue

                        

            # Run the agent            # Run the agent

            print("\n🤖 Wingy: ", end="", flush=True)            print("\n🤖 Wingy: ", end="", flush=True)

                        

            try:            try:

                result = await Runner.run(                result = await Runner.run(

                    orchestrator_agent,                    orchestrator_agent,

                    user_input,                    user_input,

                    session=session_manager.session,                    session=session_manager.session,

                )                )



                # Record interaction                # Record interaction

                session_manager.record_interaction(result.last_agent.name)                session_manager.record_interaction(result.last_agent.name)

                                

                # Print response                # Print response

                print(result.final_output)                print(result.final_output)

                                

                # Show which agent handled the request (for demo purposes)                # Show which agent handled the request (for demo purposes)

                if result.last_agent.name != "Wingy Orchestrator":                if result.last_agent.name != "Wingy Orchestrator":

                    print(f"\n[Handled by: {result.last_agent.name}]")                    print(f"\n[Handled by: {result.last_agent.name}]")



            except InputGuardrailTripwireTriggered as e:            except InputGuardrailTripwireTriggered as e:

                print(                print(

                    "\n⚠️  I can only help with gaming-related questions. "                    "\n⚠️  I can only help with gaming-related questions. "

                    "Please ask about games, strategies, or learning to play!"                    "Please ask about games, strategies, or learning to play!"

                )                )

                logging.warning(f"Guardrail triggered: {e}")                logging.warning(f"Guardrail triggered: {e}")

                

        except KeyboardInterrupt:        except KeyboardInterrupt:

            print("\n\n👋 Session interrupted. Thanks for using Wingy!")            print("\n\n👋 Session interrupted. Thanks for using Wingy!")

            break            break

        except Exception as e:        except Exception as e:

            print(f"\n❌ Error: {e}")            print(f"\n❌ Error: {e}")

            logging.error(f"Error in interactive mode: {e}", exc_info=True)            logging.error(f"Error in interactive mode: {e}", exc_info=True)





async def demo_mode(session_manager: SessionManager):async def demo_mode(session_manager: SessionManager):

    """Run a demo showcasing Wingy's capabilities."""    """Run a demo showcasing Wingy's capabilities."""

    print("\n" + "="*60)    print("\n" + "="*60)

    print("🎮 Wingy Demo - Multi-Agent Game Assistant")    print("🎮 Wingy Demo - Multi-Agent Game Assistant")

    print("="*60)    print("="*60)

        

    demo_queries = [    demo_queries = [

        {        {

            "query": "Hi! I want to learn League of Legends",            "query": "Hi! I want to learn League of Legends",

            "description": "Initial greeting + onboarding",            "description": "Initial greeting + onboarding",

        },        },

        {        {

            "query": "Teach me how to play support role",            "query": "Teach me how to play support role",

            "description": "Tutorial request → Tutorial Agent",            "description": "Tutorial request → Tutorial Agent",

        },        },

        {        {

            "query": "What's the best strategy to win lane as support?",            "query": "What's the best strategy to win lane as support?",

            "description": "Strategy question → Game Strategy Agent",            "description": "Strategy question → Game Strategy Agent",

        },        },

        {        {

            "query": "Give me a quick tip for improving my warding",            "query": "Give me a quick tip for improving my warding",

            "description": "Quick tip → Tips Agent",            "description": "Quick tip → Tips Agent",

        },        },

        {        {

            "query": "What does crowd control mean in League?",            "query": "What does crowd control mean in League?",

            "description": "Factual question → Q&A Agent",            "description": "Factual question → Q&A Agent",

        },        },

    ]    ]

        

    for i, item in enumerate(demo_queries, 1):    for i, item in enumerate(demo_queries, 1):

        print(f"\n{'─'*60}")        print(f"\n{'─'*60}")

        print(f"Demo {i}/{len(demo_queries)}: {item['description']}")        print(f"Demo {i}/{len(demo_queries)}: {item['description']}")

        print(f"{'─'*60}")        print(f"{'─'*60}")

        print(f"User: {item['query']}")        print(f"User: {item['query']}")

        print(f"\n🤖 Wingy: ", end="", flush=True)        print(f"\n🤖 Wingy: ", end="", flush=True)

                

        try:        try:

            result = await Runner.run(            result = await Runner.run(

                orchestrator_agent,                orchestrator_agent,

                item['query'],                item['query'],

                session=session_manager.session,                session=session_manager.session,

            )            )

                        

            # Record interaction            # Record interaction

            session_manager.record_interaction(result.last_agent.name)            session_manager.record_interaction(result.last_agent.name)

                        

            # Print response            # Print response

            print(result.final_output)            print(result.final_output)

            print(f"\n[Agent: {result.last_agent.name}]")            print(f"\n[Agent: {result.last_agent.name}]")



            # Pause between queries            # Pause between queries

            await asyncio.sleep(1)            await asyncio.sleep(1)

                        

        except InputGuardrailTripwireTriggered:        except InputGuardrailTripwireTriggered:

            print("⚠️ Guardrail triggered - query blocked")            print("⚠️ Guardrail triggered - query blocked")

        except Exception as e:        except Exception as e:

            print(f"❌ Error: {e}")            print(f"❌ Error: {e}")

            logging.error(f"Error in demo mode: {e}", exc_info=True)            logging.error(f"Error in demo mode: {e}", exc_info=True)

        

    print("\n" + "="*60)    print("\n" + "="*60)

    print("📊 Session Summary")    print("📊 Session Summary")

    print("="*60)    print("="*60)

    print(session_manager.get_context_summary())    print(session_manager.get_context_summary())

    print("="*60)    print("="*60)





async def main():async def main():

    """Main entry point for Wingy."""    """Main entry point for Wingy."""

    # Setup logging    # Setup logging

    setup_logging(level="INFO")    setup_logging(level="INFO")

        

    # Load configuration    # Load configuration

    try:    try:

        config = load_config()        config = load_config()

        logging.info("Configuration loaded successfully")        logging.info("Configuration loaded successfully")

    except ValueError as e:    except ValueError as e:

        logging.error(f"Configuration error: {e}")        logging.error(f"Configuration error: {e}")

        print(f"\n❌ {e}")        print(f"\n❌ {e}")

        print("\nPlease create a .env file with your OPENAI_API_KEY")        print("\nPlease create a .env file with your OPENAI_API_KEY")

        return        return

        

    # Create session manager    # Create session manager

    session_manager = SessionManager(    session_manager = SessionManager(

        user_id="demo_user",        user_id="demo_user",

        db_path=config["session_db_path"],        db_path=config["session_db_path"],

    )    )

        

    # Check command line arguments for mode    # Check command line arguments for mode

    import sys    import sys

    mode = sys.argv[1] if len(sys.argv) > 1 else "interactive"    mode = sys.argv[1] if len(sys.argv) > 1 else "interactive"

        

    if mode == "demo":    if mode == "demo":

        await demo_mode(session_manager)        await demo_mode(session_manager)

    else:    else:

        await interactive_mode(session_manager)        await interactive_mode(session_manager)





if __name__ == "__main__":if __name__ == "__main__":

    try:    try:

        asyncio.run(main())        asyncio.run(main())

    except KeyboardInterrupt:    except KeyboardInterrupt:

        print("\n\n👋 Goodbye!")        print("\n\n👋 Goodbye!")

