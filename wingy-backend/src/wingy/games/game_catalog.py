"""Comprehensive game catalog for Wingy."""

from typing import List, Dict
from .db_manager import get_db

# Legacy catalog kept for reference
GAME_CATALOG = {
    "fps": [
        {"id": "valorant", "name": "Valorant", "category": "FPS"},
        {"id": "cs2", "name": "Counter-Strike 2", "category": "FPS"},
        {"id": "overwatch2", "name": "Overwatch 2", "category": "FPS"},
    ],
    "moba": [
        {"id": "league-of-legends", "name": "League of Legends", "category": "MOBA"},
        {"id": "dota2", "name": "Dota 2", "category": "MOBA"},
    ],
    "battle_royale": [
        {"id": "fortnite", "name": "Fortnite", "category": "Battle Royale"},
        {"id": "apex-legends", "name": "Apex Legends", "category": "Battle Royale"},
        {"id": "cod-warzone", "name": "Call of Duty: Warzone", "category": "Battle Royale"},
    ],
    "sandbox": [
        {"id": "minecraft", "name": "Minecraft", "category": "Sandbox"},
    ],
    "action": [
        {"id": "gta5", "name": "GTA V", "category": "Action"},
    ],
    "sports": [
        {"id": "rocket-league", "name": "Rocket League", "category": "Sports"},
        {"id": "fifa", "name": "FIFA", "category": "Sports"},
    ],
    "rpg": [
        {"id": "elden-ring", "name": "Elden Ring", "category": "RPG"},
        {"id": "dark-souls", "name": "Dark Souls", "category": "RPG"},
        {"id": "baldurs-gate-3", "name": "Baldur's Gate 3", "category": "RPG"},
        {"id": "skyrim", "name": "Skyrim", "category": "RPG"},
        {"id": "witcher3", "name": "The Witcher 3", "category": "RPG"},
        {"id": "cyberpunk-2077", "name": "Cyberpunk 2077", "category": "RPG"},
        {"id": "hogwarts-legacy", "name": "Hogwarts Legacy", "category": "RPG"},
        {"id": "starfield", "name": "Starfield", "category": "RPG"},
    ],
    "strategy": [
        {"id": "civilization-vi", "name": "Civilization VI", "category": "Strategy"},
        {"id": "age-of-empires", "name": "Age of Empires", "category": "Strategy"},
        {"id": "total-war", "name": "Total War", "category": "Strategy"},
        {"id": "stellaris", "name": "Stellaris", "category": "Strategy"},
    ],
    "mmo": [
        {"id": "wow", "name": "World of Warcraft", "category": "MMO"},
        {"id": "ffxiv", "name": "Final Fantasy XIV", "category": "MMO"},
        {"id": "lost-ark", "name": "Lost Ark", "category": "MMO"},
        {"id": "new-world", "name": "New World", "category": "MMO"},
    ],
    "indie": [
        {"id": "hollow-knight", "name": "Hollow Knight", "category": "Indie"},
        {"id": "stardew-valley", "name": "Stardew Valley", "category": "Indie"},
        {"id": "hades", "name": "Hades", "category": "Indie"},
        {"id": "celeste", "name": "Celeste", "category": "Indie"},
        {"id": "terraria", "name": "Terraria", "category": "Indie"},
    ]
}


def get_all_games() -> List[Dict[str, str]]:
    """Return all games from database.
    
    Returns:
        List of unique game dictionaries sorted by name
    """
    db = get_db()
    return db.get_all_games()


def search_games(query: str) -> List[Dict[str, str]]:
    """Search games by name in database.
    
    Args:
        query: Search query string
        
    Returns:
        List of matching game dictionaries
    """
    db = get_db()
    return db.search_games(query)

