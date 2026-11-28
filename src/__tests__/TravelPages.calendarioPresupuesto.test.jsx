import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { TripBudget, TripCalendar } from "../pages/TravelPages";

const api = vi.hoisted(() => ({
  cerrarSesion: vi.fn(),
  obtenerCalendario: vi.fn(),
  obtenerPresupuesto: vi.fn(),
}));
vi.mock("../api", () => api);

const renderPage = (page) => render(<MemoryRouter>{page}</MemoryRouter>);
const fecha = (valor) => new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(new Date(valor));

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  Object.values(api).forEach((fn) => fn.mockReset());
  sessionStorage.setItem("smarttrip.currentTripId", "7");
});

describe("TripCalendar", () => {
  it("sin viaje elegido manda a Mis viajes", () => {
    sessionStorage.clear();

    renderPage(<TripCalendar />);

    expect(screen.getByRole("alert")).toHaveTextContent("Elegí un viaje desde Mis viajes para ver esta información.");
    expect(api.obtenerCalendario).not.toHaveBeenCalled();
  });

  it("muestra cada día con su ciudad, tipo y alojamiento", async () => {
    api.obtenerCalendario.mockResolvedValue({
      ciudades: [{ idExterno: "osm-paris", nombre: "París" }, { id: 5, nombre: "Lyon" }],
      calendario: [
        { fecha: "2027-03-10", ciudad: "osm-paris", tipo: "traslado_y_estadia", alojamiento: "Hotel Central" },
        { fecha: "2027-03-11", ciudad: 5, tipo: "excursion" },
        { fecha: "2027-03-12", ciudad: "ciudad-desconocida", tipo: "estadia" },
        { fecha: null, ciudad: null, tipo: "estadia" },
      ],
    });

    renderPage(<TripCalendar />);

    expect(screen.getByRole("status")).toHaveClass("large");
    const dias = await screen.findAllByRole("article");
    expect(dias[0]).toHaveTextContent(`DÍA 1${fecha("2027-03-10T00:00:00")}`);
    expect(dias[0]).toHaveTextContent("Traslado y estadíaParísAlojamiento: Hotel Central");
    expect(within(dias[1]).getByRole("heading", { name: "Lyon" })).toBeInTheDocument();
    expect(dias[1]).toHaveTextContent("ExcursiónLyonVisita de ida y vuelta; no cambia el alojamiento.");
    expect(dias[2]).toHaveTextContent("Estadíaciudad-desconocida");
    expect(dias[3]).toHaveTextContent("Fecha pendiente");
    expect(within(dias[3]).getByRole("heading", { name: "Día libre" })).toBeInTheDocument();
  });

  it("avisa si el calendario todavía no está disponible", async () => {
    api.obtenerCalendario.mockResolvedValue({});

    renderPage(<TripCalendar />);

    expect(await screen.findByRole("heading", { name: "El calendario todavía no está disponible" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Comparar itinerarios" })).toHaveAttribute("href", "/compare-itineraries");
  });

  it("muestra el error si no puede cargar el calendario", async () => {
    api.obtenerCalendario.mockRejectedValue(new Error("Calendario no disponible."));

    renderPage(<TripCalendar />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Calendario no disponible.");
  });
});

describe("TripBudget", () => {
  const categoria = (nombre) => screen.getByText(nombre).closest(".budget-category");

  it("sin viaje elegido manda a Mis viajes", () => {
    sessionStorage.clear();

    renderPage(<TripBudget />);

    expect(screen.getByRole("alert")).toHaveTextContent("Elegí un viaje desde Mis viajes para ver esta información.");
    expect(api.obtenerPresupuesto).not.toHaveBeenCalled();
  });

  it("muestra el presupuesto excedido, cada categoría y las notas", async () => {
    api.obtenerPresupuesto.mockResolvedValue({
      esEstimacion: true,
      notas: ["Incluye seguro de viaje."],
      presupuesto: {
        presupuestoTotal: 2000,
        totalEstimado: 2500,
        restanteEstimado: -500,
        porcentajeUsado: 125,
        categorias: { transporte: 1000, hospedaje: "800.5", alimentacion: null, actividades: 699.5 },
      },
    });

    renderPage(<TripBudget />);

    expect(screen.getByRole("status")).toHaveClass("large");
    expect(await screen.findByText("Estimaciones en USD. No representan precios reales. El total es estimado.")).toBeInTheDocument();
    expect(screen.getByText("$2000 USD")).toBeInTheDocument();
    expect(screen.getByText("$2500 USD")).toBeInTheDocument();
    expect(screen.getByText("$-500 USD")).toHaveClass("over-budget");
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(categoria("Transporte")).toHaveTextContent("$1000.00 USD");
    expect(categoria("Transporte").querySelector(".thin span")).toHaveStyle({ width: "40%" });
    expect(categoria("Hospedaje")).toHaveTextContent("$800.50 USD");
    expect(categoria("Alimentación")).toHaveTextContent("$0.00 USD");
    expect(categoria("Actividades")).toHaveTextContent("$699.50 USD");
    expect(screen.getByText("Incluye seguro de viaje.")).toBeInTheDocument();
  });

  it("calcula el porcentaje usado si el backend no lo envía", async () => {
    api.obtenerPresupuesto.mockResolvedValue({ esEstimacion: false, presupuesto: { presupuestoTotal: 1000, totalEstimado: 250 } });

    renderPage(<TripBudget />);

    expect(await screen.findByText("Estimaciones en USD. No representan precios reales.")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
    expect(screen.getByText("$— USD")).not.toHaveClass("over-budget");
    expect(categoria("Transporte")).toHaveTextContent("$0.00 USD");
    expect(document.querySelector(".budget-notes")).toBeNull();
  });

  it("muestra ceros si el presupuesto llega vacío", async () => {
    api.obtenerPresupuesto.mockResolvedValue({});

    renderPage(<TripBudget />);

    expect(await screen.findByText("0%")).toBeInTheDocument();
    expect(screen.getAllByText("$— USD")).toHaveLength(3);
    expect(categoria("Actividades").querySelector(".thin span")).toHaveStyle({ width: "0%" });
  });

  it("muestra el error si no puede cargar el presupuesto", async () => {
    api.obtenerPresupuesto.mockRejectedValue(new Error("Presupuesto no disponible."));

    renderPage(<TripBudget />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Presupuesto no disponible.");
    expect(screen.queryByText("Uso del presupuesto")).not.toBeInTheDocument();
  });
});
