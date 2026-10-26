const ItineraryCard = ({
  itinerary,
  isSelected = false,
  onSelect,
}) => {
  const formattedCost = new Intl.NumberFormat("es-AR").format(
    itinerary.totalCost,
  );

  return (
    <article className={`itinerary-card ${isSelected ? "selected" : ""}`}>
      <div className="itinerary-card-topline">
        <span className="itinerary-badge">{itinerary.badge}</span>
        {isSelected && <span className="itinerary-selected-label">Elegido</span>}
      </div>

      <h2>{itinerary.title}</h2>

      <p className="itinerary-description">{itinerary.description}</p>

      <div className="itinerary-route" aria-label="Recorrido">
        {itinerary.route.map((city, index) => (
          <span className="itinerary-route-stop" key={city}>
            {index > 0 && <span className="itinerary-route-divider" aria-hidden="true">→</span>}
            {city}
          </span>
        ))}
      </div>

      <div className="itinerary-price-block">
        <span className="itinerary-price-label">Estimado total</span>
        <strong className="itinerary-price">USD {formattedCost}</strong>
        <span className="itinerary-per-person">
          USD {new Intl.NumberFormat("es-AR").format(itinerary.totalCost / 2)} por persona
        </span>
      </div>

      <dl className="itinerary-details">
        <div>
          <dt>Duración</dt>
          <dd>{itinerary.duration}</dd>
        </div>
        <div>
          <dt>Traslados</dt>
          <dd>{itinerary.transport}</dd>
        </div>
      </dl>

      <button
        type="button"
        className="itinerary-select-button"
        aria-pressed={isSelected}
        onClick={onSelect}
      >
        {isSelected ? "Itinerario elegido" : "Elegir este itinerario"}
      </button>
    </article>
  );
};

export default ItineraryCard;