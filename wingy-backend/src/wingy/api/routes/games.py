"""Game catalog API routes."""

from fastapi import APIRouter, Query

from wingy.games.game_catalog import get_popular_games, get_all_games, search_games


router = APIRouter(prefix="/games", tags=["games"])


@router.get("/popular")
async def get_popular():
    """Get list of popular games.
    
    Returns:
        Dictionary containing list of popular games and count
    """
    games = get_popular_games()
    return {
        "games": games,
        "count": len(games)
    }


@router.get("/all")
async def get_all():
    """Get all available games.
    
    Returns:
        Dictionary containing list of all games and count
    """
    games = get_all_games()
    return {
        "games": games,
        "count": len(games)
    }


@router.get("/search")
async def search(q: str = Query(..., min_length=1, description="Search query")):
    """Search games by name.
    
    Args:
        q: Search query string (minimum 1 character)
        
    Returns:
        Dictionary containing matching games, count, and the query
    """
    results = search_games(q)
    return {
        "games": results,
        "count": len(results),
        "query": q
    }

