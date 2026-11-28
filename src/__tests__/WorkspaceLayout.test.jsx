import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { updateStoredUser } from "../auth";

const mockNavigate = vi.fn();
const api = vi.hoisted(() => ({ cerrarSesion: vi.fn() }));

vi.mock("../api", () => api);
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderLayout = (props = {}) => render(
  <MemoryRouter initialEntries={["/my-trips"]}>
    <WorkspaceLayout title="Mis viajes" {...props}>contenido</WorkspaceLayout>
  </MemoryRouter>
);

describe("WorkspaceLayout", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockNavigate.mockReset();
    api.cerrarSesion.mockReset();
  });

  it("marca la sección actual y saluda con el nombre del usuario", () => {
    updateStoredUser({ nombre: "ana pérez" });

    renderLayout({ description: "Descripción de la página" });

    expect(screen.getByRole("link", { name: "Mis viajes" })).toHaveClass("active");
    expect(screen.getByRole("link", { name: /Nuevo viaje/ })).not.toHaveClass("active");
    expect(screen.getByRole("link", { name: "Hola, ana" })).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("Descripción de la página")).toBeInTheDocument();
  });

  it.each([
    [{ correo: "ana@example.test" }, "ana@example.test"],
    [{ email: "luz@example.test" }, "luz@example.test"],
    [null, "Mi cuenta"],
  ])("muestra un nombre de respaldo para %j", (usuario, nombre) => {
    if (usuario) updateStoredUser(usuario);

    renderLayout();

    expect(screen.getByText(nombre, { selector: "strong" })).toBeInTheDocument();
  });

  it("actualiza el usuario cuando cambia en otra parte de la app", () => {
    updateStoredUser({ nombre: "Ana" });
    renderLayout();

    act(() => updateStoredUser({ nombre: "Beatriz" }));

    expect(screen.getByText("Beatriz", { selector: "strong" })).toBeInTheDocument();
  });

  it("cierra la sesión en el servidor y vuelve al login", async () => {
    api.cerrarSesion.mockResolvedValue({});
    localStorage.setItem("smarttrip.token", "token");
    renderLayout();

    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true, state: undefined }));
    expect(localStorage.getItem("smarttrip.token")).toBeNull();
  });

  it("cierra la sesión local aunque falle el servidor y avisa el motivo", async () => {
    api.cerrarSesion.mockRejectedValue(new Error("Servidor no disponible"));
    renderLayout();

    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/", {
      replace: true,
      state: { notice: "La sesión local se cerró. Servidor no disponible" },
    }));
  });

  it("usa un motivo genérico si el servidor falla sin un Error", async () => {
    api.cerrarSesion.mockRejectedValue("sin detalle");
    renderLayout();

    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/", {
      replace: true,
      state: { notice: "La sesión local se cerró. No se pudo cerrar la sesión en el servidor." },
    }));
  });
});
