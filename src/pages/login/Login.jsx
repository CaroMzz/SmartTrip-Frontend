import { Link, useNavigate } from "react-router-dom";
import TravelHero from "../../components/TravelHero";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Navegación directa al panel de viajes
    navigate("/my-trips");
  };

  return (
    <div className="login-page">
      <TravelHero />

      <section className="login-form-section">
        <div className="login-form-container">
          <p className="form-overline">BIENVENIDO A SMARTTRIP</p>

          <h2>¡Qué bueno verte de nuevo!</h2>

          <p className="form-description">Inicia sesión y retomá tus planes</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>

              <input
                type="email"
                id="email"
                name="email"
                placeholder="florencia@ejemplo.com"
                defaultValue="florencia@ejemplo.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>

              <input
                type="password"
                id="password"
                name="password"
                placeholder="Ingresa tu contraseña"
                defaultValue="password12345678"
              />
            </div>

            <button type="submit" className="submit-button">
              Iniciar sesión
            </button>
          </form>

          <p className="signup-link">
            ¿Todavia no tenés una cuenta? <Link to="/register">Creá tu cuenta</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;