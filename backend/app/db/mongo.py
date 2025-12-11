import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = "ai_travel_buddy"

client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None


async def connect_to_mongo():
    """Connect to MongoDB using Motor async client"""
    global client, db
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]
    
    # Ensure collections exist and create indexes if needed
    await ensure_collections()
    print(f"Connected to MongoDB: {DATABASE_NAME}")


async def close_mongo():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("Disconnected from MongoDB")


async def ensure_collections():
    """Ensure required collections exist with indexes"""
    global db
    
    collections = ["users", "itineraries", "places_cache"]
    
    for collection_name in collections:
        if collection_name not in await db.list_collection_names():
            await db.create_collection(collection_name)
            print(f"Created collection: {collection_name}")
    
    # Create indexes
    users_collection = db["users"]
    await users_collection.create_index("email", unique=True)
    
    itineraries_collection = db["itineraries"]
    await itineraries_collection.create_index("user_id")
    await itineraries_collection.create_index("created_at")
    
    places_collection = db["places_cache"]
    # Drop old place_id index if it exists (causes issues with null values)
    try:
        await places_collection.drop_index("place_id_1")
    except Exception:
        pass  # Index doesn't exist, which is fine
    
    # Index on query field (used for cache lookups) - unique to prevent duplicates
    try:
        await places_collection.create_index("query", unique=True)
    except Exception:
        pass  # Index might already exist


def get_db() -> AsyncIOMotorDatabase:
    """Get the MongoDB database instance"""
    if db is None:
        raise RuntimeError("Database not connected. Call connect_to_mongo() first.")
    return db


def get_client() -> AsyncIOMotorClient:
    """Get the MongoDB client instance"""
    if client is None:
        raise RuntimeError("Database not connected. Call connect_to_mongo() first.")
    return client
