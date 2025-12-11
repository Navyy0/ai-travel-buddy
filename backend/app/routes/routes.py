"""Routes for directions/routing via Ola Maps."""

from fastapi import APIRouter, Query, HTTPException, status
from fastapi.responses import JSONResponse

from app.services.ola_maps import OlaMapsService

router = APIRouter(prefix="/routes", tags=["routes"])


@router.get("/directions")
async def get_directions(
    origin_lat: float = Query(..., description="Origin latitude"),
    origin_lon: float = Query(..., description="Origin longitude"),
    dest_lat: float = Query(..., description="Destination latitude"),
    dest_lon: float = Query(..., description="Destination longitude"),
    profile: str = Query("driving", description="Routing profile: driving, walking, cycling")
):
    """Get directions between two points using Ola Maps Directions API.

    Query params:
    - `origin_lat`, `origin_lon` (required): origin coordinates
    - `dest_lat`, `dest_lon` (required): destination coordinates
    - `profile` (optional): driving (default), walking, cycling
    """
    try:
        origin = (origin_lat, origin_lon)
        destination = (dest_lat, dest_lon)
        result = await OlaMapsService.get_directions(origin, destination, profile=profile)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
    
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")
    
    return JSONResponse(content=result)
