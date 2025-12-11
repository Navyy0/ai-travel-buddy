"""
Ola Maps service for place search, details, reverse geocoding, and directions.
Provides caching and retry/backoff logic using httpx async client.

Uses Ola Maps APIs:
- Autocomplete API: places/v1/autocomplete
- Place Details API: places/v1/details
- Reverse Geocoding: places/v1/reverse
- Directions API: routing/v1/directions (with /routes/v1/directions fallback)
"""

import os
import asyncio
import httpx
import logging
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timedelta
from dotenv import load_dotenv

from app.db.mongo import get_db

load_dotenv()

logger = logging.getLogger(__name__)

# Ola Maps API credentials from environment
OLA_MAPS_API_KEY = os.getenv("OLA_MAPS_API_KEY")
OLA_PROJECT_ID = os.getenv("OLA_PROJECT_ID")

# API base URL
OLA_API_BASE = "https://api.olamaps.io"

# Default headers with User-Agent
DEFAULT_HEADERS = {
    "Accept": "application/json",
    "User-Agent": "TripPlan/1.0"
}

# Retry configuration
MAX_RETRIES = 3
INITIAL_BACKOFF = 1  # seconds
MAX_BACKOFF = 10  # seconds

# Cache TTL (hours)
CACHE_TTL_HOURS = 24  # 24 hours as per spec


