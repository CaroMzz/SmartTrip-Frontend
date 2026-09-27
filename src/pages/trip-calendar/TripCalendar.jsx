import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./TripCalendar.css";

const tripDays = {
  12: { city: "Madrid", type: "stay", description: "Día para explorar" },
  13: { city: "Madrid", type: "stay", description: "Día para explorar" },
  14: { city: "Madrid", type: "stay", description: "Día para explorar" },
  15: { city: "Valencia", type: "travel", description: "Traslado desde Madrid" },
  16: { city: "Valencia", type: "stay", description: "Día para explorar" },
  17: { city: "Valencia", type: "stay", description: "Día para explorar" },
  18: { city: "Barcelona", type: "travel", description: "Traslado desde Valencia" },
  19: { city: "Barcelona", type: "stay", description: "Día para explorar" },
  20: { city: "Barcelona", type: "stay", description: "Día para explorar" },
  21: { city: "Barcelona", type: "stay", description: "Día para explorar" },
};

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const calendarDays = createCalendarDays(2026, 9);

function TripCalendar() {
  return (
    <div className="trip-calendar-page">
      <Sidebar />

      <main className="trip-calendar-content">
        <header className="trip-calendar-header">
          <div>
            <p className="trip-calendar-breadcrumb">
              <Link to="/my-trips">Mis viajes</Link> / España, a tu ritmo
            </p>
            <h1>El calendario de tu viaje</h1>
            <p className="trip-calendar-description">
              España, a tu ritmo · 12–21 oct 2026 · 2 personas
            </p>
          </div>
          <span className="trip-calendar-currency">USD · Moneda base</span>
        </header>

        <nav className="trip-calendar-tabs" aria-label="Secciones del viaje">
          <Link className="trip-calendar-tab" to="/itinerary">Itinerario</Link>
          <span className="trip-calendar-tab active" aria-current="page">Calendario</span>
          <Link className="trip-calendar-tab" to="/itinerary#presupuesto">Presupuesto</Link>
          <Link className="trip-calendar-edit-button" to="/edit-trip">Editar viaje</Link>
        </nav>

        <section className="trip-calendar-card" aria-labelledby="calendar-month">
          <div className="trip-calendar-card-header">
            <div>
              <p className="trip-calendar-overline">Tu recorrido día por día</p>
              <h2 id="calendar-month">Octubre 2026</h2>
            </div>
            <span className="trip-calendar-duration">10 días de viaje</span>
          </div>

          <div className="trip-calendar-grid" role="grid" aria-label="Calendario de octubre de 2026">
            {weekDays.map((weekday) => (
              <div className="trip-calendar-weekday" role="columnheader" key={weekday}>
                {weekday}
              </div>
            ))}
            {calendarDays.map((day, index) => (
              <CalendarDay key={day ? day.day : `empty-${index}`} day={day} />
            ))}
          </div>

          <div className="trip-calendar-legend" aria-label="Referencias del calendario">
            <span><i className="legend-stay" /> Estadía</span>
            <span><i className="legend-travel" /> Día de traslado</span>
          </div>
        </section>

        <section className="trip-calendar-city-section" aria-labelledby="city-stays-title">
          <div className="trip-calendar-section-heading">
            <div>
              <p className="trip-calendar-overline">Tu ruta</p>
              <h2 id="city-stays-title">Noches por ciudad</h2>
            </div>
            <span>3 destinos · 10 días</span>
          </div>
          <div className="trip-calendar-city-grid">
            <CitySummary city="Madrid" days="3 días" dates="12–14 oct" description="Museos y paseos" />
            <CitySummary city="Valencia" days="3 días" dates="15–17 oct" description="Ciudad y costa" />
            <CitySummary city="Barcelona" days="4 días" dates="18–21 oct" description="Arte y arquitectura" />
          </div>
        </section>

        <p className="trip-calendar-note">
          Los días de traslado están incluidos en el total del viaje.
        </p>
      </main>
    </div>
  );
}

function CalendarDay({ day }) {
  if (!day) {
    return <div className="trip-calendar-day empty" role="gridcell" aria-hidden="true" />;
  }

  return (
    <div
      className={`trip-calendar-day ${day.type}`}
      role="gridcell"
      aria-label={`${day.day} de octubre${day.city ? `: ${day.city}, ${day.description}` : ""}`}
    >
      <span className="trip-calendar-day-number">{day.day}</span>
      {day.city && <strong>{day.city}</strong>}
      {day.city && <span className="trip-calendar-day-description">{day.description}</span>}
    </div>
  );
}

function CitySummary({ city, days, dates, description }) {
  return (
    <article className="trip-calendar-city-card">
      <div className="trip-calendar-city-title">
        <strong>{city}</strong>
        <span>{days}</span>
      </div>
      <p>{dates} · {description}</p>
    </article>
  );
}

function createCalendarDays(year, month) {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const tripDay = tripDays[day];

      return {
        day,
        type: tripDay?.type || "outside-trip",
        city: tripDay?.city || "",
        description: tripDay?.description || "",
      };
    }),
  ];
}

export default TripCalendar;
