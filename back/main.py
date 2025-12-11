from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from aviationstack import AviationStackAPI
from database import session, Flight
import os
import datetime
import logging

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
api = AviationStackAPI(api_key=API_KEY, airport="CDG")

# ------------------------------
# Initialize FastAPI app
# ------------------------------
app = FastAPI(title="FlightDelay Monitor API")

# ------------------------------
# Cache for API calls
# ------------------------------
last_update_time: datetime.datetime | None = None
CACHE_DELAY_SECONDS = 60  # 1 minute


# ------------------------------
# Endpoints
# ------------------------------
@app.get("/")
def root():
    """Root endpoint to check if API is running."""
    return {"message": "FlightDelay Monitor API is running"}


@app.get("/delayed_flights")
def delayed_flights(min_delay: int = Query(0, description="Minimum delay in minutes to filter flights")):
    """
    Retrieve all delayed flights (departure or arrival).
    Optional query parameter to filter by minimum delay in minutes.
    """
    flights = session.query(Flight).all()
    filtered = [f for f in flights if (f.delay or 0) >= min_delay]
    logger.info(f"Returning {len(filtered)} delayed flights")
    return [
        {
            "flight_number": f.flight_number,
            "airline": f.airline,
            "dep": f.dep,
            "arr": f.arr,
            "dep_time_est": f.dep_time_est,
            "dep_time": f.dep_time,
            "arr_time_est": f.arr_time_est,
            "arr_time": f.arr_time,
            "delay": f.delay,
            "timestamp": f.timestamp
        }
        for f in filtered
    ]


@app.get("/flight/{flight_number}")
def get_flight(flight_number: str):
    """
    Retrieve a specific flight by its flight number.
    """
    flight = session.query(Flight).filter(Flight.flight_number == flight_number).order_by(Flight.timestamp.desc()).first()
    if not flight:
        logger.warning(f"Flight {flight_number} not found")
        return JSONResponse(status_code=404, content={"error": "Flight not found"})
    logger.info(f"Returning flight {flight_number}")
    return {
        "flight_number": flight.flight_number,
        "airline": flight.airline,
        "dep": flight.dep,
        "arr": flight.arr,
        "dep_time_est": flight.dep_time_est,
        "dep_time": flight.dep_time,
        "arr_time_est": flight.arr_time_est,
        "arr_time": flight.arr_time,
        "delay": flight.delay,
        "timestamp": flight.timestamp
    }


@app.post("/update_flights")
def update_flights():
    """
    Fetch the latest delayed flights from AviationStack and store them in the database.
    Will skip the API call if last update was less than 1 minute ago.
    """
    global last_update_time
    now = datetime.datetime.now(datetime.timezone.utc)

    if last_update_time and (now - last_update_time).total_seconds() < CACHE_DELAY_SECONDS:
        logger.info("Skipped API call: last update was less than 1 minute ago")
        return {"message": "Skipped API call. Last update was less than 1 minute ago."}

    try:
        flights = api.get_delayed_flights()
        for f in flights:
            session.add(f)
        session.commit()
        last_update_time = now
        logger.info(f"Updated {len(flights)} flights from AviationStack")
        return {"message": f"{len(flights)} flights updated in database"}
    except Exception as e:
        logger.error(f"Error updating flights: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/stats")
def stats():
    """
    Return statistics about delayed flights:
    - Total number of delayed flights
    - Average delay
    - Top 5 airlines by number of delayed flights
    """
    flights = session.query(Flight).all()
    if not flights:
        return {"total_delayed": 0, "average_delay": 0, "top_airlines": []}

    total_delayed = len(flights)
    avg_delay = sum([f.delay or 0 for f in flights]) / total_delayed

    airline_counts = {}
    for f in flights:
        airline_counts[f.airline] = airline_counts.get(f.airline, 0) + 1

    top_airlines = sorted(airline_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    return {
        "total_delayed": total_delayed,
        "average_delay": round(avg_delay, 2),
        "top_airlines": [{"airline": a, "count": c} for a, c in top_airlines]
    }
