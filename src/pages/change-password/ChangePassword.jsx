import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./ChangePassword.css";

function ChangePassword() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const currentPassword = values.get("current-password");
    const newPassword = values.get("new-password");
    const confirmPassword = values.get("confirm-password");

    if (newPassword !== confirmPassword) {
      setMessageType("error");
      setMessage("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    if (newPassword === currentPassword) {
      setMessageType("error");
      setMessage("La nueva contraseña debe ser distinta de la actual.");
      return;
    }

    setMessageType("info");
    setMessage(
      "Los datos son válidos, pero el cambio todavía no se puede guardar porque falta conectar el servicio de cuenta.",
    );
  }

  return (
    <div className="change-password-page">
      <Sidebar />

      <main className="change-password-main">
        <header className="change-password-header">
          <div>
            <p className="change-password-breadcrumb">
              <Link to="/profile">Mi perfil</Link> / Seguridad
            </p>
            <h1>Cambiar contraseña</h1>
            <p className="change-password-description">
              Elegí una contraseña segura para proteger tu cuenta.
            </p>
          </div>
          <span className="change-password-status">Cuenta verificada</span>
        </header>

        <div className="change-password-layout">
          <section className="change-password-card">
            <div className="change-password-card-heading">
              <span className="password-lock" aria-hidden="true">◆</span>
              <div>
                <h2>Actualizá tus datos de acceso</h2>
                <p>Usá al menos 8 caracteres y evitá reutilizar una contraseña anterior.</p>
              </div>
            </div>

            <form className="change-password-form" onSubmit={handleSubmit}>
              <PasswordField
                id="current-password"
                name="current-password"
                label="Contraseña actual"
                autoComplete="current-password"
              />
              <PasswordField
                id="new-password"
                name="new-password"
                label="Nueva contraseña"
                autoComplete="new-password"
                minLength={8}
                helper="Debe tener al menos 8 caracteres."
              />
              <PasswordField
                id="confirm-password"
                name="confirm-password"
                label="Repetir nueva contraseña"
                autoComplete="new-password"
                minLength={8}
              />

              {message && (
                <p className={`password-feedback ${messageType}`} role="status">
                  {message}
                </p>
              )}

              <div className="password-actions">
                <Link to="/profile" className="cancel-password-button">
                  Cancelar
                </Link>
                <button type="submit" className="save-password-button">
                  Validar cambio
                </button>
              </div>
            </form>
          </section>

          <aside className="password-security-note">
            <span className="password-security-icon" aria-hidden="true">✓</span>
            <h2>Recomendaciones</h2>
            <ul>
              <li>Combiná letras, números y símbolos.</li>
              <li>No uses la misma contraseña en otros sitios.</li>
              <li>No compartas tus datos de acceso.</li>
            </ul>
          </aside>
        </div>
      </main>
    </div>
  );
}

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  minLength,
  helper,
}) {
  return (
    <div className="password-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type="password"
        autoComplete={autoComplete}
        minLength={minLength}
        required
      />
      {helper && <small>{helper}</small>}
    </div>
  );
}

export default ChangePassword;
