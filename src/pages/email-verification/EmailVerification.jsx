import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { confirmarCorreo, reenviarVerificacion } from "../../api";
import TravelHero from "../../components/TravelHero";
import "./EmailVerification.css";

function EmailVerification() {
  const location = useLocation();
  const { state } = location;
  const email = state?.email;
  const token = new URLSearchParams(location.search).get("token");
  const requestStarted = useRef(false);
  const [status, setStatus] = useState(token ? "confirming" : "waiting");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token || requestStarted.current) return;
    requestStarted.current = true;
    confirmarCorreo(token)
      .then((response) => {
        setStatus("confirmed");
        setMessage(response.mensaje || "Tu correo quedó confirmado. Ya podés iniciar sesión.");
      })
      .catch((requestError) => {
        setStatus("failed");
        setError(requestError.message);
      });
  }, [token]);

  const handleResend = async () => {
    setError("");
    setMessage("");
    if (!email) {
      setError("Volvé al registro para indicar el correo al que querés reenviar el enlace.");
      return;
    }

    setResending(true);
    try {
      const response = await reenviarVerificacion(email);
      setMessage(response.mensaje || `Enviamos un nuevo enlace a ${email}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setResending(false);
    }
  };

  const verificationMessage = status === "confirmed"
    ? message
    : status === "confirming"
      ? "Estamos validando el enlace. Puede tardar unos segundos."
      : state?.correoEnviado === false
        ? `Tu cuenta se creó, pero no se pudo enviar el correo a ${email || "la dirección indicada"}. Podés intentar reenviarlo.`
        : email
          ? `Te enviamos un enlace a ${email}. Abrilo para verificar tu cuenta y empezar a planificar.`
          : "Revisá tu correo para encontrar el enlace de verificación y empezar a planificar.";

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
          <h2>
            {status === "confirmed"
              ? "Correo confirmado"
              : status === "confirming"
                ? "Confirmando tu correo…"
                : "Revisá tu correo"}
          </h2>
          <div className={`verification-icon${status === "failed" ? " failed" : ""}`} aria-hidden="true">
            {status === "failed" ? "!" : "✓"}
          </div>
          <p className="verification-message">{verificationMessage}</p>
          {error && <p className="verification-error" role="alert">{error}</p>}
          {message && status !== "confirmed" && (
            <p className="verification-success" role="status">{message}</p>
          )}
          {status === "confirmed" ? (
            <div className="verification-actions">
              <Link to="/" className="verification-button primary">Iniciar sesión</Link>
            </div>
          ) : status === "confirming" ? null : (
            <div className="verification-actions">
              <Link to="/" className="verification-button primary">Ya verifiqué mi correo</Link>
              <button
                type="button"
                className="verification-button secondary"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? "Reenviando…" : "Reenviar enlace"}
              </button>
            </div>
          )}
          {status !== "confirmed" && (
            <p className="verification-help">¿No llegó? Revisá la carpeta de correo no deseado.</p>
          )}
          <p className="verification-login">
            <Link to="/">Volver al inicio de sesión</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default EmailVerification;
