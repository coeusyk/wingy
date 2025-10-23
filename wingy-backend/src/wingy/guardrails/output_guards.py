"""Output guardrails for validating agent responses."""

import logging

from pydantic import BaseModel

from agents import (
    Agent,
    GuardrailFunctionOutput,
    RunContextWrapper,
    Runner,
    output_guardrail,
)

logger = logging.getLogger(__name__)


class ResponseSafetyOutput(BaseModel):
    """Output model for response safety guardrail."""
    is_safe: bool
    reasoning: str
    issues_found: list[str] = []


class AgentResponseOutput(BaseModel):
    """Model for agent response content."""
    content: str


# Guardrail agent for response safety
response_safety_agent = Agent(
    name="Response Safety Guard",
    instructions="""
    Check if the agent's response is safe, appropriate, and helpful for users.
    
    Safe responses:
    - Helpful gaming advice and strategies
    - Educational content about games
    - Respectful and constructive feedback
    - Accurate information within the agent's scope
    
    Unsafe responses:
    - Encouraging cheating or exploits
    - Toxic or inappropriate language
    - Providing harmful advice
    - Sharing personal/sensitive information
    - Content outside gaming/learning scope
    
    List any specific issues found in the issues_found field.
    """,
    output_type=ResponseSafetyOutput,
)


@output_guardrail
async def response_safety_guardrail(
    ctx: RunContextWrapper[None],
    agent: Agent,
    output: AgentResponseOutput | str,
) -> GuardrailFunctionOutput:
    """Validate that agent output is safe and appropriate.
    
    Args:
        ctx: Run context wrapper
        agent: The agent that generated the output
        output: Agent output to validate
    
    Returns:
        Guardrail output with tripwire status
    """
    logger.debug("Running response safety guardrail")
    
    # Extract content from output
    if isinstance(output, str):
        content = output
    else:
        content = output.content
    
    result = await Runner.run(response_safety_agent, content, context=ctx.context)
    safety_check = result.final_output_as(ResponseSafetyOutput)
    
    if not safety_check.is_safe:
        logger.warning(
            f"Response safety check failed: {safety_check.reasoning}. "
            f"Issues: {', '.join(safety_check.issues_found)}"
        )
    
    return GuardrailFunctionOutput(
        output_info=safety_check,
        tripwire_triggered=not safety_check.is_safe,
    )

