import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./Profile.css";

const initialProfile = {
  name: "Florencia López",
  email: "florencia.lopez@example.com",
  transport: "Tren",
  savingPriority: 65,
};

function Profile() {
  const [profile, setProfile] = useState(initialProfile);
  const [saved, setSaved] = useState(false);

  function updateProfile(field, value) {
    setProfile((currentProfile) => ({ ...currentProfile, [field]: value }));
    setSaved(false);
  }

  function handleProfileSubmit(event) {
    event.preventDefault();
    setSaved(true);
  }

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="profile-page">
      <Sidebar />

      <main className="profile-main">
        <header className="profile-header">
          <div>
            <p className="profile-breadcrumb">
              <Link to="/my-trips">Mis viajes</Link> / Mi perfil
            </p>
            <h1>Tu perfil</h1>
            <p className="profile-description">
              Administrá tus datos y preferencias de viaje.
            </p>
          </div>
          <span className="profile-account-status">Cuenta verificada</span>
        </header>

        <div className="profile-layout">
          <section className="profile-card">
            <div className="profile-user">
              <div className="profile-avatar" aria-hidden="true">{initials}</div>
              <div>
                <h2>{profile.name}</h2>
                <span>Viajera · Miembro desde 2026</span>
              </div>
            </div>

            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <div className="profile-section-heading">
                <h3>Datos personales</h3>
                <p>Esta información se usa para personalizar tu experiencia.</p>
              </div>

              <label className="profile-field" htmlFor="profile-name">
                <span>Nombre completo</span>
                <input
                  id="profile-name"
                  type="text"
                  value={profile.name}
                  onChange={(event) => updateProfile("name", event.target.value)}
                  required
                />
              </label>

              <label className="profile-field" htmlFor="profile-email">
                <span>Correo electrónico</span>
                <input
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  onChange={(event) => updateProfile("email", event.target.value)}
                  required
                />
                <small>Correo verificado</small>
              </label>

              <div className="profile-preferences">
                <div className="profile-section-heading">
                  <h3>Preferencias de viaje</h3>
                  <p>Podés cambiarlas en cualquier momento.</p>
                </div>

                <label className="profile-field" htmlFor="preferred-transport">
                  <span>Transporte preferido</span>
                  <select
                    id="preferred-transport"
                    value={profile.transport}
                    onChange={(event) => updateProfile("transport", event.target.value)}
                  >
                    <option>Tren</option>
                    <option>Avión</option>
                    <option>Auto</option>
                    <option>Sin preferencia</option>
                  </select>
                </label>

                <div className="profile-priority-heading">
                  <label htmlFor="saving-priority">Prioridad de ahorro</label>
                  <strong>{profile.savingPriority}%</strong>
                </div>
                <input
                  className="profile-priority-slider"
                  id="saving-priority"
                  type="range"
                  min="0"
                  max="100"
                  value={profile.savingPriority}
                  style={{ "--saving-priority": `${profile.savingPriority}%` }}
                  onChange={(event) =>
                    updateProfile("savingPriority", Number(event.target.value))
                  }
                />
                <div className="profile-slider-labels">
                  <span>Experiencias</span>
                  <span>Ahorro</span>
                </div>
              </div>

              <div className="profile-actions">
                <button className="profile-save-button" type="submit">
                  Guardar cambios
                </button>
                {saved && <span className="profile-save-status" role="status">Cambios guardados en esta vista.</span>}
              </div>
            </form>
          </section>

          <aside className="profile-aside">
            <section className="profile-trust-card">
              <span className="profile-trust-mark" aria-hidden="true">✓</span>
              <h2>Tu cuenta está protegida</h2>
              <p>Tu perfil y tus viajes son privados y solo vos podés administrarlos.</p>
              <div className="profile-verified-email">
                <span>Correo electrónico</span>
                <strong>{profile.email}</strong>
                <small>Verificado</small>
              </div>
            </section>

            <section className="profile-security-card">
              <div>
                <h2>Seguridad</h2>
                <p>Mantené segura tu cuenta con una contraseña actualizada.</p>
              </div>
              <Link to="/change-password" className="profile-password-toggle">
                Cambiar contraseña
              </Link>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Profile;