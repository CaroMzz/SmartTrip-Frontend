import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Registration from "../pages/registration/Registration";

describe("Registration Component", () => {
  it("renderiza todos los campos obligatorios del registro", () => {
    render(
      <BrowserRouter>
        <Registration />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /crear cuenta/i })
    ).toBeInTheDocument();
  });

  it("ofrece un enlace hacia el inicio de sesión", () => {
    render(
      <BrowserRouter>
        <Registration />
      </BrowserRouter>
    );

    expect(
      screen.getByRole("link", { name: /iniciá sesión/i })
    ).toBeInTheDocument();
  });
});
