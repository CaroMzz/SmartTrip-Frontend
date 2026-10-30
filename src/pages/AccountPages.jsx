import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  actualizarMiPerfil,
  cambiarContrasena,
  obtenerMiPerfil,
} from "../api";
import { updateStoredUser } from "../auth";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { Notice, PrioritySliders, TransportOptions } from "./travelShared";
import { useOpciones } from "./tripOptions";
import {
  defaultPriorities,
  normalizePriorities,
  rebalancePriorities,
} from "./tripPreferences";
import "./AccountPages.css";

export function Profile() {
  const { transportes, criterios } = useOpciones();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [transport, setTransport] = useState("tren");
  const [priorities, setPriorities] = useState(defaultPriorities);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState("");

  useEffect(() => {
    obtenerMiPerfil()
      .then((response) => {
        const user = response.usuario || response;
        const preferences = user.preferencias || {};
        setProfile(user);
        setName(user.nombre || "");
        setEmail(user.correo || user.email || "");
        setTransport(preferences.transportePreferido || "tren");
        setPriorities(normalizePriorities(preferences));
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});
    const newEmail = email.trim().toLowerCase();
    const emailChanged = newEmail !== (profile?.correo || profile?.email || "");
    setSaving(true);
    try {
      const response = await actualizarMiPerfil({
        nombre: name.trim(),
        transportePreferido: transport,
        prioridades: priorities,
        // El correo solo se envía si cambió: el backend exige la contraseña actual para cambiarlo.
        ...(emailChanged ? { email: newEmail, contrasenaActual: emailPassword } : {}),
      });
      setEmailPassword("");
      const updatedProfile = {
        ...profile,
        ...(response.usuario || {}),
        nombre: name.trim(),
        preferencias: {
          ...(profile?.preferencias || {}),
          ...(response.usuario?.preferencias || {}),
          transportePreferido: transport,
          prioridades: priorities,
        },
      };
      setProfile(updatedProfile);
      updateStoredUser(updatedProfile);
      setSuccess(emailChanged
        ? "Tu perfil se actualizó. Desde ahora iniciá sesión con el correo nuevo; cerramos tus otras sesiones."
        : response.mensaje || "Tu perfil se actualizó correctamente.");
    } catch (saveError) {
      setError(saveError.message);
      setFieldErrors(saveError.errors || {});
    } finally {
      setSaving(false);
    }
  };

  return (
    <WorkspaceLayout title="Mi perfil" description="Actualizá tus datos y preferencias para empezar cada viaje con tus prioridades.">
      {loading ? <p className="account-loading" role="status">Cargando perfil…</p> : (
        <form className="account-form account-panel" onSubmit={save}>
          <Notice>{error}</Notice>
          {success && <Notice type="success">{success}</Notice>}
          <label>
            <span>Nombre</span>
            <input value={name} onChange={(event) => setName(event.target.value)} minLength="2" required />
            {fieldErrors.nombre && <small className="account-field-error">{fieldErrors.nombre}</small>}
          </label>
          <label>
            <span>Correo electrónico</span>
            <input type="email" maxLength="320" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
            {fieldErrors.email && <small className="account-field-error">{fieldErrors.email}</small>}
          </label>
          {email.trim().toLowerCase() !== (profile?.correo || profile?.email || "") && (
            <div>
              <label>
                <span>Contraseña actual</span>
                <input type="password" value={emailPassword} onChange={(event) => setEmailPassword(event.target.value)} required autoComplete="current-password" aria-describedby="email-password-hint" />
              </label>
              <small className="account-field-hint" id="email-password-hint">Para cambiar el correo confirmá tu contraseña. Se cerrarán tus otras sesiones.</small>
            </div>
          )}
          <label>
            <span>Transporte preferido</span>
            <select value={transport} onChange={(event) => setTransport(event.target.value)}>
              <TransportOptions transportes={transportes} />
            </select>
            {fieldErrors.transportePreferido && <small className="account-field-error">{fieldErrors.transportePreferido}</small>}
          </label>
          <section className="account-priorities">
            <div className="trip-section-heading"><h2>Mis prioridades de viaje</h2><p>Se usarán como valores iniciales para tus viajes nuevos.</p></div>
            <PrioritySliders
              criterios={criterios}
              values={priorities}
              onChange={(key, value) => setPriorities((current) => rebalancePriorities(current, key, value))}
            />
            {fieldErrors.prioridades && <small className="account-field-error">{fieldErrors.prioridades}</small>}
          </section>
          <button className="trip-button primary" type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Guardar perfil"}
          </button>
          <Link className="account-secondary-link" to="/change-password">Cambiar contraseña</Link>
        </form>
      )}
    </WorkspaceLayout>
  );
}

export function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});
    if (newPassword.length < 15) {
      setFieldErrors({ nuevaContrasena: "La nueva contraseña debe tener al menos 15 caracteres." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirmar: "Las contraseñas nuevas no coinciden." });
      return;
    }
    setLoading(true);
    try {
      const response = await cambiarContrasena(currentPassword, newPassword);
      setSuccess(response.mensaje || "La contraseña se cambió correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setError(requestError.message);
      setFieldErrors(requestError.errors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorkspaceLayout title="Cambiar contraseña" description="Elegí una contraseña segura de al menos 15 caracteres.">
      <form className="account-form account-panel password-form" noValidate onSubmit={submit}>
        <Notice>{error}</Notice>
        {success && <Notice type="success">{success}</Notice>}
        <label>
          <span>Contraseña actual</span>
          <input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
          {fieldErrors.contrasenaActual && <small className="account-field-error">{fieldErrors.contrasenaActual}</small>}
        </label>
        <label>
          <span>Nueva contraseña</span>
          <input type="password" autoComplete="new-password" minLength="15" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
          {fieldErrors.nuevaContrasena && <small className="account-field-error">{fieldErrors.nuevaContrasena}</small>}
        </label>
        <label>
          <span>Confirmar nueva contraseña</span>
          <input type="password" autoComplete="new-password" minLength="15" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          {fieldErrors.confirmar && <small className="account-field-error">{fieldErrors.confirmar}</small>}
        </label>
        <button className="trip-button primary" type="submit" disabled={loading}>
          {loading ? "Actualizando…" : "Actualizar contraseña"}
        </button>
        <p className="account-hint">La sesión actual permanece activa después del cambio.</p>
      </form>
    </WorkspaceLayout>
  );
}
