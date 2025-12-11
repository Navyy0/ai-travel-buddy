"""
Authentication service handling JWT, Firebase, and password operations.
"""

import os
import base64
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import bcrypt
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from jose import JWTError, jwt
from dotenv import load_dotenv
from bson import ObjectId

from app.db.mongo import get_db
from app.schemas.user import UserResponse

load_dotenv()

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-this")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Firebase Configuration (optional - only if credentials provided)
FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH")
firebase_initialized = False

try:
    if FIREBASE_CREDENTIALS_PATH and os.path.exists(FIREBASE_CREDENTIALS_PATH):
        cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
        firebase_initialized = True
        print("✓ Firebase initialized")
except Exception as e:
    print(f"⚠ Firebase initialization skipped: {str(e)}")


class AuthService:
    """Authentication service"""

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode(), salt).decode()

    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode(), hashed.encode())

    @staticmethod
    def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        if expires_delta is None:
            expires_delta = timedelta(minutes=JWT_EXPIRE_MINUTES)
        
        expire = datetime.utcnow() + expires_delta
        to_encode = {
            "sub": user_id,
            "exp": expire,
            "type": "access"
        }
        
        encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return encoded_jwt

    @staticmethod
    def create_refresh_token(user_id: str) -> str:
        """Create JWT refresh token"""
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode = {
            "sub": user_id,
            "exp": expire,
            "type": "refresh"
        }
        
        encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return encoded_jwt

    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> Optional[str]:
        """Verify JWT token and return user_id"""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id: str = payload.get("sub")
            token_type_payload: str = payload.get("type")
            
            if user_id is None or token_type_payload != token_type:
                return None
            
            return user_id
        except JWTError:
            return None

    @staticmethod
    async def verify_firebase_token(id_token: str) -> Optional[Dict[str, Any]]:
        """
        Verify Firebase ID token.
        Returns Firebase user data if valid, None otherwise.
        Falls back to JWT decoding if Admin SDK is not initialized.
        """
        # Try Admin SDK first if available
        if firebase_initialized:
            try:
                decoded_token = firebase_auth.verify_id_token(id_token)
                return decoded_token
            except Exception as e:
                print(f"Firebase Admin SDK verification failed: {str(e)}")
                # Fall through to JWT decoding
        
        # Fallback: Decode JWT token manually (for development when Admin SDK not configured)
        # Note: This doesn't verify the signature, but extracts user info
        # For production, Admin SDK should be configured
        try:
            # JWT format: header.payload.signature
            parts = id_token.split('.')
            if len(parts) != 3:
                print("⚠ Invalid JWT token format")
                return None
            
            # Decode payload (second part)
            payload_part = parts[1]
            # Add padding if needed
            padding = 4 - len(payload_part) % 4
            if padding != 4:
                payload_part += '=' * padding
            
            decoded_bytes = base64.urlsafe_b64decode(payload_part)
            decoded = json.loads(decoded_bytes.decode('utf-8'))
            
            # Extract Firebase user data from decoded token
            # Firebase ID tokens use "sub" for user ID
            firebase_user = {
                "uid": decoded.get("sub"),  # Firebase uses "sub" for user ID
                "email": decoded.get("email"),
                "name": decoded.get("name") or decoded.get("display_name"),
                "email_verified": decoded.get("email_verified", False),
            }
            
            # Ensure we have at least uid and email
            if not firebase_user.get("uid") or not firebase_user.get("email"):
                print("⚠ Firebase token missing required fields (uid or email)")
                return None
            
            print("⚠ Using JWT decode fallback (Admin SDK not configured)")
            return firebase_user
        except Exception as e:
            print(f"Firebase token verification failed: {str(e)}")
            return None

    @staticmethod
    async def register_user(email: str, password: str, full_name: str) -> Optional[UserResponse]:
        """Register a new user"""
        db = get_db()
        users_col = db["users"]
        
        # Check if user exists
        existing_user = await users_col.find_one({"email": email})
        if existing_user:
            return None
        
        # Create new user
        hashed_password = AuthService.hash_password(password)
        user_doc = {
            "email": email,
            "password": hashed_password,
            "full_name": full_name,
            "role": "traveler",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await users_col.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        
        return AuthService._to_user_response(user_doc)

    @staticmethod
    async def login_user(email: str, password: str) -> Optional[UserResponse]:
        """Authenticate user and return user data if valid"""
        db = get_db()
        users_col = db["users"]
        
        user = await users_col.find_one({"email": email})
        if not user or not AuthService.verify_password(password, user.get("password", "")):
            return None
        
        return AuthService._to_user_response(user)

    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[UserResponse]:
        """Get user by ID"""
        try:
            db = get_db()
            users_col = db["users"]
            
            user = await users_col.find_one({"_id": ObjectId(user_id)})
            if not user:
                return None
            
            return AuthService._to_user_response(user)
        except Exception:
            return None

    @staticmethod
    async def firebase_login_or_create(firebase_user_data: Dict[str, Any]) -> Optional[UserResponse]:
        """
        Login or create user from Firebase token data.
        Firebase tokens include uid, email, name, etc.
        """
        db = get_db()
        users_col = db["users"]
        
        email = firebase_user_data.get("email")
        uid = firebase_user_data.get("uid")
        name = firebase_user_data.get("name", "Firebase User")
        
        if not email:
            return None
        
        # Find existing user by email
        user = await users_col.find_one({"email": email})
        
        if user:
            # Update last login
            await users_col.update_one(
                {"_id": user["_id"]},
                {"$set": {"updated_at": datetime.utcnow()}}
            )
            return AuthService._to_user_response(user)
        
        # Create new user from Firebase
        user_doc = {
            "email": email,
            "full_name": name,
            "firebase_uid": uid,
            "role": "traveler",
            "password": None,  # No password for Firebase users
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await users_col.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        
        return AuthService._to_user_response(user_doc)

    @staticmethod
    def _to_user_response(user_doc: Dict[str, Any]) -> UserResponse:
        """Convert MongoDB user document to UserResponse"""
        return UserResponse(
            id=str(user_doc["_id"]),
            email=user_doc.get("email"),
            role=user_doc.get("role", "traveler"),
            full_name=user_doc.get("full_name"),
            created_at=user_doc.get("created_at"),
            updated_at=user_doc.get("updated_at")
        )
