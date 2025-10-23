# Architecture Documentation

## Overview

Wingy is a multi-agent system built on OpenAI's Agents SDK, designed to provide intelligent game assistance through specialized agents coordinated by an orchestrator.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Layer                            │
│           (Interactive CLI / API Interface)                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   Guardrails Layer                           │
│  • Topic Validation (gaming-related check)                   │
│  • Content Safety (toxic/inappropriate detection)            │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│               Orchestrator Agent                             │
│  • Intent classification                                     │
│  • Agent routing and handoff                                 │
│  • Session coordination                                      │
│  • Context management                                        │
└───┬────────┬─────────┬──────────┬─────────────────────────┘
    │        │         │          │
    ▼        ▼         ▼          ▼
┌─────┐  ┌─────┐  ┌─────┐  ┌─────────┐
│Game │  │Tutor│  │Tips │  │   Q&A   │  Specialized Agents
│Strat│  │ial  │  │Agent│  │  Agent  │
└──┬──┘  └──┬──┘  └──┬──┘  └────┬────┘
   │        │        │           │
   └────────┴────────┴───────────┘
                │
┌───────────────▼─────────────────────────────────────────────┐
│                    Tool Layer                                │
│  • Web Search (Google Custom Search)                         │
│  • External APIs (future)                                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌───────────────▼─────────────────────────────────────────────┐
│               Infrastructure Layer                           │
│  • Session Store (SQLite)                                    │
│  • User Profiles (JSON)                                      │
│  • Tracing & Logging                                         │
│  • Configuration                                             │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Orchestrator Agent

**Location**: `src/wingy/agents/orchestrator.py`

**Purpose**: Main entry point and intelligent router

**Responsibilities**:
- Greet users and understand their needs
- Classify user intent
- Route to appropriate specialist agent
- Maintain conversation context
- Handle general queries
- Apply input guardrails

**Handoff Logic**:
```python
# Decision tree
if "how to win" or "best strategy" or "counter":
    → Game Strategy Agent
elif "learn" or "teach me" or "I'm new":
    → Tutorial Agent
elif "quick tip" or "advice":
    → Tips Agent
elif "what is" or "how does X work":
    → Q&A Agent
```

### 2. Specialized Agents

#### Game Strategy Agent
**Location**: `src/wingy/agents/game_strategy.py`

- **Focus**: Competitive gameplay optimization
- **Tools**: Web search
- **Output**: Strategic analysis, meta insights, counter-strategies

#### Tutorial Agent
**Location**: `src/wingy/agents/tutorial.py`

- **Focus**: Step-by-step learning and skill development
- **Tools**: None (relies on model knowledge)
- **Output**: Structured learning paths, progressive tutorials

#### Tips Agent
**Location**: `src/wingy/agents/tips.py`

- **Focus**: Quick, actionable advice
- **Tools**: Web search
- **Output**: Concise tips, micro-optimizations

#### Q&A Agent
**Location**: `src/wingy/agents/qa.py`

- **Focus**: Factual game information
- **Tools**: Web search
- **Output**: Accurate facts, rule clarifications

### 3. Guardrails System

#### Input Guardrails
**Location**: `src/wingy/guardrails/input_guards.py`

**Topic Validation**:
- Checks if query is gaming-related
- Blocks off-topic requests
- Extracts game names

**Content Safety**:
- Detects toxic language
- Prevents cheating requests
- Blocks inappropriate content

#### Output Guardrails
**Location**: `src/wingy/guardrails/output_guards.py`

**Response Safety**:
- Validates agent responses
- Prevents harmful advice
- Ensures appropriate content

### 4. Session Management

**Location**: `src/wingy/sessions/`

#### SessionManager
**Purpose**: Manages user sessions and profiles

**Features**:
- SQLite-backed conversation history
- User profile persistence (JSON)
- Context tracking
- Interaction recording

#### Data Models

**UserProfile**:
```python
{
    "user_id": str,
    "games": [GamePreference],
    "total_interactions": int,
    "agents_used": [str]
}
```

**GamePreference**:
```python
{
    "game_name": str,
    "skill_level": Enum(beginner, intermediate, advanced, expert),
    "preferred_roles": [str],
    "learning_goals": [str]
}
```

