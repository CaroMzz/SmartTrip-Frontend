import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./EmailResent.css";

function EmailResent() {
  return (
    <div className="email-resent-page">
      <Sidebar />

      <main className="email-resent-main">
        <header className="email-resent-topbar">
          <span>Mi espacio</span>
          <span className="email-resent-currency">USD · Moneda base</span>
        </header>

        <section className="email-resent-card" aria-labelledby="email-resent-title">
          <span className="email-resent-check" aria-hidden="true">✓</span>
          <h1 id="email-resent-title">Enlace reenviado</h1>
          <p>Revisá tu correo y seguí el enlace para verificar tu cuenta.</p>
          <small>
            Esta es una confirmación de demostración. El envío real requiere
            conectar el servicio de correo.
          </small>
          <Link to="/email-verification" className="email-resent-button">
            Volver a verificación
          </Link>
        </section>
      </main>
    </div>
  );
}

export default EmailResent;
