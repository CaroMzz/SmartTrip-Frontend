import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/login/Login";

const mockNavigate = vi.fn();
const api = vi.hoisted(() => ({ iniciarSesion: vi.fn() }));

vi.mock("../api", () => api);
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderLogin = (entrada = "/") => render(
  <MemoryRouter initialEntries={[entrada]}>
    <Login />
  </MemoryRouter>
);

const completar = (email, password) => {
  fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: password } });
};

describe("Login: validaciones y estados", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    api.iniciarSesion.mockReset();
  });

  it.each([
    ["sin correo", "", "clave"],
    ["sin contraseña", "ana@example.test", ""],
  ])("pide completar los datos si se envía %s", (_caso, email, password) => {
    renderLogin();
    completar(email, password);

    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Completá tu correo y contraseña para iniciar sesión.");
    expect(api.iniciarSesion).not.toHaveBeenCalled();
  });

  it("avisa mientras se escribe un correo inválido y no lo envía", () => {
    renderLogin();
    completar("ana@", "clave");

    expect(screen.getByText("Ingresá un correo válido, por ejemplo nombre@correo.com.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Revisá el formato de tu correo electrónico.");
    expect(api.iniciarSesion).not.toHaveBeenCalled();
  });

  it("muestra el aviso que deja el cierre de sesión", () => {
    renderLogin({ pathname: "/", state: { notice: "La sesión local se cerró." } });

    expect(screen.getByRole("status")).toHaveTextContent("La sesión local se cerró.");
  });

  it("muestra que está verificando y un error genérico si el rechazo no es un Error", async () => {
    let rechazar;
    api.iniciarSesion.mockReturnValue(new Promise((_resolve, reject) => { rechazar = reject; }));
    renderLogin();
    completar("ana@example.test", "clave");

    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(screen.getByRole("button", { name: "Verificando..." })).toBeDisabled();
    rechazar("sin detalle");

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo iniciar sesión. Verificá tus credenciales e intentá nuevamente.");
    expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeEnabled();
  });
});
