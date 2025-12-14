import React, { useState } from "react";

interface Props {
  onUpdateComplete?: () => void;
}

export default function UpdateFlightsButton({ onUpdateComplete }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/update_flights`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      console.log("Update result:", data);
      if (onUpdateComplete) onUpdateComplete();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <button
        onClick={handleUpdate}
        disabled={loading}
        style={{
          padding: "8px 16px",
          borderRadius: "6px",
          border: "none",
          backgroundColor: loading ? "#ccc" : "#1E90FF",
          color: "white",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold",
        }}
      >
        {loading ? "Updating..." : "Update Flights"}
      </button>
      {error && <div style={{ color: "red", marginTop: "6px" }}>{error}</div>}
    </div>
  );
}