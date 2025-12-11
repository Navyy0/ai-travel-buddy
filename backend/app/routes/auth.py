"""
Authentication routes: register, login, Firebase auth, refresh token, get current user.
"""

from fastapi import APIRouter, HTTPException, Depends, status, Response
from fastapi.security import HTTPBearer
from starlette.requests import Request
from typing import Optional

from app.schemas.user import UserSignUp, UserLogin, UserResponse, TokenResponse, FirebaseTokenRequest, RefreshRequest
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()


async def get_current_user(request: Request) -> str:
    """
    Dependency to extract and verify current user from JWT token.
    Returns user_id.
    """
    # First look for Authorization header, fall back to cookie named 'access_token'
    auth_header = request.headers.get("Authorization")
    token = None
    if auth_header:
        try:
            scheme, token = auth_header.split()
            if scheme.lower() != "bearer":
                token = None
        except ValueError:
            token = None

    if not token:
        # Try cookie
        token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization token")

    # If cookie contains Bearer prefix, strip it
    if token.startswith("Bearer "):
        token = token.split(" ", 1)[1]

    user_id = AuthService.verify_token(token, token_type="access")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_id


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserSignUp, response: Response):
    """
    Register a new user with email and password.
    Returns access token, refresh token, and user data.
    """
    # Register user
    user = await AuthService.register_user(
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Generate tokens
    access_token = AuthService.create_access_token(user.id)
    refresh_token = AuthService.create_refresh_token(user.id)

    # Set HttpOnly cookies for frontend usage
    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="lax", path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax", path="/")

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, response: Response):
    """
    Login with email and password.
    Returns access token and user data.
    """
    user = await AuthService.login_user(
        email=credentials.email,
        password=credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Generate tokens
    access_token = AuthService.create_access_token(user.id)
    refresh_token = AuthService.create_refresh_token(user.id)

    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="lax", path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax", path="/")

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user
    )


@router.post("/firebase", response_model=TokenResponse)
async def firebase_login(token_data: FirebaseTokenRequest, response: Response):
    """
    Login or register with Firebase ID token.
    Returns access token and user data.
    
    Request body:
    ```json
    {
        "id_token": "firebase_id_token_string"
    }
    ```
    """
    # Verify Firebase token
    firebase_user = await AuthService.verify_firebase_token(token_data.id_token)
    
    if not firebase_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase token"
        )
    
    # Login or create user
    user = await AuthService.firebase_login_or_create(firebase_user)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create/login user"
        )
    
    # Generate tokens
    access_token = AuthService.create_access_token(user.id)
    refresh_token = AuthService.create_refresh_token(user.id)

    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="lax", path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax", path="/")

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(payload: RefreshRequest, response: Response):
    """
    Refresh access token using refresh token.
    Must provide valid refresh token in body and send access token in Authorization header.
    
    Request body:
    ```json
    {
        "refresh_token": "refresh_token_string"
    }
    ```
    """
    # Verify refresh token (support token from body)
    user_id = AuthService.verify_token(payload.refresh_token, token_type="refresh")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    # Get user data
    user = await AuthService.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Generate new tokens
    new_access_token = AuthService.create_access_token(user.id)
    new_refresh_token = AuthService.create_refresh_token(user.id)

    response.set_cookie(key="access_token", value=new_access_token, httponly=True, samesite="lax", path="/")
    response.set_cookie(key="refresh_token", value=new_refresh_token, httponly=True, samesite="lax", path="/")

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        user=user
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user_id: str = Depends(get_current_user)):
    """
    Get current authenticated user information.
    Requires valid JWT token in Authorization header.
    """
    user = await AuthService.get_user_by_id(current_user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.post("/logout")
async def logout(response: Response):
    """Clear auth cookies to log the user out."""
    # Clear cookies by setting empty values and immediate expiry
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"ok": True}
