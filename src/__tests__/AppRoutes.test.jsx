import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AppRoutes from "../routes/AppRoutes";
import App from "../App";

const api = vi.hoisted(() => ({
  obtenerViajes: vi.fn(),
  obtenerOpciones: vi.fn(),
}));

vi.mock("../api", () => api);

const renderEn = (ruta) => render(
  <MemoryRouter initialEntries={[ruta]}>
    <AppRoutes />
  </MemoryRouter>
);

describe("AppRoutes", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    api.obtenerViajes.mockResolvedValue({ viajes: [] });
    api.obtenerOpciones.mockResolvedValue(null);
  });

  it("manda al login si se entra a una ruta protegida sin sesión", () => {
    renderEn("/my-trips");

    expect(screen.getByRole("heading", { name: "¡Qué bueno verte de nuevo!" })).toBeInTheDocument();
  });

  it("muestra la ruta protegida si hay sesión", async () => {
    localStorage.setItem("smarttrip.token", "token");

    renderEn("/my-trips");

    expect(await screen.findByRole("heading", { name: "Tu próxima aventura empieza acá" })).toBeInTheDocument();
  });

  it("vuelve al login cuando la sesión vence", async () => {
    localStorage.setItem("smarttrip.token", "token");
    renderEn("/my-trips");
    await screen.findByRole("heading", { name: "Tu próxima aventura empieza acá" });

    act(() => {
      window.dispatchEvent(new Event("smarttrip:session-expired"));
    });

    expect(screen.getByRole("heading", { name: "¡Qué bueno verte de nuevo!" })).toBeInTheDocument();
  });

  it.each([
    ["/register", "Tu próximo viaje comienza acá."],
    ["/email-verification", "Revisá tu correo"],
    ["/ayuda", "Preguntas Frecuentes y Guía de Tareas"],
    ["/una-ruta-que-no-existe", "¡Qué bueno verte de nuevo!"],
  ])("resuelve %s", (ruta, titulo) => {
    renderEn(ruta);

    expect(screen.getByRole("heading", { name: titulo })).toBeInTheDocument();
  });

  it("App monta las rutas dentro del router del navegador", () => {
    window.history.pushState({}, "", "/");

    render(<App />);

    expect(screen.getByRole("heading", { name: "¡Qué bueno verte de nuevo!" })).toBeInTheDocument();
  });
});
