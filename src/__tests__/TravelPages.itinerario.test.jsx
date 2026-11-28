import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Itinerary } from "../pages/TravelPages";

const api = vi.hoisted(() => ({
  cerrarSesion: vi.fn(),
  obtenerDestino: vi.fn(),
  obtenerItinerario: vi.fn(),
}));
const mapa = vi.hoisted(() => ({ fitBounds: vi.fn(), setView: vi.fn() }));

vi.mock("../api", () => api);

// Leaflet necesita medidas reales del navegador: el mapa se reemplaza por elementos simples que
// exponen las mismas props (centro, líneas y eventos de los marcadores).
vi.mock("react-leaflet", async () => {
  const { useEffect } = await vi.importActual("react");
  function Marker({ children, title, position, eventHandlers }) {
    useEffect(() => {
      eventHandlers.add({ target: { getElement: () => document.querySelector(`[data-marcador="${title}"]`) } });
    }, [eventHandlers, title]);
    return (
      <div data-marcador={title} data-position={JSON.stringify(position)}>
        <button type="button" onClick={eventHandlers.click}>{`Marcador ${title}`}</button>
        {children}
      </div>
    );
  }
  return {
    MapContainer: ({ children, center }) => <div data-testid="mapa" data-center={JSON.stringify(center)}>{children}</div>,
    Marker,
    Polyline: ({ positions }) => <div data-testid="linea" data-positions={JSON.stringify(positions)} />,
    Popup: ({ children }) => <div>{children}</div>,
    TileLayer: () => null,
    useMap: () => mapa,
  };
});

const renderPage = () => render(<MemoryRouter><Itinerary /></MemoryRouter>);
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const botonesCiudades = () => document.querySelectorAll(".itinerary-cities button");
const ficha = () => screen.queryByRole("dialog", { name: "Ficha de ciudad" });

const paris = { idExterno: "osm-paris", nombre: "París", pais: "Francia", latitud: 48.85, longitud: 2.35 };
const lyon = { nombre: "Lyon", pais: "Francia", latitud: "45.76", longitud: "4.83" };
const sinCoordenadas = { idExterno: "osm-x", nombre: "Sin coordenadas", pais: "Francia", latitud: undefined, longitud: 1 };
const sinNombre = { latitud: 1, longitud: 1 };

const itinerario = {
  ciudades: [paris, lyon, sinCoordenadas, sinNombre],
  notas: ["La distancia es aproximada."],
  tramos: [
    { id: "t1", origen: "París", destino: "Lyon", transporte: "tren", distanciaKm: 465, tiempoHoras: 2, costoUsd: 80 },
    { origen: "Lyon", destino: "Annecy", transporte: "auto", tipo: "excursion", distanciaKm: 140, tiempoHoras: 1.8, costoUsd: 30 },
  ],
};

