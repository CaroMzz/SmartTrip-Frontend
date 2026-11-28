import { afterEach, describe, expect, it, vi } from "vitest";

// API_URL se calcula al importar el módulo, así que cada caso lo vuelve a importar con otra variable.
async function cargarConfig(url) {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", url);
  return import("../config/api");
}

describe("config/api (VITE_API_URL)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("devuelve la URL sin espacios ni barras finales", async () => {
    const { getApiUrl, default: API_URL } = await cargarConfig("  https://api.example.test/// ");

    expect(getApiUrl()).toBe("https://api.example.test");
    expect(API_URL).toBe("https://api.example.test");
  });

  it("acepta URLs http", async () => {
    const { getApiUrl } = await cargarConfig("http://localhost:3000");

    expect(getApiUrl()).toBe("http://localhost:3000");
  });

  it("falla si la variable está vacía", async () => {
    const { getApiUrl } = await cargarConfig("   ");

    expect(() => getApiUrl()).toThrow("VITE_API_URL no está configurada.");
  });

  it("falla si no es una URL absoluta", async () => {
    const { getApiUrl } = await cargarConfig("api.example.test");

    expect(() => getApiUrl()).toThrow("VITE_API_URL debe ser una URL absoluta HTTP o HTTPS.");
  });

  it("falla si el protocolo no es HTTP ni HTTPS", async () => {
    const { getApiUrl } = await cargarConfig("ftp://api.example.test");

    expect(() => getApiUrl()).toThrow("VITE_API_URL debe usar el protocolo HTTP o HTTPS.");
  });
});
