# LiteLLM Multi-Provider Integration

## Overview

Wingy now supports multiple LLM providers through [LiteLLM](https://github.com/BerriAI/litellm), enabling you to use both cloud-based (OpenAI) and local (Ollama) language models seamlessly.

## Supported Providers

- **OpenAI**: GPT-4, GPT-4-Turbo, GPT-3.5-Turbo, etc.
- **Ollama**: Llama 3.1, Llama 2, CodeLlama, Mistral, and all other Ollama-supported models
- **Future**: Any LiteLLM-supported provider can be easily added

## Architecture

### Components

1. **LLM Model Factory** (`utils/llm_model.py`)
   - Central factory function `get_llm_model()` that returns the appropriate model instance
   - Handles provider-specific configuration
   - Maintains backward compatibility with existing OpenAI setup

2. **Configuration** (`utils/config.py`)
   - Extended to support multi-provider settings
   - Backward compatible with legacy `OPENAI_MODEL` environment variable
   - Validates provider-specific requirements

3. **Agent Integration**
   - All agents (Orchestrator, Game Strategy, Tutorial, Tips, Q&A) updated to use the model factory
   - No changes required to agent logic or instructions
   - Seamless switching between providers

## Configuration

### Environment Variables

#### Primary Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `LLM_PROVIDER` | LLM provider to use | No | `openai` |
| `LLM_MODEL` | Model name for the provider | Yes | - |
| `OPENAI_API_KEY` | OpenAI API key | When `LLM_PROVIDER=openai` | - |
| `OLLAMA_BASE_URL` | Ollama server URL | When `LLM_PROVIDER=ollama` | `http://localhost:11434` |

#### Legacy Configuration (Backward Compatibility)

| Variable | Description | Notes |
|----------|-------------|-------|
| `OPENAI_MODEL` | OpenAI model name | Used if `LLM_MODEL` is not set |

### Configuration Examples

#### Example 1: Using OpenAI GPT-4 (Default)

```bash
LLM_PROVIDER=openai
LLM_MODEL=gpt-4
OPENAI_API_KEY=sk-your-key-here
```

#### Example 2: Using Local Ollama

```bash
LLM_PROVIDER=ollama
LLM_MODEL=llama3.1:latest
OLLAMA_BASE_URL=http://localhost:11434
```

#### Example 3: Cost-Optimized with GPT-3.5

```bash
LLM_PROVIDER=openai
LLM_MODEL=gpt-3.5-turbo
OPENAI_API_KEY=sk-your-key-here
```

#### Example 4: Remote Ollama Instance

```bash
LLM_PROVIDER=ollama
LLM_MODEL=llama3.1:latest
OLLAMA_BASE_URL=http://your-server:11434
```

## Installation

### Prerequisites

1. **Python 3.11+** required
2. **LiteLLM package** installed (added to `pyproject.toml`)

### Installing Dependencies

```bash
cd wingy-backend
pip install -e .
```

This will automatically install:
- `litellm>=1.80.0`
- `openai-agents>=0.4.1`
- All other required dependencies

### Setting Up Ollama (Optional)

If you want to use local models:

1. **Install Ollama**: Follow instructions at [ollama.ai](https://ollama.ai)

2. **Pull a model**:
   ```bash
   ollama pull llama3.1:latest
   ```

3. **Verify Ollama is running**:
   ```bash
   curl http://localhost:11434/api/tags
   ```

## Usage

### Starting the Application

1. **Copy and configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Run the application**:
   ```bash
   python src/wingy/main.py
   ```

### Switching Providers

Simply update your `.env` file and restart the application:

```bash
# Switch from OpenAI to Ollama
LLM_PROVIDER=ollama
LLM_MODEL=llama3.1:latest
```

No code changes required!

## How It Works

### Model Factory Pattern

The `get_llm_model()` factory function:

1. **Reads configuration** from environment variables
2. **Determines provider** (OpenAI, Ollama, etc.)
3. **Returns appropriate model instance**:
   - For OpenAI (backward compatible): Returns model string
   - For LiteLLM providers: Returns `LitellmModel` instance

### OpenAI Agents SDK Integration

Wingy uses the OpenAI Agents SDK with the LiteLLM model extension:

```python
from agents import Agent
from agents.extensions.models.litellm_model import LitellmModel

# Factory creates the appropriate model
model = get_llm_model()

# Agent uses the model
agent = Agent(
    name="My Agent",
    model=model,  # Can be string or LitellmModel
    instructions="..."
)
```

### LiteLLM Model Strings

LiteLLM uses provider-prefixed model strings:

- OpenAI: `openai/gpt-4`
- Ollama: `ollama/llama3.1:latest`

The factory handles this formatting automatically.

## Benefits

### 1. Cost Optimization

- **Development**: Use free local Ollama models
- **Production**: Use OpenAI for best quality
- **Testing**: Switch between providers easily

### 2. Flexibility

- No vendor lock-in
- Easy provider switching
- Support for future providers

### 3. Backward Compatibility

- Existing OpenAI configurations work unchanged
- Gradual migration path
- No breaking changes

### 4. Unified Interface

- Same agent code for all providers
- Consistent API across providers
- LiteLLM handles provider differences

## Troubleshooting

### Issue: "OPENAI_API_KEY not found"

**Solution**: When using `LLM_PROVIDER=openai`, ensure `OPENAI_API_KEY` is set in `.env`

### Issue: "OLLAMA_BASE_URL must be set"

**Solution**: When using `LLM_PROVIDER=ollama`, set `OLLAMA_BASE_URL` in `.env`

### Issue: "LiteLLM support requires 'litellm' package"

**Solution**: Run `pip install litellm` or reinstall the project with `pip install -e .`

### Issue: Ollama connection errors

**Solution**: 
1. Verify Ollama is running: `curl http://localhost:11434/api/tags`
2. Check `OLLAMA_BASE_URL` is correct
3. Ensure the model is pulled: `ollama pull llama3.1:latest`

### Issue: Model not found with Ollama

**Solution**: Pull the model first:
```bash
ollama pull llama3.1:latest
# Or whichever model you specified in LLM_MODEL
```

## Testing

### Test with OpenAI

```bash
# Set in .env
LLM_PROVIDER=openai
LLM_MODEL=gpt-4
OPENAI_API_KEY=sk-...

# Run tests
pytest tests/
```

### Test with Ollama

```bash
# Set in .env
LLM_PROVIDER=ollama
LLM_MODEL=llama3.1:latest
OLLAMA_BASE_URL=http://localhost:11434

# Run tests
pytest tests/
```

## Migration Guide

### From Legacy OpenAI Configuration

**Before**:
```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
```

**After (Option 1 - Keep it as is)**:
No changes needed! Backward compatible.

**After (Option 2 - New format)**:
```bash
OPENAI_API_KEY=sk-...
LLM_PROVIDER=openai
LLM_MODEL=gpt-4
```

### Adding Ollama Support

Just add to your `.env`:
```bash
LLM_PROVIDER=ollama
LLM_MODEL=llama3.1:latest
OLLAMA_BASE_URL=http://localhost:11434
```

And comment out or remove:
```bash
# OPENAI_API_KEY=...  # Not needed for Ollama
```

## Performance Considerations

### OpenAI
- **Latency**: ~500ms-2s per request (network dependent)
- **Quality**: Excellent for all tasks
- **Cost**: Pay per token

### Ollama (Local)
- **Latency**: ~100ms-1s (hardware dependent)
- **Quality**: Good for most tasks, varies by model
- **Cost**: Free (uses local GPU/CPU)

### Recommendations

- **Development/Testing**: Use Ollama for cost savings
- **Production**: Use OpenAI for best quality
- **Staging**: Use Ollama for integration tests
- **Performance-critical**: Use local Ollama with GPU

## Future Enhancements

Potential additions:

1. **More Providers**: Anthropic Claude, Google Gemini, Azure OpenAI
2. **Model Routing**: Automatic provider selection based on request type
3. **Fallback Logic**: Automatic failover between providers
4. **Cost Tracking**: Built-in usage and cost monitoring
5. **Caching**: Response caching for common queries

## References

- [LiteLLM Documentation](https://docs.litellm.ai/)
- [OpenAI Agents SDK](https://github.com/openai/agents-sdk)
- [Ollama Documentation](https://ollama.ai/docs)
- [Issue #1: Original Feature Request](https://github.com/coeusyk/wingy/issues/1)

## Contributing

To add support for a new provider:

1. Add provider configuration to `config.py`
2. Update `_get_litellm_model_string()` in `llm_model.py` if needed
3. Add configuration examples to `.env.example`
4. Update this documentation
5. Add tests for the new provider
