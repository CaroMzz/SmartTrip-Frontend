import { useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import "./NewTrip.css";

function NewTrip() {
  const [tripData, setTripData] = useState({
    name: "",
    country: "",
    cities: "",
    startDate: "",
    duration: "",
    travelers: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setTripData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <div className="new-trip-page">
      <Sidebar />

      <main className="new-trip-content">
        <header className="new-trip-header">
          <div>
            <p className="new-trip-breadcrumb">Mis viajes / Nuevo viaje</p>

            <h1>¿A dónde querés ir?</h1>

            <p className="new-trip-description">
              Armemos un viaje que tenga todo lo que te gusta.
            </p>
          </div>

          <span className="currency-badge">USD · Moneda base</span>
        </header>

        <div className="new-trip-steps">
          <span className="step active">1 Destinos y fechas</span>

          <span className="step">2 Presupuesto y preferencias</span>

          <span className="step">3 Comparar rutas</span>
        </div>

        <div className="new-trip-layout">
          <form className="new-trip-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="name">Nombre del viaje</label>

              <input
                type="text"
                id="name"
                name="name"
                value={tripData.name}
                onChange={handleChange}
                placeholder="España, a tu ritmo"
              />
            </div>

            <div className="form-field">
              <label htmlFor="country">Países a visitar</label>

              <input
                type="text"
                id="country"
                name="country"
                value={tripData.country}
                onChange={handleChange}
                placeholder="España"
              />

              <small>Buscá por nombre de país.</small>
            </div>

            <div className="form-field">
              <label htmlFor="cities">Ciudades obligatorias</label>

              <input
                type="text"
                id="cities"
                name="cities"
                value={tripData.cities}
                onChange={handleChange}
                placeholder="Madrid × Valencia × Barcelona"
              />

              <small>Incluí todas las ciudades que selecciones.</small>
            </div>

            <div className="date-duration-row">
              <div className="form-field">
                <label htmlFor="startDate">Fecha de inicio</label>

                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={tripData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label htmlFor="duration">Duración en días</label>

                <input
                  type="number"
                  id="duration"
                  name="duration"
                  min="1"
                  value={tripData.duration}
                  onChange={handleChange}
                  placeholder="10"
                />

                <small>Fin del viaje: se calculará automáticamente.</small>
              </div>
            </div>

            <div className="form-action-row">
              <div className="form-field travelers-field">
                <label htmlFor="travelers">Cantidad de personas</label>

                <input
                  type="number"
                  id="travelers"
                  name="travelers"
                  min="1"
                  value={tripData.travelers}
                  onChange={handleChange}
                  placeholder="2"
                />
              </div>

              <button type="submit" className="continue-button">
                → Continuar
              </button>
            </div>
          </form>

          <aside className="trip-preview">
            <h2>Tu viaje empieza a tomar forma</h2>

            <div className="preview-image">
              <div className="preview-sun"></div>
              <div className="preview-mountains"></div>
            </div>

            <h3>
              {tripData.name || "España"} ·{" "}
              {tripData.cities ? tripData.cities.split("×").length : 3} ciudades
            </h3>

            <p>
              {tripData.cities || "Madrid, Valencia y Barcelona."} Vamos a
              comparar recorridos para aprovechar tu tiempo.
            </p>

            <small>
              {tripData.travelers || 2} personas
              {tripData.startDate ? ` · ${tripData.startDate}` : ""}
            </small>

            <Link to="/my-trips" className="back-to-trips">
              Volver a mis viajes
            </Link>
          </aside>
        </div>

        <p className="new-trip-footer">
          Podés modificar estos datos antes o después de generar tu itinerario.
        </p>
      </main>
    </div>
  );
}

export default NewTrip;
