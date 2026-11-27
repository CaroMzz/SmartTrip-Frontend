import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registrar } from "../../api";
import TravelHero from "../../components/TravelHero";
import "./Registration.css";

function Registration() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const nombre = formData.get("fullName").trim();
    const email = formData.get("email").trim();
    const contraseña = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (!nombre || !email || !contraseña || !confirmPassword) {
      setError("Completá todos los campos para crear tu cuenta.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Revisá el formato de tu correo electrónico.");
      return;
    }
    if (contraseña !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (contraseña.length < 15) {
      setError("La contraseña debe tener al menos 15 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      const resultado = await registrar({ nombre, email, contraseña });
      navigate("/email-verification", {
        state: { email, correoEnviado: resultado.correoEnviado },
      });
    } catch (registrationError) {
      setFieldErrors(registrationError?.errors || {});
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
          <form className="registration-form" noValidate onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Nombre completo</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Florencia Lopez"
                autoComplete="name"
                required
              />
              {fieldErrors.nombre && <small className="registration-error">{fieldErrors.nombre}</small>}
            </div>
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
              {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && <small className="registration-field-notice">Ingresá un correo válido, por ejemplo nombre@correo.com.</small>}
              {fieldErrors.email && <small className="registration-error">{fieldErrors.email}</small>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Crea una contraseña"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              {password.length > 0 && password.length < 15 && <small className="registration-field-notice">La contraseña necesita al menos 15 caracteres ({password.length}/15).</small>}
              {fieldErrors.contraseña && <small className="registration-error">{fieldErrors.contraseña}</small>}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirma tu contraseña"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
              {confirmPassword && password !== confirmPassword && <small className="registration-field-notice">Las contraseñas no coinciden.</small>}
            </div>
            {error && <p className="registration-error" role="alert">{error}</p>}
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
          <p className="login-link">
            ¿Ya tenés una cuenta? <Link to="/">Iniciá sesión</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Registration;
