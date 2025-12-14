import { useState, useEffect } from "react";
import FlightItem from "./FlightItem";

const API_URL = import.meta.env.VITE_API_URL;

interface ApiResponse<T> {
    data: T;
}

interface Flight {
    flightNumber: string;
    airline: string;
    dep: string;
    arr: string;
    depTimeEst: string;
    depTime: string;
    arrTimeEst: string;
    arrTime: string;
    status: "Scheduled" | "Airborne" | "Landed";
    depCountry: string;
    arrCountry: string;
}

export default function FlightsList() {
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const url = `${API_URL}/delayed_flights`;
    // Generic GET request
    const fetchFlights = async () => {
        
        try {
            setLoading(true);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: Flight[] = await response.json(); // cast to Flight[]
            setFlights(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Call fetchFlights once on component mount
    useEffect(() => {
        fetchFlights();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error when loading list: {error}</div>;

    return (
        <div>
        {flights.map(f => (
            <div key={f.flightNumber + f.dep + f.arr}>
                <FlightItem flight={f} />
            </div>
        ))}
        </div>
    );
}