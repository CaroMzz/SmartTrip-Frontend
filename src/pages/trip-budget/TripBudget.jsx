import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./TripBudget.css";

const tripBudget = {
  totalBudget: 3000,
  estimatedTotal: 2680,
  categories: [
    { name: "Alojamiento", amount: 1080, color: "lodging" },
    { name: "Traslados", amount: 750, color: "transport" },
    { name: "Comidas", amount: 520, color: "meals" },
    { name: "Experiencias", amount: 330, color: "experiences" },
  ],
  note: "Los valores son estimaciones para 2 personas. Las reservas se realizan por fuera de SmartTrip.",
};

function TripBudget() {
  const remainingBudget = tripBudget.totalBudget - tripBudget.estimatedTotal;
  const usedPercentage = Math.round(
    (tripBudget.estimatedTotal / tripBudget.totalBudget) * 100,
  );
  const remainingPercentage = 100 - usedPercentage;

  return (
    <div className="trip-budget-page">
      <Sidebar />

      <main className="trip-budget-content">
        <header className="trip-budget-header">
          <div>
            <p className="trip-budget-breadcrumb">
              <Link to="/my-trips">Mis viajes</Link> / España, a tu ritmo
            </p>
            <h1>Tu presupuesto, bajo control</h1>
            <p className="trip-budget-description">
              Estimaciones para 2 personas · 10 días · Moneda base USD
            </p>
          </div>
          <span className="trip-budget-currency">USD · Moneda base</span>
        </header>

        <nav className="trip-budget-tabs" aria-label="Secciones del viaje">
          <Link className="trip-budget-tab" to="/itinerary">Itinerario</Link>
          <Link className="trip-budget-tab" to="/trip-calendar">Calendario</Link>
          <span className="trip-budget-tab active" aria-current="page">Presupuesto</span>
          <Link className="trip-budget-edit-button" to="/edit-trip">Editar viaje</Link>
        </nav>

        <section className="trip-budget-summary" aria-label="Resumen del presupuesto">
          <BudgetSummaryCard
            label="Presupuesto total"
            amount={tripBudget.totalBudget}
            description="Disponible para todo el viaje"
          />
          <BudgetSummaryCard
            label="Total estimado"
            amount={tripBudget.estimatedTotal}
            description={`${usedPercentage}% del presupuesto`}
          />
          <BudgetSummaryCard
            label="Saldo disponible"
            amount={remainingBudget}
            description={`${remainingPercentage}% de margen`}
            isHighlighted
          />
        </section>

        <section className="trip-budget-main-grid">
          <div className="trip-budget-distribution-card">
            <div className="trip-budget-section-heading">
              <div>
                <p className="trip-budget-overline">Estimado por categoría</p>
                <h2>¿En qué se distribuye?</h2>
              </div>
              <span>USD {formatNumber(tripBudget.estimatedTotal)}</span>
            </div>

            <div className="trip-budget-categories">
              {tripBudget.categories.map((category) => (
                <BudgetCategory
                  key={category.name}
                  category={category}
                  estimatedTotal={tripBudget.estimatedTotal}
                />
              ))}
            </div>
          </div>

          <aside className="trip-budget-margin-card">
            <p className="trip-budget-overline">Tu margen disponible</p>
            <h2>Viajá con tranquilidad</h2>

            <div
              className="trip-budget-ring"
              role="img"
              aria-label={`${usedPercentage}% del presupuesto estimado`}
              style={{ "--budget-used": `${usedPercentage}%` }}
            >
              <div className="trip-budget-ring-inner">
                <strong>{usedPercentage}%</strong>
                <span>estimado</span>
              </div>
            </div>

            <p>
              Te quedan <strong>{formatCurrency(remainingBudget)}</strong> para
              imprevistos o nuevas experiencias.
            </p>
          </aside>
        </section>

        <p className="trip-budget-note">{tripBudget.note}</p>
      </main>
    </div>
  );
}

function BudgetSummaryCard({ label, amount, description }) {
  return (
    <article className="trip-budget-summary-card">
      <span className="trip-budget-summary-label">{label}</span>

      <strong className="trip-budget-summary-amount">
        {formatCurrency(amount)}
      </strong>

      <span className="trip-budget-summary-description">{description}</span>
    </article>
  );
}

function BudgetCategory({ category, estimatedTotal }) {
  const percentage = (category.amount / estimatedTotal) * 100;

  return (
    <div className={`trip-budget-category ${category.color}`}>
      <div className="trip-budget-category-header">
        <span>{category.name}</span>

        <strong>{formatCurrency(category.amount)}</strong>
      </div>

      <div
        className="trip-budget-progress-background"
        role="progressbar"
        aria-label={`Porcentaje de ${category.name} sobre el total estimado`}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={Math.round(percentage)}
      >
        <div
          className="trip-budget-progress-bar"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
      <span className="trip-budget-category-percentage">
        {Math.round(percentage)}% del total estimado
      </span>
    </div>
  );
}

function formatNumber(amount) {
  return new Intl.NumberFormat("es-AR").format(amount);
}

function formatCurrency(amount) {
  return `USD ${formatNumber(amount)}`;
}

export default TripBudget;
