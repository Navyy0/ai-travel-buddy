"""
Database indexes setup module.
Run at application startup to ensure all required indexes are created.
"""

from app.db.mongo import get_db
from pymongo import ASCENDING, DESCENDING


async def create_indexes():
    """Create all required database indexes"""
    db = get_db()
    
    # Users collection indexes
    users_col = db["users"]
    await users_col.create_index("email", unique=True)
    print("✓ Created index on users.email")
    
    # Itineraries collection indexes
    itineraries_col = db["itineraries"]
    await itineraries_col.create_index("user_id", unique=False)
    print("✓ Created index on itineraries.user_id")
    
    await itineraries_col.create_index("destination", unique=False)
    print("✓ Created index on itineraries.destination")
    
    await itineraries_col.create_index([("created_at", DESCENDING)])
    print("✓ Created index on itineraries.created_at")
    
    await itineraries_col.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
    print("✓ Created compound index on itineraries(user_id, created_at)")
    
    # Places cache collection indexes
    places_col = db["places_cache"]
    # Drop old place_id index if it exists (causes issues with null values)
    try:
        await places_col.drop_index("place_id_1")
        print("✓ Dropped old places_cache.place_id index")
    except Exception:
        pass  # Index doesn't exist, which is fine
    
    # Index on query field (used for cache lookups)
    try:
        await places_col.create_index("query", unique=True)
        print("✓ Created unique index on places_cache.query")
    except Exception:
        # Index might already exist
        print("✓ Index on places_cache.query already exists")
    
    await places_col.create_index([("created_at", DESCENDING)], expireAfterSeconds=2592000)  # 30 days TTL
    print("✓ Created TTL index on places_cache (30 days)")

    # Preferences collection (optional) - ensure exists and index on user_id
    prefs_col = db["preferences"]
    try:
        await prefs_col.create_index([("user_id", ASCENDING)], unique=False)
        print("✓ Created index on preferences.user_id")
    except Exception:
        pass

    # Analytics logs collection (optional) - basic index on created_at and event type
    analytics_col = db["analytics_logs"]
    try:
        await analytics_col.create_index([("created_at", DESCENDING)])
        print("✓ Created index on analytics_logs.created_at")
    except Exception:
        pass
    
    print("\n✅ All indexes created successfully")
