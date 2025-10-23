"""Session manager for handling user sessions and profiles.""""""Session manager for handling user sessions and profiles."""



import jsonimport json

import loggingimport logging

from pathlib import Pathfrom pathlib import Path

from typing import Optionalfrom typing import Optional

from agents import SQLiteSession

from agents import Session

from .models import UserProfile, SessionContext, SkillLevel

from .models import UserProfile

logger = logging.getLogger(__name__)



logger = logging.getLogger(__name__)

class SessionManager:

    """Manages user sessions, profiles, and conversation context."""

class SessionManager:    

    """Manages user sessions and profiles for Wingy.    def __init__(self, user_id: str, db_path: str = "./data/sessions.db"):

            """Initialize session manager.

    Handles:        

    - Session storage (conversation history) using SQLite        Args:

    - User profile management (preferences, stats) using JSON            user_id: Unique identifier for the user

    - Context tracking across interactions            db_path: Path to SQLite database for session storage

    """        """

            self.user_id = user_id

    def __init__(        self.db_path = db_path

        self,        

        user_id: str,        # Ensure data directory exists

        db_path: str = "./data/sessions.db",        Path(db_path).parent.mkdir(parents=True, exist_ok=True)

        profiles_dir: str = "./data/profiles",        

    ):        # Create SQLite session for conversation history

        """Initialize session manager.        self.session = SQLiteSession(user_id, db_path)

                

        Args:        # Initialize user profile

            user_id: Unique identifier for the user        self.profile = self._load_or_create_profile()

            db_path: Path to SQLite database for session storage        

            profiles_dir: Directory for user profile JSON files        # Initialize session context

        """        self.context = SessionContext(

        self.user_id = user_id            session_id=user_id,

        self.db_path = Path(db_path)            user_id=user_id,

        self.profiles_dir = Path(profiles_dir)        )

                

        # Create directories if they don't exist        logger.info(f"Session manager initialized for user: {user_id}")

        self.db_path.parent.mkdir(parents=True, exist_ok=True)    

        self.profiles_dir.mkdir(parents=True, exist_ok=True)    def _load_or_create_profile(self) -> UserProfile:

                """Load existing user profile or create a new one."""

        # Initialize session        profile_path = self._get_profile_path()

        self.session = Session(        

            user_id=user_id,        if profile_path.exists():

            db_path=str(self.db_path),            try:

        )                with open(profile_path, "r") as f:

                            data = json.load(f)

        # Load or create user profile                    return UserProfile(**data)

        self.profile = self._load_profile()            except Exception as e:

                        logger.warning(f"Failed to load profile: {e}. Creating new profile.")

        logger.info(f"Session manager initialized for user: {user_id}")        

            # Create new profile

    def _load_profile(self) -> UserProfile:        return UserProfile(user_id=self.user_id)

        """Load user profile from JSON file or create new one."""    

        profile_path = self.profiles_dir / f"{self.user_id}.json"    def _get_profile_path(self) -> Path:

                """Get path to user profile file."""

        if profile_path.exists():        profile_dir = Path(self.db_path).parent / "profiles"

            try:        profile_dir.mkdir(parents=True, exist_ok=True)

                with open(profile_path, "r") as f:        return profile_dir / f"{self.user_id}.json"

                    data = json.load(f)    

                logger.info(f"Loaded profile for user: {self.user_id}")    def save_profile(self) -> None:

                return UserProfile.from_dict(data)        """Save user profile to disk."""

            except Exception as e:        profile_path = self._get_profile_path()

                logger.error(f"Error loading profile: {e}")        try:

                # Create new profile if loading fails            with open(profile_path, "w") as f:

                return UserProfile(user_id=self.user_id)                json.dump(self.profile.model_dump(), f, indent=2, default=str)

        else:            logger.debug(f"Profile saved for user: {self.user_id}")

            logger.info(f"Creating new profile for user: {self.user_id}")        except Exception as e:

            return UserProfile(user_id=self.user_id)            logger.error(f"Failed to save profile: {e}")

        

    def _save_profile(self):    def update_profile(

        """Save user profile to JSON file."""        self,

        profile_path = self.profiles_dir / f"{self.user_id}.json"        game_name: Optional[str] = None,

                skill_level: Optional[SkillLevel] = None,

        try:    ) -> None:

            with open(profile_path, "w") as f:        """Update user profile with new information.

                json.dump(self.profile.to_dict(), f, indent=2)        

            logger.debug(f"Profile saved for user: {self.user_id}")        Args:

        except Exception as e:            game_name: Name of the game to add or update

            logger.error(f"Error saving profile: {e}")            skill_level: User's skill level for the game

            """

    def record_interaction(self, agent_name: str):        if game_name:

        """Record an interaction with an agent.            existing_game = self.profile.get_game(game_name)

                    if existing_game and skill_level:

        Args:                existing_game.skill_level = skill_level

            agent_name: Name of the agent that handled the interaction            elif not existing_game:

        """                self.profile.add_game(game_name, skill_level or SkillLevel.BEGINNER)

        self.profile.interaction_count += 1        

        self.profile.last_agent_used = agent_name        self.save_profile()

        self._save_profile()    

        def record_interaction(self, agent_name: str) -> None:

    def get_context_summary(self) -> str:        """Record an interaction with an agent.

        """Get a summary of user context for display.        

                Args:

        Returns:            agent_name: Name of the agent used

            Formatted string with user profile information        """

        """        self.profile.update_interaction_count()

        lines = [        self.profile.record_agent_use(agent_name)

            f"User: {self.profile.username or self.user_id}",        self.context.update_context(agent=agent_name)

            f"Total Interactions: {self.profile.interaction_count}",        self.save_profile()

        ]    

            async def clear_session(self) -> None:

        if self.profile.last_agent_used:        """Clear conversation history while preserving profile."""

            lines.append(f"Last Agent: {self.profile.last_agent_used}")        await self.session.clear_session()

                logger.info(f"Session cleared for user: {self.user_id}")

        if self.profile.favorite_games:    

            lines.append("\nFavorite Games:")    def get_context_summary(self) -> str:

            for game in self.profile.favorite_games:        """Get a summary of the current context for agent prompts.

                lines.append(        

                    f"  - {game.game_name} "        Returns:

                    f"({game.skill_level.value}"            Formatted context summary string

                    f"{f', {game.favorite_role}' if game.favorite_role else ''})"        """

                )        parts = [f"User ID: {self.user_id}"]

        else:        

            lines.append("\nNo favorite games set yet")        if self.profile.games:

                    games_str = ", ".join([g.game_name for g in self.profile.games])

        return "\n".join(lines)            parts.append(f"Games: {games_str}")

            

    async def clear_session(self):        if self.context.current_game:

        """Clear the current session (conversation history)."""            game = self.profile.get_game(self.context.current_game)

        # Create new session (old one will be saved automatically)            if game:

        self.session = Session(                parts.append(f"Current Game: {game.game_name}")

            user_id=self.user_id,                parts.append(f"Skill Level: {game.skill_level}")

            db_path=str(self.db_path),                if game.preferred_roles:

        )                    parts.append(f"Preferred Roles: {', '.join(game.preferred_roles)}")

        logger.info(f"Session cleared for user: {self.user_id}")        

        parts.append(f"Total Interactions: {self.profile.total_interactions}")
        
        return "\n".join(parts)
