import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./Itinerary.css";

const itineraryData = {
  title: "España, a tu ritmo",
  dates: "12–21 oct 2026",
  duration: "10 días",
  travelers: "2 personas",
  cities: [
    {
      id: 1,
      name: "Madrid",
      dates: "12–14 oct · 3 días",
      distance: "360 km",
      travelTime: "1 h 50 min en tren",
    },
    {
      id: 2,
      name: "Valencia",
      dates: "15–17 oct · 3 días",
      distance: "350 km",
      travelTime: "2 h 50 min en tren",
    },
    {
      id: 3,
      name: "Barcelona",
      dates: "18–21 oct · 4 días",
      distance: "",
      travelTime: "",
    },
  ],
  estimatedCost: "USD 2.680",
  availableBudget: "USD 320 disponibles de USD 3.000",
  travelTime: "4 h 40 min",
  distance: "710 km entre ciudades",
  experiences: "17 atractivos",
  experienceDetails: "3 ciudades · 2 cambios de alojamiento",
};

function Itinerary() {
  return (
    <div className="itinerary-page">
      <Sidebar />

      <main className="itinerary-content">
        <header className="itinerary-header">
          <div>
            <p className="itinerary-breadcrumb">
              <Link to="/my-trips">Mis viajes</Link> / España, a tu ritmo
            </p>
            <h1>{itineraryData.title}</h1>
            <p className="itinerary-description">
              {itineraryData.dates} · {itineraryData.duration} · {itineraryData.travelers}
            </p>
          </div>
          <span className="itinerary-status">Itinerario elegido</span>
        </header>

        <div className="itinerary-actions">
          <div className="itinerary-tabs" aria-label="Secciones del viaje">
            <span className="itinerary-tab active" aria-current="page">
              Recorrido
            </span>
            <Link className="itinerary-tab" to="/trip-calendar">
              Calendario
            </Link>
            <a className="itinerary-tab" href="#presupuesto">Presupuesto</a>
          </div>
          <Link to="/edit-trip" className="itinerary-edit-button">
            Editar viaje
          </Link>
        </div>

        <section className="itinerary-route-section" aria-label="Recorrido del viaje">
          <div className="itinerary-map" role="img" aria-label="Mapa esquemático del recorrido por España">
            <div className="map-heading">
              <span className="map-route-icon" aria-hidden="true">↗</span>
              <span>Tu recorrido · Tren</span>
            </div>
            <svg
              className="map-illustration"
              viewBox="0 0 500 300"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <path className="map-land" d="M45 68 L122 43 L205 50 L272 39 L355 77 L421 112 L399 173 L351 196 L322 250 L243 265 L178 235 L113 242 L68 198 L42 135 Z" />
              <path className="map-route-line" d="M173 157 Q229 125 294 177 T370 93" />
              <circle className="map-marker" cx="173" cy="157" r="15" />
              <circle className="map-marker" cx="294" cy="177" r="15" />
              <circle className="map-marker" cx="370" cy="93" r="15" />
              <text className="map-marker-number" x="173" y="162" textAnchor="middle">1</text>
              <text className="map-marker-number" x="294" y="182" textAnchor="middle">2</text>
              <text className="map-marker-number" x="370" y="98" textAnchor="middle">3</text>
              <text className="map-city-name" x="150" y="190">Madrid</text>
              <text className="map-city-name" x="272" y="211">Valencia</text>
              <text className="map-city-name" x="348" y="68">Barcelona</text>
            </svg>
            <span className="map-caption">Vista esquemática del recorrido</span>
          </div>

          <aside className="itinerary-route-list">
            <div className="route-list-heading">
              <div>
                <p className="itinerary-overline">Del 12 al 21 de octubre</p>
                <h2>Paradas del viaje</h2>
              </div>
              <span className="transport-badge">Tren</span>
            </div>

            <ol className="city-list">
              {itineraryData.cities.map((city) => (
                <li className="city-item" key={city.id}>
                  <span className="city-number" aria-hidden="true">{city.id}</span>
                  <div className="city-information">
                    <h3>{city.name}</h3>
                    <p>{city.dates}</p>
                    {city.travelTime && (
                      <span className="city-transfer">
                        {city.distance} · {city.travelTime}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </section>

        <section className="itinerary-summary" id="presupuesto" aria-label="Resumen del viaje">
          <article className="itinerary-summary-card budget-summary-card">
            <span>Presupuesto estimado</span>
            <strong>{itineraryData.estimatedCost}</strong>
            <p>{itineraryData.availableBudget}</p>
          </article>
          <article className="itinerary-summary-card">
            <span>Tiempo en traslados</span>
            <strong>{itineraryData.travelTime}</strong>
            <p>{itineraryData.distance}</p>
          </article>
          <article className="itinerary-summary-card">
            <span>Experiencias</span>
            <strong>{itineraryData.experiences}</strong>
            <p>{itineraryData.experienceDetails}</p>
          </article>
        </section>

        <footer className="itinerary-footer">
          <Link to="/compare-itineraries" className="itinerary-compare-button">
            Comparar alternativas
          </Link>
          <Link to="/my-trips" className="itinerary-back-link">
            Volver a mis viajes
          </Link>
        </footer>
      </main>
    </div>
  );
}

export default Itinerary;