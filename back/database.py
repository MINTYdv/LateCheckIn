from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import DeclarativeBase, sessionmaker
import datetime
import os

# ------------------------------
# Database configuration
# ------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'flights.db')}"

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False}
)

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = Session()


# ------------------------------
# Base model
# ------------------------------
class Base(DeclarativeBase):
    pass


# ------------------------------
# Flight model
# ------------------------------
class Flight(Base):
    __tablename__ = "flights"

    id = Column(Integer, primary_key=True, index=True)

    flight_number = Column(String)
    airline = Column(String)

    dep = Column(String)
    arr = Column(String)

    dep_time_scheduled = Column(DateTime)
    dep_time_estimated = Column(DateTime)

    arr_time_scheduled = Column(DateTime)
    arr_time_estimated = Column(DateTime)

    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    @property
    def delay(self):
        """Return arrival delay in minutes (positive = delayed)."""
        if self.arr_time_estimated and self.arr_time_scheduled:
            return (self.arr_time_estimated - self.arr_time_scheduled).total_seconds() / 60
        return None

    @property
    def status(self):
        """
        Determine flight status based on UTC naive datetimes.
        """
        now = datetime.datetime.utcnow()

        dep = self.dep_time_scheduled
        arr = self.arr_time_estimated or self.arr_time_scheduled

        if dep and dep > now:
            return "Scheduled"

        if dep and dep <= now:
            if arr and arr > now:
                return "Airborne"
            if arr and arr <= now:
                return "Landed"

        return "Unknown"

    def __repr__(self):
        return (
            f"{self.id} - Flight {self.airline} {self.flight_number} ({self.status}) | "
            f"{self.dep} -> {self.arr} | "
            f"Delay: {self.delay} min"
        )


# ------------------------------
# Create tables
# ------------------------------
Base.metadata.create_all(bind=engine)