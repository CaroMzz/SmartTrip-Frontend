import "./TravelHero.css";

function TravelHero({
  titleFirstLine = "Menos organizar.",
  titleSecondLine = "Más viajar.",
  description = "Tus destinos, tus precios y tus presupuestos. Todo en un solo lugar.",
  tag = "Rutas personalizadas.",
  footer = "Planea con intención. Viajá a tu ritmo.",
}) {
  return (
    <section className="travel-hero">
      <div className="brand">
        <span className="brand-icon">✦</span>
        <span className="brand-name">SmartTrip</span>
      </div>

      <div className="hero-content">
        <h1>
          {titleFirstLine}
          <br />
          <span>{titleSecondLine}</span>
        </h1>

        <p>{description}</p>

        <div className="travel-illustration">
          <div className="sun"></div>

          <div className="mountain mountain-back"></div>
          <div className="mountain mountain-front"></div>

          <div className="building building-one"></div>
          <div className="building building-two"></div>
          <div className="building building-three"></div>
          <div className="building building-four"></div>

          <div className="travel-path"></div>
        </div>

        <div className="hero-tag">{tag}</div>

        <p className="hero-footer">{footer}</p>
      </div>
    </section>
  );
}

export default TravelHero;

