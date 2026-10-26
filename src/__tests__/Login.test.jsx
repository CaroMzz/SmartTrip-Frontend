import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../pages/login/Login";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login Component", () => {
  it("renderiza el formulario con campos de email y contraseña", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /iniciar sesión/i })
    ).toBeInTheDocument();
  });

  it("contiene los enlaces para registrarse y para ver el Centro de Ayuda (FAQ)", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByRole("link", { name: /creá tu cuenta/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /ver centro de ayuda \(faq\)/i })
    ).toBeInTheDocument();
  });

  it("ejecuta el submit del formulario y navega hacia /my-trips", () => {
    mockNavigate.mockClear();

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const submitBtn = screen.getByRole("button", { name: /iniciar sesión/i });
    fireEvent.click(submitBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/my-trips");
  });
});
