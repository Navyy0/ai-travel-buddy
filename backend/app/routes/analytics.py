"""
Analytics routes: admin analytics queries from MongoDB.

Endpoints:
- GET /admin/analytics → retrieve analytics from MongoDB (requires admin role)
"""

from fastapi import APIRouter, HTTPException, Depends
from app.routes.admin import require_role
from app.db.mongo import get_db

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/admin/analytics")
async def get_admin_analytics(current_admin = Depends(require_role(["admin"])), db=Depends(get_db)):
    """
    Retrieve analytics directly from MongoDB.
    Requires admin role.
    
    Returns:
    ```json
    {
        "total_itineraries_generated": 42,
        "top_5_destinations": [
            {"destination": "Paris", "count": 10},
            {"destination": "Tokyo", "count": 8}
        ]
    }
    ```
    """
    try:
        # Get total count of itineraries
        total_itineraries = await db["itineraries"].count_documents({})
        
        # Get top 5 destinations by aggregation
        pipeline = [
            {"$group": {"_id": "$destination", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        top_destinations_cursor = db["itineraries"].aggregate(pipeline)
        top_destinations = await top_destinations_cursor.to_list(5)
        
        # Format response
        return {
            "total_itineraries_generated": total_itineraries,
            "top_5_destinations": [
                {"destination": item["_id"], "count": item["count"]}
                for item in top_destinations
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve analytics: {str(e)}")
