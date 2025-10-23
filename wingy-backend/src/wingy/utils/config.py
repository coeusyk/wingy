"""Configuration management for Wingy.""""""Configuration management for Wingy."""



import osimport os

from pathlib import Pathfrom pathlib import Path

from typing import Dict, Anyfrom typing import Dict, Any

from dotenv import load_dotenv

from dotenv import load_dotenv



def load_config() -> Dict[str, Any]:

def load_config() -> Dict[str, Any]:    """Load configuration from environment variables.

    """Load configuration from environment variables.    

        Returns:

    Returns:        Dictionary containing configuration values.

        Dictionary with configuration values    """

            # Load .env file if it exists

    Raises:    env_path = Path.cwd() / ".env"

        ValueError: If required configuration is missing    if env_path.exists():

    """        load_dotenv(env_path)

    # Load .env file    

    load_dotenv()    config = {

            # OpenAI Configuration

    # Required configuration        "openai_api_key": os.getenv("OPENAI_API_KEY"),

    openai_api_key = os.getenv("OPENAI_API_KEY")        "openai_model": os.getenv("OPENAI_MODEL"),

    if not openai_api_key:        "enable_tracing": os.getenv("ENABLE_TRACING", "true").lower() == "true",

        raise ValueError("OPENAI_API_KEY not found in environment variables")        

            # Session Configuration

    # Optional configuration with defaults        "session_db_path": os.getenv("SESSION_DB_PATH", "./data/sessions.db"),

    config = {        

        "openai_api_key": openai_api_key,        # Google Search Configuration (optional)

        "google_api_key": os.getenv("GOOGLE_API_KEY"),        "google_api_key": os.getenv("GOOGLE_API_KEY"),

        "google_search_engine_id": os.getenv("GOOGLE_SEARCH_ENGINE_ID"),        "google_search_engine_id": os.getenv("GOOGLE_SEARCH_ENGINE_ID"),

        "session_db_path": os.getenv("SESSION_DB_PATH", "./data/sessions.db"),    }

        "profiles_dir": os.getenv("PROFILES_DIR", "./data/profiles"),    

        "log_level": os.getenv("LOG_LEVEL", "INFO"),    # Validate required configs

    }    if not config["openai_api_key"]:

            raise ValueError(

    return config            "OPENAI_API_KEY not found in environment. "

            "Please set it in .env file or environment variables."
        )
    
    # Log warning if Google Search is not configured (not required)
    if not config["google_api_key"] or not config["google_search_engine_id"]:
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(
            "Google Search API not configured. Web search tool will return error messages. "
            "Set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID in .env to enable web search."
        )
    
    return config
