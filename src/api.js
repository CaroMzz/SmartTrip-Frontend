import { getApiUrl } from "./config/api";

async function solicitar(ruta, opciones = {}) {
  const respuesta = await fetch(`${getApiUrl()}${ruta}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...(opciones.headers || {}),
    },
  });

  const texto = await respuesta.text();
  const datos = texto ? JSON.parse(texto) : {};

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || `Error HTTP ${respuesta.status}`);
  }

  return datos;
}

export const registrar = ({ nombre, email, contraseña }) =>
  solicitar("/usuarios/registro", {
    method: "POST",
    body: JSON.stringify({ nombre, email, contraseña }),
  });

export const confirmarCorreo = (token) =>
  solicitar("/usuarios/confirmar-correo", {
    method: "POST",
    body: JSON.stringify({ token }),
  });

export const iniciarSesion = (email, contraseña) =>
  solicitar("/usuarios/login", {
    method: "POST",
    body: JSON.stringify({ email, contraseña }),
  });

export const obtenerMiPerfil = (token) =>
  solicitar("/usuarios/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
