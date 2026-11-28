import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../api";
import { getToken, saveSession, setCurrentTripId } from "../auth";

const BASE = "http://localhost:3000";

const respuesta = (cuerpo, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  text: async () => (typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo)),
});

describe("api: solicitudes y manejo de errores", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    globalThis.fetch = vi.fn().mockResolvedValue(respuesta({ ok: true }));
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("usa el token de la sesión guardada si no recibe uno", async () => {
    saveSession("token-guardado", null);

    await api.obtenerMiPerfil();

    expect(globalThis.fetch).toHaveBeenCalledWith(`${BASE}/usuarios/me`, expect.objectContaining({
      headers: { "Content-Type": "application/json", Authorization: "Bearer token-guardado" },
    }));
  });

  it("no pisa un header Authorization que ya viene en la solicitud", async () => {
    saveSession("token-guardado", null);

    await api.obtenerMiPerfil("token-explicito");

    expect(globalThis.fetch.mock.calls[0][1].headers.Authorization).toBe("Bearer token-explicito");
  });

  it("transforma un error de red en ApiError con estado 0", async () => {
    globalThis.fetch.mockRejectedValueOnce(new Error("Failed to fetch"));

    const error = await api.obtenerViajes().catch((e) => e);

    expect(error).toBeInstanceOf(api.ApiError);
    expect(error).toMatchObject({ name: "ApiError", message: "Failed to fetch", status: 0, errors: {} });
  });

  it("usa un mensaje genérico si la red falla sin un Error", async () => {
    globalThis.fetch.mockRejectedValueOnce("sin conexión");

    await expect(api.obtenerViajes()).rejects.toThrow("No se pudo conectar con el servidor. Intentá nuevamente.");
  });

  it("devuelve un objeto vacío si el servidor responde sin cuerpo", async () => {
    globalThis.fetch.mockResolvedValueOnce(respuesta(""));

    await expect(api.eliminarViaje("7")).resolves.toEqual({});
  });

  it("rechaza una respuesta exitosa que no es JSON", async () => {
    globalThis.fetch.mockResolvedValueOnce(respuesta("<html>", { status: 200 }));

    await expect(api.obtenerViajes()).rejects.toMatchObject({
      message: "El servidor devolvió una respuesta inválida.",
      status: 200,
    });
  });

  it("usa el texto de un error que no es JSON como mensaje", async () => {
    globalThis.fetch.mockResolvedValueOnce(respuesta("Servicio caído", { ok: false, status: 503 }));

    await expect(api.obtenerViajes()).rejects.toMatchObject({ message: "Servicio caído", status: 503 });
  });

  it("arma el mensaje con el estado HTTP y expone los errores por campo", async () => {
    globalThis.fetch.mockResolvedValueOnce(respuesta({ errores: { nombre: "Requerido" } }, { ok: false, status: 422 }));

    await expect(api.crearViaje({})).rejects.toMatchObject({
      message: "Error HTTP 422",
      status: 422,
      errors: { nombre: "Requerido" },
    });
  });

  it("cierra la sesión y avisa si el servidor responde 401 fuera del login", async () => {
    saveSession("token-vencido", { nombre: "Ana" });
    setCurrentTripId("7");
    const listener = vi.fn();
    window.addEventListener("smarttrip:session-expired", listener);
    globalThis.fetch.mockResolvedValueOnce(respuesta({ mensaje: "Sesión vencida" }, { ok: false, status: 401 }));

    await expect(api.obtenerViajes()).rejects.toThrow("Sesión vencida");

    expect(getToken()).toBeNull();
    expect(sessionStorage.getItem("smarttrip.currentTripId")).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener("smarttrip:session-expired", listener);
  });

  it("iniciarSesion guarda la sesión con el usuario recibido", async () => {
    globalThis.fetch.mockResolvedValueOnce(respuesta({ token: "token-nuevo", usuario: { nombre: "Ana" } }));

    await api.iniciarSesion("ana@example.test", "clave");

    expect(getToken()).toBe("token-nuevo");
    expect(JSON.parse(localStorage.getItem("smarttrip.user"))).toEqual({ nombre: "Ana" });
  });

  it("iniciarSesion falla si la respuesta no trae token", async () => {
    globalThis.fetch.mockResolvedValueOnce(respuesta({ usuario: { nombre: "Ana" } }));

    await expect(api.iniciarSesion("ana@example.test", "clave")).rejects.toMatchObject({
      message: "La respuesta no contiene el token de sesión.",
      status: 502,
    });
    expect(getToken()).toBeNull();
  });
});

