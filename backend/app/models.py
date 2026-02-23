from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.orm import declarative_base
import uuid

Base = declarative_base()


# Map model for telemetry table
# index=true for get endpoint filtering
# UUID for telemetry record id
# ISO Datetime object
class TelemetryModel(Base):
    __tablename__ = "telemetry"

    id = Column(
        String,
        primary_key=True,
        index=True,
        default=lambda: str(uuid.uuid4())
    )
    satelliteId = Column(String, nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    altitude = Column(Float, nullable=False)
    velocity = Column(Float, nullable=False)
    status = Column(String, nullable=False)
