from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum


class ActivityType(str, Enum):
    """Activity types for itinerary"""
    SIGHTSEEING = "sightseeing"
    DINING = "dining"
    ADVENTURE = "adventure"
    RELAXATION = "relaxation"
    SHOPPING = "shopping"
    ENTERTAINMENT = "entertainment"
    TRANSPORTATION = "transportation"
    ACCOMMODATION = "accommodation"
    OTHER = "other"


class Activity(BaseModel):
    """Individual activity in a day plan"""
    id: Optional[str] = None
    time: str  # e.g., "09:00" in HH:MM format
    title: str
    description: str
    activity_type: ActivityType
    location: str
    duration_minutes: int
    cost: Optional[float] = 0.0
    notes: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "time": "09:00",
                "title": "Statue of Liberty",
                "description": "Visit the iconic statue",
                "activity_type": "sightseeing",
                "location": "Liberty Island, New York",
                "duration_minutes": 120,
                "cost": 24.0,
                "notes": "Book tickets in advance"
            }
        }


class DayPlan(BaseModel):
    """Plan for a single day in the itinerary"""
    day: int
    date: str  # ISO format: YYYY-MM-DD
    title: Optional[str] = None
    theme: Optional[str] = None
    activities: List[Activity] = []
    notes: Optional[str] = None
    estimated_budget: Optional[float] = None

    class Config:
        json_schema_extra = {
            "example": {
                "day": 1,
                "date": "2025-12-20",
                "title": "Arrival & Exploration",
                "theme": "City Exploration",
                "activities": [
                    {
                        "time": "10:00",
                        "title": "Check-in at Hotel",
                        "description": "Arrive and check into hotel",
                        "activity_type": "accommodation",
                        "location": "Hotel Address",
                        "duration_minutes": 60,
                        "cost": 150.0
                    }
                ],
                "notes": "Rest after travel",
                "estimated_budget": 200.0
            }
        }


class Itinerary(BaseModel):
    """Complete travel itinerary"""
    id: Optional[str] = None
    user_id: str
    title: str
    description: Optional[str] = None
    destination: str
    start_date: str  # ISO format: YYYY-MM-DD
    end_date: str    # ISO format: YYYY-MM-DD
    duration_days: int
    day_plans: List[DayPlan] = []
    total_budget: Optional[float] = None
    travel_style: Optional[str] = None  # e.g., "luxury", "budget", "adventure"
    is_public: bool = False
    public: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "507f1f77bcf86cd799439011",
                "title": "New York Christmas 2025",
                "description": "A magical holiday trip to NYC",
                "destination": "New York, USA",
                "start_date": "2025-12-20",
                "end_date": "2025-12-27",
                "duration_days": 7,
                "day_plans": [],
                "total_budget": 2000.0,
                "travel_style": "luxury",
                "is_public": False
            }
        }


class ItineraryCreate(BaseModel):
    """Schema for creating a new itinerary"""
    title: str
    description: Optional[str] = None
    destination: str
    start_date: str
    end_date: str
    travel_style: Optional[str] = None
    total_budget: Optional[float] = None


class ItineraryUpdate(BaseModel):
    """Schema for updating an itinerary"""
    title: Optional[str] = None
    description: Optional[str] = None
    total_budget: Optional[float] = None
    travel_style: Optional[str] = None
    is_public: Optional[bool] = None
    public: Optional[bool] = None
    day_plans: Optional[List[DayPlan]] = None
