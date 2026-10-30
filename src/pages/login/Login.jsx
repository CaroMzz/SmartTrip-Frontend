import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { iniciarSesion } from "../../api";
import TravelHero from "../../components/TravelHero";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const submittedEmail = formData.get("email").trim();
    const submittedPassword = formData.get("password");
    if (!submittedEmail || !submittedPassword) {
      setError("Completá tu correo y contraseña para iniciar sesión.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submittedEmail)) {
      setError("Revisá el formato de tu correo electrónico.");
      return;
    }
    setIsSubmitting(true);

    try {
      await iniciarSesion(
        submittedEmail,
        submittedPassword
      );
      navigate("/my-trips");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "No se pudo iniciar sesión. Verificá tus credenciales e intentá nuevamente."
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

          <p className="form-description">Inicia sesión y retomá tus planes</p>

          {location.state?.notice && (
            <p className="login-notice" role="status">{location.state.notice}</p>
          )}

          <form className="login-form" noValidate onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>

              <input
                type="email"
                id="email"
                name="email"
                placeholder="florencia@ejemplo.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && <small className="login-field-notice">Ingresá un correo válido, por ejemplo nombre@correo.com.</small>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>

              <input
                type="password"
                id="password"
                name="password"
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verificando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="signup-link">
            ¿Todavia no tenés una cuenta? <Link to="/register">Creá tu cuenta</Link>
          </p>
          <p className="help-link">
            ¿Necesitás ayuda?{" "}
            <Link to="/faq">Ver Centro de Ayuda (FAQ)</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;
