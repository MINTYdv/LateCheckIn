// src/components/FlightsList.tsx

import { useState, useEffect } from "react";
import FlightItem from "./FlightItem";
import { Flight } from "../types";

const API_URL = import.meta.env.VITE_API_URL;

export default function FlightsList({ arrivalAirport }: { arrivalAirport?: string }) {
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Construct API URL with optional arrival airport filter
    const url = arrivalAirport ? `${API_URL}/flights?arr=${arrivalAirport}` : `${API_URL}/flights`;

    // Generic GET request to fetch flights
    const fetchFlights = async () => {
        try {
            setLoading(true);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: Flight[] = await response.json();
            setFlights(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch flights on component mount and when arrivalAirport changes
    useEffect(() => {
        fetchFlights();
    }, [arrivalAirport]);

    if (loading) return <div>Loading flights...</div>;
    if (error) return <div>Error when loading flights: {error}</div>;
    if (flights.length === 0) return <div>No flights available.</div>;

    return (
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {flights.map(f => (
                <FlightItem key={`${f.flight_number}-${f.dep}-${f.arr}-${f.dep_time_scheduled}`} flight={f} />
            ))}
        </div>
    );
}
