import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registrar } from "../api";
import TravelHero from "../components/TravelHero";
import "./Registration.css";

function Registration() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const nombre = formData.get("fullName").trim();
    const email = formData.get("email").trim();
    const contraseña = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (!nombre) {
      setError("Ingresá tu nombre completo.");
      return;
    }

    if (contraseña !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registrar({ nombre, email, contraseña });
      navigate("/verify-email", { state: { email } });
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : "No se pudo crear la cuenta. Intentá nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <form className="registration-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Nombre completo</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Florencia Lopez"
                autoComplete="name"
                minLength={2}
                required
              />
            </div>

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
                placeholder="Crea una contraseña"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirmar contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirma tu contraseña"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            {error && (
              <p className="registration-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="login-link">
            ¿Ya tenés una cuenta? {" "}
            <Link to="/">Iniciá sesión</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Registration;