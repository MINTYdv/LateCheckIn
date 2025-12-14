import { useState, useEffect } from "react";
import AirportSearchBar from "./components/AirportSearchBar";
import FlightItem from "./components/FlightItem";
import FlightsList from "./components/FlightsList";

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
      import("./data/airports.json").then((module) => {
        const airports: Airport[] = module.default; // ← obligatoire
        const airport = airports.find(a => a.name === saved || a.code === saved);
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
        <FlightsList></FlightsList>
      </div>
    )}
    </div>
  );
}

export default App;