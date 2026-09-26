import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import TravelHero from "../components/TravelHero";
import { confirmarCorreo } from "../api";
import "./EmailVerification.css";

function EmailVerification() {
  const location = useLocation();
  const [token, setToken] = useState(location.state?.tokenVerificacion || "");
  const tokenRecibido = Boolean(location.state?.tokenVerificacion);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const email =
    location.state?.email ||
    sessionStorage.getItem("smarttrip_email") ||
    "tu correo";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token.trim()) {
      setError("Ingresá el token de verificación.");
      return;
    }

    setLoading(true);

    try {
      const data = await confirmarCorreo(token.trim());
      setSuccess(`${data.mensaje} Ahora podés iniciar sesión.`);
      setToken("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-verification-page">
      <TravelHero
        titleFirstLine="Menos organizar."
        titleSecondLine="Más viajar."
        description="Tus destinos, tus tiempos y tu presupuesto. Todo en un solo lugar."
        tag="Rutas personalizadas"
        footer="Planeá con intención. Viajá a tu ritmo."
      />

      <section className="verification-section">
        <div className="verification-container">
          <p className="verification-overline">TU ESPACIO PARA VIAJAR</p>

          <h2>Revisá tu correo</h2>

          <div className="verification-icon" aria-hidden="true">
            ✓
          </div>

          <p className="verification-message">
            Te enviamos un enlace a {email}. {tokenRecibido
              ? "El token de verificación llegó desde el backend de desarrollo."
              : "En desarrollo, el token de verificación aparece en la consola del servidor."}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="verification-token">Token de verificación</label>
              <input
                type="text"
                id="verification-token"
                name="verification-token"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder={tokenRecibido ? "Token recibido del backend" : "Pegá el token de la consola"}
              />
            </div>

            {error && <p className="form-error">{error}</p>}
            {success && <p className="form-success">{success}</p>}

            <div className="verification-actions">
              <button
                type="submit"
                className="verification-button primary"
                disabled={loading}
              >
                {loading ? "Verificando..." : "Ya verifiqué mi correo"}
              </button>

              <button type="button" className="verification-button secondary">
                Reenviar enlace
              </button>
            </div>
          </form>

          <p className="verification-help">
            Si el token no llegó al navegador, habilitá <strong>PRINT_VERIFICATION_TOKENS=true</strong>{" "}
            en el backend local y copiá el valor de su consola.
          </p>

          <p className="verification-login">
            <Link to="/">Volver al inicio de sesión</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default EmailVerification;
