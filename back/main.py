from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from aviationstack import AviationStackAPI
from database import session, Flight
import os
import datetime
import logging
from typing import Optional

# ------------------------------
# Setup logging
# ------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ------------------------------
# Load environment variables
# ------------------------------
load_dotenv()
API_KEY = os.getenv("AVIATIONSTACK_KEY")

# ------------------------------
# Initialize AviationStack API
# ------------------------------
api = AviationStackAPI(api_key=API_KEY)

# ------------------------------
# Initialize FastAPI app
# ------------------------------
app = FastAPI(title="LateCheckIn API")

# ------------------------------
# Cache for API calls
# ------------------------------
last_update_time: Optional[datetime.datetime] = None
CACHE_DELAY_SECONDS = 60  # 1 minute delay between API updates

# ------------------------------
# CORS
# ------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------
# Endpoints
# ------------------------------
@app.get("/")
def root() -> dict[str, str]:
    """Root endpoint to check if API is running."""
    return {"message": "LateCheckIn API is running"}


@app.get("/flights")
def flights(arr: str | None = None) -> list[dict]:
    """
    Retrieve all flights from the database.
    Optionally filter by arrival airport code.
    """
    flights = session.query(Flight).all()

    print(arr)
    filtered = [
        f for f in flights
        if (arr is None or f.arr == arr)
    ]

    logger.info(f"Returning {len(filtered)} flights")

    return [
        {
            "flight_number": f.flight_number,
            "status": f.status,
            "airline": f.airline,
            "dep": f.dep,
            "arr": f.arr,
            "dep_country": f.dep_country,
            "arr_country": f.arr_country,
            "dep_time_scheduled": f.dep_time_scheduled,
            "dep_time_estimated": f.dep_time_estimated,
            "arr_time_scheduled": f.arr_time_scheduled,
            "arr_time_estimated": f.arr_time_estimated,
            "delay": f.delay,
            "timestamp": f.timestamp,
        }
        for f in filtered
    ]


@app.post("/update_flights")
def update_flights() -> dict[str, str]:
    """
    Fetch flights from AviationStack and store them in the database.
    Skips API call if last update was less than 1 minute ago.
    Avoids duplicates based on flight_number + scheduled times.
    """
    global last_update_time
    now = datetime.datetime.now(datetime.timezone.utc)

    if last_update_time and (now - last_update_time).total_seconds() < CACHE_DELAY_SECONDS:
        logger.info("Skipped API call: last update was less than 1 minute ago")
        return {"message": "Skipped API call. Last update was less than 1 minute ago."}

    try:
        flights = api.get_flights()
        logger.info(f"AviationStack returned {len(flights)} flights")

        existing_keys = {
            (f.flight_number, f.dep_time_scheduled, f.arr_time_scheduled)
            for f in session.query(
                Flight.flight_number,
                Flight.dep_time_scheduled,
                Flight.arr_time_scheduled,
            ).all()
        }

        new_flights = [
            f for f in flights
            if (f.flight_number, f.dep_time_scheduled, f.arr_time_scheduled) not in existing_keys
        ]

        if new_flights:
            session.bulk_save_objects(new_flights)
            session.commit()
            last_update_time = now
            logger.info(f"Inserted {len(new_flights)} new flights")
            return {"message": f"{len(new_flights)} new flights inserted"}
        else:
            logger.info("No new flights to update")
            return {"message": "No new flights to update"}

    except Exception as e:
        logger.error(f"Error updating flights: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})