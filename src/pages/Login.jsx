import { useState } from "react";
import { Link } from "react-router-dom";

import TravelHero from "../components/TravelHero";
import { iniciarSesion } from "../api";
import "./Login.css";

const initialState = {
  email: "",
  password: "",
};

function Login() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await iniciarSesion(form.email, form.password);
      sessionStorage.setItem("smarttrip_token", data.token);
      sessionStorage.setItem("smarttrip_user", JSON.stringify(data.usuario));
      setSuccess("Sesión iniciada correctamente.");
      setForm(initialState);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
                required
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
                required
              />
            </div>

            {error && <p className="form-error">{error}</p>}
            {success && <p className="form-success">{success}</p>}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="signup-link">
            ¿Todavia no tenés una cuenta? {""}
            <Link to="/register">Creá tu cuenta</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;