**SessionContext**:
```python
{
    "session_id": str,
    "current_game": str,
    "current_topic": str,
    "active_agent": str,
    "metadata": dict
}
```

### 5. Tool Layer

**Location**: `src/wingy/tools/`

#### Web Search Tool
- **Purpose**: Find current game information from the web
- **Status**: ✅ Implemented with Google Custom Search API
- **Features**: Real-time gaming information, patch notes, strategies, community discussions

## Data Flow

### 1. User Query Processing

```
User Input
    ↓
[Input Validation]
    ↓
[Session Retrieval]
    ↓
Orchestrator.run()
    ↓
[Intent Classification]
    ↓
[Agent Selection]
    ↓
[Handoff Execution]
```

### 2. Agent Handoff Protocol

```python
# Orchestrator identifies need for specialist
orchestrator_agent.handoffs = [
    game_strategy_agent,
    tutorial_agent,
    tips_agent,
    qa_agent
]

# OpenAI SDK handles handoff via function calling
# Agent receives:
{
    "context": conversation_history,
    "user_profile": user_data,
    "tools": [available_tools]
}
```

### 3. Response Generation

```
Specialist Agent
    ↓
[Tool Calls if needed]
    ↓
[Generate Response]
    ↓
[Output Guardrails]
    ↓
[Session Update]
    ↓
Return to User
```

## Key Design Patterns

### 1. Handoffs Pattern
Orchestrator delegates to specialists, who return control when done.

**Advantages**:
- Clean separation of concerns
- Specialist expertise
- Maintainable code

### 2. Guardrails Pattern
Input/output validation using separate checker agents.

**Advantages**:
- Safety by design
- Flexible policies
- AI-powered validation

### 3. Session Pattern
Persistent context across conversations.

**Advantages**:
- Continuity
- Personalization
- Context awareness

## Extension Points

### Adding New Agents

1. Create agent file in `src/wingy/agents/`
2. Define Agent with instructions and tools
3. Add to orchestrator's handoffs list
4. Update `agents/__init__.py`

### Adding New Tools

1. Create tool file in `src/wingy/tools/`
2. Decorate function with `@function_tool`
3. Add to relevant agent's tools list
4. Update `tools/__init__.py`

### Adding New Guardrails

1. Create guardrail in `src/wingy/guardrails/`
2. Define checker agent and output model
3. Decorate function with `@input_guardrail` or `@output_guardrail`
4. Add to agent's guardrails list

## Configuration

### Environment Variables

```env
OPENAI_API_KEY=<required>      # OpenAI API key
OPENAI_MODEL=gpt-4o            # Model to use
ENABLE_TRACING=true            # Enable tracing
SESSION_DB_PATH=./data/...     # Session storage path
```

### Model Selection

Current: `gpt-4o`

Alternatives:
- `gpt-4o-mini` (faster, cheaper)
- `gpt-4-turbo` (more capable)

## Performance Considerations

### Latency
- Handoffs add latency (additional LLM calls)
- Guardrails add validation overhead
- Tool calls increase response time

**Optimizations**:
- Cache frequent queries
- Parallel tool calls where possible
- Stream responses

### Cost
- Multiple agents = multiple API calls
- Guardrails = additional LLM calls

**Optimizations**:
- Use smaller models for guardrails
- Batch guardrail checks
- Implement caching

## Security & Safety

### Input Validation
- Topic validation (gaming only)
- Content safety checks
- Rate limiting (TODO)

### Output Validation
- Response safety checks
- No personal information leakage
- Appropriate content only

### Data Privacy
- Session data stored locally
- No sensitive data retention
- User consent required

## Testing Strategy

### Unit Tests
- Individual agent responses
- Guardrail validation
- Tool functionality

### Integration Tests
- Agent handoffs
- Session persistence
- End-to-end flows

### Guardrail Tests
- Off-topic blocking
- Safety trigger scenarios
- Edge cases

## Future Enhancements

### Phase 2
- [x] Real web search integration ✅
- [ ] Multi-game specialist agents
- [ ] Voice interface support
- [ ] Enhanced web search caching

### Phase 3
- [ ] Team collaboration features
- [ ] VOD analysis agent
- [ ] Performance tracking
- [ ] Community integration

### Phase 4
- [ ] Custom agent training
- [ ] Multi-modal support (images, videos)
- [ ] Real-time game integration
- [ ] Mobile app
