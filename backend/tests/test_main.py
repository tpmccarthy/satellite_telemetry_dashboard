import pytest
import httpx
from app.main import app
from app.db import init_db


@pytest.fixture
def transport():
    init_db()  # ensures telemetry tables are created
    return httpx.ASGITransport(app=app)


# --- POST: DATA INGESTION & CONSTRAINTS ---
@pytest.mark.asyncio
async def test_post_telemetry_constraints(transport):
    async with httpx.AsyncClient(
        transport=transport,
        base_url="http://test"
    ) as ac:
        # Test 1: Valid Data (Happy Path)
        payload = {
            "satelliteId": "SAT-1",
            "timestamp": "2026-02-23T12:00:00Z",
            "altitude": 400.5,
            "velocity": 7.6,
            "status": "healthy"
        }
        res = await ac.post("/telemetry", json=payload)
        assert res.status_code == 200

        # Test 2: Constraint Validation (Negative Altitude)
        bad_payload = payload.copy()
        bad_payload["altitude"] = -50.0
        res = await ac.post("/telemetry", json=bad_payload)
        assert res.status_code == 422   # Pydantic gt=0 constraint triggered


# --- GET: RETRIEVAL & FILTERING ---
@pytest.mark.asyncio
async def test_get_telemetry_filtering(transport):
    async with httpx.AsyncClient(
        transport=transport,
        base_url="http://test"
    ) as ac:
        # Create a record first
        await ac.post(
            "/telemetry",
            json={
                "satelliteId": "V-1",
                "timestamp": "2026-02-23T12:00:00Z",
                "altitude": 100,
                "velocity": 10,
                "status": "healthy"
            }
        )

        # Test Filter by SatelliteId
        res = await ac.get("/telemetry", params={"satelliteId": "V-1"})
        assert res.status_code == 200
        assert len(res.json()["data"]) >= 1


# --- DELETE: RECORD PURGING ---
@pytest.mark.asyncio
async def test_delete_telemetry_lifecycle(transport):
    async with httpx.AsyncClient(
        transport=transport,
        base_url="http://test"
    ) as ac:
        # 1. Create
        post_res = await ac.post(
            "/telemetry",
            json={
                "satelliteId": "DEL-1",
                "timestamp": "2026-02-23T12:00:00Z",
                "altitude": 100,
                "velocity": 10,
                "status": "healthy"
            }
        )
        record_id = post_res.json()["id"]

        # 2. Delete
        del_res = await ac.delete(f"/telemetry/{record_id}")
        assert del_res.status_code == 200

        # 3. Verify Gone (404)
        get_res = await ac.get(f"/telemetry/{record_id}")
        assert get_res.status_code == 404
