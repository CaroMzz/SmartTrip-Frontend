import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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

  it("no envía el registro si el dominio del correo está malformado", () => {
    render(
      <BrowserRouter>
        <Registration />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: "Ana Pérez" } });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: "ana@.example.com" } });
    fireEvent.change(screen.getByLabelText(/^contraseña/i), { target: { value: "una clave bien larga" } });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: "una clave bien larga" } });
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Revisá el formato de tu correo electrónico."
    );
  });
});
