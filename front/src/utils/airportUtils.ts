// src/utils/airportUtils.ts
import airports from "../data/airports.json";

interface Airport {
  name: string;
  code: string;
  country: string;
  lat?: number;
  lng?: number;
}

// Mapping IATA → ISO
const IATA_TO_ISO: Record<string, string> = {};
(airports as Airport[]).forEach(a => {
  if (a.code && a.country && a.code !== "\\N") {
    IATA_TO_ISO[a.code.toUpperCase()] = a.country;
  }
});

/**
 * Get ISO country code for a given IATA airport code.
 */
export function getCountryISO(iataCode: string): string | null {
  return IATA_TO_ISO[iataCode.toUpperCase()] ?? null;
}

/**
 * Get latitude and longitude for a given IATA airport code.
 */
export function getAirportCoords(iataCode: string): { lat: number; lng: number } | null {
  const code = iataCode.toUpperCase();
  const airport = (airports as Airport[]).find(a => a.code && a.code.toUpperCase() === code);
  if (!airport || typeof airport.lat !== 'number' || typeof airport.lng !== 'number') return null;
  return { lat: airport.lat, lng: airport.lng };
}