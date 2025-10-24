"""Game catalog API routes."""

from typing import List
from fastapi import APIRouter, Query
from pydantic import BaseModel

from wingy.games.game_catalog import get_all_games, search_games
from wingy.games.db_manager import get_db


router = APIRouter(prefix="/games", tags=["games"])


class SuggestedQuestionsRequest(BaseModel):
    """Request model for suggested questions."""
    game_ids: List[str]


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


@router.post("/suggested-questions")
async def get_suggested_questions(request: SuggestedQuestionsRequest):
    """Get suggested questions for selected games.
    
    Args:
        request: Contains list of game IDs
        
    Returns:
        Dictionary containing suggested questions for the selected games
    """
    db = get_db()
    questions = db.get_suggested_questions(request.game_ids)
    return {
        "questions": questions,
        "count": len(questions)
    }
