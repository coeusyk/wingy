"""API routes for user management."""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

from ...sessions.db_manager import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])


# Request/Response Models
class CreateUserRequest(BaseModel):
    """Request model for creating a user."""
    user_id: Optional[str] = Field(None, description="Optional user ID")


class UserResponse(BaseModel):
    """Response model for user data."""
    id: str = Field(..., description="User identifier")
    preferences: Dict[str, Any] = Field(default_factory=dict, description="User preferences")
    created_at: str | None = Field(None, description="Creation timestamp")


class OnboardRequest(BaseModel):
    """Request model for onboarding."""
    games: List[str] = Field(..., description="List of selected games")
    preferences: List[str] = Field(default_factory=list, description="User preferences")


class PreferencesUpdate(BaseModel):
    """Request model for updating preferences."""
    games: List[str] = Field(..., description="List of selected games")
    preferences: List[str] = Field(default_factory=list, description="User preferences")


@router.post("/create", response_model=UserResponse)
async def create_user(request: CreateUserRequest) -> UserResponse:
    """
    Create a new user.
    
    Returns a new user_id that should be stored in localStorage.
    """
    try:
        db = get_db()
        user = db.create_user(user_id=request.user_id)
        
        return UserResponse(
            id=user["id"],
            preferences=user["preferences"],
            created_at=user.get("created_at")
        )
    except Exception as e:
        logger.error(f"Error creating user: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create user: {str(e)}"
        )


@router.post("/{user_id}/onboard")
async def onboard_user(user_id: str, request: OnboardRequest):
    """
    Complete onboarding for a user by saving their initial preferences.
    
    Args:
        user_id: User identifier
        request: Onboarding data with games and preferences
    """
    try:
        db = get_db()
        
        # Check if user exists
        user = db.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Save preferences
        preferences = {
            "games": request.games,
            "preferences": request.preferences,
            "onboarded": True
        }
        
        success = db.update_user_preferences(user_id, preferences)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update preferences")
        
        return {
            "message": "Onboarding completed successfully",
            "user_id": user_id,
            "preferences": preferences
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error onboarding user: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to onboard user: {str(e)}"
        )


@router.get("/{user_id}/preferences", response_model=UserResponse)
async def get_user_preferences(user_id: str) -> UserResponse:
    """
    Get user preferences.
    
    Args:
        user_id: User identifier
    """
    try:
        db = get_db()
        user = db.get_user(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(
            id=user["id"],
            preferences=user["preferences"],
            created_at=user.get("created_at")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user preferences: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get user preferences: {str(e)}"
        )


@router.put("/{user_id}/preferences")
async def update_user_preferences(user_id: str, request: PreferencesUpdate):
    """
    Update user preferences.
    
    Args:
        user_id: User identifier
        request: New preferences data
    """
    try:
        db = get_db()
        
        # Check if user exists
        user = db.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update preferences
        preferences = {
            "games": request.games,
            "preferences": request.preferences,
            "onboarded": True
        }
        
        success = db.update_user_preferences(user_id, preferences)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update preferences")
        
        return {
            "message": "Preferences updated successfully",
            "user_id": user_id,
            "preferences": preferences
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user preferences: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update user preferences: {str(e)}"
        )
