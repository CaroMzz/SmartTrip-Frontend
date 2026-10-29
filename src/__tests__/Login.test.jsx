import { beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../pages/login/Login";

const mockNavigate = vi.fn();
const mockIniciarSesion = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../api", () => ({
  iniciarSesion: (...args) => mockIniciarSesion(...args),
}));

describe("Login Component", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockIniciarSesion.mockReset();
  });

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

  it("inicia sesión con las credenciales ingresadas y navega solo si son válidas", async () => {
    mockIniciarSesion.mockResolvedValueOnce({ token: "token-valido" });
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "clave-correcta" },
    });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockIniciarSesion).toHaveBeenCalledWith(
        "ana@example.com",
        "clave-correcta"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/my-trips");
    });
  });

  it("no permite ingresar y muestra el error si el servidor rechaza las credenciales", async () => {
    mockIniciarSesion.mockRejectedValueOnce(
      new Error("Credenciales inválidas")
    );
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "noexiste@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "incorrecta" },
    });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Credenciales inválidas"
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
