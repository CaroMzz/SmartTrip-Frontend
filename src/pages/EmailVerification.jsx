import { Link } from "react-router-dom";
import TravelHero from "../components/TravelHero";
import "./EmailVerification.css";

function EmailVerification() {
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
          <p className="verification-overline">
            TU ESPACIO PARA VIAJAR
          </p>

          <h2>Revisá tu correo</h2>

          <div className="verification-icon" aria-hidden="true">
            ✓
          </div>

          <p className="verification-message">
            Te enviamos un enlace a florencia@ejemplo.com. Abrilo
            para verificar tu cuenta y empezar a planificar.
          </p>

          <div className="verification-actions">
            <button
              type="button"
              className="verification-button primary"
            >
              Ya verifiqué mi correo
            </button>

            <button
              type="button"
              className="verification-button secondary"
            >
              Reenviar enlace
            </button>
          </div>

          <p className="verification-help">
            ¿No llegó? Revisá la carpeta de correo no deseado.
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