import { useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import "./BudgetPreferences.css";

function BudgetPreferences() {
  const [budget, setBudget] = useState("3000");
  const [transport, setTransport] = useState("train");
  const [savingPercentage, setSavingPercentage] = useState(60);

  const attractionsPercentage = 100 - savingPercentage;

  return (
    <div className="budget-preferences-page">
      <Sidebar />

      <main className="budget-preferences-content">
        <header className="budget-preferences-header">
          <div>
            <p className="budget-breadcrumb">Mis viajes / Nuevo viaje</p>

            <h1>Un viaje que se adapte a vos</h1>

            <p className="budget-description">
              Definí lo esencial; nosotros ordenamos el recorrido.
            </p>
          </div>

          <span className="currency-badge">USD · Moneda base</span>
        </header>

        <div className="budget-steps">
          <Link to="/new-trip" className="budget-step completed">
            Destinos y fechas
          </Link>

          <span className="budget-step active">
            2 Presupuesto y preferencias
          </span>

          <span className="budget-step">3 Comparar rutas</span>
        </div>

        <div className="budget-layout">
          <section className="budget-form-card">
            <div className="budget-field">
              <label htmlFor="budget">Presupuesto total del viaje (USD)</label>

              <input
                type="number"
                id="budget"
                value={budget}
                min="0"
                onChange={(event) => setBudget(event.target.value)}
              />

              <small>Importe total para las 2 personas, no por persona.</small>
            </div>

            <div className="transport-section">
              <label>Medio de transporte preferido</label>

              <div className="transport-options">
                <button
                  type="button"
                  className={`transport-option ${
                    transport === "train" ? "selected" : ""
                  }`}
                  onClick={() => setTransport("train")}
                >
                  <span className="transport-icon">🚆</span>
                  <span>Tren</span>
                </button>

                <button
                  type="button"
                  className={`transport-option ${
                    transport === "plane" ? "selected" : ""
                  }`}
                  onClick={() => setTransport("plane")}
                >
                  <span className="transport-icon">✈</span>
                  <span>Avión</span>
                </button>

                <button
                  type="button"
                  className={`transport-option ${
                    transport === "car" ? "selected" : ""
                  }`}
                  onClick={() => setTransport("car")}
                >
                  <span className="transport-icon">🚗</span>
                  <span>Auto</span>
                </button>
              </div>
            </div>

            <div className="preferences-section">
              <h2>¿Qué es más importante para vos?</h2>

              <p className="preferences-description">
                Balanceá el ahorro y los atractivos turísticos. La suma de tus
                prioridades es siempre 100%.
              </p>

              <div className="preference-header">
                <span>Ahorrar en el viaje</span>
                <strong>{savingPercentage}%</strong>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={savingPercentage}
                onChange={(event) =>
                  setSavingPercentage(Number(event.target.value))
                }
                className="preference-slider"
              />

              <div className="preference-header">
                <span>Atractivos turísticos</span>
                <strong>{attractionsPercentage}%</strong>
              </div>

              <div className="preference-slider static-slider">
                <div
                  className="static-slider-fill"
                  style={{
                    width: `${attractionsPercentage}%`,
                  }}
                ></div>
              </div>

              <small className="preference-note">
                Equilibrio elegido: un poco más de ahorro.
              </small>
            </div>

            <div className="budget-actions">
              <Link to="/new-trip" className="back-button">
                ← Volver
              </Link>

              <button type="button" className="generate-button">
                ✧ Generar alternativas
              </button>
            </div>
          </section>

          <aside className="trip-summary-panel">
            <h2>Resumen de tu viaje</h2>

            <div className="summary-item">
              <span>Destinos</span>
              <strong>Madrid · Valencia · Barcelona</strong>
            </div>

            <div className="summary-item">
              <span>Fechas</span>
              <strong>12–21 oct 2026 · 10 días</strong>
            </div>

            <div className="summary-item">
              <span>Viajeros</span>
              <strong>2 personas</strong>
            </div>

            <div className="summary-item">
              <span>Presupuesto</span>
              <strong>
                USD {Number(budget || 0).toLocaleString("es-AR")} en total
              </strong>
            </div>
          </aside>

          <div className="budget-info-box">
            Los costos son aproximados. SmartTrip te ayuda a planificar y
            comparar; las reservas se hacen por fuera.
          </div>
        </div>
      </main>
    </div>
  );
}

export default BudgetPreferences;
