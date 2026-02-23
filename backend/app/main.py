from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.db import SessionLocal, init_db
from app.models import TelemetryModel
from app.schema import TelemetrySchema, TelemetryCreate, TelemetryResponse

from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional
from uuid import UUID


# Lifespan context
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context.

    Init database schema.
    """
    init_db()
    yield


# Launch App
app = FastAPI(lifespan=lifespan)


# Instantiate middleware for frontend/backend communications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Set up db session
def get_db():
    """
    Provide a SQLAlchemy session.

    Yields:
        SQLAlchemy Session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/telemetry", response_model=TelemetrySchema)
def create_telemetry(
    payload: TelemetryCreate,
    db: Session = Depends(get_db)
) -> TelemetrySchema:
    """
    Insert telemetry into database

    Args:
        payload (TelemetryCreate): telemetry input
        db (Session, optional): activate session

    Returns:
        Telemetry: class object from schema
    """
    telemetry = TelemetryModel(
        satelliteId=payload.satelliteId,
        timestamp=payload.timestamp,
        altitude=payload.altitude,
        velocity=payload.velocity,
        status=payload.status
    )
    
    db.add(telemetry)
    db.commit()
    db.refresh(telemetry)
    
    return telemetry


@app.get("/telemetry", response_model=TelemetryResponse)
def get_telemetry(
    satelliteId: Optional[str] = None,
    status: Optional[str] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = Query(100, gt=0, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> TelemetryResponse:
    """
    Retrieve telemetry from database

    Args:
        satellitedId (Optional[str], optional): satellite identifier. Defaults to None.
        status (Optional[str], optional): mnemonic status. Defaults to None.
        start_time (Optional[datetime], optional): start time for pagination. Defaults to None.
        end_time (Optional[datetime], optional): end time for pagination. Defaults to None.
        limit (int, optional): number of items to return. Defaults to Query(100, gt=0, le=100).
        offset (int, optional): skip "offset" number of records. Defaults to Query(0, ge=0).
        db (Session, optional): activate db session. Defaults to Depends(get_db).

    Returns:
        TelemetryResponse: class object from schema
    """
    query = db.query(TelemetryModel)

    if satelliteId:
        query = query.filter(TelemetryModel.satelliteId == satelliteId)
    if status:
        query = query.filter(TelemetryModel.status == status)
    if start_time:
        query = query.filter(TelemetryModel.timestamp >= start_time)
    if end_time:
        query = query.filter(TelemetryModel.timestamp <= end_time)

    total = query.count()
    query = query.order_by(TelemetryModel.timestamp.desc())
    results = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "data": results
    }


@app.get("/telemetry/{id}", response_model=TelemetrySchema)
def get_telemetry_by_id(
    id: UUID,
    db: Session = Depends(get_db),
) -> TelemetrySchema:
    """
    Get telemetry by telemetry UUID.

    Args:
        id (UUID): database record UUID
        db (Session, optional): activate db session. Defaults to Depends(get_db)

    Returns:
        Telemetry: class object from schema

    Raises:
        HTTPException: if no record found
    """

    telemetry_record = db.query(TelemetryModel).filter(TelemetryModel.id == id).first()

    if not telemetry_record:
        raise HTTPException(status_code=404, detail="Telemetry not found")

    return telemetry_record


@app.delete("/telemetry/{id}")
def delete_telemetry_by_id(
    id: UUID,
    db: Session = Depends(get_db)
) -> dict:
    """_summary_

    Args:
        id (UUID): database record UUID
        db (Session, optional): activate db session. Defaults to Depends(get_db).

    Returns:
        dict: delete confirmation message

    Raises:
        HTTPException: if no record found
    """

    telemetry = (
        db.query(TelemetryModel)
        .filter(TelemetryModel.id == str(id))
        .first()
    )

    if not telemetry:
        raise HTTPException(status_code=404, detail="Telemetry not found")

    db.delete(telemetry)
    db.commit()

    return {"message": "Telemetry deleted"}
