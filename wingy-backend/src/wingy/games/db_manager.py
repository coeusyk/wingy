"""Database manager for game catalog and suggested questions."""

import sqlite3
from pathlib import Path
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

# Database path
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)
GAMES_DB_PATH = DATA_DIR / "games.db"


class GamesDatabase:
    """Manager for games database operations."""
    
    def __init__(self, db_path: Path = GAMES_DB_PATH):
        """Initialize database connection and create tables if needed."""
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Create tables if they don't exist."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Games table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS games (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    abbr TEXT NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Add abbr column if it doesn't exist (migration for existing databases)
            cursor.execute("PRAGMA table_info(games)")
            columns = [column[1] for column in cursor.fetchall()]
            if 'abbr' not in columns:
                cursor.execute("ALTER TABLE games ADD COLUMN abbr TEXT DEFAULT 'UNK'")
                logger.info("Added abbr column to games table")
            
            # Suggested questions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS suggested_questions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    game_id TEXT NOT NULL,
                    question TEXT NOT NULL,
                    priority INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (game_id) REFERENCES games (id) ON DELETE CASCADE
                )
            """)
            
            # Create index for faster queries
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_questions_game_id 
                ON suggested_questions (game_id)
            """)
            
            conn.commit()
            logger.info("Games database initialized successfully")
    
    def get_all_games(self) -> List[Dict[str, str]]:
        """Get all games from database."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, category, abbr FROM games ORDER BY name")
            return [dict(row) for row in cursor.fetchall()]
    
    def search_games(self, query: str) -> List[Dict[str, str]]:
        """Search games by name."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, name, category, abbr FROM games WHERE name LIKE ? ORDER BY name",
                (f"%{query}%",)
            )
            return [dict(row) for row in cursor.fetchall()]
    
    def get_game_by_id(self, game_id: str) -> Optional[Dict[str, str]]:
        """Get a specific game by ID."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, category, abbr, description FROM games WHERE id = ?", (game_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    def get_suggested_questions(self, game_ids: List[str]) -> List[Dict[str, str]]:
        """Get suggested questions for a list of games."""
        if not game_ids:
            return []
        
        placeholders = ",".join("?" * len(game_ids))
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(
                f"""
                SELECT q.id, q.question, q.game_id, g.name as game_name, q.priority
                FROM suggested_questions q
                JOIN games g ON q.game_id = g.id
                WHERE q.game_id IN ({placeholders})
                ORDER BY q.priority DESC, q.id
                """,
                game_ids
            )
            return [dict(row) for row in cursor.fetchall()]
    
    def add_game(self, game_id: str, name: str, category: str, abbr: str, description: str = "") -> bool:
        """Add a new game to the database."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO games (id, name, category, abbr, description) VALUES (?, ?, ?, ?, ?)",
                    (game_id, name, category, abbr, description)
                )
                conn.commit()
                return True
        except sqlite3.IntegrityError:
            logger.warning(f"Game with id {game_id} already exists")
            return False
    
    def add_suggested_question(self, game_id: str, question: str, priority: int = 0) -> bool:
        """Add a suggested question for a game."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO suggested_questions (game_id, question, priority) VALUES (?, ?, ?)",
                    (game_id, question, priority)
                )
                conn.commit()
                return True
        except sqlite3.Error as e:
            logger.error(f"Error adding suggested question: {e}")
            return False
    
    def seed_data(self):
        """Seed the database with initial game data and suggested questions."""
        # Game catalog data with abbreviations
        games_data = [
            # FPS (game_id, name, category, abbr, description)
            ("valorant", "Valorant", "FPS", "VAL", "Tactical 5v5 character-based shooter"),
            ("cs2", "Counter-Strike 2", "FPS", "CS2", "Classic competitive FPS"),
            ("overwatch2", "Overwatch 2", "FPS", "OW2", "Team-based hero shooter"),
            
            # MOBA
            ("league-of-legends", "League of Legends", "MOBA", "LoL", "5v5 competitive MOBA"),
            ("dota2", "Dota 2", "MOBA", "Dota", "Complex strategic MOBA"),
            
            # Battle Royale
            ("fortnite", "Fortnite", "Battle Royale", "FN", "Build and battle royale"),
            ("apex-legends", "Apex Legends", "Battle Royale", "Apex", "Hero-based battle royale"),
            ("cod-warzone", "Call of Duty: Warzone", "Battle Royale", "WZ", "Realistic battle royale"),
            
            # Sandbox
            ("minecraft", "Minecraft", "Sandbox", "MC", "Creative building and survival"),
            
            # Action
            ("gta5", "GTA V", "Action", "GTA", "Open-world action adventure"),
            
            # Sports
            ("rocket-league", "Rocket League", "Sports", "RL", "Car soccer"),
            ("fifa", "FIFA", "Sports", "FIFA", "Soccer simulation"),
            
            # RPG
            ("elden-ring", "Elden Ring", "RPG", "ER", "Open-world dark fantasy RPG"),
            ("dark-souls", "Dark Souls", "RPG", "DS", "Challenging action RPG"),
            ("baldurs-gate-3", "Baldur's Gate 3", "RPG", "BG3", "D&D-based RPG"),
            ("skyrim", "Skyrim", "RPG", "Skyr", "Open-world fantasy RPG"),
            ("witcher3", "The Witcher 3", "RPG", "W3", "Story-driven fantasy RPG"),
            ("cyberpunk-2077", "Cyberpunk 2077", "RPG", "CP77", "Futuristic open-world RPG"),
            ("hogwarts-legacy", "Hogwarts Legacy", "RPG", "HL", "Wizarding world RPG"),
            ("starfield", "Starfield", "RPG", "SF", "Space exploration RPG"),
            
            # Strategy
            ("civilization-vi", "Civilization VI", "Strategy", "Civ6", "Turn-based strategy"),
            ("age-of-empires", "Age of Empires", "Strategy", "AoE", "Real-time strategy"),
            ("total-war", "Total War", "Strategy", "TW", "Grand strategy and tactics"),
            ("stellaris", "Stellaris", "Strategy", "Stel", "Space grand strategy"),
            
            # MMO
            ("wow", "World of Warcraft", "MMO", "WoW", "Fantasy MMORPG"),
            ("ffxiv", "Final Fantasy XIV", "MMO", "FF14", "Story-rich MMORPG"),
            ("lost-ark", "Lost Ark", "MMO", "LA", "Action MMORPG"),
            ("new-world", "New World", "MMO", "NW", "Colonial-era MMO"),
            
            # Indie
            ("hollow-knight", "Hollow Knight", "Indie", "HK", "Metroidvania platformer"),
            ("stardew-valley", "Stardew Valley", "Indie", "SDV", "Farming simulation"),
            ("hades", "Hades", "Indie", "Hades", "Roguelike dungeon crawler"),
            ("celeste", "Celeste", "Indie", "Cel", "Precision platformer"),
            ("terraria", "Terraria", "Indie", "Terr", "2D sandbox adventure"),
        ]
        
        # Add games (will skip if already exists due to IntegrityError)
        for game_id, name, category, abbr, description in games_data:
            self.add_game(game_id, name, category, abbr, description)
        
        # Update existing games with abbreviations if they have default 'UNK'
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            for game_id, name, category, abbr, description in games_data:
                cursor.execute(
                    "UPDATE games SET abbr = ? WHERE id = ? AND (abbr = 'UNK' OR abbr IS NULL)",
                    (abbr, game_id)
                )
            conn.commit()
        
        # Suggested questions for each game
        questions_data = [
            # Valorant
            ("valorant", "How do I improve my aim in Valorant?", 10),
            ("valorant", "What are the best agents for beginners?", 9),
            ("valorant", "How do I use utility effectively?", 8),
            
            # Minecraft
            ("minecraft", "Teach me redstone basics in Minecraft", 10),
            ("minecraft", "How do I find diamonds quickly?", 9),
            ("minecraft", "What are the best enchantments?", 8),
            
            # Elden Ring
            ("elden-ring", "What's the best starter build in Elden Ring?", 10),
            ("elden-ring", "How do I beat Margit the Fell Omen?", 9),
            ("elden-ring", "Where should I explore first?", 8),
            
            # League of Legends
            ("league-of-legends", "What are the best champions for beginners?", 10),
            ("league-of-legends", "How do I improve my CS (creep score)?", 9),
            ("league-of-legends", "What's the current meta?", 8),
            
            # Fortnite
            ("fortnite", "How do I build faster in Fortnite?", 10),
            ("fortnite", "What are the best landing spots?", 9),
            ("fortnite", "How do I improve in 1v1 fights?", 8),
            
            # Dark Souls
            ("dark-souls", "What class should I start with?", 10),
            ("dark-souls", "How do I parry effectively?", 9),
            ("dark-souls", "Where do I go after the Undead Burg?", 8),
            
            # Dota 2
            ("dota2", "What are the easiest heroes for beginners?", 10),
            ("dota2", "How does the laning phase work?", 9),
            ("dota2", "What items should I buy first?", 8),
            
            # Rocket League
            ("rocket-league", "How do I improve my aerials?", 10),
            ("rocket-league", "What are the best camera settings?", 9),
            ("rocket-league", "How do I rotate properly in 3v3?", 8),
        ]
        
        # Add suggested questions
        for game_id, question, priority in questions_data:
            self.add_suggested_question(game_id, question, priority)
        
        logger.info("Database seeded successfully")


# Global database instance
_db_instance = None

def get_db() -> GamesDatabase:
    """Get or create the global database instance."""
    global _db_instance
    if _db_instance is None:
        _db_instance = GamesDatabase()
    return _db_instance
