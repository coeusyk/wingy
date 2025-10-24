"""Data models for session management and user profiles."""

from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class SkillLevel(str, Enum):
    """User skill level for a game."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class GamePreference(BaseModel):
    """User's preference and skill for a specific game."""
    game_name: str
    skill_level: SkillLevel = SkillLevel.BEGINNER
    preferred_roles: List[str] = Field(default_factory=list)
    learning_goals: List[str] = Field(default_factory=list)
    
    class Config:
        use_enum_values = True


class UserProfile(BaseModel):
    """User profile containing preferences and history."""
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    games: List[GamePreference] = Field(default_factory=list)
    total_interactions: int = 0
    agents_used: List[str] = Field(default_factory=list)
    
    def add_game(self, game_name: str, skill_level: SkillLevel = SkillLevel.BEGINNER) -> None:
        """Add a new game to user's profile."""
        if not any(g.game_name == game_name for g in self.games):
            self.games.append(
                GamePreference(
                    game_name=game_name,
                    skill_level=skill_level,
                )
            )
    
    def get_game(self, game_name: str) -> Optional[GamePreference]:
        """Get game preference by name."""
        return next((g for g in self.games if g.game_name == game_name), None)
    
    def update_interaction_count(self) -> None:
        """Increment total interactions."""
        self.total_interactions += 1
    
    def record_agent_use(self, agent_name: str) -> None:
        """Record that an agent was used."""
        if agent_name not in self.agents_used:
            self.agents_used.append(agent_name)


class SessionContext(BaseModel):
    """Current session context information."""
    session_id: str
    user_id: str
    current_game: Optional[str] = None
    current_topic: Optional[str] = None
    active_agent: str = "orchestrator"
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    def update_context(
        self,
        game: Optional[str] = None,
        topic: Optional[str] = None,
        agent: Optional[str] = None,
    ) -> None:
        """Update session context."""
        if game is not None:
            self.current_game = game
        if topic is not None:
            self.current_topic = topic
        if agent is not None:
            self.active_agent = agent
