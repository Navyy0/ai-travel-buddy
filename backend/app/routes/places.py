"""Places routes: search, details, and reverse geocoding via Ola Maps."""

from fastapi import APIRouter, Query, HTTPException, status
from fastapi.responses import JSONResponse

from app.services.ola_maps import OlaMapsService

router = APIRouter(prefix="/places", tags=["places"])


@router.get("/search")
async def search_places(q: str = Query(..., description="Search query", min_length=1), 
                       limit: int = Query(5, ge=1, le=20)):
    """Search places using Ola Maps Autocomplete API.

    Query params:
    - `q` (required): search text
    - `limit`: max results (default 5)
    """
    try:
        results = await OlaMapsService.places_autocomplete(q, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

    return JSONResponse(content={"results": results})


@router.get("/details")
async def place_details(place_id: str = Query(..., description="Ola place_id")):
    """Get detailed place information by place_id.

    Query params:
    - `place_id` (required): Ola place_id from autocomplete/search
    """
    try:
        result = await OlaMapsService.place_details(place_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
    
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Place not found")
    
    return JSONResponse(content=result)


@router.get("/reverse")
async def reverse_geocode(lat: float = Query(..., description="Latitude"),
                         lon: float = Query(..., description="Longitude")):
    """Reverse geocode coordinates to get place details.

    Query params:
    - `lat` (required): latitude
    - `lon` (required): longitude
    """
    try:
        result = await OlaMapsService.reverse_geocode(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
    
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No place found for coordinates")
    
    return JSONResponse(content=result)
