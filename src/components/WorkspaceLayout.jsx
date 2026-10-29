import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cerrarSesion } from "../api";
import { clearSession, getStoredUser } from "../auth";
import "./WorkspaceLayout.css";

const navigation = [
  { to: "/my-trips", label: "Mis viajes", icon: "✦" },
  { to: "/new-trip", label: "Nuevo viaje", icon: "+" },
  { to: "/itinerary", label: "Itinerario", icon: "⌁" },
  { to: "/trip-calendar", label: "Calendario", icon: "▦" },
  { to: "/trip-budget", label: "Presupuesto", icon: "$" },
  { to: "/profile", label: "Mi perfil", icon: "○" },
  { to: "/change-password", label: "Cambiar contraseña", icon: "◇" },
];

function WorkspaceLayout({ title, description, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getStoredUser);
  const userName = user?.nombre || user?.correo || user?.email || "Mi cuenta";

  useEffect(() => {
    const refreshUser = () => setUser(getStoredUser());
    window.addEventListener("smarttrip:user-updated", refreshUser);
    return () => window.removeEventListener("smarttrip:user-updated", refreshUser);
  }, []);

  const handleLogout = async () => {
    let message = "";
    try {
      await cerrarSesion();
    } catch (error) {
      message = error instanceof Error ? error.message : "No se pudo cerrar la sesión en el servidor.";
    } finally {
      clearSession();
      navigate("/", {
        replace: true,
        state: message ? { notice: `La sesión local se cerró. ${message}` } : undefined,
      });
    }
  };

  return (
    <div className="workspace">
      <aside className="workspace-sidebar">
        <NavLink className="workspace-brand" to="/my-trips" aria-label="SmartTrip, inicio">
          <span className="workspace-brand-mark">✦</span>
          <span>SmartTrip</span>
        </NavLink>

        <p className="workspace-nav-label">PLANIFICACIÓN</p>
        <nav className="workspace-nav" aria-label="Navegación principal">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `workspace-nav-link${isActive ? " active" : ""}`}
            >
              <span className="workspace-nav-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="workspace-user">
          <div className="workspace-avatar" aria-hidden="true">
            {userName.slice(0, 1).toUpperCase()}
          </div>
          <div className="workspace-user-details">
            <strong>{userName}</strong>
            <span>Viajero SmartTrip</span>
          </div>
        </div>
        <button className="workspace-logout" type="button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </aside>

      <main className="workspace-main">
        <header className="workspace-topbar">
          <span>Tu espacio para viajar</span>
          <NavLink to="/profile">Hola, {userName.split(" ")[0]}</NavLink>
        </header>
        <section className="workspace-content" key={location.pathname}>
          <div className="workspace-heading">
            <div>
              <p className="workspace-eyebrow">SMARTTRIP · PLANIFICACIÓN</p>
              <h1>{title}</h1>
              {description && <p className="workspace-description">{description}</p>}
            </div>
          </div>
          {children}
        </section>
      </main>
    </div>
  );
}

export default WorkspaceLayout;
