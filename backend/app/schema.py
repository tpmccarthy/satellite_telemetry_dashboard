from datetime import datetime, timezone
from pydantic import BaseModel, AwareDatetime, ConfigDict, Field, field_validator
from typing import List
from uuid import UUID


class TelemetrySchema(BaseModel):
    """
    Request model for single telemetry record
    """
    id: UUID
    satelliteId: str
    timestamp: datetime
    altitude: float
    velocity: float
    status: str

    model_config = ConfigDict(from_attributes=True)


class TelemetryCreate(BaseModel):
    """
    Request model for creating a telemetry record.
    """

    satelliteId: str
    timestamp: AwareDatetime
    altitude: float = Field(..., gt=0)
    velocity: float = Field(..., gt=0)
    status: str

    @field_validator('timestamp', mode='after')
    @classmethod
    def normalize_to_utc(cls, v: datetime) -> datetime:
        """
        Ensures all telemetry is stored on a single universal timeline.
        :param cls: class definition
        :type cls: type
        :param v: parsed datetime object
        :type v: datetime.datetime

        :return: timezone aware object in UTC
        :rtype: datetime.datetime
        """
        return v.astimezone(timezone.utc)


class TelemetryResponse(BaseModel):
    """
    Response model returning filtered endpoint
    """

    total: int
    limit: int
    offset: int
    data: List[TelemetrySchema]

    model_config = ConfigDict(from_attributes=True)
