import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.db.mongo import connect_to_mongo, close_mongo
from app.models.indexes import create_indexes
from app.routes import auth
from app.core import exceptions as core_exceptions
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

# Configure basic logging for the app
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app.main")

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="AI Travel Buddy API",
    description="Backend API for AI Travel Buddy application",
    version="1.0.0"
)

# Configure CORS
# Allow overriding the allowed origins via an environment variable
# Example: ALLOWED_ORIGINS="http://localhost:3000,https://localhost,http://10.0.2.2"
origins_env = os.getenv("ALLOWED_ORIGINS", "").strip()
if origins_env:
    origins = [o.strip() for o in origins_env.split(",") if o.strip()]
else:
    # sensible development defaults (includes emulator mapping and Capacitor host)
    origins = [
        "https://travelbuddy-ai.onrender.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "https://localhost",
        "http://localhost",
        "capacitor://localhost",
        "http://10.0.2.2",
        "http://127.0.0.1",
    ]

logger.info(f"Configured CORS origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup and shutdown events
@app.on_event("startup")
async def startup():
    """Connect to database and create indexes on startup"""
    await connect_to_mongo()
    await create_indexes()
    logger.info("✅ Application startup complete")


@app.on_event("shutdown")
async def shutdown():
    """Close database connection on shutdown"""
    await close_mongo()
    logger.info("✅ Application shutdown complete")


# Include routers
app.include_router(auth.router)
from app.routes import places, generate, itineraries, routes, admin, analytics, weather, embed
app.include_router(places.router)
app.include_router(routes.router)
app.include_router(generate.router)
app.include_router(itineraries.router)
app.include_router(admin.router)
app.include_router(analytics.router)
app.include_router(weather.router)
app.include_router(embed.router)
app.add_exception_handler(StarletteHTTPException, core_exceptions.http_exception_handler)
app.add_exception_handler(RequestValidationError, core_exceptions.validation_exception_handler)
app.add_exception_handler(Exception, core_exceptions.generic_exception_handler)
# from app.routes import trips, recommendations
# app.include_router(trips.router)
# app.include_router(recommendations.router)

@app.get("/")
async def root():
    return {"message": "Welcome to AI Travel Buddy API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
