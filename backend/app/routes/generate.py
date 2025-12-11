"""
Route to generate itineraries by calling AI and enriching results with Maps data.

POST /generate

Flow: validate -> call ai_client.generate_itinerary -> enrich with maps ->
compute travel times & estimated costs -> return itinerary JSON (do not save)
"""

from typing import Any, Dict, List, Optional
import math
import asyncio

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import logging
from datetime import datetime

from app.services.ai_client import AIClient
from app.services import maps

router = APIRouter(tags=["generate"])


class GenerateRequest(BaseModel):
    destination: str
    start_date: str
    end_date: str
    budget: Optional[float] = None
    preferences: Optional[List[str]] = Field(default_factory=list)
    travelers: Optional[int] = 1
    travel_style: Optional[str] = "balanced"


async def _enrich_activity(activity: Dict[str, Any]) -> Dict[str, Any]:
    """Attach place info (lat/lon, place_name, address) to activity when possible."""
    loc = activity.get("location")
    if not loc:
        return activity

    try:
        search_res = await maps.search_place(loc, limit=1)
    except Exception:
        search_res = None

    place_info: Dict[str, Any] = {}
    if search_res and isinstance(search_res, list) and len(search_res) > 0:
        first = search_res[0]
        place_info["place_name"] = first.get("place_name", "")
        place_info["lat"] = first.get("lat")
        place_info["lon"] = first.get("lon")
        place_info["display_name"] = first.get("display_name", "")
        place_info["type"] = first.get("type", "")
    else:
        # Log for debugging: failed enrichment for this activity location
        import logging
        logging.getLogger(__name__).warning("Enrichment failed for activity location: %s -> search_res=%s", loc, repr(search_res))
    activity["place_info"] = place_info
    return activity


async def _compute_travel_between(a_from: Dict[str, Any], a_to: Dict[str, Any]) -> Dict[str, Any]:
    """Compute directions between two activities if lat/lon available."""
    pf = a_from.get("place_info") or {}
    pt = a_to.get("place_info") or {}
    if not pf.get("lat") or not pt.get("lat"):
        return {"travel_time_minutes": None, "travel_cost": None, "distance_meters": None, "route_geojson": None}

    try:
        # Call OSRM with (lon, lat) tuples
        directions = await maps.get_directions([(pf['lon'], pf['lat']), (pt['lon'], pt['lat'])])
    except Exception:
        return {"travel_time_minutes": None, "travel_cost": None, "distance_meters": None, "route_geojson": None}

    if not directions:
        return {"travel_time_minutes": None, "travel_cost": None, "distance_meters": None, "route_geojson": None}

    duration_s = directions.get("duration_seconds", 0)
    distance_m = directions.get("distance_meters", 0)
    route_geojson = directions.get("geometry")

    minutes = math.ceil(duration_s / 60) if duration_s else None
    # simple cost estimate: $0.6 per km
    cost = round((distance_m / 1000.0) * 0.6, 2) if distance_m else None

    return {
        "travel_time_minutes": minutes,
        "travel_cost": cost,
        "distance_meters": distance_m,
        "route_geojson": route_geojson,
    }


@router.post("/generate")
async def generate_itinerary(payload: GenerateRequest):
    # Validate basic fields (Pydantic already validated types/formats loosely)
    dest = payload.destination or ""
    if not dest or not isinstance(dest, str) or not dest.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="destination is required")

    # Compute duration_days from dates when possible
    duration_days = None
    try:
        if payload.start_date and payload.end_date:
            sd = datetime.fromisoformat(payload.start_date)
            ed = datetime.fromisoformat(payload.end_date)
            # include both start and end dates
            diff = (ed.date() - sd.date()).days + 1
            duration_days = diff if diff > 0 else 1
    except Exception:
        logging.getLogger(__name__).warning("Could not parse start/end dates for duration_days")

    # Call AI to generate itinerary
    ai_result = await AIClient.generate_itinerary(
        destination=dest.strip(),
        start_date=payload.start_date,
        end_date=payload.end_date,
        duration_days=duration_days,
        travel_style=payload.travel_style,
        interests=payload.preferences,
        budget=payload.budget,
    )

    if not ai_result:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="AI generation failed")

    # ai_result expected to be validated itinerary dict with day_plans
    day_plans = ai_result.get("day_plans", [])

    # Enrich activities with place info concurrently per day
    for day in day_plans:
        activities = day.get("activities", [])
        # enrich activities sequentially but could be parallelized
        enriched_activities = []
        for act in activities:
            enriched = await _enrich_activity(act)
            enriched_activities.append(enriched)

        # compute travel between consecutive activities
        for idx in range(len(enriched_activities)):
            if idx == 0:
                # no travel from previous
                enriched_activities[idx]["travel_from_previous"] = {
                    "travel_time_minutes": None,
                    "travel_cost": None,
                    "distance_meters": None,
                    "route_geojson": None,
                }
                continue

            prev = enriched_activities[idx - 1]
            cur = enriched_activities[idx]
            travel_info = await _compute_travel_between(prev, cur)
            cur["travel_from_previous"] = {
                "travel_time_minutes": travel_info.get("travel_time_minutes"),
                "travel_cost": travel_info.get("travel_cost"),
                "distance_meters": travel_info.get("distance_meters"),
                "route_geojson": travel_info.get("route_geojson"),
            }

        # recompute day's estimated budget based on activities and travel costs
        day_total = 0.0
        for act in enriched_activities:
            cost = act.get("cost") or 0.0
            tcost = None
            tf = act.get("travel_from_previous") or {}
            tcost = tf.get("travel_cost") or 0.0
            try:
                day_total += float(cost) + float(tcost)
            except Exception:
                pass

        # prefer AI-provided estimated_budget if present, else set computed
        if not day.get("estimated_budget"):
            day["estimated_budget"] = round(day_total, 2)

        day["activities"] = enriched_activities

    # Optionally compute total estimated budget
    computed_total = 0.0
    for d in day_plans:
        eb = d.get("estimated_budget") or 0.0
        try:
            computed_total += float(eb)
        except Exception:
            pass

    ai_result["computed_estimated_total_budget"] = round(computed_total, 2)

    return JSONResponse(content=ai_result)
