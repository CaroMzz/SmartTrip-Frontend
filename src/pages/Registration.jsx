import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import TravelHero from "../components/TravelHero";
import { registrar } from "../api";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (form.password.length < 15) {
      setError("La contraseña debe tener al menos 15 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const respuesta = await registrar({
        nombre: form.fullName,
        email: form.email,
        contraseña: form.password,
      });

      sessionStorage.setItem("smarttrip_email", form.email);
      navigate("/verify-email", {
        state: { email: form.email, tokenVerificacion: respuesta.tokenVerificacion },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
                required
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
                minLength={15}
                required
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
                minLength={15}
                required
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
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
