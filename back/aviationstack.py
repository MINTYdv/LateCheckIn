import requests
import os
from zoneinfo import ZoneInfo
import datetime

from database import Flight, session

OS_API_KEY = os.getenv("AVIATIONSTACK_KEY")


class AviationStackAPI:
    BASE_URL = "http://api.aviationstack.com/v1/flights"

    def __init__(self, api_key: str, airport: str = "CDG"):
        self.api_key = api_key
        self.airport = airport

    def fetch_flights(self) -> list[dict]:
        params = {
            'access_key': self.api_key,
            'arr_iata': self.airport,
            'limit': 200
        }
        response = requests.get(self.BASE_URL, params=params)
        data = response.json()
        return data.get("data", [])