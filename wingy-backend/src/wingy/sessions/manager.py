"""Session manager for handling user sessions and profiles."""

import json
import logging
from pathlib import Path
from typing import Optional
from agents import SQLiteSession

from .models import UserProfile, SessionContext, SkillLevel

logger = logging.getLogger(__name__)


class SessionManager:
    """Manages user sessions, profiles, and conversation context."""
    
    def __init__(self, user_id: str, db_path: str = "./data/sessions.db"):
        """Initialize session manager.
        
        Args:
            user_id: Unique identifier for the user
            db_path: Path to SQLite database for session storage
        """
        self.user_id = user_id
        self.db_path = db_path
        
        # Ensure data directory exists
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Create SQLite session for conversation history
        self.session = SQLiteSession(user_id, db_path)
        
        # Initialize user profile
        self.profile = self._load_or_create_profile()
        
        # Initialize session context
        self.context = SessionContext(
            session_id=user_id,
            user_id=user_id,
        )
        
        logger.info(f"Session manager initialized for user: {user_id}")
    
    def _load_or_create_profile(self) -> UserProfile:
        """Load existing user profile or create a new one."""
        profile_path = self._get_profile_path()
        
        if profile_path.exists():
            try:
                with open(profile_path, "r") as f:
                    data = json.load(f)
                    return UserProfile(**data)
            except Exception as e:
                logger.warning(f"Failed to load profile: {e}. Creating new profile.")
        
        # Create new profile
        return UserProfile(user_id=self.user_id)
    
    def _get_profile_path(self) -> Path:
        """Get path to user profile file."""
        profile_dir = Path(self.db_path).parent / "profiles"
        profile_dir.mkdir(parents=True, exist_ok=True)
        return profile_dir / f"{self.user_id}.json"
    
    def save_profile(self) -> None:
        """Save user profile to disk."""
        profile_path = self._get_profile_path()
        try:
            with open(profile_path, "w") as f:
                json.dump(self.profile.model_dump(), f, indent=2, default=str)
            logger.debug(f"Profile saved for user: {self.user_id}")
        except Exception as e:
            logger.error(f"Failed to save profile: {e}")
    
    def update_profile(
        self,
        game_name: Optional[str] = None,
        skill_level: Optional[SkillLevel] = None,
    ) -> None:
        """Update user profile with new information.
        
        Args:
            game_name: Name of the game to add or update
            skill_level: User's skill level for the game
        """
        if game_name:
            existing_game = self.profile.get_game(game_name)
            if existing_game and skill_level:
                existing_game.skill_level = skill_level
            elif not existing_game:
                self.profile.add_game(game_name, skill_level or SkillLevel.BEGINNER)
        
        self.save_profile()
    
    def record_interaction(self, agent_name: str) -> None:
        """Record an interaction with an agent.
        
        Args:
            agent_name: Name of the agent used
        """
        self.profile.update_interaction_count()
        self.profile.record_agent_use(agent_name)
        self.context.update_context(agent=agent_name)
        self.save_profile()
    
    async def clear_session(self) -> None:
        """Clear conversation history while preserving profile."""
        await self.session.clear_session()
        logger.info(f"Session cleared for user: {self.user_id}")
    
    def get_context_summary(self) -> str:
        """Get a summary of the current context for agent prompts.
        
        Returns:
            Formatted context summary string
        """
        parts = [f"User ID: {self.user_id}"]
        
        if self.profile.games:
            games_str = ", ".join([g.game_name for g in self.profile.games])
            parts.append(f"Games: {games_str}")
        
        if self.context.current_game:
            game = self.profile.get_game(self.context.current_game)
            if game:
                parts.append(f"Current Game: {game.game_name}")
                parts.append(f"Skill Level: {game.skill_level}")
                if game.preferred_roles:
                    parts.append(f"Preferred Roles: {', '.join(game.preferred_roles)}")
        
        parts.append(f"Total Interactions: {self.profile.total_interactions}")
        
        return "\n".join(parts)
