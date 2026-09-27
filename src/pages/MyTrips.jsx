import Sidebar from "../components/Sidebar";
import TripSummary from "../components/TripSummary";
import TripCard from "../components/TripCard";
import { Link } from "react-router-dom";
import "./MyTrips.css";

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

          <button
            type="button"
            className="create-trip-button"
          >
            + Crear nuevo viaje
          </button>
        </header>

        <TripSummary />

        <section className="trips-section">
          <div className="section-title">
            <h2>Tus planes</h2>
            <span>2 viajes</span>
          </div>

          <div className="trips-grid">
            <TripCard
              status="Listo para viajar"
              statusType="ready"
              title="España, a tu ritmo"
              cities="Madrid · Valencia · Barcelona"
              dates="12–21 oct 2026 · 10 días"
              createdDate="Creado el 15 sep 2026"
              buttonText="Ver itinerario"
              to="/itinerary"
            />

            <TripCard
              status="Borrador"
              statusType="draft"
              title="Una semana en Italia"
              cities="Roma · Florencia"
              dates="08–14 nov 2026 · 7 días"
              createdDate="Creado el 13 sep 2026"
              buttonText="Seguir planificando"
              to="/budget-preferences"
            />

            <article className="new-trip-card">
              <span className="new-trip-icon">+</span>

              <h3>
                ¿Y si el próximo destino lo elegís hoy?
              </h3>

              <p>
                Agregá tus ciudades favoritas y encontrá la
                mejor forma de recorrerlas.
              </p>

              <Link to="/new-trip">Planear un viaje</Link>
            </article>
          </div>
        </section>

        <p className="private-trips-message">
          Tus viajes son privados y solo vos podés administrarlos.
        </p>
      </main>
    </div>
  );
}

export default MyTrips;