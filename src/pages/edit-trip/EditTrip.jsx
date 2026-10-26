import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./EditTrip.css";

const initialTrip = {
  name: "España, a tu ritmo",
  country: "España",
  cities: "Madrid • Valencia • Barcelona",
  startDate: "2026-10-12",
  duration: 10,
  people: 2,
};

function EditTrip() {
  const [trip, setTrip] = useState(initialTrip);
  const [saved, setSaved] = useState(false);

  const updateTrip = (field, value) => {
    setTrip((currentTrip) => ({
      ...currentTrip,
      [field]: value,
    }));
    setSaved(false);
  };

  const cities = trip.cities
    .split(/[•×,]/)
    .map((city) => city.trim())
    .filter(Boolean);

  const dateSummary = getDateSummary(trip.startDate, trip.duration);

  function handleSubmit(event) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <div className="edit-trip-page">
      <Sidebar />

      <main className="edit-trip-content">
        <header className="edit-trip-header">
          <div>
            <p className="edit-trip-breadcrumb">
              <Link to="/my-trips">Mis viajes</Link> / Editar viaje
            </p>
            <h1>Editá tu viaje</h1>
            <p className="edit-trip-description">
              Actualizá los detalles para que el plan siga siendo tuyo.
            </p>
          </div>
          <span className="edit-trip-currency">USD · Moneda base</span>
        </header>

        <nav className="edit-trip-steps" aria-label="Pasos para planificar el viaje">
          <span className="edit-trip-step active" aria-current="step">
            1 Destinos y fechas
          </span>
          <Link to="/budget-preferences" className="edit-trip-step">
            2 Presupuesto y preferencias
          </Link>
          <Link to="/compare-itineraries" className="edit-trip-step">
            3 Comparar rutas
          </Link>
        </nav>

        <div className="edit-trip-workspace">
          <form className="edit-trip-form-card" onSubmit={handleSubmit}>
            <EditTripField
              id="trip-name"
              label="Nombre del viaje"
              value={trip.name}
              placeholder="España, a tu ritmo"
              onChange={(value) => updateTrip("name", value)}
            />

            <EditTripField
              id="trip-country"
              label="Países a visitar"
              value={trip.country}
              placeholder="España"
              helper="Buscá por nombre de país."
              onChange={(value) => updateTrip("country", value)}
            />

            <EditTripField
              id="trip-cities"
              label="Ciudades obligatorias"
              value={trip.cities}
              placeholder="Madrid • Valencia • Barcelona"
              helper="Separá las ciudades con un punto medio."
              onChange={(value) => updateTrip("cities", value)}
            />

            <div className="edit-trip-field-grid">
              <EditTripField
                id="trip-start-date"
                label="Fecha de inicio"
                type="date"
                value={trip.startDate}
                onChange={(value) => updateTrip("startDate", value)}
              />

              <EditTripField
                id="trip-duration"
                label="Duración en días"
                type="number"
                min="1"
                value={trip.duration}
                helper={dateSummary.endDate ? `Finaliza el ${dateSummary.endDate}.` : ""}
                onChange={(value) => updateTrip("duration", Number(value) || 0)}
              />
            </div>

            <EditTripField
              id="trip-people"
              label="Cantidad de personas"
              type="number"
              min="1"
              value={trip.people}
              onChange={(value) => updateTrip("people", Number(value) || 0)}
            />

            <div className="edit-trip-form-actions">
              <Link to="/itinerary" className="edit-trip-cancel-button">
                Cancelar
              </Link>
              <button className="edit-trip-primary-button" type="submit">
                Guardar cambios
              </button>
            </div>
            {saved && (
              <p className="edit-trip-success" role="status">
                Cambios guardados en esta vista.
              </p>
            )}
          </form>

          <aside className="edit-trip-preview-card" aria-label="Vista previa del viaje">
            <h2>Así va tomando forma</h2>
            <div className="edit-trip-preview-image" aria-hidden="true">
              <span className="preview-sun" />
              <span className="preview-hill preview-hill-back" />
              <span className="preview-hill preview-hill-front" />
              <span className="preview-route-dot preview-route-dot-one" />
              <span className="preview-route-dot preview-route-dot-two" />
              <span className="preview-route-dot preview-route-dot-three" />
            </div>
            <div className="edit-trip-preview-body">
              <p className="edit-trip-preview-overline">Tu próximo viaje</p>
              <h3>{trip.name || "Tu viaje"}</h3>
              <p>
                {cities.length
                  ? cities.join(" · ")
                  : "Agregá ciudades para ver el recorrido."}
              </p>
              <div className="edit-trip-preview-meta">
                <span>{trip.people || 0} personas</span>
                <span>{dateSummary.label || "Elegí una fecha"}</span>
              </div>
            </div>
            <Link to="/itinerary" className="edit-trip-back-button">
              Volver al itinerario
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}

function EditTripField({
  id,
  label,
  value,
  placeholder,
  helper,
  onChange,
  type = "text",
  min,
}) {
  return (
    <div className="edit-trip-field">
      <label className="edit-trip-field-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        min={min}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {helper && <small className="edit-trip-field-helper">{helper}</small>}
    </div>
  );
}

function getDateSummary(startDateValue, duration) {
  if (!startDateValue) {
    return { label: "", endDate: "" };
  }

  const startDate = new Date(`${startDateValue}T12:00:00`);

  if (Number.isNaN(startDate.getTime())) {
    return { label: "", endDate: "" };
  }

  const endDate = new Date(startDate);

  if (duration > 0) {
    endDate.setDate(endDate.getDate() + duration - 1);
  }

  const formatOptions = { day: "numeric", month: "short" };
  const startLabel = new Intl.DateTimeFormat("es-AR", formatOptions).format(startDate);
  const endLabel = new Intl.DateTimeFormat("es-AR", {
    ...formatOptions,
    year: "numeric",
  }).format(endDate);

  return {
    label: `${startLabel} – ${endLabel}`,
    endDate: endLabel,
  };
}

export default EditTrip;
