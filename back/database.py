from typing import Any
from zoneinfo import ZoneInfo
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime

from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
import datetime
import os

# Local DB file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'flights.db')}"

TIMEZONE_NAME = "Europe/Paris"

engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = Session()

tz = ZoneInfo(TIMEZONE_NAME)

class Base(DeclarativeBase):
    pass

class Flight(Base):
    __tablename__ = "flights"
    id = Column(Integer, primary_key=True, index=True)
    flight_number = Column(String)
    airline = Column(String)
    dep = Column(String)
    arr = Column(String)
    dep_country = Column(String)
    arr_country = Column(String)
    dep_time_est = Column(DateTime(timezone=True))
    arr_time_est = Column(DateTime(timezone=True))
    dep_time = Column(DateTime(timezone=True))
    arr_time = Column(DateTime(timezone=True))
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.datetime.now(ZoneInfo(TIMEZONE_NAME)))

    @property
    def delay(self):
        """Return the arrival delay in minutes."""
        if self.arr_time and self.arr_time_est:
            return (self.arr_time - self.arr_time_est).total_seconds() / 60
        return None

    @property
    def status(self):
        now = datetime.datetime.now(tz)

        dep = self.dep_time
        arr = self.arr_time

        # Force naive → aware
        if dep and dep.tzinfo is None:
            dep = dep.replace(tzinfo=tz)
        if arr and arr.tzinfo is None:
            arr = arr.replace(tzinfo=tz)

        if dep and dep > now:
            return "Scheduled"
        elif dep and dep <= now:
            if arr and arr > now:
                return "Airborne"
            elif arr and arr <= now:
                return "Landed"

        return "Unknown"

    def __repr__(self):
        return f"{self.id} - Flight {self.airline} {self.flight_number} ({self.status}) - {self.dep} ({self.depCountry}) => {self.arr} ({self.arrCountry}) - {self.dep_time} (Est. {self.dep_time_est}) - {self.arr_time} (Est. {self.arr_time_est}) => Delay {self.delay} [Timestamp {self.timestamp}]"

# Create the "Flights" table
Base.metadata.create_all(bind=engine)