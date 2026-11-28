import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { CompareItineraries } from "../pages/TravelPages";

const mockNavigate = vi.fn();
const api = vi.hoisted(() => ({
  cerrarSesion: vi.fn(),
  generarItinerarios: vi.fn(),
  obtenerItinerarios: vi.fn(),
  seleccionarItinerario: vi.fn(),
}));

vi.mock("../api", () => api);
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderPage = () => render(<MemoryRouter><CompareItineraries /></MemoryRouter>);
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const alternativas = [
  {
    id: "a",
    tipo: "equilibrada",
    recomendada: true,
    notas: ["Distancia aproximada."],
    metricas: { tiempoTrasladosHoras: 5, distanciaTotalKm: 300, cantidadCiudades: 3, cambiosAlojamiento: 2, puntajeTuristico: 80 },
    presupuesto: { totalEstimado: 1500 },
    puntaje: 9,
  },
  { itinerarioId: "b", tipo: "mas_ahorro", presupuesto: { total: 900 }, ciudades: [{}, {}], notas: ["Distancia aproximada.", "Sin trenes nocturnos."] },
  { _id: "c", tipo: "mas_experiencias" },
  { tipo: "otra" },
];

const filas = () => screen.getAllByRole("row").slice(1);

describe("CompareItineraries", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    Object.values(api).forEach((fn) => fn.mockReset());
    mockNavigate.mockReset();
    sessionStorage.setItem("smarttrip.currentTripId", "7");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sin viaje elegido manda a Mis viajes", () => {
    sessionStorage.clear();

    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent("Elegí un viaje desde Mis viajes para ver esta información.");
    expect(screen.getByRole("link", { name: "Ir a Mis viajes" })).toBeInTheDocument();
  });

  it("si todavía no hay alternativas las genera y muestra la comparación", async () => {
    api.obtenerItinerarios.mockResolvedValueOnce({}).mockResolvedValueOnce({ alternativas });
    api.generarItinerarios.mockResolvedValue({});

    renderPage();

    expect(screen.getByRole("status")).toHaveTextContent("Generando tus alternativas…");
    await screen.findByRole("table");
    expect(api.generarItinerarios).toHaveBeenCalledWith("7");
    const [equilibrada, ahorro, experiencias, otra] = filas();
    expect(equilibrada).toHaveClass("recommended-row");
    expect(within(equilibrada).getByText("Recomendada")).toBeInTheDocument();
    expect(equilibrada).toHaveTextContent("EquilibradaRecomendada5 h300 km$1500 USD3280/1009Elegir");
    expect(ahorro).not.toHaveClass("recommended-row");
    expect(ahorro).toHaveTextContent("Más ahorro— h— km$900 USD2——/100—Elegir");
    expect(experiencias).toHaveTextContent("Más experiencias— h— km$— USD———/100—Elegir");
    expect(otra).toHaveTextContent("Opción 4");
    const notas = screen.getByRole("list", { name: "Aclaraciones del recorrido" });
    expect(within(notas).getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Distancia aproximada.", "Sin trenes nocturnos."]);
    expect(screen.getByRole("link", { name: "Editar viaje" })).toBeInTheDocument();
  });

  it("elige una alternativa y abre el itinerario", async () => {
    const seleccion = deferred();
    api.obtenerItinerarios.mockResolvedValue({ itinerarios: alternativas });
    api.seleccionarItinerario.mockReturnValue(seleccion.promise);
    renderPage();
    await screen.findByRole("table");

    fireEvent.click(within(filas()[1]).getByRole("button", { name: "Elegir" }));

    expect(within(filas()[1]).getByRole("button", { name: "Eligiendo…" })).toBeDisabled();
    expect(within(filas()[0]).getByRole("button", { name: "Elegir" })).toBeDisabled();
    seleccion.resolve({});
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/itinerary"));
    expect(api.seleccionarItinerario).toHaveBeenCalledWith("7", "b");
  });

  it("muestra el error si no puede elegir y deja volver a intentar", async () => {
    api.obtenerItinerarios.mockResolvedValue({ itinerarios: alternativas });
    api.seleccionarItinerario.mockRejectedValue(new Error("La alternativa venció."));
    renderPage();
    await screen.findByRole("table");

    fireEvent.click(within(filas()[2]).getByRole("button", { name: "Elegir" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("La alternativa venció.");
    expect(api.seleccionarItinerario).toHaveBeenCalledWith("7", "c");
    expect(within(filas()[2]).getByRole("button", { name: "Elegir" })).toBeEnabled();
  });

  it("no envía una alternativa sin identificador", async () => {
    api.obtenerItinerarios.mockResolvedValue({ itinerarios: alternativas });
    renderPage();
    await screen.findByRole("table");

    fireEvent.click(within(filas()[3]).getByRole("button", { name: "Elegir" }));

    expect(screen.getByRole("alert")).toHaveTextContent("La alternativa no tiene un identificador válido.");
    expect(api.seleccionarItinerario).not.toHaveBeenCalled();
  });

  it("si no se generaron alternativas ofrece intentar nuevamente", async () => {
    api.obtenerItinerarios.mockResolvedValue({ itinerarios: [] });
    api.generarItinerarios.mockResolvedValue({});
    renderPage();

    // jsdom no recarga la página ni deja espiar location.reload: alcanza con que el botón no rompa la pantalla.
    fireEvent.click(await screen.findByRole("button", { name: "Intentar nuevamente" }));

    expect(api.generarItinerarios).toHaveBeenCalledWith("7");
    expect(screen.getByRole("heading", { name: "No se generaron alternativas" })).toBeInTheDocument();
  });

  it("muestra el error si no puede generar las alternativas", async () => {
    api.obtenerItinerarios.mockResolvedValue({});
    api.generarItinerarios.mockRejectedValue(new Error("El motor de rutas no responde."));

    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("El motor de rutas no responde.");
    expect(screen.getByRole("heading", { name: "No se generaron alternativas" })).toBeInTheDocument();
  });

  it("ignora la respuesta si la pantalla ya se cerró", async () => {
    const carga = deferred();
    api.obtenerItinerarios.mockReturnValue(carga.promise);
    const error = vi.spyOn(console, "error");

    renderPage().unmount();
    carga.resolve({ itinerarios: alternativas });
    await flush();

    expect(error).not.toHaveBeenCalled();
  });

  it("ignora el error si la pantalla ya se cerró", async () => {
    const carga = deferred();
    api.obtenerItinerarios.mockReturnValue(carga.promise);
    const error = vi.spyOn(console, "error");

    renderPage().unmount();
    carga.reject(new Error("tarde"));
    await flush();

    expect(error).not.toHaveBeenCalled();
  });
});