describe("Itinerary", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    Object.values(api).forEach((fn) => fn.mockReset());
    mapa.fitBounds.mockReset();
    mapa.setView.mockReset();
    sessionStorage.setItem("smarttrip.currentTripId", "7");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sin viaje elegido manda a Mis viajes", () => {
    sessionStorage.clear();

    renderPage();

    expect(screen.getByRole("alert")).toHaveTextContent("Elegí un viaje desde Mis viajes para ver esta información.");
    expect(api.obtenerItinerario).not.toHaveBeenCalled();
  });

  it("muestra el error si no puede cargar el itinerario", async () => {
    api.obtenerItinerario.mockRejectedValue(new Error("Todavía no elegiste un itinerario."));

    renderPage();

    expect(screen.getByRole("status")).toHaveClass("large");
    expect(await screen.findByRole("alert")).toHaveTextContent("Todavía no elegiste un itinerario.");
    expect(screen.queryByTestId("mapa")).not.toBeInTheDocument();
  });

  it("dibuja la ruta, encuadra todas las ciudades y lista los tramos", async () => {
    api.obtenerItinerario.mockResolvedValue({
      itinerario: itinerario,
      geometria: {
        type: "Feature",
        geometry: { type: "MultiLineString", coordinates: [[[2.35, 48.85], [4.83, 45.76]], [[9, 9]]] },
      },
    });

    renderPage();

    const mapaRenderizado = await screen.findByTestId("mapa");
    expect(mapaRenderizado).toHaveAttribute("data-center", JSON.stringify([48.85, 2.35]));
    expect(screen.getAllByTestId("linea")).toHaveLength(1);
    expect(screen.getByTestId("linea")).toHaveAttribute("data-positions", JSON.stringify([[48.85, 2.35], [45.76, 4.83]]));
    expect(mapa.fitBounds).toHaveBeenCalledWith([[48.85, 2.35], [45.76, 4.83], [1, 1]], { padding: [36, 36] });
    expect(screen.getAllByRole("button", { name: /^Marcador / })).toHaveLength(3);
    expect(screen.queryByRole("button", { name: "Marcador Sin coordenadas" })).not.toBeInTheDocument();
    expect(document.querySelector('[data-marcador="París"]')).toHaveAttribute("aria-label", "París: ver ficha");
    expect(screen.getByText("Mapa y datos geográficos · © OpenStreetMap contributors")).toBeInTheDocument();
    expect(botonesCiudades()).toHaveLength(4);
    expect(botonesCiudades()[0]).toHaveTextContent("01ParísFrancia");
    expect(screen.getByText("La distancia es aproximada.")).toBeInTheDocument();
    const tramos = document.querySelectorAll(".itinerary-legs article");
    expect(tramos[0]).toHaveTextContent("01París → Lyontren465 km · 2 h$80 USD");
    expect(tramos[1]).toHaveTextContent("Lyon → Annecyauto · Excursión, sin cambio de alojamiento140 km · 1.8 h$30 USD");
    expect(screen.getByRole("link", { name: "Ver calendario" })).toHaveAttribute("href", "/trip-calendar");
    expect(screen.getByRole("link", { name: "Ver presupuesto" })).toHaveAttribute("href", "/trip-budget");
  });

  it("toma la geometría del itinerario y centra el mapa en la única ciudad", async () => {
    api.obtenerItinerario.mockResolvedValue({
      itinerario: {
        ciudades: [paris],
        tramos: [],
        geometria: { type: "LineString", coordinates: [[2.35, 48.85], [2.4, 48.9]], atribucionMapa: "OpenRouteService" },
      },
    });

    renderPage();

    expect(await screen.findByText("OpenRouteService · © OpenStreetMap contributors")).toBeInTheDocument();
    expect(screen.getByTestId("linea")).toHaveAttribute("data-positions", JSON.stringify([[48.85, 2.35], [48.9, 2.4]]));
    expect(mapa.setView).toHaveBeenCalledWith([48.85, 2.35], 9);
    expect(mapa.fitBounds).not.toHaveBeenCalled();
  });

  it("sin ciudades ubicables ni geometría usa el centro por defecto", async () => {
    api.obtenerItinerario.mockResolvedValue({ ciudades: [sinCoordenadas] });

    renderPage();

    expect(await screen.findByTestId("mapa")).toHaveAttribute("data-center", JSON.stringify([-34.6037, -58.3816]));
    expect(screen.queryByTestId("linea")).not.toBeInTheDocument();
    expect(mapa.fitBounds).not.toHaveBeenCalled();
    expect(mapa.setView).not.toHaveBeenCalled();
    expect(document.querySelectorAll(".itinerary-legs article")).toHaveLength(0);
  });

  it("solo abre la ficha de ciudades que tienen identificador", async () => {
    api.obtenerItinerario.mockResolvedValue({ itinerario });
    api.obtenerDestino.mockReturnValue(new Promise(() => {}));
    renderPage();
    await screen.findByTestId("mapa");

    fireEvent.click(screen.getByRole("button", { name: "Marcador Lyon" }));
    fireEvent.click(screen.getByRole("button", { name: "Lyon · Ver ficha" }));
    fireEvent.click(botonesCiudades()[1]);
    expect(ficha()).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Marcador París" }));
    expect(ficha()).toBeInTheDocument();
    expect(within(ficha()).getByRole("status")).toHaveTextContent("Cargando…");
    expect(within(ficha()).getByRole("status")).not.toHaveClass("large");
    fireEvent.click(screen.getByRole("button", { name: "Cerrar ficha" }));
    expect(ficha()).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "París · Ver ficha" }));
    expect(ficha()).toBeInTheDocument();
    fireEvent.click(ficha());
    expect(ficha()).toBeInTheDocument();
    fireEvent.click(document.querySelector(".city-modal-backdrop"));
    expect(ficha()).toBeNull();

    fireEvent.click(botonesCiudades()[0]);
    expect(ficha()).toBeInTheDocument();
    expect(api.obtenerDestino).toHaveBeenCalledWith("osm-paris", { nombre: "París", pais: "Francia" });
  });
});

