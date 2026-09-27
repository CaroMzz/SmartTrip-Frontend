import Sidebar from "../../components/Sidebar";
import TripSummary from "../../components/TripSummary";
import TripCard from "../../components/TripCard";
import { Link } from "react-router-dom";
import "./MyTrips.css";

const trips = [];

function MyTrips() {
  return (
    <div className="my-trips-page">
      <Sidebar />

      <main className="my-trips-content">
        <header className="my-trips-header">
          <div>
            <p className="page-overline">Mi espacio</p>

            <h1>Mis viajes</h1>

            <p className="page-description">
              Todo listo para tu próxima aventura.
            </p>
          </div>

          <Link to="/new-trip" className="create-trip-button">
            + Crear nuevo viaje
          </Link>
        </header>

        {trips.length === 0 ? (
          <EmptyTripsState />
        ) : (
          <>
            <TripSummary />

            <section className="trips-section">
              <div className="section-title">
                <h2>Tus planes</h2>
                <span>{trips.length} viajes</span>
              </div>

              <div className="trips-grid">
                {trips.map((trip) => (
                  <TripCard key={trip.id} {...trip} />
                ))}

                <article className="new-trip-card">
                  <span className="new-trip-icon" aria-hidden="true">+</span>
                  <h3>¿Y si el próximo destino lo elegís hoy?</h3>
                  <p>
                    Agregá tus ciudades favoritas y encontrá la mejor forma de
                    recorrerlas.
                  </p>
                  <Link to="/new-trip">Planear un viaje</Link>
                </article>
              </div>
            </section>

            <p className="private-trips-message">
              Tus viajes son privados y solo vos podés administrarlos.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function EmptyTripsState() {
  return (
    <section className="empty-trips-state" aria-labelledby="empty-trips-title">
      <div className="empty-trips-artwork">
        <svg
          viewBox="0 0 240 150"
          role="img"
          aria-label="Ilustración de una ciudad junto al mar"
        >
          <circle className="empty-art-sun" cx="198" cy="31" r="15" />
          <path className="empty-art-sea" d="M0 100 C24 76 48 72 73 83 C96 93 112 96 135 85 C163 72 179 85 197 102 C214 119 226 126 240 116 L240 150 L0 150 Z" />
          <path className="empty-art-ground" d="M0 122 C45 111 76 117 116 112 C164 106 197 117 240 110 L240 150 L0 150 Z" />
          <path className="empty-art-route" d="M114 119 C88 108 84 92 98 81 C109 72 133 66 170 57" />
          <rect className="empty-art-building" x="31" y="70" width="16" height="39" rx="2" />
          <rect className="empty-art-building" x="56" y="61" width="18" height="48" rx="2" />
          <rect className="empty-art-building" x="84" y="76" width="16" height="33" rx="2" />
          <rect className="empty-art-building" x="137" y="79" width="17" height="31" rx="2" />
          <rect className="empty-art-building" x="163" y="70" width="16" height="40" rx="2" />
          <path className="empty-art-window" d="M37 77h4v5h-4zm25-8h5v6h-5zm0 12h5v6h-5zm-24 9h4v5h-4zm30 0h5v6h-5zm74-3h5v6h-5zm27-9h4v5h-4zm0 12h4v5h-4z" />
          <rect className="empty-art-base" y="119" width="240" height="5" />
        </svg>
      </div>
      <h2 id="empty-trips-title">Tu próxima historia empieza acá</h2>
      <p>
        Todavía no creaste ningún viaje. Elegí tus destinos y armemos tu
        primer itinerario.
      </p>
      <Link to="/new-trip" className="empty-trips-create-button">
        <span aria-hidden="true">+</span>
        Crear primer viaje
      </Link>
    </section>
  );
}

export default MyTrips;