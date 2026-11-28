import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ obtenerOpciones: vi.fn() }));
vi.mock("../api", () => api);

// useOpciones guarda la solicitud en una variable del módulo: cada caso usa un módulo nuevo.
async function cargarHook() {
  vi.resetModules();
  const modulo = await import("../pages/tripOptions");
  function Opciones() {
    const { transportes, criterios } = modulo.useOpciones();
    return <p>{transportes.map((t) => t.etiqueta).join(",")}|{criterios.map((c) => c.etiqueta).join(",")}</p>;
  }
  return { ...modulo, Opciones };
}

const opcionesDelBackend = {
  transportes: [{ tipo: "bus", etiqueta: "Micro" }],
  criterios: [{ clave: "ahorro", etiqueta: "Gastar menos" }],
};

describe("useOpciones", () => {
  beforeEach(() => {
    api.obtenerOpciones.mockReset();
  });

  it("empieza con las listas base y las reemplaza por las del backend", async () => {
    api.obtenerOpciones.mockResolvedValue(opcionesDelBackend);
    const { Opciones } = await cargarHook();

    render(<Opciones />);

    expect(screen.getByText("Tren,Avión,Auto|Minimizar costos,Reducir kilómetros recorridos,Maximizar lugares turísticos,Minimizar cambios de alojamiento,Priorizar tren sobre avión,Priorizar rutas panorámicas")).toBeInTheDocument();
    expect(await screen.findByText("Micro|Gastar menos")).toBeInTheDocument();
  });

  it("pide las opciones una sola vez aunque se use en varios componentes", async () => {
    api.obtenerOpciones.mockResolvedValue(opcionesDelBackend);
    const { Opciones } = await cargarHook();

    render(<><Opciones /><Opciones /></>);

    expect(await screen.findAllByText("Micro|Gastar menos")).toHaveLength(2);
    expect(api.obtenerOpciones).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["sin respuesta", null],
    ["sin transportes", { transportes: [], criterios: opcionesDelBackend.criterios }],
    ["sin criterios", { transportes: opcionesDelBackend.transportes, criterios: [] }],
  ])("mantiene las listas base si el backend responde %s", async (_caso, respuesta) => {
    api.obtenerOpciones.mockResolvedValue(respuesta);
    const { Opciones } = await cargarHook();

    render(<Opciones />);

    await waitFor(() => expect(api.obtenerOpciones).toHaveBeenCalled());
    await Promise.resolve();
    expect(screen.getByText(/^Tren,Avión,Auto\|/)).toBeInTheDocument();
  });

  it("vuelve a pedir las opciones si la primera solicitud falló", async () => {
    api.obtenerOpciones.mockRejectedValueOnce(new Error("sin backend")).mockResolvedValueOnce(opcionesDelBackend);
    const { Opciones } = await cargarHook();

    const primera = render(<Opciones />);
    await waitFor(() => expect(api.obtenerOpciones).toHaveBeenCalledTimes(1));
    await new Promise((resolve) => setTimeout(resolve, 0));
    primera.unmount();

    render(<Opciones />);

    expect(await screen.findByText("Micro|Gastar menos")).toBeInTheDocument();
    expect(api.obtenerOpciones).toHaveBeenCalledTimes(2);
  });

  it("no actualiza un componente que ya se desmontó", async () => {
    let resolver;
    api.obtenerOpciones.mockReturnValue(new Promise((resolve) => { resolver = resolve; }));
    const { Opciones } = await cargarHook();
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const vista = render(<Opciones />);
    vista.unmount();
    resolver(opcionesDelBackend);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
