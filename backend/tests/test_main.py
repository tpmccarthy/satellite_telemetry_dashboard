import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_create_telemetry_valid():
    """Test the 'Happy Path' for valid data ingestion."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {
            "satelliteId": "TEST-SAT",
            "timestamp": "2026-02-23T12:00:00Z",
            "altitude": 500.0,
            "velocity": 7.5,
            "status": "healthy"
        }
        response = await ac.post("/telemetry", json=payload)
        assert response.status_code == 200
        assert response.json()["satelliteId"] == "TEST-SAT"


@pytest.mark.asyncio
async def test_create_telemetry_invalid_altitude():
    """MISSION ASSURANCE: Ensure negative altitude is REJECTED."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {
            "satelliteId": "FAIL-SAT",
            "timestamp": "2026-02-23T12:00:00Z",
            "altitude": -100.0, # INVALID
            "velocity": 7.5,
            "status": "healthy"
        }
        response = await ac.post("/telemetry", json=payload)
        # Pydantic 'gt=0' should trigger a 422 Unprocessable Entity
        assert response.status_code == 422
