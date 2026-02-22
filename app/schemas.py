from datetime import datetime

from pydantic import BaseModel, Field


class TelemetryCreate(BaseModel):
    """
    Request model for creating a telemetry record.
    """

    satelliteId: str
    timestamp: datetime
    altitude: float = Field(..., gt=0)
    velocity: float = Field(..., gt=0)
    status: str


class TelemetryResponse(BaseModel):
    """
    Response model representing a telemetry record.
    """

    id: int
    satelliteId: str
    timestamp: datetime
    altitude: float
    velocity: float
    status: str

    class Config:
        from_attributes = True  # Enables mapping to pydantic model
