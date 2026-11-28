import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { BudgetPreferences } from "../pages/TravelPages";

const mockNavigate = vi.fn();
const api = vi.hoisted(() => ({
  cerrarSesion: vi.fn(),
  guardarConfiguracion: vi.fn(),
  obtenerMiPerfil: vi.fn(),
  obtenerOpciones: vi.fn(),
  obtenerViaje: vi.fn(),
}));

vi.mock("../api", () => api);
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderPage = () => render(<MemoryRouter><BudgetPreferences /></MemoryRouter>);
const deferred = () => {
  let resolve;
  const promise = new Promise((res) => { resolve = res; });
  return { promise, resolve };
};
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const botonGuardar = () => screen.getByRole("button", { name: /Guardar y comparar itinerarios|Guardando…/ });
const formulario = () => document.querySelector("form");
// Es el único select de la pantalla; su etiqueta también incluye los avisos de transporte cuando aparecen.
const transporte = () => screen.getByRole("combobox");
const opciones = () => within(transporte()).getAllByRole("option").map((opcion) => opcion.textContent);

const viaje = {
  id: "7",
  presupuestoTotal: 2500,
  transportePreferido: "avion",
  transportesDisponibles: ["tren", "avion"],
  prioridades: { ahorro: 50, distancia: 10, atractivos: 10, alojamiento: 10, tren: 10, panoramicas: 10 },
};
const perfil = { usuario: { preferencias: { ahorro: 20, distancia: 20, atractivos: 20, alojamiento: 20, tren: 10, panoramicas: 10 } } };

