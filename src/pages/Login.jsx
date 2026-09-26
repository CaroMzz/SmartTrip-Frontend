import TravelHero from "../components/TravelHero";
import "./Login.css";
import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="login-page">
      <TravelHero />

      <section className="login-form-section">
        <div className="login-form-container">
          <p className="form-overline">BIENVENIDO A SMARTTRIP</p>

          <h2>¡Qué bueno verte de nuevo!</h2>

<<<<<<< HEAD
          <p className="form-description">Inicia sesión y retomá tus planes</p>
=======
          <p className="form-description">
            Iniciá sesión y retomá tus planes
          </p>
>>>>>>> 1d6bb69498d2ccc6ff09dab82c897a9208d1408c

          <form className="login-form">
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

            <button type="submit" className="submit-button">
              Iniciar sesión
            </button>
          </form>

          <p className="signup-link">
<<<<<<< HEAD
            ¿Todavia no tenés una cuenta?{" "}
=======
            ¿Todavia no tenés una cuenta? {""}
>>>>>>> 1d6bb69498d2ccc6ff09dab82c897a9208d1408c
            <Link to="/register">Creá tu cuenta</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;
