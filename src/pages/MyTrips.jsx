import Sidebar from "../components/Sidebar";
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

          <button className="create-trip-button">
            + Crear nuevo viaje
          </button>
        </header>

        <section className="featured-trip">
          <div className="featured-trip-info">
            <span className="trip-status">
              TU PRÓXIMA ESCAPADA
            </span>

            <h2>España, a tu ritmo</h2>

            <p>
              12–21 octubre · 10 días · 3 ciudades · 2 personas
            </p>
          </div>

          <div className="featured-trip-price">
            <strong>USD 2.460</strong>

            <span>estimado para todo el viaje</span>

            <button>Abrir mi itinerario</button>
          </div>
        </section>

        <section className="trips-section">
          <div className="section-title">
            <h2>Tus planes</h2>
            <span>2 viajes</span>
          </div>

          <div className="trips-grid">
            <article className="trip-card">
              <div className="trip-card-image">
                <div className="trip-sun"></div>
                <div className="trip-mountains"></div>
              </div>

              <span className="trip-card-status ready">
                Listo para viajar
              </span>

              <h3>España, a tu ritmo</h3>

              <p>Madrid · Valencia · Barcelona</p>

              <p>12–21 oct 2026 · 10 días</p>

              <small>Creado el 15 sep 2026</small>

              <button>→ Ver itinerario</button>
            </article>

            <article className="trip-card">
              <div className="trip-card-image">
                <div className="trip-sun"></div>
                <div className="trip-mountains"></div>
              </div>

              <span className="trip-card-status draft">
                Borrador
              </span>

              <h3>Una semana en Italia</h3>

              <p>Roma · Florencia</p>

              <p>08–14 nov 2026 · 7 días</p>

              <small>Creado el 13 sep 2026</small>

              <button>→ Seguir planificando</button>
            </article>

            <article className="new-trip-card">
              <span className="new-trip-icon">+</span>

              <h3>
                ¿Y si el próximo destino lo elegís hoy?
              </h3>

              <p>
                Agregá tus ciudades favoritas y encontrá la mejor
                forma de recorrerlas.
              </p>

              <button>Planear un viaje</button>
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