class OlaMapsService:
    """Ola Maps helper for place search, details, reverse geocoding, and directions."""

    @staticmethod
    async def _get(url: str, params: Dict[str, Any], retries: int = 0) -> Optional[Dict[str, Any]]:
        """Common HTTP GET requester with error handling and retry logic."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, params=params, headers=DEFAULT_HEADERS)

                if response.status_code == 429:
                    # Rate limited
                    if retries < MAX_RETRIES:
                        backoff = min(INITIAL_BACKOFF * (2 ** retries), MAX_BACKOFF)
                        logger.warning(f"Rate limited (429). Retrying in {backoff}s...")
                        await asyncio.sleep(backoff)
                        return await OlaMapsService._get(url, params, retries + 1)
                    logger.error(f"Max retries exceeded for rate limit on {url}")
                    return None

                if response.status_code == 403:
                    logger.error(f"Forbidden (403) — check API key and dashboard restrictions. URL: {url}")
                    return None

                if response.status_code >= 500:
                    # Server error — retry
                    if retries < MAX_RETRIES:
                        backoff = min(INITIAL_BACKOFF * (2 ** retries), MAX_BACKOFF)
                        logger.warning(f"Server error {response.status_code}. Retrying in {backoff}s...")
                        await asyncio.sleep(backoff)
                        return await OlaMapsService._get(url, params, retries + 1)

                if response.status_code != 200:
                    logger.error(f"HTTP {response.status_code} for {url}: {response.text[:500]}")
                    return None

                return response.json()

        except asyncio.TimeoutError:
            logger.error(f"Request timeout for {url}")
            if retries < MAX_RETRIES:
                backoff = min(INITIAL_BACKOFF * (2 ** retries), MAX_BACKOFF)
                await asyncio.sleep(backoff)
                return await OlaMapsService._get(url, params, retries + 1)
            return None
        except httpx.HTTPError as e:
            logger.exception(f"HTTP error for {url}: {e}")
            if retries < MAX_RETRIES:
                backoff = min(INITIAL_BACKOFF * (2 ** retries), MAX_BACKOFF)
                await asyncio.sleep(backoff)
                return await OlaMapsService._get(url, params, retries + 1)
            return None

    @staticmethod
    async def places_autocomplete(query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search places using Ola Places Autocomplete API.

        Args:
            query: Search query string
            limit: Max results to return

        Returns:
            List of dicts: [{ place_id, name, display_name, lat, lon, category }]
        """
        cache_key = f"autocomplete_{query}_{limit}"
        cached = await OlaMapsService._get_cached_result(cache_key)
        if cached:
            logger.debug(f"Cache hit for autocomplete: {query}")
            return cached

        if not OLA_MAPS_API_KEY:
            logger.error("OLA_MAPS_API_KEY not set")
            return []

        url = f"{OLA_API_BASE}/places/v1/autocomplete"
        params = {
            "input": query,
            "api_key": OLA_MAPS_API_KEY,
            "limit": limit,
        }

        result = await OlaMapsService._get(url, params)

        results = []
        if result and isinstance(result, dict):
            items = result.get("predictions") or []
            for item in items:
                try:
                    # Extract coordinates from nested geometry.location
                    geometry = item.get("geometry") or {}
                    location = geometry.get("location") or {}
                    lat = location.get("lat")
                    lon = location.get("lng")  # Note: Ola uses "lng" not "lon"
                    
                    # Fallback to top-level lat/lon if geometry not present
                    if lat is None:
                        lat = item.get("lat")
                    if lon is None:
                        lon = item.get("lng") or item.get("lon")

                    # Extract name/description
                    structured = item.get("structured_formatting") or {}
                    main_text = structured.get("main_text") or ""
                    secondary_text = structured.get("secondary_text") or ""
                    
                    name = main_text or item.get("name") or item.get("text") or ""
                    display_name = f"{main_text}, {secondary_text}".strip(", ") if main_text and secondary_text else (main_text or secondary_text or item.get("description") or "")

                    if lat is not None and lon is not None:
                        results.append({
                            "place_id": item.get("place_id"),
                            "name": name,
                            "display_name": display_name,
                            "lat": float(lat),
                            "lon": float(lon),
                            "category": item.get("types") and item.get("types")[0] or "",
                        })
                except Exception as e:
                    logger.debug(f"Error parsing autocomplete item: {e}")
                    continue

        if results:
            await OlaMapsService._cache_result(cache_key, results)
        return results

    @staticmethod
    async def place_details(place_id: str) -> Optional[Dict[str, Any]]:
        """Get place details by place_id.

        Args:
            place_id: Ola place_id

        Returns:
            Dict: { place_id, name, lat, lon, address, metadata }
        """
        cache_key = f"details_{place_id}"
        cached = await OlaMapsService._get_cached_result(cache_key)
        if cached:
            logger.debug(f"Cache hit for place details: {place_id}")
            return cached

        if not OLA_MAPS_API_KEY:
            logger.error("OLA_MAPS_API_KEY not set")
            return None

        url = f"{OLA_API_BASE}/places/v1/details"
        params = {
            "place_id": place_id,
            "api_key": OLA_MAPS_API_KEY,
        }

        result = await OlaMapsService._get(url, params)

        if result and isinstance(result, dict):
            try:
                geometry = result.get("geometry") or {}
                location = geometry.get("location") or {}
                lat = location.get("lat") or result.get("lat")
                lon = location.get("lng") or result.get("lng") or result.get("lon")

                details = {
                    "place_id": result.get("place_id") or place_id,
                    "name": result.get("name") or result.get("display_name") or "",
                    "lat": float(lat) if lat is not None else None,
                    "lon": float(lon) if lon is not None else None,
                    "address": result.get("address") or result.get("formatted_address") or "",
                    "metadata": result.get("metadata") or {},
                }
                await OlaMapsService._cache_result(cache_key, details)
                return details
            except Exception as e:
                logger.exception(f"Error parsing place details: {e}")
                return None

        return None

    @staticmethod
    async def reverse_geocode(lat: float, lon: float) -> Optional[Dict[str, Any]]:
        """Reverse geocode coordinates to get place info.

        Args:
            lat: Latitude
            lon: Longitude

        Returns:
            Dict: { lat, lon, display_name, address, metadata }
        """
        cache_key = f"reverse_{lat}_{lon}"
        cached = await OlaMapsService._get_cached_result(cache_key)
        if cached:
            logger.debug(f"Cache hit for reverse geocoding: {lat}, {lon}")
            return cached

        if not OLA_MAPS_API_KEY:
            logger.error("OLA_MAPS_API_KEY not set")
            return None

        url = f"{OLA_API_BASE}/places/v1/reverse"
        params = {
            "lat": lat,
            "lng": lon,
            "api_key": OLA_MAPS_API_KEY,
        }

        result = await OlaMapsService._get(url, params)

        if result and isinstance(result, dict):
            try:
                details = {
                    "lat": float(lat),
                    "lon": float(lon),
                    "display_name": result.get("display_name") or result.get("name") or "",
                    "address": result.get("address") or "",
                    "metadata": result.get("metadata") or {},
                }
                await OlaMapsService._cache_result(cache_key, details)
                return details
            except Exception as e:
                logger.exception(f"Error parsing reverse geocoding: {e}")
                return None

        return None

    @staticmethod
    async def get_directions(origin: Tuple[float, float], destination: Tuple[float, float], 
                            profile: str = "driving") -> Optional[Dict[str, Any]]:
        """Get directions between two points.

        Args:
            origin: (lat, lon) tuple
            destination: (lat, lon) tuple
            profile: 'driving', 'walking', 'cycling'

        Returns:
            Dict: { distance_meters, duration_seconds, geometry_geojson, steps }
        """
        cache_key = f"directions_{origin[0]}_{origin[1]}_{destination[0]}_{destination[1]}_{profile}"
        cached = await OlaMapsService._get_cached_result(cache_key)
        if cached:
            logger.debug(f"Cache hit for directions")
            return cached

        if not OLA_MAPS_API_KEY:
            logger.error("OLA_MAPS_API_KEY not set")
            return None

        # Try /routing/v1/directions first, fallback to /routes/v1/directions
        urls_to_try = [
            f"{OLA_API_BASE}/routing/v1/directions",
            f"{OLA_API_BASE}/routes/v1/directions",
        ]

        for url in urls_to_try:
            # Ola docs: origin and destination should be lat,lon
            params = {
                "origin": f"{origin[0]},{origin[1]}",
                "destination": f"{destination[0]},{destination[1]}",
                "api_key": OLA_MAPS_API_KEY,
                "profile": profile,
                "geometries": "geojson",
            }

            result = await OlaMapsService._get(url, params)

            if result and isinstance(result, dict):
                try:
                    routes = result.get("routes") or []
                    if routes:
                        route = routes[0]
                        distance_m = route.get("distance") or 0
                        duration_s = route.get("duration") or 0
                        geometry = route.get("geometry")

                        details = {
                            "distance_meters": float(distance_m),
                            "duration_seconds": float(duration_s),
                            "geometry_geojson": geometry,
                            "steps": route.get("legs") or route.get("steps") or [],
                        }
                        await OlaMapsService._cache_result(cache_key, details)
                        return details
                except Exception as e:
                    logger.exception(f"Error parsing directions: {e}")
                    continue
            elif result is None and url == urls_to_try[-1]:
                # Last URL failed
                logger.error("Both directions endpoints failed")
                return None

        return None

    @staticmethod
    async def _get_cached_result(cache_key: str) -> Optional[Any]:
        """Retrieve cached result from MongoDB."""
        try:
            db = get_db()
            places_col = db["places_cache"]
            doc = await places_col.find_one({"query": cache_key})
            if not doc:
                return None
            created_at = doc.get("cached_at")
            if created_at and isinstance(created_at, datetime):
                if datetime.utcnow() - created_at > timedelta(hours=CACHE_TTL_HOURS):
                    await places_col.delete_one({"query": cache_key})
                    return None
            return doc.get("raw_response")
        except Exception as e:
            logger.exception(f"Cache retrieval error: {e}")
            return None

    @staticmethod
    async def _cache_result(cache_key: str, data: Any) -> bool:
        """Cache result in MongoDB."""
        try:
            db = get_db()
            places_col = db["places_cache"]
            cache_doc = {
                "query": cache_key,
                "raw_response": data,
                "cached_at": datetime.utcnow(),
            }
            await places_col.update_one({"query": cache_key}, {"$set": cache_doc}, upsert=True)
            return True
        except Exception as e:
            logger.exception(f"Cache storage error: {e}")
            return False


# Backwards-compatible module-level wrappers (for existing imports)
async def search_place(query: str, limit: int = 5):
    """Wrapper: call OlaMapsService.places_autocomplete"""
    return await OlaMapsService.places_autocomplete(query, limit=limit)


async def get_place_details(lat: float, lon: float):
    """Wrapper: call OlaMapsService.reverse_geocode"""
    return await OlaMapsService.reverse_geocode(lat, lon)


async def get_directions(points: List[Tuple[float, float]]):
    """Wrapper: call OlaMapsService.get_directions with (lat,lon) tuples converted"""
    if len(points) < 2:
        return None
    origin = points[0]
    destination = points[-1]
    return await OlaMapsService.get_directions(origin, destination)
