"""
CRUD routes for itineraries.

Endpoints:
- POST /itineraries (auth required) — save validated itinerary to `itineraries` collection
- GET /itineraries — list user itineraries
- GET /itineraries/{id}
- PUT /itineraries/{id}
- DELETE /itineraries/{id}
"""

from typing import Any, Dict, List
from datetime import datetime

from fastapi import APIRouter, HTTPException, status, Depends, Body
from pydantic import ValidationError
from bson.objectid import ObjectId

from app.db.mongo import get_db
from app.schemas.itinerary import Itinerary, ItineraryUpdate
from app.routes.auth import get_current_user

router = APIRouter(prefix="/itineraries", tags=["itineraries"])


def _serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    out = {k: v for k, v in doc.items() if k != "_id"}
    _id = doc.get("_id")
    if _id is not None:
        out["id"] = str(_id)
    # convert datetimes to ISO strings
    for k in ("created_at", "updated_at"):
        if k in out and isinstance(out[k], datetime):
            out[k] = out[k].isoformat()
    return out


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_itinerary(payload: Dict[str, Any] = Body(...), current_user_id: str = Depends(get_current_user)):
    """Validate and save an itinerary for the authenticated user."""
    db = get_db()
    data = dict(payload)
    data["user_id"] = current_user_id
    data["created_at"] = datetime.utcnow()
    data["updated_at"] = datetime.utcnow()

    try:
        itinerary = Itinerary(**data)
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    doc = itinerary.dict(exclude_none=True)
    result = await db["itineraries"].insert_one(doc)
    inserted = await db["itineraries"].find_one({"_id": result.inserted_id})
    return _serialize_doc(inserted)


@router.get("")
async def list_itineraries(current_user_id: str = Depends(get_current_user)):
    """List itineraries for the authenticated user."""
    db = get_db()
    cursor = db["itineraries"].find({"user_id": current_user_id}).sort("created_at", -1)
    results = []
    async for doc in cursor:
        results.append(_serialize_doc(doc))
    return results


@router.get("/{itinerary_id}")
async def get_itinerary(itinerary_id: str, current_user_id: str = Depends(get_current_user)):
    db = get_db()
    try:
        oid = ObjectId(itinerary_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid itinerary id")

    doc = await db["itineraries"].find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found")
    if doc.get("user_id") != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    return _serialize_doc(doc)


@router.put("/{itinerary_id}")
async def update_itinerary(itinerary_id: str, payload: Dict[str, Any] = Body(...), current_user_id: str = Depends(get_current_user)):
    db = get_db()
    try:
        oid = ObjectId(itinerary_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid itinerary id")

    existing = await db["itineraries"].find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found")
    if existing.get("user_id") != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    # Only allow specific fields to be updated
    allowed_fields = {"title", "day_plans", "total_budget", "description", "duration_days", "is_public", "public"}
    payload = dict(payload)
    update_fields = {k: v for k, v in payload.items() if k in allowed_fields}

    if not update_fields:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No updatable fields provided")

    # Prevent changing owner and update timestamp
    update_fields["user_id"] = current_user_id
    update_fields["updated_at"] = datetime.utcnow()

    # Validate resulting itinerary by merging with existing document
    try:
        merged = {**existing, **update_fields}
        itinerary = Itinerary(**merged)
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    update_doc = {"$set": update_fields}
    await db["itineraries"].update_one({"_id": oid}, update_doc)
    updated = await db["itineraries"].find_one({"_id": oid})
    return _serialize_doc(updated)


@router.delete("/{itinerary_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_itinerary(itinerary_id: str, current_user_id: str = Depends(get_current_user)):
    db = get_db()
    try:
        oid = ObjectId(itinerary_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid itinerary id")

    existing = await db["itineraries"].find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found")
    if existing.get("user_id") != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    await db["itineraries"].delete_one({"_id": oid})
    return None
