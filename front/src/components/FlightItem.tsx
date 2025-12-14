import React from "react";
import CountryFlag from "./CountryFlag";
import { Flight } from "../types";
import { getCountryISO } from "../utils/airportUtils";

interface Props {
  flight: Flight;
}

export default function FlightItem({ flight }: Props) {
  // Helper function: format ISO datetime string into "HH:mm" or return placeholder
  const formatTime = (time: string | null) => {
    if (!time) return "--:--";
    const date = new Date(time);
    if (isNaN(date.getTime())) return "--:--";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Helper function: format ISO datetime string into "DD/MM/YYYY" or return placeholder
  const formatDate = (time: string | null) => {
    if (!time) return "--/--/----";
    const date = new Date(time);
    if (isNaN(date.getTime())) return "--/--/----";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Map flight status to a color
  const statusColor = {
    Scheduled: "#FFA500", // Orange
    Airborne: "#1E90FF",  // Dodger Blue
    Landed: "#32CD32"     // Lime Green
  }[flight.status] || "#999";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px",
        gap: "16px",
        borderBottom: "1px solid #eee",
        flexWrap: "wrap",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
      aria-label={`Flight ${flight.airline} ${flight.flight_number} from ${flight.dep} to ${flight.arr}`}
    >
      {/* Left column: departure above arrival with country flags */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          minWidth: "80px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {getCountryISO(flight.dep) ? (
            <CountryFlag code={getCountryISO(flight.dep)!} size="w-6 h-6" />
          ) : (
            <div style={{ width: 24, height: 16 }} aria-hidden="true" />
          )}
          <span style={{ fontWeight: 600, fontSize: "12px" }}>{flight.dep || "N/A"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {getCountryISO(flight.arr) ? (
            <CountryFlag code={getCountryISO(flight.arr)!} size="w-6 h-6" />
          ) : (
            <div style={{ width: 24, height: 16 }} aria-hidden="true" />
          )}
          <span style={{ fontWeight: 600, fontSize: "12px" }}>{flight.arr || "N/A"}</span>
        </div>
      </div>

      {/* Flight info: airline + flight number + scheduled/estimated times */}
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {flight.airline || "Unknown Airline"} {flight.flight_number || ""}
        </div>
        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "14px",
            color: "#555",
            flexWrap: "wrap",
            minWidth: 0,
          }}
        >
          {/* Departure time and date */}
          <div style={{ whiteSpace: "nowrap" }}>
            <div>{formatDate(flight.dep_time_scheduled)}</div>
            Dep:{" "}
            <span
              style={{
                textDecoration:
                  flight.dep_time_scheduled && flight.dep_time_estimated && flight.dep_time_scheduled !== flight.dep_time_estimated
                    ? "line-through"
                    : "none",
                color:
                  flight.dep_time_scheduled && flight.dep_time_estimated && flight.dep_time_scheduled !== flight.dep_time_estimated
                    ? "#999"
                    : "#555",
              }}
              aria-label={`Scheduled departure time: ${formatTime(flight.dep_time_scheduled)}`}
            >
              {formatTime(flight.dep_time_scheduled)}
            </span>
            {flight.dep_time_scheduled && flight.dep_time_estimated && flight.dep_time_scheduled !== flight.dep_time_estimated && (
              <span aria-label={`Estimated departure time: ${formatTime(flight.dep_time_estimated)}`}> → {formatTime(flight.dep_time_estimated)}</span>
            )}
          </div>

          {/* Arrival time */}
          <div style={{ whiteSpace: "nowrap" }}>
            Arr:{" "}
            <span
              style={{
                textDecoration:
                  flight.arr_time_scheduled && flight.arr_time_estimated && flight.arr_time_scheduled !== flight.arr_time_estimated
                    ? "line-through"
                    : "none",
                color:
                  flight.arr_time_scheduled && flight.arr_time_estimated && flight.arr_time_scheduled !== flight.arr_time_estimated
                    ? "#999"
                    : "#555",
              }}
              aria-label={`Scheduled arrival time: ${formatTime(flight.arr_time_scheduled)}`}
            >
              {formatTime(flight.arr_time_scheduled)}
            </span>
            {flight.arr_time_scheduled && flight.arr_time_estimated && flight.arr_time_scheduled !== flight.arr_time_estimated && (
              <span aria-label={`Estimated arrival time: ${formatTime(flight.arr_time_estimated)}`}> → {formatTime(flight.arr_time_estimated)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Flight status with colored dot */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          minWidth: "110px",
          justifyContent: "flex-end",
          flexShrink: 0,
        }}
        aria-label={`Flight status: ${flight.status}`}
      >
        <span
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: statusColor,
            display: "inline-block",
            boxShadow: `0 0 6px ${statusColor}`,
          }}
          aria-hidden="true"
        />
        <span style={{ color: statusColor, fontWeight: 700, fontSize: "14px" }}>{flight.status}</span>
      </div>
    </div>
  );
}