describe("Itinerary: ficha de ciudad", () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
    sessionStorage.setItem("smarttrip.currentTripId", "7");
    api.obtenerItinerario.mockResolvedValue({ itinerario: { ciudades: [paris] } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function abrirFicha() {
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Marcador París" }));
    return ficha();
  }

  it("muestra descripción, avisos, fotos y lugares por categoría con sus fuentes", async () => {
    api.obtenerDestino.mockResolvedValue({
      destino: {
        nombre: "París",
        descripcion: "La ciudad luz.",
        tiempoSugeridoDias: 3,
        avisos: ["Hay huelga de transporte.", "Museos cerrados los lunes."],
        fotos: [{ url: "torre.jpg", textoAlternativo: "Torre Eiffel de noche" }, { url: "sena.jpg" }],
        categoriasSinDatos: ["monumentos"],
        fuenteContenido: "Wikivoyage",
        puntosInteres: {
          atracciones: [
            { id: "a1", nombre: "Torre Eiffel", descripcion: "Estructura de hierro.", fuenteContenido: "Wikipedia", urlFuente: "https://example.test/torre" },
            { nombre: "Louvre", fuenteContenido: "OpenStreetMap" },
            { nombre: "Montmartre" },
          ],
          museos: [{ urlFuente: "https://example.test/museo" }],
          monumentos: [{ nombre: "Arco del Triunfo" }],
        },
      },
    });

    const dialogo = await abrirFicha();

    expect(await within(dialogo).findByRole("heading", { name: "París" })).toBeInTheDocument();
    expect(within(dialogo).getByText("La ciudad luz.")).toBeInTheDocument();
    expect(within(dialogo).getByText("Tiempo sugerido: 3 días")).toBeInTheDocument();
    expect(within(dialogo).getByRole("status")).toHaveTextContent("Hay huelga de transporte. Museos cerrados los lunes.");
    expect(within(dialogo).getByRole("img", { name: "Torre Eiffel de noche" })).toHaveAttribute("src", "torre.jpg");
    expect(within(dialogo).getByRole("img", { name: "Vista de París" })).toHaveAttribute("src", "sena.jpg");
    const seccion = (titulo) => within(dialogo).getByRole("heading", { name: titulo }).closest("section");
    expect(seccion("Atracciones")).toHaveTextContent("Torre EiffelEstructura de hierro.Fuente: Wikipedia Ver fuente");
    expect(within(seccion("Atracciones")).getByRole("link", { name: "Ver fuente" })).toHaveAttribute("href", "https://example.test/torre");
    expect(seccion("Atracciones")).toHaveTextContent("LouvreFuente: OpenStreetMap");
    expect(seccion("Atracciones").querySelectorAll("small")).toHaveLength(2);
    expect(within(seccion("Museos")).getByRole("link", { name: "Ver fuente" })).toBeInTheDocument();
    expect(seccion("Monumentos")).toHaveTextContent("Sin datos disponibles");
    expect(seccion("Parques")).toHaveTextContent("Sin datos disponibles");
    expect(seccion("Restaurantes")).toHaveTextContent("Sin datos disponibles");
    expect(within(dialogo).getByText("Fuente del contenido: Wikivoyage")).toBeInTheDocument();
  });

  it("completa con valores por defecto si el destino llega con pocos datos", async () => {
    api.obtenerDestino.mockResolvedValue({
      nombre: "París",
      avisos: "Información parcial.",
      categoriasSinDatos: { atracciones: true },
      puntosInteres: { atracciones: [{ nombre: "Torre Eiffel" }], museos: [{ nombre: "Louvre" }] },
    });

    const dialogo = await abrirFicha();

    expect(await within(dialogo).findByText("Descripción no disponible.")).toBeInTheDocument();
    expect(within(dialogo).getByText("Tiempo sugerido: — días")).toBeInTheDocument();
    expect(within(dialogo).getByRole("status")).toHaveTextContent("Información parcial.");
    expect(within(dialogo).queryByRole("img")).not.toBeInTheDocument();
    const seccion = (titulo) => within(dialogo).getByRole("heading", { name: titulo }).closest("section");
    expect(seccion("Atracciones")).toHaveTextContent("Sin datos disponibles");
    expect(seccion("Museos")).toHaveTextContent("Louvre");
    expect(dialogo.querySelector(".city-source")).toBeNull();
  });

  it("no muestra avisos ni lugares si el destino no los trae", async () => {
    api.obtenerDestino.mockResolvedValue({ destino: { nombre: "París" } });

    const dialogo = await abrirFicha();

    await within(dialogo).findByRole("heading", { name: "París" });
    expect(within(dialogo).queryByRole("status")).not.toBeInTheDocument();
    expect(within(dialogo).getAllByText("Sin datos disponibles")).toHaveLength(5);
  });

  it("muestra el error si no puede cargar el destino", async () => {
    api.obtenerDestino.mockRejectedValue(new Error("Destino no encontrado."));

    const dialogo = await abrirFicha();

    expect(await within(dialogo).findByRole("alert")).toHaveTextContent("Destino no encontrado.");
  });

  it.each([
    ["la respuesta", (carga) => carga.resolve({ destino: { nombre: "París" } })],
    ["el error", (carga) => carga.reject(new Error("tarde"))],
  ])("ignora %s si la ficha ya se cerró", async (_caso, terminar) => {
    const carga = deferred();
    api.obtenerDestino.mockReturnValue(carga.promise);
    const error = vi.spyOn(console, "error");
    await abrirFicha();

    fireEvent.click(screen.getByRole("button", { name: "Cerrar ficha" }));
    terminar(carga);
    await flush();

    await waitFor(() => expect(ficha()).toBeNull());
    expect(error).not.toHaveBeenCalled();
  });
});
