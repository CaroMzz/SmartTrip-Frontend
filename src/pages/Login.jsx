import { useState } from "react";
import { Link } from "react-router-dom";

import TravelHero from "../components/TravelHero";
import "./Login.css";

const initialState = {
  email: "",
  password: "",
};

function Login() {
  const [form, setForm] = useState(initialState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="login-page">
      <TravelHero />

      <section className="login-form-section">
        <div className="login-form-container">
          <p className="form-overline">BIENVENIDO A SMARTTRIP</p>

          <h2>¡Qué bueno verte de nuevo!</h2>

          <p className="form-description">Iniciá sesión y retomá tus planes</p>

          <form className="login-form" onSubmit={handleSubmit}>
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

            <button type="submit" className="submit-button">
              Iniciar sesión
            </button>
          </form>

          <p className="signup-link">
            ¿Todavia no tenés una cuenta? {" "}
            <Link to="/register">Creá tu cuenta</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;
