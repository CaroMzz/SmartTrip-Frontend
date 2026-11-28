import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ChangePassword, Profile } from "../pages/AccountPages";

const api = vi.hoisted(() => ({
  actualizarMiPerfil: vi.fn(),
  cambiarContrasena: vi.fn(),
  cerrarSesion: vi.fn(),
  obtenerMiPerfil: vi.fn(),
  obtenerOpciones: vi.fn(),
}));
vi.mock("../api", () => api);

const renderPage = (page) => render(<MemoryRouter>{page}</MemoryRouter>);
const guardarPerfil = () => fireEvent.click(screen.getByRole("button", { name: "Guardar perfil" }));
const usuarioGuardado = () => JSON.parse(localStorage.getItem("smarttrip.user"));

describe("Profile", () => {
  beforeEach(() => {
    localStorage.clear();
    Object.values(api).forEach((fn) => fn.mockReset());
    api.obtenerOpciones.mockResolvedValue(null);
  });

  it("acepta un perfil sin `usuario` ni preferencias y usa valores por defecto", async () => {
    api.obtenerMiPerfil.mockResolvedValue({ email: "luz@example.test" });

    renderPage(<Profile />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando perfil…");
    expect(await screen.findByLabelText("Correo electrónico")).toHaveValue("luz@example.test");
    expect(screen.getByLabelText("Nombre")).toHaveValue("");
    expect(screen.getByLabelText("Transporte preferido")).toHaveValue("tren");
    expect(screen.getByRole("slider", { name: "Minimizar costos" })).toHaveValue("30");
  });

  it("si el perfil no tiene correo, pide la contraseña para el que se ingrese", async () => {
    api.obtenerMiPerfil.mockResolvedValue({ usuario: { nombre: "Ana" } });

    renderPage(<Profile />);

    expect(await screen.findByLabelText("Correo electrónico")).toHaveValue("");
    expect(screen.queryByLabelText("Contraseña actual")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "ana@example.test" } });
    fireEvent.change(screen.getByLabelText("Contraseña actual"), { target: { value: "clave actual" } });
    api.actualizarMiPerfil.mockResolvedValue({ usuario: { correo: "ana@example.test" } });
    guardarPerfil();

    expect(await screen.findByText(/iniciá sesión con el correo nuevo/)).toBeInTheDocument();
    expect(api.actualizarMiPerfil.mock.calls[0][0]).toMatchObject({ email: "ana@example.test", contrasenaActual: "clave actual" });
    expect(screen.queryByLabelText("Contraseña actual")).not.toBeInTheDocument();
  });

  it("muestra el error si no puede cargar el perfil", async () => {
    api.obtenerMiPerfil.mockRejectedValue(new Error("No se pudo cargar el perfil."));

    renderPage(<Profile />);

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo cargar el perfil.");
  });

  it("guarda transporte y prioridades, y actualiza el usuario guardado", async () => {
    api.obtenerMiPerfil.mockResolvedValue({
      usuario: { nombre: "Ana", correo: "ana@example.test", preferencias: { transportePreferido: "avion", moneda: "USD" } },
    });
    api.actualizarMiPerfil.mockResolvedValue({ mensaje: "Perfil guardado.", usuario: { id: "u1", preferencias: { idioma: "es" } } });
    renderPage(<Profile />);

    const transporte = await screen.findByLabelText("Transporte preferido");
    expect(transporte).toHaveValue("avion");
    fireEvent.change(transporte, { target: { value: "auto" } });
    fireEvent.change(screen.getByRole("slider", { name: "Minimizar costos" }), { target: { value: "50" } });
    guardarPerfil();
    expect(screen.getByRole("button", { name: "Guardando…" })).toBeDisabled();

    expect(await screen.findByText("Perfil guardado.")).toBeInTheDocument();
    const enviado = api.actualizarMiPerfil.mock.calls[0][0];
    expect(enviado).toMatchObject({ nombre: "Ana", transportePreferido: "auto" });
    expect(enviado.prioridades.ahorro).toBe(50);
    expect(Object.values(enviado.prioridades).reduce((a, b) => a + b, 0)).toBe(100);
    expect(usuarioGuardado()).toMatchObject({
      id: "u1",
      nombre: "Ana",
      preferencias: { moneda: "USD", idioma: "es", transportePreferido: "auto" },
    });
  });

  it("usa un mensaje propio si el backend no envía uno ni devuelve el usuario", async () => {
    api.obtenerMiPerfil.mockResolvedValue({ usuario: { nombre: "Ana", email: "ana@example.test" } });
    api.actualizarMiPerfil.mockResolvedValue({});
    renderPage(<Profile />);

    fireEvent.change(await screen.findByLabelText("Nombre"), { target: { value: "  Ana P. " } });
    guardarPerfil();

    expect(await screen.findByText("Tu perfil se actualizó correctamente.")).toBeInTheDocument();
    expect(api.actualizarMiPerfil.mock.calls[0][0]).not.toHaveProperty("email");
    expect(usuarioGuardado()).toMatchObject({ nombre: "Ana P.", preferencias: { transportePreferido: "tren" } });
  });

  it("muestra el error del servidor y el de cada campo", async () => {
    api.obtenerMiPerfil.mockResolvedValue({ usuario: { nombre: "Ana", correo: "ana@example.test" } });
    api.actualizarMiPerfil.mockRejectedValue(Object.assign(new Error("Revisá los datos."), {
      errors: {
        nombre: "Nombre muy corto",
        email: "Correo ya usado",
        transportePreferido: "Transporte inválido",
        prioridades: "Deben sumar 100",
      },
    }));
    renderPage(<Profile />);

    await screen.findByLabelText("Nombre");
    guardarPerfil();

    expect(await screen.findByRole("alert")).toHaveTextContent("Revisá los datos.");
    ["Nombre muy corto", "Correo ya usado", "Transporte inválido", "Deben sumar 100"].forEach((mensaje) => {
      expect(screen.getByText(mensaje)).toBeInTheDocument();
    });
  });

  it("muestra el error aunque el servidor no indique campos", async () => {
    api.obtenerMiPerfil.mockResolvedValue({ usuario: { nombre: "Ana", correo: "ana@example.test" } });
    api.actualizarMiPerfil.mockRejectedValue(new Error("Servidor caído."));
    renderPage(<Profile />);

    await screen.findByLabelText("Nombre");
    guardarPerfil();

    expect(await screen.findByRole("alert")).toHaveTextContent("Servidor caído.");
    expect(document.querySelector(".account-field-error")).toBeNull();
  });
});

