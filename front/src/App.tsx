import { useState, useEffect } from "react";
import AirportSearchBar from "./components/AirportSearchBar";
import FlightsList from "./components/FlightsList";
import UpdateFlightsButton from "./components/UpdateFlightsButton";
import FlightGlobe from "./components/FlightGlobe";
// Local Airport interface for App state
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
    // Optionally trigger a refresh of FlightsList if needed
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Flight Dashboard</h1>

      <div style={{ display: "flex", gap: "20px", height: "80vh" }}>
        {/* Left column: search + update + flights list */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AirportSearchBar onSelect={handleAirportSelect} />
            <UpdateFlightsButton onUpdateComplete={handleUpdateComplete} />
          </div>

          {selectedAirport && (
            <div style={{ overflowY: "auto", flex: 1 }}>
              <h2>Flights for {selectedAirport.name} ({selectedAirport.code})</h2>
              <FlightsList arrivalAirport={selectedAirport.code} />
            </div>
          )}
        </div>

        {/* Right column: globe showing flights */}
        <div style={{ flex: 1, border: "1px solid #ccc" }}>
          {selectedAirport && (
            <FlightGlobe arrivalAirport={selectedAirport.code} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;