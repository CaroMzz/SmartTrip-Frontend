import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { registrar, iniciarSesion, confirmarCorreo, obtenerMiPerfil } from "../api";

describe("API Client Module (src/api.js)", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("registrar envía un POST con nombre, email y contraseña a /usuarios/registro", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ mensaje: "Usuario registrado con éxito" }),
    });

    const datos = await registrar({
      nombre: "Juan Perez",
      email: "juan@example.com",
      contraseña: "claveSegura12345",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/usuarios/registro"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: "Juan Perez",
          email: "juan@example.com",
          contraseña: "claveSegura12345",
        }),
      })
    );
    expect(datos.mensaje).toBe("Usuario registrado con éxito");
  });

  it("iniciarSesion envía un POST con credenciales a /usuarios/login", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ token: "token_mock_123" }),
    });

    const res = await iniciarSesion("test@smarttrip.com", "miClaveSecreta123");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/usuarios/login"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "test@smarttrip.com",
          contraseña: "miClaveSecreta123",
        }),
      })
    );
    expect(res.token).toBe("token_mock_123");
  });

  it("confirmarCorreo envía el token de verificación", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ mensaje: "Correo confirmado" }),
    });

    const res = await confirmarCorreo("token_hash_abc");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/usuarios/confirmar-correo"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ token: "token_hash_abc" }),
      })
    );
    expect(res.mensaje).toBe("Correo confirmado");
  });

  it("obtenerMiPerfil envía el header Authorization Bearer", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ usuario: { email: "ana@test.com" } }),
    });

    const res = await obtenerMiPerfil("mi_token_bearer");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/usuarios/me"),
      expect.objectContaining({
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer mi_token_bearer",
        },
      })
    );
    expect(res.usuario.email).toBe("ana@test.com");
  });

  it("lanza un error descriptivo si el servidor responde con status no ok", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ mensaje: "Credenciales inválidas" }),
    });

    await expect(iniciarSesion("error@test.com", "mal")).rejects.toThrow(
      "Credenciales inválidas"
    );
  });
});
