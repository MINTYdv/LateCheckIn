import { useState, useEffect } from "react";
import AirportSearchBar from "./components/AirportSearchBar";
import FlightsList from "./components/FlightsList";
import UpdateFlightsButton from "./components/UpdateFlightsButton";
import FlightGlobe from "./components/FlightGlobe";

interface Airport {
  name: string;
  code: string;
  country: string;
}

function App() {
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("lastAirportQuery");
    if (saved) {
      import("./data/airports.json").then((module) => {
        const airports: Airport[] = module.default;
        const airport = airports.find(a => a.name === saved || a.code === saved);
        if (airport) setSelectedAirport(airport);
      });
    }
  }, []);

  const handleAirportSelect = (airport: Airport) => {
    setSelectedAirport(airport);
    sessionStorage.setItem("lastAirportQuery", airport.code);
  };

  const handleUpdateComplete = () => {
    // Optional refresh logic
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", fontFamily: "sans-serif" }}>
      {/* Fullscreen Globe */}
      {selectedAirport && <FlightGlobe arrivalAirport={selectedAirport.code} style={{ width: "100%", height: "100%" }} />}

      {/* Overlay controls */}
      <div style={{
        position: "absolute",
        top: 20,
        left: 20,
        width: 400,
        maxHeight: "90%",
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: 20,
        borderRadius: 12,
        overflowY: "auto",
        color: "white",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
      }}>
        <h1 style={{ marginBottom: 12 }}>Flight Dashboard</h1>
        <div style={{ display: "flex", gap: "10px", marginBottom: 20, flexWrap: "wrap" }}>
          <AirportSearchBar onSelect={handleAirportSelect} />
          <UpdateFlightsButton onUpdateComplete={handleUpdateComplete} />
        </div>
        {selectedAirport && (
          <>
            <h2 style={{ marginBottom: 12 }}>Flights for {selectedAirport.name} ({selectedAirport.code})</h2>
            <FlightsList arrivalAirport={selectedAirport.code} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;