import pytest
from httpx import AsyncClient
from datetime import datetime

@pytest.mark.asyncio
async def test_health_and_register(monkeypatch):
    import app.main as main_mod

    async def noop_async(*args, **kwargs):
        return None

    # Patch DB startup to avoid external connections
    monkeypatch.setattr(main_mod, "connect_to_mongo", noop_async)
    monkeypatch.setattr(main_mod, "create_indexes", noop_async)

    # Prepare fake user object returned by AuthService.register_user
    from app.schemas.user import UserResponse

    fake_user = UserResponse(
        id="507f1f77bcf86cd799439011",
        email="user@example.com",
        full_name="John Doe",
        created_at=datetime.utcnow()
    )

    async def fake_register_user(email, password, full_name):
        return fake_user

    def fake_create_access_token(user_id):
        return "fake-token"

    # Patch AuthService methods on the routes module import
    monkeypatch.setattr("app.routes.auth.AuthService.register_user", fake_register_user)
    monkeypatch.setattr("app.routes.auth.AuthService.create_access_token", fake_create_access_token)

    async with AsyncClient(app=main_mod.app, base_url="http://test") as ac:
        # health check
        h = await ac.get("/health")
        assert h.status_code == 200

        # register
        payload = {"email": "user@example.com", "password": "pw123456", "full_name": "John Doe"}
        r = await ac.post("/auth/register", json=payload)

    assert r.status_code == 201
    body = r.json()
    assert body.get("access_token") == "fake-token"
    assert body.get("user").get("email") == "user@example.com"
