import json
import asyncio
import pytest
from datetime import datetime
import sys
import types


# Ensure tests don't fail when `google.generativeai` isn't installed in the
# test environment: provide a simple placeholder module before importing the
# application modules that import it.
sys.modules.setdefault("google", types.ModuleType("google"))
sys.modules.setdefault("google.generativeai", types.ModuleType("google.generativeai"))


@pytest.mark.asyncio
async def test_generate_itinerary_success(monkeypatch):
    # Import inside test so module-level load_dotenv already ran in source
    from app.services import ai_client

    # Ensure module-level GEMINI_API_KEY is set for the function
    ai_client.GEMINI_API_KEY = "test-key"

    # Prepare a fake Gemini response text (valid JSON itinerary)
    fake_itinerary = {
        "title": "Test Trip",
        "description": "A short test trip",
        "destination": "Testville",
        "start_date": "2025-01-01",
        "end_date": "2025-01-01",
        "duration_days": 1,
        "total_budget": 0,
        "travel_style": "balanced",
        "day_plans": [
            {
                "day": 1,
                "date": "2025-01-01",
                "title": "Day 1",
                "theme": "Sightseeing",
                "activities": [
                    {
                        "time": "09:00",
                        "title": "Morning Walk",
                        "description": "Walk around the park",
                        "activity_type": "sightseeing",
                        "location": "Central Park",
                        "duration_minutes": 60,
                        "cost": 0.0,
                        "notes": ""
                    }
                ],
                "notes": "",
                "estimated_budget": 0.0
            }
        ]
    }

    class MockResponse:
        def __init__(self, text):
            self.text = text

    class MockModel:
        def __init__(self, name):
            pass

        def generate_content(self, prompt):
            return MockResponse(json.dumps(fake_itinerary))

    # Patch the genai model to our MockModel (module exists due to sys.modules above)
    monkeypatch.setattr(ai_client.genai, "GenerativeModel", MockModel)

    # Call the async generate_itinerary
    result = await ai_client.AIClient.generate_itinerary(
        destination="Testville",
        start_date="2025-01-01",
        end_date="2025-01-01",
        duration_days=1,
    )

    assert result is not None
    assert result.get("destination") == "Testville"
    assert isinstance(result.get("day_plans"), list)
    assert len(result.get("day_plans")) == 1
