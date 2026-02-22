from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)
    satelliteId = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)  # stored as ISO 8601 string
    altitude = Column(Float, nullable=False)
    velocity = Column(Float, nullable=False)
    status = Column(String, nullable=False)