describe("ChangePassword", () => {
  const NUEVA = "una clave nueva y larga";

  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
    renderPage(<ChangePassword />);
  });

  const completar = (actual, nueva, confirmar) => {
    fireEvent.change(screen.getByLabelText("Contraseña actual"), { target: { value: actual } });
    fireEvent.change(screen.getByLabelText("Nueva contraseña"), { target: { value: nueva } });
    fireEvent.change(screen.getByLabelText("Confirmar nueva contraseña"), { target: { value: confirmar } });
    fireEvent.click(screen.getByRole("button", { name: "Actualizar contraseña" }));
  };

  it("exige al menos 15 caracteres", () => {
    completar("actual", "corta", "corta");

    expect(screen.getByText("La nueva contraseña debe tener al menos 15 caracteres.")).toBeInTheDocument();
    expect(api.cambiarContrasena).not.toHaveBeenCalled();
  });

  it("exige que la confirmación coincida", () => {
    completar("actual", NUEVA, `${NUEVA}!`);

    expect(screen.getByText("Las contraseñas nuevas no coinciden.")).toBeInTheDocument();
    expect(api.cambiarContrasena).not.toHaveBeenCalled();
  });

  it("cambia la contraseña y limpia el formulario", async () => {
    let resolver;
    api.cambiarContrasena.mockReturnValue(new Promise((resolve) => { resolver = resolve; }));

    completar("actual", NUEVA, NUEVA);
    expect(screen.getByRole("button", { name: "Actualizando…" })).toBeDisabled();
    resolver({ mensaje: "Contraseña actualizada." });

    expect(await screen.findByText("Contraseña actualizada.")).toBeInTheDocument();
    expect(api.cambiarContrasena).toHaveBeenCalledWith("actual", NUEVA);
    expect(screen.getByLabelText("Contraseña actual")).toHaveValue("");
    expect(screen.getByLabelText("Nueva contraseña")).toHaveValue("");
    expect(screen.getByLabelText("Confirmar nueva contraseña")).toHaveValue("");
  });

  it("usa un mensaje propio si el backend no envía uno", async () => {
    api.cambiarContrasena.mockResolvedValue({});

    completar("actual", NUEVA, NUEVA);

    expect(await screen.findByText("La contraseña se cambió correctamente.")).toBeInTheDocument();
  });

  it("muestra el error y los errores por campo del servidor", async () => {
    api.cambiarContrasena.mockRejectedValue(Object.assign(new Error("No se pudo cambiar."), {
      errors: { contrasenaActual: "La contraseña actual no es correcta.", nuevaContrasena: "Es igual a la anterior." },
    }));

    completar("mal", NUEVA, NUEVA);

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo cambiar.");
    expect(screen.getByText("La contraseña actual no es correcta.")).toBeInTheDocument();
    expect(screen.getByText("Es igual a la anterior.")).toBeInTheDocument();
  });

  it("muestra el error aunque el servidor no indique campos", async () => {
    api.cambiarContrasena.mockRejectedValue(new Error("Servidor caído."));

    completar("actual", NUEVA, NUEVA);

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Servidor caído."));
    expect(document.querySelector(".account-field-error")).toBeNull();
  });
});
