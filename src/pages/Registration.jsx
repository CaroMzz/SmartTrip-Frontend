import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import TravelHero from "../components/TravelHero";
import "./Registration.css";

const initialState = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function Registration() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/verify-email");
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

          <form className="registration-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Nombre completo</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Florencia Lopez"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="florencia@ejemplo.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirma tu contraseña"
              />
            </div>

            <button type="submit" className="submit-button">
              Crear cuenta
            </button>
          </form>

          <p className="login-link">
            ¿Ya tenés una cuenta? {" "}
            <Link to="/">Iniciá sesión</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Registration;
