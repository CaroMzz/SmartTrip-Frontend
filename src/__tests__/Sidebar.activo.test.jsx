import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const renderEn = (ruta) => render(
  <MemoryRouter initialEntries={[ruta]}>
    <Sidebar />
  </MemoryRouter>
);

describe("Sidebar: enlace activo según la ruta", () => {
  it.each([
    ["/profile", /mi perfil/i],
    ["/change-password", /mi perfil/i],
    ["/faq", /ayuda y faq/i],
    ["/ayuda", /ayuda y faq/i],
  ])("en %s marca solo el enlace que corresponde", (ruta, activo) => {
    renderEn(ruta);

    expect(screen.getByRole("link", { name: activo })).toHaveClass("active");
    expect(screen.getByRole("link", { name: /mis viajes/i })).not.toHaveClass("active");
  });
});
