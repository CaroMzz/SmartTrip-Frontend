import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "../components/Sidebar";

describe("Sidebar Component", () => {
  it("renderiza la marca de SmartTrip y los enlaces de navegación", () => {
    render(
      <MemoryRouter initialEntries={["/my-trips"]}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText("SmartTrip")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /mis viajes/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /mi perfil/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ayuda y faq/i })).toBeInTheDocument();
  });

  it("marca el enlace 'Mis viajes' como activo cuando la ruta es /my-trips", () => {
    render(
      <MemoryRouter initialEntries={["/my-trips"]}>
        <Sidebar />
      </MemoryRouter>
    );

    const misViajesLink = screen.getByRole("link", { name: /mis viajes/i });
    expect(misViajesLink).toHaveClass("active");

    const perfilLink = screen.getByRole("link", { name: /mi perfil/i });
    expect(perfilLink).not.toHaveClass("active");
  });

  it("muestra la información del usuario en el pie del sidebar", () => {
    render(
      <MemoryRouter initialEntries={["/my-trips"]}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText("Florencia López")).toBeInTheDocument();
    expect(screen.getByText("Viajera")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cerrar sesión/i })).toBeInTheDocument();
  });
});
