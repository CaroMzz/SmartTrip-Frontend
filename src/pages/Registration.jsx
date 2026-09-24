import "./Registration.css";

function Registration() {
  return (
    <div className="registration-page">
      <section className="registration-hero">
        <div className="brand">
          <span className="brand-icon">✦</span>
          <span className="brand-name">SmartTrip</span>
        </div>

        <div className="hero-content">
          <h1>
            Menos planificación.
            <br />
            <span>Más viajes.</span>
          </h1>
          <p>
            Transformá tus planes de viaje en experiencias inolvidables. Comenzá tu viaje con nosotros.
          </p>

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

          <div className="hero-tag">Tu viaje comienza acá.</div>

          <p className="hero-footer">
            Planificá menos. Explorá más. Viaja mejor.
          </p>
        </div>
      </section>

      <section className="registration-form-section">
        <div className="form-container">
          <p className="form-overline">BIENVENIDO A SMARTTRIP</p>

          <h2>Tu próximo viaje comienza acá.</h2>

          <p className="form-description">
            Creá tu cuenta y comenzá a planificar tu próxima aventura.
          </p>

          <form className="registration-form">
            <div className="form-group">
              <label htmlFor="fullName">Nombre completo</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Ingresa tu nombre completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Dirección de correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Ingresa tu email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Ingresa tu contraseña"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirma tu contraseña"
              />
            </div>

            <button type="submit" className="submit-button">
              Crear cuenta
            </button>
          </form>

          <p className="login-link">
            ¿Ya tenés una cuenta? <a href="#">Iniciá sesión</a>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Registration;
