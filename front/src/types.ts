export interface Flight {
    flight_number: string;
    airline: string;
    dep: string;
    arr: string;
    dep_time_scheduled: string | null;
    dep_time_estimated: string | null;
    arr_time_scheduled: string | null;
    arr_time_estimated: string | null;
    status: "Scheduled" | "Airborne" | "Landed";
    dep_country?: string | null;
    arr_country?: string | null;
}