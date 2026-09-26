import "./TripCard.css";

function TripCard({
  status,
  statusType,
  title,
  cities,
  dates,
  createdDate,
  buttonText,
}) {
  return (
    <article className="trip-card">
      <div className="trip-card-image">
        <div className="trip-card-sun"></div>
        <div className="trip-card-mountains"></div>
      </div>

      <span className={`trip-card-status ${statusType}`}>
        {status}
      </span>

      <h3>{title}</h3>

      <p>{cities}</p>

      <p>{dates}</p>

      <small>{createdDate}</small>

      <button type="button">
        → {buttonText}
      </button>
    </article>
  );
}

export default TripCard;