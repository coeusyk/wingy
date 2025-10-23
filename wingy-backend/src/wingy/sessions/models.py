"""Data models for session management.""""""Data models for session management and user profiles."""



from dataclasses import dataclass, fieldfrom typing import List, Optional, Dict, Any

from typing import List, Optionalfrom datetime import datetime

from enum import Enumfrom enum import Enum

from pydantic import BaseModel, Field



class SkillLevel(str, Enum):

    """Player skill level."""class SkillLevel(str, Enum):

    BEGINNER = "beginner"    """User skill level for a game."""

    INTERMEDIATE = "intermediate"    BEGINNER = "beginner"

    ADVANCED = "advanced"    INTERMEDIATE = "intermediate"

    EXPERT = "expert"    ADVANCED = "advanced"

    EXPERT = "expert"



@dataclass

class GamePreference:class GamePreference(BaseModel):

    """User's game preference and skill level."""    """User's preference and skill for a specific game."""

    game_name: str    game_name: str

    skill_level: SkillLevel = SkillLevel.BEGINNER    skill_level: SkillLevel = SkillLevel.BEGINNER

    favorite_role: Optional[str] = None    preferred_roles: List[str] = Field(default_factory=list)

    playtime_hours: Optional[int] = None    learning_goals: List[str] = Field(default_factory=list)

    

    class Config:

@dataclass        use_enum_values = True

class UserProfile:

    """User profile with gaming preferences and history."""

    user_id: strclass UserProfile(BaseModel):

    username: Optional[str] = None    """User profile containing preferences and history."""

    favorite_games: List[GamePreference] = field(default_factory=list)    user_id: str

    interaction_count: int = 0    created_at: datetime = Field(default_factory=datetime.utcnow)

    last_agent_used: Optional[str] = None    games: List[GamePreference] = Field(default_factory=list)

        total_interactions: int = 0

    def to_dict(self) -> dict:    agents_used: List[str] = Field(default_factory=list)

        """Convert profile to dictionary."""    

        return {    def add_game(self, game_name: str, skill_level: SkillLevel = SkillLevel.BEGINNER) -> None:

            "user_id": self.user_id,        """Add a new game to user's profile."""

            "username": self.username,        if not any(g.game_name == game_name for g in self.games):

            "favorite_games": [            self.games.append(

                {                GamePreference(

                    "game_name": g.game_name,                    game_name=game_name,

                    "skill_level": g.skill_level.value,                    skill_level=skill_level,

                    "favorite_role": g.favorite_role,                )

                    "playtime_hours": g.playtime_hours,            )

                }    

                for g in self.favorite_games    def get_game(self, game_name: str) -> Optional[GamePreference]:

            ],        """Get game preference by name."""

            "interaction_count": self.interaction_count,        return next((g for g in self.games if g.game_name == game_name), None)

            "last_agent_used": self.last_agent_used,    

        }    def update_interaction_count(self) -> None:

            """Increment total interactions."""

    @classmethod        self.total_interactions += 1

    def from_dict(cls, data: dict) -> "UserProfile":    

        """Create profile from dictionary."""    def record_agent_use(self, agent_name: str) -> None:

        favorite_games = [        """Record that an agent was used."""

            GamePreference(        if agent_name not in self.agents_used:

                game_name=g["game_name"],            self.agents_used.append(agent_name)

                skill_level=SkillLevel(g["skill_level"]),

                favorite_role=g.get("favorite_role"),

                playtime_hours=g.get("playtime_hours"),class SessionContext(BaseModel):

            )    """Current session context information."""

            for g in data.get("favorite_games", [])    session_id: str

        ]    user_id: str

            current_game: Optional[str] = None

        return cls(    current_topic: Optional[str] = None

            user_id=data["user_id"],    active_agent: str = "orchestrator"

            username=data.get("username"),    metadata: Dict[str, Any] = Field(default_factory=dict)

            favorite_games=favorite_games,    

            interaction_count=data.get("interaction_count", 0),    def update_context(

            last_agent_used=data.get("last_agent_used"),        self,

        )        game: Optional[str] = None,

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
