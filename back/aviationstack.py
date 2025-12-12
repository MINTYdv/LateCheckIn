import requests
import os
from zoneinfo import ZoneInfo
import datetime

from database import Flight, session, TIMEZONE_NAME

OS_API_KEY = os.getenv("AVIATIONSTACK_KEY")
tz = ZoneInfo(TIMEZONE_NAME)

class AviationStackAPI:
    """
    Class to interact with the AviationStack API to fetch flight data.

    Attributes:
        BASE_URL (str): Base URL of the AviationStack API.
        api_key (str): API key for accessing AviationStack.
        airport (str): IATA code of the airport to filter arriving flights.
    """

    BASE_URL = "http://api.aviationstack.com/v1/flights"

    def __init__(self, api_key: str):
        """
        Initialize the AviationStackAPI instance.

        Args:
            api_key (str): Your AviationStack API key.
        """
        self.api_key = api_key




    def fetch_flights(self) -> list[dict]:
        """
        Fetch all flights arriving at the specified airport from the AviationStack API.

        Returns:
            list[dict]: List of raw flight dictionaries from the API.
        """
        params = {
            "access_key": self.api_key
        }
        response = requests.get(self.BASE_URL, params=params)
        data = response.json()
        return data.get("data", [])
    
    
    def filter_delayed(self, flights_raw: list[dict]) -> list[dict]:
        """
        Filter flights that are delayed either at departure or at arrival.
        Delay is still calculated based on arrival times.

        Args:
            flights_raw (list[dict]): Raw flight data from the API.

        Returns:
            list[dict]: Flights that are delayed at departure or arrival.
        """
        delayed = []
        for f in flights_raw:
            dep_est = f["departure"]["estimated"]
            dep_act = f["departure"]["actual"]
            arr_est = f["arrival"]["estimated"]
            arr_act = f["arrival"]["actual"]

            # Check if departure is delayed
            dep_delayed = False
            if dep_est and dep_act:
                dep_dt_est = datetime.datetime.fromisoformat(dep_est.replace("Z", "+00:00"))
                dep_dt_act = datetime.datetime.fromisoformat(dep_act.replace("Z", "+00:00"))
                if dep_dt_act > dep_dt_est:
                    dep_delayed = True

            # Check if arrival is delayed
            arr_delayed = False
            if arr_est and arr_act:
                arr_dt_est = datetime.datetime.fromisoformat(arr_est.replace("Z", "+00:00"))
                arr_dt_act = datetime.datetime.fromisoformat(arr_act.replace("Z", "+00:00"))
                if arr_dt_act > arr_dt_est:
                    arr_delayed = True

            if dep_delayed or arr_delayed:
                delayed.append(f)

        return delayed
    
    def get_delayed_flights(self) -> list[Flight]:
        """
        Retrieve all delayed flights for the specified airport.

        This method fetches flights from the API, filters those that are delayed,
        and returns them as a list of Flight ORM objects.

        Returns:
            list[Flight]: List of delayed flights.
        """
        raw = self.fetch_flights()
        delayed_raw = self.filter_delayed(raw)
        return [self.to_flight(f) for f in delayed_raw]
    
    def get_flights(self) -> list[Flight]:
        """
        Retrieve all flights for the specified airport.

        This method fetches flights from the API and returns them as a list of Flight ORM objects.

        Returns:
            list[Flight]: List of fetched flights.
        """
        raw = self.fetch_flights()
        return [self.to_flight(f) for f in raw]

    def to_flight(self, f: dict) -> Flight:
            """
            Convert a raw flight dictionary into a Flight ORM object.

            Args:
                f (dict): Raw flight data dictionary.

            Returns:
                Flight: SQLAlchemy Flight object.
            """
            return Flight(
                flight_number=f["flight"]["iata"],
                airline=f["airline"]["name"],
                dep=f["departure"]["iata"],
                arr=f["arrival"]["iata"],
                dep_time_est=self._parse_time(f["departure"]["estimated"], tz),
                arr_time_est=self._parse_time(f["arrival"]["estimated"], tz),
                dep_time=self._parse_time(f["departure"]["actual"], tz),
                arr_time=self._parse_time(f["arrival"]["actual"], tz),
                timestamp=datetime.datetime.now(tz)
            )
    
    def save_flight(self, flight: Flight):
        """
        Save a Flight object to the database.

        Args:
            flight (Flight): The Flight ORM object to save.

        Returns:
            Flight: The saved Flight object.
        """
        session.add(flight)
        session.commit()
        return flight
    
    def _parse_time(self, time_str: str, tz: ZoneInfo):
        """
        Convert ISO8601 string to a timezone-aware datetime object.

        Args:
            time_str (str): ISO8601 datetime string.
            tz (ZoneInfo): Target timezone.

        Returns:
            datetime.datetime | None: Parsed datetime object with timezone, or None if input is invalid.
        """
        if not time_str:
            return None
        return datetime.datetime.fromisoformat(time_str.replace("Z", "+00:00")).astimezone(tz)