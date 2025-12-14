import requests
import datetime
import time
import logging

from database import Flight


class AviationStackAPI:
    """
    Client wrapper for the AviationStack REST API.

    Responsibilities:
    - Fetch all flight data from AviationStack with pagination support
    - Map API payloads to Flight ORM objects
    - Handle retries and logging for robustness

    Note:
    This class only fetches and maps flights; it does not perform any business logic such as delay calculations.
    """

    BASE_URL = "http://api.aviationstack.com/v1/flights"
    MAX_RETRIES = 3
    RETRY_DELAY = 2  # seconds

    def __init__(self, api_key: str):
        """
        Initialize the AviationStack API client.

        Args:
            api_key (str): AviationStack API key.
        """
        self.api_key = api_key
        self.logger = logging.getLogger(__name__)

    def fetch_flights(self, limit: int = 100, offset: int = 0) -> list[dict]:
        """
        Fetch flights from the AviationStack API with pagination support.

        Args:
            limit (int): Number of records to fetch per request (max depends on API).
            offset (int): Offset for pagination.

        Returns:
            list[dict]: Raw flight records returned by the API.
        """
        params = {
            "access_key": self.api_key,
            "limit": limit,
            "offset": offset,
        }

        for attempt in range(1, self.MAX_RETRIES + 1):
            try:
                self.logger.debug(f"Fetching flights from AviationStack API (limit={limit}, offset={offset}), attempt {attempt}")
                response = requests.get(self.BASE_URL, params=params, timeout=10)
                response.raise_for_status()
                payload = response.json()
                data = payload.get("data", [])
                self.logger.info(f"Fetched {len(data)} flights from AviationStack API (limit={limit}, offset={offset})")
                return data
            except requests.RequestException as e:
                self.logger.warning(f"Attempt {attempt} failed to fetch flights: {e}")
                if attempt < self.MAX_RETRIES:
                    time.sleep(self.RETRY_DELAY)
                else:
                    self.logger.error(f"All {self.MAX_RETRIES} attempts failed to fetch flights.")
                    raise

    def get_flights(self, limit: int = 100, offset: int = 0) -> list[Flight]:
        """
        Retrieve flights and convert them into Flight ORM objects.

        Args:
            limit (int): Number of records to fetch per request.
            offset (int): Offset for pagination.

        Returns:
            list[Flight]: List of mapped Flight objects.
        """
        raw_flights = self.fetch_flights(limit=limit, offset=offset)
        return [self.to_flight(f) for f in raw_flights]

    def to_flight(self, f: dict) -> Flight:
        """
        Convert a raw AviationStack flight payload into a Flight ORM object.

        Missing or None values are replaced with empty strings to ensure data consistency.

        Args:
            f (dict): Raw flight dictionary from AviationStack.

        Returns:
            Flight: SQLAlchemy Flight instance.
        """
        def safe_get(d, *keys):
            for key in keys:
                if d is None:
                    return ""
                d = d.get(key)
            return d if d is not None else ""

        return Flight(
            flight_number=safe_get(f, "flight", "iata"),
            airline=safe_get(f, "airline", "name"),
            dep=safe_get(f, "departure", "iata"),
            arr=safe_get(f, "arrival", "iata"),
            dep_time_scheduled=self._parse_time(safe_get(f, "departure", "scheduled")),
            dep_time_estimated=self._parse_time(safe_get(f, "departure", "estimated")),
            arr_time_scheduled=self._parse_time(safe_get(f, "arrival", "scheduled")),
            arr_time_estimated=self._parse_time(safe_get(f, "arrival", "estimated")),
            timestamp=datetime.datetime.utcnow()
        )

    def _parse_time(self, time_str: str | None) -> datetime.datetime | None:
        """
        Parse an ISO8601 timestamp into a naive UTC datetime.

        AviationStack timestamps are UTC ("Z"), so we:
        - Parse as aware datetime
        - Convert to UTC
        - Drop timezone info to keep everything naive

        Args:
            time_str (str | None): ISO8601 timestamp string or None.

        Returns:
            datetime.datetime | None: Naive UTC datetime or None if input is invalid.
        """
        if not time_str:
            return None

        try:
            dt = datetime.datetime.fromisoformat(time_str.replace("Z", "+00:00"))
            return dt.astimezone(datetime.timezone.utc).replace(tzinfo=None)
        except ValueError:
            self.logger.warning(f"Failed to parse datetime string: {time_str}")
            return None