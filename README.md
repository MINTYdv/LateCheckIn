# ✈️ LateCheckIn – Flight Dashboard

Welcome to LateCheckIn, a portfolio project created to explore REST APIs, React, and FastAPI. This project, developed over a few days (4.5 days), allows tracking flights and visualizing them on a 3D globe. It is intentionally limited in complexity and functionality. Due to AviationStack API restrictions, not all flights can be displayed in real time.

It demonstrates real-time data fetching, database integration, and an interactive UI—ideal for showcasing technical skills in a professional context such as an Airbus internship interview.

---

## 📌 Project Overview

**LateCheckIn** is a web dashboard that allows users to:

- Search for an airport (by name or IATA code) with autocomplete suggestions.
- View all flights arriving at the selected airport. (Limited by API restrictions)
- Check real-time status: Scheduled, Airborne, or Landed.
- Compare scheduled vs estimated departure and arrival times.
- Visualize flight routes globally on a 3D interactive globe.
- Update flight data via AviationStack API (with caching to respect API limits).

---

## 🛠 Technologies Used

- **Backend:** Python, FastAPI, SQLAlchemy, SQLite
- **Frontend:** React, TypeScript, Vite, TailwindCSS (optional)
- **Data:** AviationStack API, OurAirports dataset
- **3D Visualization:** [react-globe.gl](https://github.com/vasturiano/react-globe.gl)
- **Other:** dotenv, axios/fetch, sessionStorage

---

## 🚀 Features

### Airport Search

- Autocomplete with up to 10 suggestions.
- Country flag displayed next to airport name.
- Stores last search in browser session.

### Flights List

- Scrollable list with flight info: airline, flight number, departure/arrival times, status.
- Scheduled vs estimated times shown with line-through for delays.
- Responsive and clean design.

### Flight Globe

- Interactive 3D globe showing all flight routes for selected airport.
- Animated arcs with random colors.
- Real-time integration with flights fetched from the backend.

### Update Flights

- Button to refresh flight data.
- Caching ensures API usage limits are respected.
- Updates SQLite database with new flight information.

---

## ⚙️ Installation

### Backend

```bash
cd back
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate    # Windows
pip install -r requirements.txt
```