describe("BudgetPreferences", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    Object.values(api).forEach((fn) => fn.mockReset());
    mockNavigate.mockReset();
    sessionStorage.setItem("smarttrip.currentTripId", "7");
    // Si las opciones fallan, useOpciones vuelve a pedirlas en el próximo montaje y usa las listas base.
    api.obtenerOpciones.mockRejectedValue(new Error("sin backend"));
    api.obtenerMiPerfil.mockResolvedValue(perfil);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sin viaje elegido manda a Mis viajes", () => {
    sessionStorage.clear();

    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent("Elegí un viaje desde Mis viajes para ver esta información.");
    expect(screen.getByRole("link", { name: "Ir a Mis viajes" })).toHaveAttribute("href", "/my-trips");
    expect(api.obtenerViaje).not.toHaveBeenCalled();
  });

  it("precarga presupuesto, transporte y prioridades del viaje", async () => {
    api.obtenerViaje.mockResolvedValue({ viaje });

    renderPage();

    expect(await screen.findByDisplayValue("2500")).toBeInTheDocument();
    expect(transporte()).toHaveValue("avion");
    expect(opciones()).toEqual(["Elegí un transporte", "Tren", "Avión"]);
    expect(screen.getByRole("slider", { name: "Minimizar costos" })).toHaveValue("50");
    expect(botonGuardar()).toBeEnabled();
  });

  it.each([
    ["elige tren si el preferido ya no está", { transportePreferido: "auto", transportesDisponibles: ["avion", "tren"] }, "tren"],
    ["elige el primero si tampoco hay tren", { transportePreferido: "auto", transportesDisponibles: ["avion", "bus"] }, "avion"],
  ])("%s", async (_caso, cambios, esperado) => {
    api.obtenerViaje.mockResolvedValue({ viaje: { ...viaje, ...cambios } });

    renderPage();

    await screen.findByDisplayValue("2500");
    expect(transporte()).toHaveValue(esperado);
  });

  it("si el viaje no informa transportes ofrece los del backend y conserva el preferido", async () => {
    api.obtenerViaje.mockResolvedValue({ viaje: { ...viaje, transportePreferido: "auto", transportesDisponibles: undefined } });

    renderPage();

    await screen.findByDisplayValue("2500");
    expect(transporte()).toHaveValue("auto");
    expect(opciones()).toEqual(["Elegí un transporte", "Tren", "Avión", "Auto"]);
    expect(screen.queryByText("Este viaje no tiene transportes disponibles.")).not.toBeInTheDocument();
  });

  it("muestra con su clave un transporte que no conoce", async () => {
    api.obtenerViaje.mockResolvedValue({ viaje: { ...viaje, transportesDisponibles: ["bus"] } });

    renderPage();

    await screen.findByDisplayValue("2500");
    expect(transporte()).toHaveValue("bus");
    expect(opciones()).toEqual(["Elegí un transporte", "bus"]);
  });

  it("acepta un viaje sin `viaje`, presupuesto ni transporte y usa las prioridades del perfil", async () => {
    api.obtenerViaje.mockResolvedValue({ id: "7", transportesDisponibles: "tren" });
    api.obtenerMiPerfil.mockResolvedValue(perfil.usuario);

    renderPage();

    await waitFor(() => expect(screen.getByRole("slider", { name: "Minimizar costos" })).toHaveValue("20"));
    expect(screen.getByLabelText("Presupuesto total (USD)")).toHaveValue(null);
    expect(transporte()).toHaveValue("");
    expect(botonGuardar()).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Presupuesto total (USD)"), { target: { value: "900" } });
    expect(botonGuardar()).toBeDisabled();
    fireEvent.submit(formulario());
    expect(screen.getByRole("alert")).toHaveTextContent("Elegí un transporte disponible para continuar.");
    expect(api.guardarConfiguracion).not.toHaveBeenCalled();
  });

  it("avisa si el viaje no tiene transportes y no guarda el que tenía", async () => {
    api.obtenerViaje.mockResolvedValue({ viaje: { ...viaje, transportePreferido: "auto", transportesDisponibles: [] } });

    renderPage();

    expect(await screen.findByText("Este viaje no tiene transportes disponibles.")).toBeInTheDocument();
    expect(opciones()).toEqual(["Elegí un transporte"]);
    fireEvent.click(botonGuardar());
    expect(screen.getByRole("alert")).toHaveTextContent("Elegí un transporte disponible para continuar.");
    expect(api.guardarConfiguracion).not.toHaveBeenCalled();
  });

  it("si el viaje no carga muestra el error y no deja guardar", async () => {
    api.obtenerViaje.mockRejectedValue(new Error("Viaje no encontrado."));

    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("Viaje no encontrado.");
    expect(screen.getByRole("slider", { name: "Minimizar costos" })).toHaveValue("20");
    expect(botonGuardar()).toBeDisabled();
    fireEvent.submit(formulario());
    expect(api.guardarConfiguracion).not.toHaveBeenCalled();
  });

  it("si el viaje y el perfil fallan muestra el error del viaje", async () => {
    api.obtenerViaje.mockRejectedValue(new Error("Viaje no encontrado."));
    api.obtenerMiPerfil.mockRejectedValue(new Error("Perfil no encontrado."));

    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("Viaje no encontrado.");
  });

  it("si solo falla el perfil muestra ese error", async () => {
    api.obtenerViaje.mockResolvedValue({ viaje });
    api.obtenerMiPerfil.mockRejectedValue(new Error("Perfil no encontrado."));

    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("Perfil no encontrado.");
    expect(screen.getByRole("slider", { name: "Minimizar costos" })).toHaveValue("30");
  });

  it("muestra el error si la respuesta del viaje no se puede leer", async () => {
    api.obtenerViaje.mockResolvedValue(null);

    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent(/null/);
    expect(botonGuardar()).toBeDisabled();
  });

  it("no actualiza la pantalla si se cerró antes de que lleguen los datos", async () => {
    const carga = deferred();
    api.obtenerViaje.mockReturnValue(carga.promise);
    const error = vi.spyOn(console, "error");

    renderPage().unmount();
    carga.resolve({ viaje });
    await flush();

    expect(error).not.toHaveBeenCalled();
  });

  it("no muestra el error de lectura si la pantalla se cerró mientras tanto", async () => {
    // Caso defensivo: la pantalla se desmonta justo antes de que falle la lectura de la respuesta.
    let vista;
    const respuesta = {
      get viaje() {
        vista.unmount();
        throw new Error("respuesta ilegible");
      },
    };
    api.obtenerViaje.mockResolvedValue(respuesta);
    const error = vi.spyOn(console, "error");

    vista = renderPage();
    await flush();
    await flush();

    expect(error).not.toHaveBeenCalled();
  });

  it("avisa cuando el transporte guardado ya no está disponible", async () => {
    api.obtenerViaje.mockResolvedValue({
      viaje: { ...viaje, transportePreferido: null, avisoTransporte: "El tren dejó de estar disponible." },
    });

    renderPage();

    expect(await screen.findByText("El tren dejó de estar disponible.")).toBeInTheDocument();
    expect(screen.getByText("El transporte anterior ya no está disponible. Elegí uno nuevo para continuar.")).toBeInTheDocument();
    expect(transporte()).toHaveValue("");

    fireEvent.change(transporte(), { target: { value: "tren" } });
    expect(transporte()).toHaveValue("tren");
    expect(screen.queryByText("El transporte anterior ya no está disponible. Elegí uno nuevo para continuar.")).not.toBeInTheDocument();
  });

  it("guarda la configuración y sigue a comparar itinerarios", async () => {
    let resolver;
    api.guardarConfiguracion.mockReturnValue(new Promise((resolve) => { resolver = resolve; }));
    api.obtenerViaje.mockResolvedValue({ viaje });
    renderPage();

    fireEvent.change(await screen.findByLabelText("Presupuesto total (USD)"), { target: { value: "3100" } });
    fireEvent.change(transporte(), { target: { value: "tren" } });
    fireEvent.click(botonGuardar());
    expect(screen.getByRole("button", { name: "Guardando…" })).toBeDisabled();
    resolver({});

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/compare-itineraries"));
    expect(api.guardarConfiguracion).toHaveBeenCalledWith("7", {
      presupuestoTotal: 3100,
      moneda: "USD",
      transportePreferido: "tren",
      prioridades: viaje.prioridades,
    });
  });

  it("muestra el error del servidor y el de cada campo al guardar", async () => {
    api.obtenerViaje.mockResolvedValue({ viaje });
    api.guardarConfiguracion.mockRejectedValue(Object.assign(new Error("Revisá la configuración."), {
      errors: {
        presupuestoTotal: "Presupuesto insuficiente.",
        transportePreferido: { mensaje: "Transporte no disponible." },
        prioridades: { message: "Deben sumar 100." },
      },
    }));
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Guardar y comparar itinerarios" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Revisá la configuración.");
    expect(screen.getByText("Presupuesto insuficiente.")).toBeInTheDocument();
    expect(screen.getByText("Transporte no disponible.")).toBeInTheDocument();
    expect(screen.getByText("Deben sumar 100.")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("muestra el error al guardar aunque el servidor no indique campos", async () => {
    api.obtenerViaje.mockResolvedValue({ viaje });
    api.guardarConfiguracion.mockRejectedValue(new Error("Servidor caído."));
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Guardar y comparar itinerarios" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Servidor caído.");
    expect(document.querySelector(".trip-field-error")).toBeNull();
  });

  // Van al final: cuando /opciones responde, useOpciones guarda la respuesta para el resto del archivo.
  describe("con las opciones que define el backend", () => {
    const opcionesBackend = {
      transportes: [{ tipo: "bus", etiqueta: "Micro" }, { tipo: "avion", etiqueta: "Avión (vuelo)" }],
      criterios: [{ clave: "ahorro", etiqueta: "Gastar menos" }, { clave: "nuevo", etiqueta: "Criterio nuevo" }],
    };

    beforeEach(() => {
      api.obtenerOpciones.mockResolvedValue(opcionesBackend);
    });

    it("usa las etiquetas del backend y completa las que no define", async () => {
      api.obtenerViaje.mockResolvedValue({ viaje: { ...viaje, transportePreferido: "bus", transportesDisponibles: ["tren", "bus", "avion"] } });

      renderPage();

      expect(await screen.findByRole("option", { name: "Micro" })).toBeInTheDocument();
      expect(opciones()).toEqual(["Elegí un transporte", "Tren", "Micro", "Avión (vuelo)"]);
      expect(transporte()).toHaveValue("bus");
    });

    it("no guarda si un criterio nuevo del backend hace que las seis prioridades no sumen 100", async () => {
      api.obtenerViaje.mockResolvedValue({ viaje });
      renderPage();

      const nuevo = await screen.findByRole("slider", { name: "Criterio nuevo" });
      expect(nuevo).toHaveValue("0");
      fireEvent.change(nuevo, { target: { value: "20" } });
      fireEvent.change(screen.getByRole("slider", { name: "Gastar menos" }), { target: { value: "50" } });
      fireEvent.click(botonGuardar());

      expect(screen.getByRole("alert")).toHaveTextContent("Las seis prioridades deben sumar 100%.");
      expect(api.guardarConfiguracion).not.toHaveBeenCalled();
    });
  });
});
