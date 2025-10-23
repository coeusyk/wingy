"""Comprehensive game catalog for Wingy."""

from typing import List, Dict

GAME_CATALOG = {
    "popular": [
        {"id": "valorant", "name": "Valorant", "category": "FPS"},
        {"id": "league-of-legends", "name": "League of Legends", "category": "MOBA"},
        {"id": "minecraft", "name": "Minecraft", "category": "Sandbox"},
        {"id": "fortnite", "name": "Fortnite", "category": "Battle Royale"},
        {"id": "cs2", "name": "Counter-Strike 2", "category": "FPS"},
        {"id": "dota2", "name": "Dota 2", "category": "MOBA"},
        {"id": "apex-legends", "name": "Apex Legends", "category": "Battle Royale"},
        {"id": "overwatch2", "name": "Overwatch 2", "category": "FPS"},
        {"id": "gta5", "name": "GTA V", "category": "Action"},
        {"id": "rocket-league", "name": "Rocket League", "category": "Sports"},
        {"id": "cod-warzone", "name": "Call of Duty: Warzone", "category": "Battle Royale"},
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


def get_popular_games() -> List[Dict[str, str]]:
    """Return list of popular games.
    
    Returns:
        List of game dictionaries with id, name, and category
    """
    return GAME_CATALOG["popular"]


def get_all_games() -> List[Dict[str, str]]:
    """Return all games across all categories.
    
    Returns:
        List of unique game dictionaries sorted by name
    """
    all_games = []
    for category in GAME_CATALOG.values():
        all_games.extend(category)
    
    # Remove duplicates and sort
    seen = set()
    unique_games = []
    for game in all_games:
        if game["id"] not in seen:
            seen.add(game["id"])
            unique_games.append(game)
    
    return sorted(unique_games, key=lambda x: x["name"])


def search_games(query: str) -> List[Dict[str, str]]:
    """Search games by name.
    
    Args:
        query: Search query string
        
    Returns:
        List of matching game dictionaries
    """
    query = query.lower()
    all_games = get_all_games()
    return [game for game in all_games if query in game["name"].lower()]

