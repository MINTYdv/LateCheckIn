import { useState, useEffect } from "react";
import Globe from "react-globe.gl";
import { Flight } from "../types";
import { getAirportCoords } from "../utils/airportUtils"; // <- ta fonction utilitaire

const API_URL = import.meta.env.VITE_API_URL;

export default function FlightGlobe({ arrivalAirport }: { arrivalAirport?: string }) {
  const [arcs, setArcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        const url = arrivalAirport ? `${API_URL}/flights?arr=${arrivalAirport}` : `${API_URL}/flights`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const flights: Flight[] = await response.json();

        const arcsData = flights.map(f => {
          const depCoords = getAirportCoords(f.dep);
          const arrCoords = getAirportCoords(f.arr);
          if (!depCoords || !arrCoords) return null;

          return {
            startLat: depCoords.lat,
            startLng: depCoords.lng,
            endLat: arrCoords.lat,
            endLng: arrCoords.lng,
            color: [
              ["red", "white", "blue", "green"][Math.floor(Math.random() * 4)],
              ["red", "white", "blue", "green"][Math.floor(Math.random() * 4)]
            ]
          };
        }).filter(Boolean);

        setArcs(arcsData as any[]);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [arrivalAirport]);

  if (loading) return <div>Loading globe...</div>;
  if (error) return <div>Error loading globe: {error}</div>;
  if (arcs.length === 0) return <div>No flights to display on globe.</div>;

  return (
    <div style={{ width: "50%", height: "80vh" }}>
      <Globe
        globeImageUrl="/src/images/earth-night.jpg"
        arcsData={arcs}
        arcColor="color"
        arcDashLength={() => Math.random()}
        arcDashGap={() => Math.random()}
        arcDashAnimateTime={() => Math.random() * 4000 + 500}
        showAtmosphere={true}
      />
    </div>
  );
}