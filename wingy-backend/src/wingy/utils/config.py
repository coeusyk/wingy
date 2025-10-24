"""Configuration management for Wingy."""

import os
from pathlib import Path
from typing import Dict, Any
from dotenv import load_dotenv


def load_config() -> Dict[str, Any]:
    """Load configuration from environment variables.
    
    Returns:
        Dictionary containing configuration values.
    """
    # Load .env file if it exists
    env_path = Path.cwd() / ".env"
    if env_path.exists():
        load_dotenv(env_path)
    
    config = {
        # OpenAI Configuration
        "openai_api_key": os.getenv("OPENAI_API_KEY"),
        "openai_model": os.getenv("OPENAI_MODEL"),
        "enable_tracing": os.getenv("ENABLE_TRACING", "true").lower() == "true",
        
        # Session Configuration
        "session_db_path": os.getenv("SESSION_DB_PATH", "./data/sessions.db"),
        
        # Google Search Configuration (optional)
        "google_api_key": os.getenv("GOOGLE_API_KEY"),
        "google_search_engine_id": os.getenv("GOOGLE_SEARCH_ENGINE_ID"),
    }
    
    # Validate required configs
    if not config["openai_api_key"]:
        raise ValueError(
            "OPENAI_API_KEY not found in environment. "
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