describe("api: rutas de cada endpoint", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
    globalThis.fetch = vi.fn().mockResolvedValue(respuesta({}));
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it.each([
    ["reenviarVerificacion", () => api.reenviarVerificacion("ana@example.test"), "/usuarios/reenviar-verificacion", "POST", { email: "ana@example.test" }],
    ["cerrarSesion", () => api.cerrarSesion(), "/usuarios/logout", "POST", undefined],
    ["actualizarMiPerfil", () => api.actualizarMiPerfil({ nombre: "Ana" }), "/usuarios/me", "PATCH", { nombre: "Ana" }],
    ["cambiarContrasena", () => api.cambiarContrasena("vieja", "nueva"), "/usuarios/me/contrasena", "PATCH", { contrasenaActual: "vieja", nuevaContrasena: "nueva" }],
    ["buscarPaises", () => api.buscarPaises("Españ a"), "/destinos/paises?q=Espa%C3%B1%20a", undefined, undefined],
    ["buscarCiudades", () => api.buscarCiudades("San José", ["CR", "US"]), "/destinos/buscar?q=San%20Jos%C3%A9&paises=CR%2CUS", undefined, undefined],
    ["obtenerViajes", () => api.obtenerViajes(), "/viajes", undefined, undefined],
    ["obtenerViaje", () => api.obtenerViaje("a/b"), "/viajes/a%2Fb", undefined, undefined],
    ["crearViaje", () => api.crearViaje({ nombre: "Viaje" }), "/viajes", "POST", { nombre: "Viaje" }],
    ["actualizarViaje", () => api.actualizarViaje("7", { nombre: "Otro" }), "/viajes/7", "PATCH", { nombre: "Otro" }],
    ["eliminarViaje", () => api.eliminarViaje("7"), "/viajes/7", "DELETE", undefined],
    ["guardarConfiguracion", () => api.guardarConfiguracion("7", { moneda: "USD" }), "/viajes/7/configuracion", "PATCH", { moneda: "USD" }],
    ["obtenerItinerarios", () => api.obtenerItinerarios("7"), "/viajes/7/itinerarios", undefined, undefined],
    ["generarItinerarios", () => api.generarItinerarios("7"), "/viajes/7/itinerarios/generar", "POST", undefined],
    ["seleccionarItinerario", () => api.seleccionarItinerario("7", "41"), "/viajes/7/itinerario-seleccionado", "PUT", { itinerarioId: "41" }],
    ["obtenerItinerario", () => api.obtenerItinerario("7"), "/viajes/7/itinerario", undefined, undefined],
    ["obtenerDestino sin datos", () => api.obtenerDestino("osm-1"), "/destinos/osm-1", undefined, undefined],
    ["obtenerDestino con nombre y país", () => api.obtenerDestino("osm-1", { nombre: "París", pais: "Francia" }), "/destinos/osm-1?nombre=Par%C3%ADs&pais=Francia", undefined, undefined],
    ["obtenerDestino solo con país", () => api.obtenerDestino("osm-1", { pais: "Francia" }), "/destinos/osm-1?pais=Francia", undefined, undefined],
    ["obtenerOpciones", () => api.obtenerOpciones(), "/opciones", undefined, undefined],
    ["obtenerCalendario", () => api.obtenerCalendario("7"), "/viajes/7/calendario", undefined, undefined],
    ["obtenerPresupuesto", () => api.obtenerPresupuesto("7"), "/viajes/7/presupuesto", undefined, undefined],
  ])("%s llama a la ruta correcta", async (_nombre, llamar, ruta, metodo, cuerpo) => {
    await llamar();

    const [url, opciones] = globalThis.fetch.mock.calls[0];
    expect(url).toBe(`${BASE}${ruta}`);
    expect(opciones.method).toBe(metodo);
    expect(opciones.body).toBe(cuerpo === undefined ? undefined : JSON.stringify(cuerpo));
  });
});
