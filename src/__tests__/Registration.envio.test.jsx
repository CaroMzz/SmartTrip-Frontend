import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Registration from "../pages/registration/Registration";

const mockNavigate = vi.fn();
const api = vi.hoisted(() => ({ registrar: vi.fn() }));

vi.mock("../api", () => api);
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const CLAVE = "una clave bien larga";

const completar = ({ nombre = "Ana Pérez", email = "ana@example.test", password = CLAVE, confirmar = password } = {}) => {
  fireEvent.change(screen.getByLabelText("Nombre completo"), { target: { value: nombre } });
  fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: password } });
  fireEvent.change(screen.getByLabelText("Confirmar contraseña"), { target: { value: confirmar } });
};

const enviar = () => fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

describe("Registration: validaciones y envío", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    api.registrar.mockReset();
    render(<MemoryRouter><Registration /></MemoryRouter>);
  });

  it.each([
    ["sin nombre", { nombre: "  " }, "Completá todos los campos para crear tu cuenta."],
    ["sin correo", { email: "" }, "Completá todos los campos para crear tu cuenta."],
    ["sin contraseña", { password: "", confirmar: CLAVE }, "Completá todos los campos para crear tu cuenta."],
    ["sin confirmación", { confirmar: "" }, "Completá todos los campos para crear tu cuenta."],
    ["con un correo inválido", { email: "ana@example" }, "Revisá el formato de tu correo electrónico."],
    ["con contraseñas distintas", { confirmar: `${CLAVE}!` }, "Las contraseñas no coinciden."],
    ["con una contraseña corta", { password: "corta" }, "La contraseña debe tener al menos 15 caracteres."],
  ])("no envía el formulario %s", (_caso, datos, mensaje) => {
    completar(datos);

    enviar();

    expect(screen.getByRole("alert")).toHaveTextContent(mensaje);
    expect(api.registrar).not.toHaveBeenCalled();
  });

  it("avisa en vivo correo inválido, contraseña corta y confirmación distinta", () => {
    completar({ email: "ana@", password: "corta", confirmar: "otra" });

    expect(screen.getByText("Ingresá un correo válido, por ejemplo nombre@correo.com.")).toBeInTheDocument();
    expect(screen.getByText("La contraseña necesita al menos 15 caracteres (5/15).")).toBeInTheDocument();
    expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
  });

  it("registra la cuenta y lleva a verificar el correo", async () => {
    let resolver;
    api.registrar.mockReturnValue(new Promise((resolve) => { resolver = resolve; }));
    completar({ email: " ana@example.test " });

    enviar();
    expect(screen.getByRole("button", { name: "Creando cuenta..." })).toBeDisabled();
    resolver({ correoEnviado: false });

    await vi.waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/email-verification", {
      state: { email: "ana@example.test", correoEnviado: false },
    }));
    expect(api.registrar).toHaveBeenCalledWith({ nombre: "Ana Pérez", email: "ana@example.test", contraseña: CLAVE });
  });

  it("muestra el error del servidor y los errores de cada campo", async () => {
    const error = Object.assign(new Error("Revisá los datos."), {
      errors: { nombre: "Nombre inválido", email: "Correo ya registrado", contraseña: "Contraseña débil" },
    });
    api.registrar.mockRejectedValue(error);
    completar();

    enviar();

    expect(await screen.findByRole("alert")).toHaveTextContent("Revisá los datos.");
    expect(screen.getByText("Nombre inválido")).toBeInTheDocument();
    expect(screen.getByText("Correo ya registrado")).toBeInTheDocument();
    expect(screen.getByText("Contraseña débil")).toBeInTheDocument();
  });

  it("usa un mensaje genérico si el rechazo no es un Error", async () => {
    api.registrar.mockRejectedValue(undefined);
    completar();

    enviar();

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo crear la cuenta. Intentá nuevamente.");
  });
});
