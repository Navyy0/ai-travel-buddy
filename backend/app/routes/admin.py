from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body
from pydantic import BaseModel
from bson.objectid import ObjectId

from app.routes.auth import get_current_user
from app.services.auth import AuthService
from app.db.mongo import get_db

router = APIRouter(prefix="/admin", tags=["admin"])


class RoleUpdateRequest(BaseModel):
    role: str


def require_role(required_roles: List[str]):
    async def dependency(current_user_id: str = Depends(get_current_user)):
        user = await AuthService.get_user_by_id(current_user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user")
        if user.role not in required_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")
        return user
    return dependency


@router.get("/users")
async def list_users(current_admin = Depends(require_role(["admin"]))):
    db = get_db()
    cursor = db["users"].find({}, {"password": 0})
    users = []
    async for u in cursor:
        users.append({
            "id": str(u.get("_id")),
            "email": u.get("email"),
            "role": u.get("role", "traveler")
        })
    return users


@router.patch("/users/{user_id}/role")
async def update_user_role(user_id: str, payload: RoleUpdateRequest = Body(...), current_admin = Depends(require_role(["admin"]))):
    db = get_db()
    # validate user id
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user id")

    # allowed roles (only traveler and admin)
    allowed_roles = {"traveler", "admin"}
    new_role = payload.role
    if new_role not in allowed_roles:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid role. Allowed: {sorted(list(allowed_roles))}")
    # fetch target user
    target = await db["users"].find_one({"_id": oid})
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Prevent an admin from removing another admin's role. Admins may promote travelers to admin,
    # but they may not demote other admins to a non-admin role. Self-demotion is allowed.
    target_role = target.get("role", "traveler")
    target_id_str = str(target.get("_id"))
    # current_admin is a UserResponse (pydantic) returned by AuthService.get_user_by_id
    current_admin_id = None
    try:
        current_admin_id = str(getattr(current_admin, "id", None) or getattr(current_admin, "_id", None))
    except Exception:
        current_admin_id = None

    if target_role == "admin" and new_role != "admin" and current_admin_id != target_id_str:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot remove admin role from another admin")

    res = await db["users"].update_one({"_id": oid}, {"$set": {"role": new_role}})
    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # audit log: record who performed the role change
    try:
        audit_doc = {
            "actor_id": getattr(current_admin, "id", None) or getattr(current_admin, "_id", None),
            "actor_email": getattr(current_admin, "email", None),
            "target_id": str(oid),
            "target_email": target.get("email"),
            "previous_role": target.get("role", "traveler"),
            "new_role": new_role,
            "timestamp": __import__('datetime').datetime.utcnow(),
        }
        await db["role_changes"].insert_one(audit_doc)
    except Exception:
        # Don't fail role change if audit logging fails; just continue
        pass

    updated = await db["users"].find_one({"_id": oid})
    return {
        "id": str(updated.get("_id")),
        "email": updated.get("email"),
        "role": updated.get("role", "traveler")
    }


@router.get("/itineraries")
async def list_all_itineraries(
    page: int = 1,
    page_size: int = 20,
    q: str | None = None,
    user_email: str | None = None,
    current_admin = Depends(require_role(["admin"]))
):
    """List itineraries with pagination and optional search/filtering.

    Query params:
    - `page`: page number (1-based)
    - `page_size`: items per page
    - `q`: simple text search against itinerary title (case-insensitive)
    - `user_email`: filter by owner email

    Returns an object with total, page, page_size and items.
    """
    db = get_db()
    filter_q = {}

    # filter by user email -> resolve to user id(s)
    if user_email:
        owner = await db["users"].find_one({"email": user_email})
        if owner:
            filter_q["user_id"] = str(owner.get("_id"))
        else:
            # no matching user -> empty result
            return {"total": 0, "page": page, "page_size": page_size, "items": []}

    # text search on title
    if q:
        filter_q["title"] = {"$regex": q, "$options": "i"}

    total = await db["itineraries"].count_documents(filter_q)

    skip = max(0, (page - 1)) * max(1, page_size)
    cursor = db["itineraries"].find(filter_q).sort("created_at", -1).skip(skip).limit(max(1, page_size))

    items = []
    async for doc in cursor:
        user_email_val = None
        uid = doc.get("user_id")
        if uid:
            try:
                owner = await db["users"].find_one({"_id": ObjectId(uid)})
                if owner:
                    user_email_val = owner.get("email")
            except Exception:
                user_email_val = uid

        items.append({
            "id": str(doc.get("_id")),
            "title": doc.get("title"),
            "user_email": user_email_val,
            "is_public": doc.get("is_public", False),
            "created_at": doc.get("created_at").isoformat() if doc.get("created_at") else None,
        })

    return {"total": total, "page": page, "page_size": page_size, "items": items}


@router.get("/role-changes")
async def get_role_changes(
    page: int = 1,
    page_size: int = 20,
    actor_email: Optional[str] = None,
    target_email: Optional[str] = None,
    current_admin = Depends(require_role(["admin"]))
):
    """Return role change audit log entries (paginated).

    Optional filters: `actor_email`, `target_email`.
    """
    db = get_db()
    filter_q = {}
    if actor_email:
        filter_q["actor_email"] = actor_email
    if target_email:
        filter_q["target_email"] = target_email

    total = await db["role_changes"].count_documents(filter_q)
    skip = max(0, (page - 1)) * max(1, page_size)
    cursor = db["role_changes"].find(filter_q).sort("timestamp", -1).skip(skip).limit(max(1, page_size))

    items = []
    async for doc in cursor:
        items.append({
            "id": str(doc.get("_id")),
            "actor_email": doc.get("actor_email"),
            "actor_id": str(doc.get("actor_id")) if doc.get("actor_id") else None,
            "target_email": doc.get("target_email"),
            "target_id": str(doc.get("target_id")) if doc.get("target_id") else None,
            "previous_role": doc.get("previous_role"),
            "new_role": doc.get("new_role"),
            "timestamp": doc.get("timestamp").isoformat() if doc.get("timestamp") else None,
        })

    return {"total": total, "page": page, "page_size": page_size, "items": items}
