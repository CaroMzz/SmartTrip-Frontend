import TravelHero from "../components/TravelHero";
import "./Registration.css";
import { Link } from "react-router-dom";

function Registration() {
  return (
    <div className="registration-page">
      <TravelHero />

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
                placeholder="Florencia Lopez"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="florencia@ejemplo.com"
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
<<<<<<< HEAD
            ¿Ya tenés una cuenta? <Link to="/">Iniciá sesión</Link>
=======
            ¿Ya tenés una cuenta? {" "}
            <Link to="/">Iniciá sesión</Link>
>>>>>>> 1d6bb69498d2ccc6ff09dab82c897a9208d1408c
          </p>
        </div>
      </section>
    </div>
  );
}

export default Registration;
