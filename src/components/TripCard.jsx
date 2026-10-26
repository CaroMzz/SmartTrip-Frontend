import { Link } from "react-router-dom";
import "./TripCard.css";

function TripCard({
  status,
  statusType,
  title,
  cities,
  dates,
  createdDate,
  buttonText,
  to,
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

      <Link className="trip-card-action" to={to}>
        → {buttonText}
      </Link>
    </article>
  );
}

export default TripCard;