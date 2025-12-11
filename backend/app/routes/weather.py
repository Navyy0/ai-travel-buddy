from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.services import packing

router = APIRouter(prefix="/weather", tags=["weather"])


class Location(BaseModel):
    lat: float
    lon: float


class PackingRequest(BaseModel):
    location: Location
    start_date: str = Field(..., description="Start date YYYY-MM-DD")
    end_date: str = Field(..., description="End date YYYY-MM-DD")
    use_gemini: Optional[bool] = True


@router.post("/packing")
async def packing_suggestions(req: PackingRequest):
    try:
        result = packing.generate_packing_suggestions(
            lat=req.location.lat,
            lon=req.location.lon,
            start=req.start_date,
            end=req.end_date,
            use_gemini=req.use_gemini,
        )
        return {"ok": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
