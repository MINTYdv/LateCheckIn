import AirportSearchBar from "./components/AirportSearchBar";
import CountryFlag from "./components/CountryFlag";

function App() {
  return <div>
    <AirportSearchBar></AirportSearchBar>
    <CountryFlag code="FR" size="w-12 h-12" />
    </div>
}

export default App;