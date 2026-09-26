import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">✦</span>
        <span>SmartTrip</span>
      </div>

      <p className="sidebar-section-title">TU PRÓXIMA HISTORIA</p>

      <nav className="sidebar-navigation">
        <Link to="/my-trips" className="sidebar-link active">
          <span>▣</span>
          Mis viajes
        </Link>

        <Link to="/profile" className="sidebar-link">
          <span>♙</span>
          Mi perfil
        </Link>
      </nav>

      <div className="sidebar-message">
        <strong>✧ Un viaje, a tu medida.</strong>

        <p>
          Tus destinos, tus tiempos y tu presupuesto.
        </p>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">FL</div>

        <div>
          <strong>Florencia López</strong>
          <span>Viajera</span>
        </div>
      </div>

      <button className="logout-button">
        ↪ Cerrar sesión
      </button>
    </aside>
  );
}

export default Sidebar;