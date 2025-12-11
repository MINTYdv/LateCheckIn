import { useState, useEffect } from "react";
import CountryFlag from "./CountryFlag";
import AIRPORTS from "../data/airports.json"; // assure-toi que le path est correct

interface Airport {
  name: string;
  code: string;
  country: string;
}

interface Props {
  onSelect: (airport: Airport) => void;
}

export default function AirportSearchBar({ onSelect }: Props) {
  // Charge la dernière recherche depuis sessionStorage
  const [query, setQuery] = useState<string>(() => {
    return sessionStorage.getItem("lastAirportQuery") || "";
  });

  const [results, setResults] = useState<Airport[]>([]);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
    } else {
      const filtered = AIRPORTS.filter(a =>
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.code.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10); // max 10 suggestions
      setResults(filtered);
    }

    // Sauvegarde la recherche dans sessionStorage
    sessionStorage.setItem("lastAirportQuery", query);
  }, [query]);

  const handleSelect = (airport: Airport) => {
    setQuery(airport.name);
    setResults([]);
    sessionStorage.setItem("lastAirportQuery", airport.name);
    onSelect(airport);
  };

  return (
    <div style={{ position: "relative", width: "250px" }}>
      <input
        type="text"
        placeholder="Enter airport code..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{
          padding: "10px 14px",
          width: "100%",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "16px"
        }}
      />
      {results.length > 0 && (
        <div style={{ 
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background:"white", 
          border:"1px solid #ddd", 
          borderRadius:"8px",
          marginTop: "4px",
          maxHeight: "200px",
          overflowY: "auto",
          zIndex: 10
        }}>
          {results.map(a => (
            <div 
              key={a.code} 
              style={{ 
                padding:"8px", 
                display: "flex", 
                color: "black",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer"
              }}
              onClick={() => handleSelect(a)}
            >
              <CountryFlag code={a.country} size="w-20 h-25" />
              <span>{a.name} ({a.code})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}