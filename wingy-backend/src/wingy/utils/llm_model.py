"""LLM Model factory for multi-provider support (OpenAI, Ollama, etc.)."""

import os
from typing import Any
from .config import load_config


def get_llm_model() -> Any:
    """Get the appropriate LLM model based on configuration.
    
    Returns either:
    - A model string for OpenAI (e.g., "gpt-4")
    - A LitellmModel instance for other providers (e.g., Ollama)
    
    Supports:
    - OpenAI models (gpt-4, gpt-3.5-turbo, etc.)
    - Ollama local models via LiteLLM (llama3.1:latest, etc.)
    - Other LiteLLM-supported providers (Anthropic, Gemini, etc.)
    
    Configuration via environment variables:
    - LLM_PROVIDER: Provider to use (openai, ollama) - defaults to "openai"
    - LLM_MODEL: Model name (gpt-4, llama3.1:latest, etc.)
    - OLLAMA_BASE_URL: Base URL for Ollama (required for ollama provider)
    - OPENAI_API_KEY: OpenAI API key (required for openai provider)
    
    Returns:
        str or LitellmModel: Model identifier for Agent initialization
    """
    config = load_config()
    
    provider = config["llm_provider"].lower()
    model = config["llm_model"]
    
    # For OpenAI, return the model string directly
    if provider == "openai":
        return model
    
    # For other providers (Ollama, etc.), use LiteLLM
    try:
        from agents.extensions.models.litellm_model import LitellmModel
    except ImportError:
        raise ImportError(
            "LiteLLM support requires the 'litellm' package. "
            "Install it with: pip install litellm"
        )
    
    # Configure provider-specific settings
    if provider == "ollama":
        # Set Ollama API base URL for LiteLLM
        ollama_base_url = config["ollama_base_url"]
        # LiteLLM uses OLLAMA_API_BASE environment variable
        os.environ["OLLAMA_API_BASE"] = ollama_base_url
        
        # LiteLLM format for Ollama: "ollama/model-name" or "ollama_chat/model-name"
        # Use ollama_chat for better responses (recommended by LiteLLM docs)
        litellm_model = f"ollama_chat/{model}"
        
        # Return LitellmModel instance with api_base parameter
        return LitellmModel(
            model=litellm_model,
            base_url=ollama_base_url
        )
    
    # For other providers, return LiteLLM model with provider prefix
    # Format: "provider/model-name" (e.g., "anthropic/claude-3-5-sonnet-20240620")
    return LitellmModel(model=f"{provider}/{model}")
