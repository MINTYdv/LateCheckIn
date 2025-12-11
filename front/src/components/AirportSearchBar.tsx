import { useState } from "react";

export default function AirportSearchBar() {
  const [query, setQuery] = useState("");

  return (
    <div>
        <input
        type="text"
        placeholder="Enter airport code..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{
            padding: "10px 14px",
            width: "250px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px"
        }}
        />
    </div>
  );
}