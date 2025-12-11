from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserSignUp(BaseModel):
    """User registration schema"""
    email: EmailStr
    password: str
    full_name: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123",
                "full_name": "John Doe"
            }
        }


class UserLogin(BaseModel):
    """User login schema"""
    email: EmailStr
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }


class UserResponse(BaseModel):
    """User response schema (no password)"""
    id: str
    email: str
    role: str = "traveler"
    full_name: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "email": "user@example.com",
                "full_name": "John Doe",
                "created_at": "2025-11-13T10:00:00Z",
                "updated_at": None
            }
        }


class FirebaseTokenRequest(BaseModel):
    """Firebase token exchange request schema"""
    id_token: str

    class Config:
        json_schema_extra = {
            "example": {
                "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1Njc4OTA..."
            }
        }


class TokenResponse(BaseModel):
    """Token response after login"""
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserResponse

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": "507f1f77bcf86cd799439011",
                    "email": "user@example.com",
                    "role": "traveler",
                    "full_name": "John Doe",
                    "created_at": "2025-11-13T10:00:00Z"
                }
            }
        }


class RefreshRequest(BaseModel):
    """Refresh token request schema"""
    refresh_token: str

    class Config:
        json_schema_extra = {
            "example": {"refresh_token": "<refresh-token-string>"}
        }
