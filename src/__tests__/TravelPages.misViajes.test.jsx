import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { MyTrips } from "../pages/TravelPages";

const mockNavigate = vi.fn();
const api = vi.hoisted(() => ({
  cerrarSesion: vi.fn(),
  eliminarViaje: vi.fn(),
  obtenerViajes: vi.fn(),
}));

vi.mock("../api", () => api);
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderPage = () => render(<MemoryRouter><MyTrips /></MemoryRouter>);
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const fecha = (valor) => new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(new Date(valor));

const viajes = [
  {
    id: "1",
    nombre: "Elegido",
    estado: "itinerario_seleccionado",
    fechaInicio: "2027-03-10",
    fechaFin: "2027-03-20",
    creadoEn: "2026-11-01T15:00:00Z",
    ciudadesObligatorias: [{}, {}],
    presupuestoTotal: 3000,
  },
  { _id: "2", nombre: "Con alternativas", estado: "alternativas_generadas", fechaInicio: "no es una fecha" },
  { viajeId: "3", nombre: "Borrador" },
  { nombre: "Sin identificador" },
];

describe("MyTrips", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    Object.values(api).forEach((fn) => fn.mockReset());
    mockNavigate.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("invita a crear el primer viaje si no hay ninguno, aunque el backend no mande la lista", async () => {
    api.obtenerViajes.mockResolvedValue({});

    renderPage();

    expect(screen.getByRole("status")).toHaveClass("trip-loading", "large");
    expect(await screen.findByRole("heading", { name: "Tu próxima aventura empieza acá" })).toBeInTheDocument();
    expect(screen.getByText("0 viajes")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Crear mi primer viaje" })).toHaveAttribute("href", "/new-trip");
  });

  it("usa el singular con un solo viaje", async () => {
    api.obtenerViajes.mockResolvedValue({ viajes: [viajes[0]] });

    renderPage();

    expect(await screen.findByText("1 viaje")).toBeInTheDocument();
  });

  it("muestra estado, fechas, ciudades y presupuesto de cada viaje", async () => {
    api.obtenerViajes.mockResolvedValue({ viajes });

    renderPage();

    expect(await screen.findByText("4 viajes")).toBeInTheDocument();
    const tarjetas = screen.getAllByRole("article");
    expect(tarjetas[0]).toHaveTextContent("Itinerario elegido");
    expect(tarjetas[0]).toHaveTextContent(`${fecha("2027-03-10T00:00:00")} – ${fecha("2027-03-20T00:00:00")}`);
    expect(tarjetas[0]).toHaveTextContent(`Creado ${fecha("2026-11-01T15:00:00Z")}`);
    expect(tarjetas[0]).toHaveTextContent("2 ciudades · 3000 USD");
    expect(tarjetas[1]).toHaveTextContent("Alternativas listas");
    expect(tarjetas[1]).toHaveTextContent("no es una fecha");
    expect(tarjetas[2]).toHaveTextContent("Borrador");
    expect(tarjetas[2].querySelector(".trip-status")).toHaveClass("borrador");
    expect(tarjetas[2]).toHaveTextContent("Fecha pendiente");
    expect(tarjetas[2]).toHaveTextContent("Creado Fecha pendiente");
    expect(tarjetas[2]).toHaveTextContent("0 ciudades · — USD");
  });

  it("abre cada viaje en la pantalla que corresponde a su estado", async () => {
    api.obtenerViajes.mockResolvedValue({ viajes });
    renderPage();
    const abrir = await screen.findAllByRole("button", { name: "Abrir viaje" });

    fireEvent.click(abrir[0]);
    expect(sessionStorage.getItem("smarttrip.currentTripId")).toBe("1");
    expect(mockNavigate).toHaveBeenLastCalledWith("/itinerary");

    fireEvent.click(document.querySelectorAll(".trip-card-open")[1]);
    expect(sessionStorage.getItem("smarttrip.currentTripId")).toBe("2");
    expect(mockNavigate).toHaveBeenLastCalledWith("/compare-itineraries");

    fireEvent.click(abrir[2]);
    expect(sessionStorage.getItem("smarttrip.currentTripId")).toBe("3");
    expect(mockNavigate).toHaveBeenLastCalledWith("/edit-trip");

    fireEvent.click(abrir[3]);
    expect(screen.getByRole("alert")).toHaveTextContent("El viaje recibido no tiene un identificador válido.");
    expect(mockNavigate).toHaveBeenCalledTimes(3);
  });

  it("Editar elige el viaje y abre la edición", async () => {
    api.obtenerViajes.mockResolvedValue({ viajes });
    renderPage();

    fireEvent.click((await screen.findAllByRole("button", { name: "Editar" }))[1]);

    expect(sessionStorage.getItem("smarttrip.currentTripId")).toBe("2");
    expect(mockNavigate).toHaveBeenCalledWith("/edit-trip");
  });

  it("no elimina nada si el usuario cancela la confirmación", async () => {
    api.obtenerViajes.mockResolvedValue({ viajes });
    const confirmar = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderPage();

    fireEvent.click((await screen.findAllByRole("button", { name: "Eliminar" }))[0]);

    expect(confirmar).toHaveBeenCalledWith('¿Querés eliminar el viaje "Elegido"? Esta acción no se puede deshacer.');
    expect(api.eliminarViaje).not.toHaveBeenCalled();
  });

  it("elimina un viaje confirmado y lo saca de la lista", async () => {
    api.obtenerViajes.mockResolvedValue({ viajes });
    api.eliminarViaje.mockResolvedValue({});
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderPage();

    fireEvent.click((await screen.findAllByRole("button", { name: "Eliminar" }))[1]);

    expect(await screen.findByText("3 viajes")).toBeInTheDocument();
    expect(api.eliminarViaje).toHaveBeenCalledWith("2");
    expect(screen.queryByText("Con alternativas")).not.toBeInTheDocument();
  });

  it("no intenta eliminar un viaje sin identificador", async () => {
    api.obtenerViajes.mockResolvedValue({ viajes });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderPage();

    fireEvent.click((await screen.findAllByRole("button", { name: "Eliminar" }))[3]);

    expect(screen.getByRole("alert")).toHaveTextContent("El viaje recibido no tiene un identificador válido.");
    expect(api.eliminarViaje).not.toHaveBeenCalled();
  });

  it.each([
    ["un Error", new Error("No tenés permiso."), "No tenés permiso."],
    ["otro valor", "sin detalle", "No se pudo eliminar el viaje."],
  ])("muestra el error si eliminar falla con %s", async (_caso, rechazo, mensaje) => {
    api.obtenerViajes.mockResolvedValue({ viajes });
    api.eliminarViaje.mockRejectedValue(rechazo);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderPage();

    fireEvent.click((await screen.findAllByRole("button", { name: "Eliminar" }))[0]);

    expect(await screen.findByRole("alert")).toHaveTextContent(mensaje);
    expect(screen.getByText("4 viajes")).toBeInTheDocument();
  });

  it.each([
    ["un Error", new Error("Sin conexión."), "Sin conexión."],
    ["otro valor", "sin detalle", "No se pudieron cargar tus viajes."],
  ])("muestra el error si la carga falla con %s", async (_caso, rechazo, mensaje) => {
    api.obtenerViajes.mockRejectedValue(rechazo);

    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent(mensaje);
  });

  it("ignora la respuesta si la pantalla ya se cerró", async () => {
    const carga = deferred();
    api.obtenerViajes.mockReturnValue(carga.promise);
    const error = vi.spyOn(console, "error");

    renderPage().unmount();
    carga.resolve({ viajes });
    await flush();

    expect(error).not.toHaveBeenCalled();
  });

  it("ignora el error si la pantalla ya se cerró", async () => {
    const carga = deferred();
    api.obtenerViajes.mockReturnValue(carga.promise);
    const error = vi.spyOn(console, "error");

    renderPage().unmount();
    carga.reject(new Error("tarde"));
    await flush();

    await waitFor(() => expect(error).not.toHaveBeenCalled());
  });
});
