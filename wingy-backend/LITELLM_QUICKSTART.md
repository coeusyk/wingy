# Quick Start Guide - LiteLLM Multi-Provider Setup

## Installation

### 1. Install Dependencies

```bash
cd wingy-backend
pip install -e .
```

This will automatically install:
- `litellm>=1.80.0`
- `openai-agents>=0.4.1`
- All other dependencies

### 2. Configure Your Provider

#### Option A: OpenAI (Default)

```bash
# In .env file
LLM_PROVIDER=openai
LLM_MODEL=gpt-4
OPENAI_API_KEY=sk-your-api-key-here
```

#### Option B: Local Ollama

**Step 1**: Install Ollama from [ollama.ai](https://ollama.ai)

**Step 2**: Pull a model
```bash
ollama pull llama3.1:latest
```

**Step 3**: Configure
```bash
# In .env file
LLM_PROVIDER=ollama
LLM_MODEL=llama3.1:latest
OLLAMA_BASE_URL=http://localhost:11434
```

### 3. Run the Application

```bash
# Start the API server
python run_api.py

# Or use the start script
./start-dev.ps1  # On Windows
```

## Quick Test

```bash
# Test configuration
python -c "from wingy.utils.config import load_config; print(load_config())"

# Run tests
pytest tests/
```

## Common Issues

### "OPENAI_API_KEY not found"
- Solution: Set `OPENAI_API_KEY` in `.env` when using `LLM_PROVIDER=openai`

### "litellm package not found"
- Solution: Run `pip install litellm` or `pip install -e .`

### Ollama connection error
- Solution: Make sure Ollama is running: `curl http://localhost:11434/api/tags`

## Environment Variables Quick Reference

| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| `LLM_PROVIDER` | No | `openai` | `openai`, `ollama` |
| `LLM_MODEL` | Yes | - | `gpt-4`, `llama3.1:latest` |
| `OPENAI_API_KEY` | When using OpenAI | - | `sk-...` |
| `OLLAMA_BASE_URL` | When using Ollama | `http://localhost:11434` | `http://localhost:11434` |

## More Information

- Full documentation: `docs/LITELLM_INTEGRATION.md`
- Configuration examples: `.env.example`
