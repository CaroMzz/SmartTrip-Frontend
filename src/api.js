import { clearSession, getToken, saveSession } from "./auth";

const API_URL = (
  import.meta.env.VITE_API_URL || "https://smarttrip-backend-naa5.onrender.com"
).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function solicitar(ruta, opciones = {}) {
  const headers = new Headers(opciones.headers || {});
  const token = getToken();

  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (opciones.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, { ...opciones, headers });
  } catch (error) {
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "No se pudo conectar con el servidor. Intentá nuevamente.",
      0
    );
  }

  const texto = await respuesta.text();
  let datos = {};
  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      if (respuesta.ok) {
        throw new ApiError("El servidor devolvió una respuesta inválida.", respuesta.status);
      }
      datos = { mensaje: texto };
    }
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401 && ruta !== "/usuarios/login") {
      clearSession();
      window.dispatchEvent(new Event("smarttrip:session-expired"));
    }
    throw new ApiError(
      datos.mensaje || `Error HTTP ${respuesta.status}`,
      respuesta.status,
      datos.errores || {}
    );
  }

  return datos;
}

const enviar = (metodo, cuerpo) => ({
  method: metodo,
  body: JSON.stringify(cuerpo),
});

export const registrar = (datos) =>
  solicitar("/usuarios/registro", enviar("POST", datos));

export const confirmarCorreo = (token) =>
  solicitar("/usuarios/confirmar-correo", enviar("POST", { token }));

export const reenviarVerificacion = (email) =>
  solicitar("/usuarios/reenviar-verificacion", enviar("POST", { email }));

export const iniciarSesion = async (email, contraseña) => {
  const respuesta = await solicitar(
    "/usuarios/login",
    enviar("POST", { email, contraseña })
  );
  if (!respuesta.token || !respuesta.usuario) {
    throw new ApiError("La respuesta de inicio de sesión no contiene la sesión.", 502);
  }
  saveSession(respuesta.token, respuesta.usuario);
  return respuesta;
};

export const cerrarSesion = () => solicitar("/usuarios/logout", { method: "POST" });

export const obtenerMiPerfil = () => solicitar("/usuarios/me");

export const actualizarMiPerfil = (datos) =>
  solicitar("/usuarios/me", enviar("PATCH", datos));

export const cambiarContrasena = (contrasenaActual, nuevaContrasena) =>
  solicitar("/usuarios/me/contrasena", enviar("PATCH", {
    contrasenaActual,
    nuevaContrasena,
  }));

export const buscarPaises = (consulta) =>
  solicitar(`/destinos/paises?q=${encodeURIComponent(consulta)}`);

export const buscarCiudades = (consulta, codigosPaises) =>
  solicitar(
    `/destinos/buscar?q=${encodeURIComponent(consulta)}&paises=${encodeURIComponent(codigosPaises.join(","))}`
  );

export const obtenerViajes = () => solicitar("/viajes");

export const obtenerViaje = (id) => solicitar(`/viajes/${encodeURIComponent(id)}`);

export const crearViaje = (datos) =>
  solicitar("/viajes", enviar("POST", datos));

export const actualizarViaje = (id, datos) =>
  solicitar(`/viajes/${encodeURIComponent(id)}`, enviar("PATCH", datos));

export const eliminarViaje = (id) =>
  solicitar(`/viajes/${encodeURIComponent(id)}`, { method: "DELETE" });

export const guardarConfiguracion = (id, datos) =>
  solicitar(
    `/viajes/${encodeURIComponent(id)}/configuracion`,
    enviar("PATCH", datos)
  );

export const obtenerItinerarios = (id) =>
  solicitar(`/viajes/${encodeURIComponent(id)}/itinerarios`);

export const generarItinerarios = (id) =>
  solicitar(`/viajes/${encodeURIComponent(id)}/itinerarios/generar`, {
    method: "POST",
  });

export const seleccionarItinerario = (id, itinerarioId) =>
  solicitar(
    `/viajes/${encodeURIComponent(id)}/itinerario-seleccionado`,
    enviar("PUT", { itinerarioId })
  );

export const obtenerItinerario = (id) =>
  solicitar(`/viajes/${encodeURIComponent(id)}/itinerario`);

export const obtenerDestino = (idExterno) =>
  solicitar(`/destinos/${encodeURIComponent(idExterno)}`);

export const obtenerCalendario = (id) =>
  solicitar(`/viajes/${encodeURIComponent(id)}/calendario`);

export const obtenerPresupuesto = (id) =>
  solicitar(`/viajes/${encodeURIComponent(id)}/presupuesto`);
