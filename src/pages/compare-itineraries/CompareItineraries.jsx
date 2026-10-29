import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import ItineraryCard from "../../components/ItineraryCard";
import "./CompareItineraries.css";

const itineraries = [
  {
    id: "equilibrado",
    title: "España, a tu ritmo",
    badge: "Mejor equilibrio",
    description: "Un recorrido cómodo para disfrutar cada ciudad sin apuros.",
    route: ["Madrid", "Valencia", "Barcelona"],
    totalCost: 2680,
    duration: "10 días",
    transport: "Tren",
    lodging: "Hoteles 3 estrellas",
    pace: "Tranquilo",
    isRecommended: true,
  },
  {
    id: "ahorro",
    title: "España, modo ahorro",
    badge: "Menor costo",
    description: "Más noches en alojamientos simples y traslados económicos.",
    route: ["Madrid", "Valencia", "Barcelona"],
    totalCost: 2140,
    duration: "10 días",
    transport: "Bus + tren",
    lodging: "Hostels y pensiones",
    pace: "Activo",
    isRecommended: false,
  },
  {
    id: "experiencias",
    title: "España para descubrir",
    badge: "Más experiencias",
    description: "Más tiempo para la gastronomía, los barrios y las excursiones.",
    route: ["Madrid", "Valencia", "Barcelona"],
    totalCost: 3290,
    duration: "10 días",
    transport: "Tren de alta velocidad",
    lodging: "Hoteles boutique",
    pace: "Flexible",
    isRecommended: false,
  },
];

const metrics = [
  { key: "duration", label: "Duración", value: (itinerary) => itinerary.duration },
  { key: "transport", label: "Traslados", value: (itinerary) => itinerary.transport },
  { key: "lodging", label: "Alojamiento", value: (itinerary) => itinerary.lodging },
  { key: "pace", label: "Ritmo del viaje", value: (itinerary) => itinerary.pace },
];

function CompareItineraries() {
  const [selectedId, setSelectedId] = useState("equilibrado");
  const selectedItinerary = itineraries.find(
    (itinerary) => itinerary.id === selectedId,
  );

  return (
    <div className="compare-itineraries-page">
      <Sidebar />

      <main className="compare-itineraries-content">
        <header className="comparison-header">
          <div>
            <p className="comparison-breadcrumb">Mis viajes / Nuevo viaje</p>
            <h1>Elegí tu forma de viajar</h1>
            <p className="comparison-description">
              Compará las alternativas y quedate con la que mejor va con vos.
            </p>
          </div>
          <span className="comparison-currency">USD · Moneda base</span>
        </header>

        <nav className="comparison-steps" aria-label="Pasos para planificar el viaje">
          <Link to="/new-trip" className="comparison-step completed">
            1 Destinos y fechas
          </Link>
          <Link to="/budget-preferences" className="comparison-step completed">
            2 Presupuesto y preferencias
          </Link>
          <span className="comparison-step active" aria-current="step">
            3 Comparar rutas
          </span>
        </nav>

        <section className="comparison-message" aria-label="Resumen de preferencias">
          <span className="comparison-message-icon" aria-hidden="true">✦</span>
          <p>
            Para <strong>2 personas</strong>, del <strong>12 al 21 de octubre</strong>.
            Priorizamos el ahorro sin dejar de lado las experiencias.
          </p>
        </section>

        <section className="itinerary-options" aria-label="Alternativas de viaje">
          {itineraries.map((itinerary) => (
            <ItineraryCard
              key={itinerary.id}
              itinerary={itinerary}
              isSelected={selectedId === itinerary.id}
              onSelect={() => setSelectedId(itinerary.id)}
            />
          ))}
        </section>

        <section className="comparison-table-section">
          <div className="comparison-section-heading">
            <div>
              <p className="comparison-overline">A simple vista</p>
              <h2>Compará los detalles</h2>
            </div>
            <span>Estimaciones para 2 personas</span>
          </div>

          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th scope="col">Incluye</th>
                  {itineraries.map((itinerary) => (
                    <th scope="col" key={itinerary.id}>{itinerary.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.key}>
                    <th scope="row">{metric.label}</th>
                    {itineraries.map((itinerary) => (
                      <td key={itinerary.id}>{metric.value(itinerary)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="comparison-footer">
          <Link to="/budget-preferences" className="comparison-back-button">
            ← Volver a preferencias
          </Link>
          <div className="comparison-confirmation">
            <span>
              Elegiste <strong>{selectedItinerary.title}</strong>
            </span>
            <Link to="/my-trips" className="comparison-select-button">
              Confirmar itinerario
            </Link>
          </div>
        </footer>

        <p className="comparison-note">
          Los costos son aproximados. Las reservas se realizan por fuera de SmartTrip.
        </p>
      </main>
    </div>
  );
}

export default CompareItineraries;