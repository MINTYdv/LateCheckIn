import React from "react";
import CountryFlag from "./CountryFlag";

interface Flight {
  flightNumber: string;
  airline: string;
  dep: string; // departure airport code
  arr: string; // arrival airport code
  depTimeEst: string; // ISO string
  depTime: string;    // ISO string
  arrTimeEst: string; // ISO string
  arrTime: string;    // ISO string
  status: "Scheduled" | "Airborne" | "Landed";
  depCountry: string;
  arrCountry: string;
}

interface Props {
  flight: Flight;
}

export default function FlightItem({ flight }: Props) {
  const formatTime = (time: string) =>
    new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const statusColor = {
    Scheduled: "#FFA500",
    Airborne: "#1E90FF",
    Landed: "#32CD32"
  }[flight.status];

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      padding: "10px",
      gap: "16px",
      borderBottom: "1px solid #eee"
    }}>
      {/* Left column: departure above arrival */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <CountryFlag code={flight.depCountry} size="w-6 h-6" />
          <span style={{ fontWeight: "bold", fontSize: "12px" }}>{flight.dep}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <CountryFlag code={flight.arrCountry} size="w-6 h-6" />
          <span style={{ fontWeight: "bold", fontSize: "12px" }}>{flight.arr}</span>
        </div>
      </div>

      {/* Flight info */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "bold" }}>{flight.airline} {flight.flightNumber}</div>
        <div style={{ display: "flex", gap: "12px", fontSize: "14px", color: "#555" }}>
          <div>
            Dep: <span style={{ textDecoration: flight.depTime !== flight.depTimeEst ? "line-through" : "none" }}>
              {formatTime(flight.depTimeEst)}
            </span> {flight.depTime !== flight.depTimeEst && `→ ${formatTime(flight.depTime)}`}
          </div>
          <div>
            Arr: <span style={{ textDecoration: flight.arrTime !== flight.arrTimeEst ? "line-through" : "none" }}>
              {formatTime(flight.arrTimeEst)}
            </span> {flight.arrTime !== flight.arrTimeEst && `→ ${formatTime(flight.arrTime)}`}
          </div>
        </div>
      </div>

      {/* Status with colored dot */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: statusColor,
          display: "inline-block"
        }} />
        <span style={{ color: statusColor, fontWeight: "bold" }}>{flight.status}</span>
      </div>
    </div>
  );
}