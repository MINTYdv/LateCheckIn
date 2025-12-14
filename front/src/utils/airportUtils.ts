// src/utils/airportUtils.ts
import airports from "../data/airports.json";

interface Airport {
  name: string;
  code: string;
  country: string;
}

// Crée un mapping IATA → ISO
const IATA_TO_ISO: Record<string, string> = {};
(airports as Airport[]).forEach(a => {
  if (a.code && a.country && a.code !== "\\N") {
    IATA_TO_ISO[a.code.toUpperCase()] = a.country;
  }
});

export function getCountryISO(iataCode: string): string | null {
  return IATA_TO_ISO[iataCode.toUpperCase()] ?? null;
}