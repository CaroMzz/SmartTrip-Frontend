import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { iniciarSesion } from "../api";
import TravelHero from "../components/TravelHero";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email").trim();
    const contraseña = formData.get("password");

    try {
      await iniciarSesion(email, contraseña);
      navigate("/my-trips", { replace: true });
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "No se pudo iniciar sesión. Intentá nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <TravelHero />

      <section className="login-form-section">
        <div className="login-form-container">
          <p className="form-overline">BIENVENIDO A SMARTTRIP</p>

          <h2>¡Qué bueno verte de nuevo!</h2>

          <p className="form-description">
            Inicia sesión para continuar planificando tu próxima aventura.
          </p>

          {location.state?.notice && (
            <p className="form-notice" role="status">{location.state.notice}</p>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>

              <input
                type="email"
                id="email"
                name="email"
                placeholder="florencia@ejemplo.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>

              <input
                type="password"
                id="password"
                name="password"
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                required
              />
            </div>

            {error && <p className="registration-error" role="alert">{error}</p>}

            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
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