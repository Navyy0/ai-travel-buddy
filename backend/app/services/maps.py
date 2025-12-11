"""
Maps service compatibility layer.
Delegates all map-related calls to OlaMapsService for unified handling.
"""

from typing import Dict, Any, Optional, List, Tuple
from app.services.ola_maps import OlaMapsService


async def search_place(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Search for places using Ola Maps.

    Args:
        query: Search query string
        limit: Max number of results to return

    Returns:
        List of dicts with fields: place_name, lat, lon, display_name, type
    """
    return await OlaMapsService.places_autocomplete(query, limit=limit)


async def get_place_details(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    """Get place details via reverse geocoding using Ola Maps.

    Args:
        lat: Latitude
        lon: Longitude

    Returns:
        Dict with fields: place_name, lat, lon, display_name, address
    """
    return await OlaMapsService.reverse_geocode(lat, lon)


async def get_directions(points: List[Tuple[float, float]]) -> Optional[Dict[str, Any]]:
    """Get directions between multiple points using Ola Maps.

    Args:
        points: List of (lon, lat) tuples (legacy OSRM format)

    Returns:
        Dict with: duration_seconds, distance_meters, geometry (GeoJSON)
    """
    # Convert (lon, lat) to (lat, lon) for Ola Maps
    ola_points = [(lat, lon) for lon, lat in points]
    return await OlaMapsService.get_directions(ola_points)