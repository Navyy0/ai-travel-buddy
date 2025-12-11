"""
AI client service for generating travel itineraries using Google Gemini API.
"""

import os
import json
from typing import Dict, Any, Optional
import google.generativeai as genai
from dotenv import load_dotenv
from pydantic import ValidationError
import logging

from app.schemas.itinerary import Itinerary, DayPlan, Activity, ActivityType

load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    logging.getLogger(__name__).info("✓ Gemini API configured")
else:
    logging.getLogger(__name__).warning("⚠ GEMINI_API_KEY not set")

# Force use of Google Gemini 2.5 Flash model only (do not allow other models).
# This is intentionally hard-coded to ensure the app always uses the
# `gemini-2.5-flash` model per project requirements.
MODEL_NAME = "gemini-2.5-flash"


class AIClient:
    """AI service for travel planning"""

    @staticmethod
    async def generate_itinerary(
        destination: str,
        start_date: str,
        end_date: str,
        duration_days: int,
        travel_style: str = "balanced",
        interests: Optional[list] = None,
        budget: Optional[float] = None,
        additional_notes: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Generate a complete travel itinerary using Gemini AI.
        
        Args:
            destination: Travel destination (e.g., "Paris, France")
            start_date: Start date (YYYY-MM-DD format)
            end_date: End date (YYYY-MM-DD format)
            duration_days: Number of days for the trip
            travel_style: Type of travel - "luxury", "budget", "adventure", "cultural", "balanced"
            interests: List of interests (e.g., ["museums", "restaurants", "hiking"])
            budget: Total budget for the trip
            additional_notes: Any special requests or notes
        
        Returns:
            Dictionary containing itinerary data matching the Itinerary schema, or None on error
        """
        
        if not GEMINI_API_KEY:
            logging.getLogger(__name__).error("Error: GEMINI_API_KEY not configured")
            return None
        
        # Build the prompt
        prompt = AIClient._build_itinerary_prompt(
            destination=destination,
            start_date=start_date,
            end_date=end_date,
            duration_days=duration_days,
            travel_style=travel_style,
            interests=interests,
            budget=budget,
            additional_notes=additional_notes,
        )
        
        try:
            # Call Gemini API
            model = genai.GenerativeModel(MODEL_NAME)
            response = model.generate_content(prompt)
            
            if not response.text:
                logging.getLogger(__name__).error("Error: Empty response from Gemini API")
                return None
            
            # Extract JSON from response
            itinerary_data = AIClient._extract_json_from_response(response.text)
            
            if not itinerary_data:
                logging.getLogger(__name__).error("Error: Could not extract JSON from Gemini response")
                return None
            
            # Validate against schema
            validated_itinerary = AIClient._validate_itinerary(itinerary_data)
            
            if not validated_itinerary:
                logging.getLogger(__name__).error("Error: Generated itinerary failed schema validation")
                return None
            
            return validated_itinerary
            
        except Exception:
            logging.getLogger(__name__).exception("Error generating itinerary")
            return None

    @staticmethod
    def _build_itinerary_prompt(
        destination: str,
        start_date: str,
        end_date: str,
        duration_days: int,
        travel_style: str,
        interests: Optional[list],
        budget: Optional[float],
        additional_notes: Optional[str],
    ) -> str:
        """Build the prompt for Gemini to generate an itinerary"""
        
        interests_text = ", ".join(interests) if interests else "general tourism"
        budget_text = f"Total budget: ${budget}" if budget else "Budget not specified"
        notes_text = f"\nSpecial requests: {additional_notes}" if additional_notes else ""
        
        prompt = f"""Generate a detailed travel itinerary for the following trip:

**Trip Details:**
- Destination: {destination}
- Start Date: {start_date}
- End Date: {end_date}
- Duration: {duration_days} days
- Travel Style: {travel_style}
- Interests: {interests_text}
- {budget_text}{notes_text}

Please create a comprehensive day-by-day itinerary in the following JSON format (IMPORTANT: Return ONLY valid JSON):

{{
  "title": "A catchy title for the trip",
  "description": "Brief description of the trip",
  "destination": "{destination}",
  "start_date": "{start_date}",
  "end_date": "{end_date}",
  "duration_days": {duration_days},
  "total_budget": {budget or 0},
  "travel_style": "{travel_style}",
  "day_plans": [
    {{
      "day": 1,
      "date": "{start_date}",
      "title": "Day 1 title",
      "theme": "Theme for the day",
      "activities": [
        {{
          "time": "09:00",
          "title": "Activity title",
          "description": "Activity description",
          "activity_type": "sightseeing",
          "location": "Location name",
          "duration_minutes": 120,
          "cost": 25.0,
          "notes": "Any special notes"
        }}
      ],
      "notes": "General notes for the day",
      "estimated_budget": 100.0
    }}
  ]
}}

Requirements:
1. Generate exactly {duration_days} day plans
2. Each day should have 3-5 activities
3. Include realistic times, costs, and durations
4. Activity types must be one of: sightseeing, dining, adventure, relaxation, shopping, entertainment, transportation, accommodation, other
5. Times should be in HH:MM format (24-hour)
6. Ensure times are logical and don't overlap excessively
7. Include a mix of activities based on interests: {interests_text}
8. Total estimated budget should align with: {budget_text}
9. Days should flow logically with travel time considered
10. Return ONLY valid JSON, no markdown code blocks or extra text"""

        return prompt

    @staticmethod
    def _extract_json_from_response(response_text: str) -> Optional[Dict[str, Any]]:
        """Extract JSON from Gemini response, handling markdown code blocks"""
        try:
            # Try direct JSON parsing first
            return json.loads(response_text)
        except json.JSONDecodeError:
            pass
        
        # Try to extract from markdown code block
        if "```json" in response_text:
            start = response_text.find("```json") + 7
            end = response_text.find("```", start)
            if end > start:
                try:
                    return json.loads(response_text[start:end].strip())
                except json.JSONDecodeError:
                    pass
        
        # Try to extract from ```
        if "```" in response_text:
            start = response_text.find("```") + 3
            end = response_text.find("```", start)
            if end > start:
                try:
                    return json.loads(response_text[start:end].strip())
                except json.JSONDecodeError:
                    pass
        
        # Try to find JSON object by braces
        start = response_text.find("{")
        end = response_text.rfind("}")
        if start >= 0 and end > start:
            try:
                return json.loads(response_text[start:end+1])
            except json.JSONDecodeError:
                pass
        
        return None

    @staticmethod
    def _validate_itinerary(data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Validate itinerary data against Pydantic schema.
        Return cleaned/validated data or None if invalid.
        """
        try:
            # Process day_plans to ensure proper structure
            day_plans = []
            for day_data in data.get("day_plans", []):
                # Validate activities
                activities = []
                for activity_data in day_data.get("activities", []):
                    # Ensure activity_type is valid
                    activity_type = activity_data.get("activity_type", "other").lower()
                    if activity_type not in [at.value for at in ActivityType]:
                        activity_type = "other"
                    
                    activity_data["activity_type"] = activity_type
                    activities.append(activity_data)
                
                day_data["activities"] = activities
                day_plans.append(day_data)
            
            data["day_plans"] = day_plans
            
            # Create Itinerary instance to validate
            itinerary = Itinerary(
                user_id="temp_placeholder",  # Will be set by caller
                title=data.get("title", "Untitled Trip"),
                description=data.get("description"),
                destination=data.get("destination", ""),
                start_date=data.get("start_date", ""),
                end_date=data.get("end_date", ""),
                duration_days=data.get("duration_days", 1),
                day_plans=[
                    DayPlan(
                        day=dp.get("day", 1),
                        date=dp.get("date", ""),
                        title=dp.get("title"),
                        theme=dp.get("theme"),
                        activities=[
                            Activity(
                                time=act.get("time", "09:00"),
                                title=act.get("title", "Activity"),
                                description=act.get("description", ""),
                                activity_type=act.get("activity_type", "other"),
                                location=act.get("location", ""),
                                duration_minutes=int(act.get("duration_minutes", 60)),
                                cost=float(act.get("cost", 0)),
                                notes=act.get("notes"),
                            )
                            for act in dp.get("activities", [])
                        ],
                        notes=dp.get("notes"),
                        estimated_budget=float(dp.get("estimated_budget", 0)) if dp.get("estimated_budget") else None,
                    )
                    for dp in day_plans
                ],
                total_budget=float(data.get("total_budget", 0)) if data.get("total_budget") else None,
                travel_style=data.get("travel_style"),
                is_public=False,
            )
            
            # Return as dict (without user_id placeholder)
            return {
                "title": itinerary.title,
                "description": itinerary.description,
                "destination": itinerary.destination,
                "start_date": itinerary.start_date,
                "end_date": itinerary.end_date,
                "duration_days": itinerary.duration_days,
                "total_budget": itinerary.total_budget,
                "travel_style": itinerary.travel_style,
                "is_public": itinerary.is_public,
                "day_plans": [
                    {
                        "day": dp.day,
                        "date": dp.date,
                        "title": dp.title,
                        "theme": dp.theme,
                        "activities": [
                            {
                                "time": act.time,
                                "title": act.title,
                                "description": act.description,
                                "activity_type": act.activity_type,
                                "location": act.location,
                                "duration_minutes": act.duration_minutes,
                                "cost": act.cost,
                                "notes": act.notes,
                            }
                            for act in dp.activities
                        ],
                        "notes": dp.notes,
                        "estimated_budget": dp.estimated_budget,
                    }
                    for dp in itinerary.day_plans
                ],
            }
            
        except ValidationError as e:
            logging.getLogger(__name__).exception("Validation error while validating itinerary: %s", e)
            return None
        except Exception as e:
            logging.getLogger(__name__).exception("Error validating itinerary")
            return None
