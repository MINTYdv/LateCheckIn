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

engine = create_engine(DATABASE_URL, echo=True, connect_args={"check_same_thread": False})
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = Session()

class Base(DeclarativeBase):
    pass

class Flight(Base):
    __tablename__ = "flights"
    
    id = Column(Integer, primary_key=True, index=True)
    status = Column(String)
    flight_number = Column(String)
    airline = Column(String)
    dep = Column(String)
    arr = Column(String)

    dep_time_est = Column(DateTime(timezone=True))
    arr_time_est = Column(DateTime(timezone=True))
    dep_time = Column(DateTime(timezone=True))
    arr_time = Column(DateTime(timezone=True))

    timestamp = Column(
        DateTime(timezone=True),
        default=lambda: datetime.datetime.now(ZoneInfo(TIMEZONE_NAME))
    )

    def __init__(self, status, flight_number, airline, dep, arr,
                 dep_time_est=None, arr_time_est=None,
                 dep_time=None, arr_time=None,
                 timestamp=None):

        self.status = status
        self.flight_number = flight_number
        self.airline = airline
        self.dep = dep
        self.arr = arr
        self.dep_time_est = dep_time_est
        self.arr_time_est = arr_time_est
        self.dep_time = dep_time
        self.arr_time = arr_time
        self.timestamp = timestamp or datetime.datetime.now(ZoneInfo(TIMEZONE_NAME))

    # Calcul du retard en minutes
    @property
    def delay(self):
        if self.arr_time and self.arr_time_est:
            diff = self.arr_time - self.arr_time_est
            return diff.total_seconds() / 60
        return None

    def __repr__(self):
        return f"{self.id} - Flight {self.airline} {self.flight_number} ({self.status}) - {self.dep} => {self.arr} - {self.dep_time} (Est. {self.dep_time_est}) - {self.arr_time} (Est. {self.arr_time_est}) => Delay {self.delay} [Timestamp {self.timestamp}]"

# Create the "Flights" table
Base.metadata.create_all(bind=engine)