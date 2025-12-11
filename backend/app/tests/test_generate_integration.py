import pytest
from datetime import datetime
from httpx import AsyncClient
import sys
import types


# Ensure `google.generativeai` is present in sys.modules so importing
# application modules that import it doesn't raise ImportError in test envs
sys.modules.setdefault("google", types.ModuleType("google"))
sys.modules.setdefault("google.generativeai", types.ModuleType("google.generativeai"))


@pytest.mark.asyncio
async def test_generate_route_enrichment_and_travel(monkeypatch):
    # Import application and modules to patch
    import app.main as main_mod
    from app.routes import generate as generate_module

    # Disable startup DB/connect tasks by replacing with no-ops
    async def noop_async(*args, **kwargs):
        return None

    monkeypatch.setattr(main_mod, "connect_to_mongo", noop_async)
    monkeypatch.setattr(main_mod, "create_indexes", noop_async)

    # Patch AIClient.generate_itinerary to return a deterministic itinerary
    async def fake_generate_itinerary(*args, **kwargs):
        return {
            "title": "Test Trip",
            "description": "Test",
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
                    "theme": "Mix",
                    "activities": [
                        {"time": "09:00", "title": "A1", "description": "desc", "activity_type": "sightseeing", "location": "Place One", "duration_minutes": 30, "cost": 10.0, "notes": ""},
                        {"time": "12:00", "title": "A2", "description": "desc", "activity_type": "dining", "location": "Place Two", "duration_minutes": 60, "cost": 20.0, "notes": ""},
                    ],
                    "notes": "",
                    "estimated_budget": None
                }
            ]
        }

    monkeypatch.setattr("app.routes.generate.AIClient.generate_itinerary", fake_generate_itinerary)

    # Patch maps.search_place -> returns Nominatim-like results
    async def fake_search_place(query, limit=5):
        return [
            {
                "place_name": "Place Name",
                "lat": 10.0,
                "lon": 20.0,
                "display_name": "Place Name, Testville",
                "type": "tourism"
            }
        ]

    # Patch maps.get_directions -> returns OSRM-like response
    async def fake_get_directions(points):
        # points is List[Tuple[lon, lat]]
        return {
            "duration_seconds": 600,
            "distance_meters": 5000,
            "geometry": {
                "type": "LineString",
                "coordinates": [[20.0, 10.0], [21.0, 11.0]]
            },
            "leg_durations": [600]
        }

    monkeypatch.setattr("app.routes.generate.maps.search_place", fake_search_place)
    monkeypatch.setattr("app.routes.generate.maps.get_directions", fake_get_directions)

    # Use AsyncClient to call the app route
    async with AsyncClient(app=main_mod.app, base_url="http://test") as ac:
        payload = {
            "destination": "Testville",
            "start_date": "2025-01-01",
            "end_date": "2025-01-01",
            "preferences": [],
            "travelers": 1,
            "travel_style": "balanced"
        }
        resp = await ac.post("/generate", json=payload)

    assert resp.status_code == 200
    body = resp.json()
    assert body.get("destination") == "Testville"
    # Check day_plans enriched
    dplans = body.get("day_plans")
    assert isinstance(dplans, list) and len(dplans) == 1
    acts = dplans[0].get("activities")
    assert acts[0].get("place_info").get("place_name") == "Place Name"
    assert acts[0].get("place_info").get("lat") == 10.0
    assert acts[0].get("place_info").get("lon") == 20.0
    # Second activity should have travel_from_previous computed
    assert acts[1].get("travel_from_previous").get("travel_time_minutes") == 10  # 600s -> 10min
    assert acts[1].get("travel_from_previous").get("distance_meters") == 5000
    assert acts[1].get("travel_from_previous").get("route_geojson") is not None
    # total computed budget present
    assert "computed_estimated_total_budget" in body
