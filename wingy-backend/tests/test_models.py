"""Basic tests for Wingy components."""

from wingy.sessions.models import UserProfile, GamePreference, SkillLevel, SessionContext


class TestUserProfile:
    """Tests for UserProfile model."""
    
    def test_create_profile(self):
        """Test creating a user profile."""
        profile = UserProfile(user_id="test_user")
        assert profile.user_id == "test_user"
        assert profile.games == []
        assert profile.total_interactions == 0
    
    def test_add_game(self):
        """Test adding a game to profile."""
        profile = UserProfile(user_id="test_user")
        profile.add_game("League of Legends", SkillLevel.INTERMEDIATE)
        
        assert len(profile.games) == 1
        assert profile.games[0].game_name == "League of Legends"
        assert profile.games[0].skill_level == SkillLevel.INTERMEDIATE
    
    def test_get_game(self):
        """Test retrieving a game from profile."""
        profile = UserProfile(user_id="test_user")
        profile.add_game("Valorant")
        
        game = profile.get_game("Valorant")
        assert game is not None
        assert game.game_name == "Valorant"
        
        non_existent = profile.get_game("Unknown Game")
        assert non_existent is None
    
    def test_record_agent_use(self):
        """Test recording agent usage."""
        profile = UserProfile(user_id="test_user")
        profile.record_agent_use("Tutorial Agent")
        profile.record_agent_use("Tips Agent")
        profile.record_agent_use("Tutorial Agent")  # Duplicate
        
        assert len(profile.agents_used) == 2
        assert "Tutorial Agent" in profile.agents_used
        assert "Tips Agent" in profile.agents_used


class TestGamePreference:
    """Tests for GamePreference model."""
    
    def test_create_preference(self):
        """Test creating a game preference."""
        pref = GamePreference(
            game_name="League of Legends",
            skill_level=SkillLevel.BEGINNER,
            preferred_roles=["support", "adc"],
        )
        
        assert pref.game_name == "League of Legends"
        assert pref.skill_level == SkillLevel.BEGINNER
        assert "support" in pref.preferred_roles


class TestSessionContext:
    """Tests for SessionContext model."""
    
    def test_create_context(self):
        """Test creating a session context."""
        context = SessionContext(
            session_id="test_session",
            user_id="test_user",
        )
        
        assert context.session_id == "test_session"
        assert context.active_agent == "orchestrator"
    
    def test_update_context(self):
        """Test updating session context."""
        context = SessionContext(
            session_id="test_session",
            user_id="test_user",
        )
        
        context.update_context(
            game="Valorant",
            topic="aiming",
            agent="Tips Agent",
        )
        
        assert context.current_game == "Valorant"
        assert context.current_topic == "aiming"
        assert context.active_agent == "Tips Agent"
