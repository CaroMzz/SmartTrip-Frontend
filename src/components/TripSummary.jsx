import "./TripSummary.css";

function TripSummary() {
  return (
    <section className="trip-summary">
      <div className="trip-summary-info">
        <span className="trip-summary-status">
          TU PRÓXIMA ESCAPADA
        </span>

        <h2>España, a tu ritmo</h2>

        <p>
          12–21 octubre · 10 días · 3 ciudades · 2 personas
        </p>
      </div>

      <div className="trip-summary-price">
        <strong>USD 2.460</strong>

        <span>estimado para todo el viaje</span>

        <button type="button">
          Abrir mi itinerario
        </button>
      </div>
    </section>
  );
}

export default TripSummary;