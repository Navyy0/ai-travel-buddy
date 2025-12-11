"""Centralized exception handlers for FastAPI app."""
import logging
from typing import Any

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import status
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("app.core.exceptions")


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handle HTTPException (returned by FastAPI/Starlette)."""
    # Don't log benign 4xx too verbosely, but record message for audit
    if 500 <= getattr(exc, "status_code", 500):
        logger.exception("HTTPException: %s %s", request.method, request.url)
    else:
        logger.info("HTTPException: %s %s -> %s", request.method, request.url, exc.detail)

    return JSONResponse(
        status_code=getattr(exc, "status_code", status.HTTP_500_INTERNAL_SERVER_ERROR),
        content={"error": str(exc.detail)},
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    logger.info("Validation error for request %s %s: %s", request.method, request.url, exc.errors())
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": "Validation error", "details": exc.errors()},
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception for request %s %s", request.method, request.url)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Internal server error"},
    )
