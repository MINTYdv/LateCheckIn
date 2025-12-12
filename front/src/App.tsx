import { useState, useEffect } from "react";
import AirportSearchBar from "./components/AirportSearchBar";
import FlightItem from "./components/FlightItem";

interface Airport {
  name: string;
  code: string;
  country: string;
}

function App() {
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);

  // Initialize selected airport from sessionStorage on first render
  useEffect(() => {
    const saved = sessionStorage.getItem("lastAirportQuery");
    if (saved) {
      // Dynamically import airports.json and find matching airport
      import("./data/airports.json").then(module => {
        const airport = module.default.find((a: Airport) => a.name === saved || a.code === saved);
        if (airport) setSelectedAirport(airport);
      });
    }
  }, []);

  // Callback when an airport is selected from the search bar
  const handleAirportSelect = (airport: Airport) => {
    setSelectedAirport(airport);
    console.log("Selected airport:", airport);
    // Future: trigger API call to fetch flights for this airport

    




  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Flight Dashboard</h1>

      {/* Airport Search Bar component */}
      <AirportSearchBar onSelect={handleAirportSelect} />

      {/* Conditionally render flights dashboard when an airport is selected */}
    {selectedAirport && (
      <div style={{ marginTop: "20px" }}>
        <h2>Flights for {selectedAirport.name} ({selectedAirport.code})</h2>
        <FlightItem flight={{
          flightNumber: "AF123",
          airline: "Air France",
          dep: "CDG",
          arr: "JFK",
          depTimeEst: "2025-12-11T10:00:00+01:00",
          depTime: "2025-12-11T10:15:00+01:00",
          arrTimeEst: "2025-12-11T13:00:00-05:00",
          arrTime: "2025-12-11T13:20:00-05:00",
          status: "Airborne",
          depCountry: "FR",
          arrCountry: "US"
        }} />
      </div>
    )}
    </div>
  );
}

export default App;