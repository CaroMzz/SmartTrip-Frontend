import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { EditTrip, NewTrip } from "../pages/TravelPages";

const mockNavigate = vi.fn();
const api = vi.hoisted(() => ({
  actualizarViaje: vi.fn(),
  buscarCiudades: vi.fn(),
  buscarPaises: vi.fn(),
  cerrarSesion: vi.fn(),
  crearViaje: vi.fn(),
  obtenerViaje: vi.fn(),
}));

vi.mock("../api", () => api);
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderPage = (page) => render(<MemoryRouter>{page}</MemoryRouter>);
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const hoy = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const francia = { nombre: "Francia", codigo: "FR" };
const espana = { nombre: "España", codigo: "ES" };
const paris = { idExterno: "osm-paris", nombre: "París", region: "Île-de-France", pais: "Francia" };
const madrid = { idExterno: "osm-madrid", nombre: "Madrid", pais: "España" };

const buscarPais = (texto) => fireEvent.change(screen.getByLabelText("Buscar país"), { target: { value: texto } });
const buscarCiudad = (texto) => fireEvent.change(screen.getByLabelText("Buscar ciudad"), { target: { value: texto } });
const completarDatos = ({ nombre = "  Europa  ", fecha = "2030-05-01", dias = "5", personas = "3" } = {}) => {
  fireEvent.change(screen.getByLabelText("Nombre del viaje"), { target: { value: nombre } });
  fireEvent.change(screen.getByLabelText("Fecha de inicio"), { target: { value: fecha } });
  fireEvent.change(screen.getByLabelText("Duración en días"), { target: { value: dias } });
  fireEvent.change(screen.getByLabelText("Personas"), { target: { value: personas } });
};
const formulario = () => document.querySelector("form.trip-form");

// Busca un país o ciudad, espera el autocompletado y devuelve la promesa pendiente para resolverla.
async function buscarConPendiente(funcion, buscar, texto) {
  const pendiente = deferred();
  funcion.mockReturnValueOnce(pendiente.promise);
  const llamadas = funcion.mock.calls.length;
  buscar(texto);
  await waitFor(() => expect(funcion).toHaveBeenCalledTimes(llamadas + 1));
  return pendiente;
}

async function elegirPais(pais) {
  const pendiente = await buscarConPendiente(api.buscarPaises, buscarPais, pais.nombre.slice(0, 3));
  pendiente.resolve({ resultados: [pais] });
  fireEvent.click(await screen.findByRole("option", { name: `${pais.nombre} · ${pais.codigo}` }));
}

async function elegirCiudad(ciudad, nombreOpcion) {
  const pendiente = await buscarConPendiente(api.buscarCiudades, buscarCiudad, ciudad.nombre.slice(0, 3));
  pendiente.resolve({ resultados: [ciudad] });
  fireEvent.click(await screen.findByRole("option", { name: nombreOpcion }));
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  Object.values(api).forEach((fn) => fn.mockReset());
  mockNavigate.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("NewTrip: autocompletado de países y ciudades", () => {
  it("busca países desde dos letras, muestra que está buscando y agrega el elegido", async () => {
    renderPage(<NewTrip />);
    expect(screen.getByLabelText("Buscar ciudad")).toBeDisabled();
    expect(screen.getByLabelText("Buscar ciudad")).toHaveAttribute("placeholder", "Primero elegí un país");

    buscarPais("F");
    await flush();
    expect(api.buscarPaises).not.toHaveBeenCalled();

    const pendiente = await buscarConPendiente(api.buscarPaises, buscarPais, " Fr ");
    expect(api.buscarPaises).toHaveBeenLastCalledWith("Fr");
    expect(screen.getByText("Buscando países…")).toBeInTheDocument();
    pendiente.resolve({ resultados: [francia, espana] });
    fireEvent.click(await screen.findByRole("option", { name: "Francia · FR" }));

    expect(screen.getByRole("button", { name: "Francia ×" })).toBeInTheDocument();
    expect(screen.getByLabelText("Buscar país")).toHaveValue("");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Buscar ciudad")).toHaveAttribute("placeholder", "Buscá una ciudad");
  });

  it("no repite países, muestra errores del catálogo y los limpia en la búsqueda siguiente", async () => {
    renderPage(<NewTrip />);
    await elegirPais(francia);

    const sinResultados = await buscarConPendiente(api.buscarPaises, buscarPais, "Es");
    sinResultados.resolve({});
    await flush();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    const conRepetido = await buscarConPendiente(api.buscarPaises, buscarPais, "Esp");
    conRepetido.resolve({ resultados: [francia, espana] });
    fireEvent.click(await screen.findByRole("option", { name: "Francia · FR" }));
    expect(screen.getAllByRole("button", { name: "Francia ×" })).toHaveLength(1);
    expect(screen.getByLabelText("Buscar país")).toHaveValue("Esp");

    const conError = await buscarConPendiente(api.buscarPaises, buscarPais, "Espa");
    conError.reject(new Error("El catálogo no responde."));
    expect(await screen.findByRole("alert")).toHaveTextContent("El catálogo no responde.");

    const otraVez = await buscarConPendiente(api.buscarPaises, buscarPais, "Españ");
    otraVez.resolve({ resultados: [espana] });
    fireEvent.click(await screen.findByRole("option", { name: "España · ES" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    buscarPais("Al");
    buscarPais("A");
    expect(screen.queryByText("Buscando países…")).not.toBeInTheDocument();
  });

  it("descarta respuestas y errores de búsquedas de países que ya se reemplazaron", async () => {
    renderPage(<NewTrip />);

    const vieja = await buscarConPendiente(api.buscarPaises, buscarPais, "Fra");
    const nueva = await buscarConPendiente(api.buscarPaises, buscarPais, "Fran");
    vieja.resolve({ resultados: [espana] });
    nueva.resolve({ resultados: [francia] });
    expect(await screen.findByRole("option", { name: "Francia · FR" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "España · ES" })).not.toBeInTheDocument();

    const conError = await buscarConPendiente(api.buscarPaises, buscarPais, "Franc");
    await buscarConPendiente(api.buscarPaises, buscarPais, "Franci");
    conError.reject(new Error("tarde"));
    await flush();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("busca ciudades en los países elegidos, sin repetir y quitándolas con el país", async () => {
    renderPage(<NewTrip />);
    await elegirPais(francia);
    await elegirPais(espana);

    buscarCiudad("P");
    await flush();
    expect(api.buscarCiudades).not.toHaveBeenCalled();

    const pendiente = await buscarConPendiente(api.buscarCiudades, buscarCiudad, "Par");
    expect(api.buscarCiudades).toHaveBeenLastCalledWith("Par", ["FR", "ES"]);
    expect(screen.getByText("Buscando ciudades…")).toBeInTheDocument();
    pendiente.resolve({ resultados: [paris, madrid] });
    expect(await screen.findByRole("option", { name: "Madrid, España" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("option", { name: "París, Île-de-France, Francia" }));
    expect(screen.getByRole("button", { name: "París ×" })).toBeInTheDocument();

    const sinResultados = await buscarConPendiente(api.buscarCiudades, buscarCiudad, "Ma");
    sinResultados.resolve({});
    await flush();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    const conError = await buscarConPendiente(api.buscarCiudades, buscarCiudad, "Mad");
    conError.reject(new Error("El buscador de ciudades falló."));
    expect(await screen.findByRole("alert")).toHaveTextContent("El buscador de ciudades falló.");

    const conRepetida = await buscarConPendiente(api.buscarCiudades, buscarCiudad, "Madr");
    conRepetida.resolve({ resultados: [paris, madrid] });
    fireEvent.click(await screen.findByRole("option", { name: "París, Île-de-France, Francia" }));
    expect(screen.getAllByRole("button", { name: "París ×" })).toHaveLength(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("option", { name: "Madrid, España" }));

    buscarCiudad("Li");
    buscarCiudad("L");
    expect(screen.queryByText("Buscando ciudades…")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Francia ×" }));
    expect(screen.queryByRole("button", { name: "París ×" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Madrid ×" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Madrid ×" }));
    expect(screen.queryByRole("button", { name: "Madrid ×" })).not.toBeInTheDocument();
  });

  it("descarta respuestas y errores de búsquedas de ciudades que ya se reemplazaron", async () => {
    renderPage(<NewTrip />);
    await elegirPais(francia);

    const vieja = await buscarConPendiente(api.buscarCiudades, buscarCiudad, "Par");
    const nueva = await buscarConPendiente(api.buscarCiudades, buscarCiudad, "Pari");
    vieja.resolve({ resultados: [madrid] });
    nueva.resolve({ resultados: [paris] });
    expect(await screen.findByRole("option", { name: "París, Île-de-France, Francia" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Madrid, España" })).not.toBeInTheDocument();

    const conError = await buscarConPendiente(api.buscarCiudades, buscarCiudad, "Paris");
    await buscarConPendiente(api.buscarCiudades, buscarCiudad, "Paris ");
    conError.reject(new Error("tarde"));
    await flush();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("NewTrip: validación y creación", () => {
  it.each([
    ["sin países", [], [], "Elegí al menos un país del autocompletado."],
    ["sin ciudades", [francia], [], "Elegí al menos una ciudad del buscador."],
  ])("no crea un viaje %s", async (_caso, paises, ciudades, mensaje) => {
    renderPage(<NewTrip />);
    for (const pais of paises) await elegirPais(pais);
    for (const ciudad of ciudades) await elegirCiudad(ciudad.ciudad, ciudad.opcion);
    completarDatos();

    fireEvent.submit(formulario());

    expect(await screen.findByRole("alert")).toHaveTextContent(mensaje);
    expect(api.crearViaje).not.toHaveBeenCalled();
  });

  it("pide al menos un día por ciudad", async () => {
    renderPage(<NewTrip />);
    await elegirPais(francia);
    await elegirPais(espana);
    await elegirCiudad(paris, "París, Île-de-France, Francia");
    await elegirCiudad(madrid, "Madrid, España");
    completarDatos({ dias: "1" });
    expect(screen.getByLabelText("Duración en días")).toHaveAttribute("min", "2");

    fireEvent.submit(formulario());

    expect(await screen.findByRole("alert")).toHaveTextContent("La duración debe ser de al menos un día por ciudad.");
  });

  it("crea el viaje, lo deja como actual y sigue con el presupuesto", async () => {
    const creacion = deferred();
    api.crearViaje.mockReturnValue(creacion.promise);
    renderPage(<NewTrip />);
    expect(screen.getByLabelText("Fecha de inicio")).toHaveAttribute("min", hoy());
    expect(screen.getByLabelText("Personas")).toHaveValue(1);
    await elegirPais(francia);
    await elegirCiudad(paris, "París, Île-de-France, Francia");
    completarDatos();

    fireEvent.click(screen.getByRole("button", { name: "Continuar con presupuesto" }));
    expect(screen.getByRole("button", { name: "Guardando…" })).toBeDisabled();
    creacion.resolve({ viaje: { _id: 99 } });

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/budget-preferences"));
    expect(sessionStorage.getItem("smarttrip.currentTripId")).toBe("99");
    expect(api.crearViaje).toHaveBeenCalledWith({
      nombre: "Europa",
      paises: [francia],
      ciudadesObligatorias: [paris],
      fechaInicio: "2030-05-01",
      duracionDias: 5,
      cantidadPersonas: 3,
    });
  });

  it("avisa si el servidor crea el viaje sin devolver su identificador", async () => {
    api.crearViaje.mockResolvedValue({ viaje: {} });
    renderPage(<NewTrip />);
    await elegirPais(francia);
    await elegirCiudad(paris, "París, Île-de-France, Francia");
    completarDatos();

    fireEvent.submit(formulario());

    expect(await screen.findByRole("alert")).toHaveTextContent("El servidor creó el viaje sin devolver su identificador.");
    expect(screen.getByRole("button", { name: "Continuar con presupuesto" })).toBeEnabled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("muestra junto a cada campo los errores que devuelve el servidor", async () => {
    api.crearViaje.mockRejectedValue({
      errors: {
        nombre: "El nombre ya existe.",
        paises: { mensaje: "País no admitido." },
        ciudadesObligatorias: { message: "Ciudad fuera del país." },
        fechaInicio: {},
        duracionDias: "Máximo 60 días.",
        cantidadPersonas: "Máximo 20 personas.",
      },
    });
    renderPage(<NewTrip />);
    await elegirPais(francia);
    await elegirCiudad(paris, "París, Île-de-France, Francia");
    completarDatos();

    fireEvent.submit(formulario());

    for (const mensaje of ["El nombre ya existe.", "País no admitido.", "Ciudad fuera del país.", "Máximo 60 días.", "Máximo 20 personas."]) {
      expect(await screen.findByText(mensaje)).toHaveClass("trip-field-error");
    }
    expect(document.querySelectorAll(".trip-field-error")).toHaveLength(5);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("EditTrip", () => {
  const viaje = {
    id: "7",
    nombre: "Europa",
    paises: ["Francia"],
    paisesDetalle: [francia],
    ciudadesObligatorias: [paris],
    fechaInicio: "2030-05-01T00:00:00.000Z",
    duracionDias: 4,
    cantidadPersonas: 2,
  };

  beforeEach(() => {
    sessionStorage.setItem("smarttrip.currentTripId", "7");
  });

  it("sin viaje elegido manda a Mis viajes", () => {
    sessionStorage.clear();

    renderPage(<EditTrip />);

    expect(screen.getByRole("alert")).toHaveTextContent("Elegí un viaje desde Mis viajes para ver esta información.");
    expect(screen.getByRole("link", { name: "Ir a Mis viajes" })).toHaveAttribute("href", "/my-trips");
    expect(api.obtenerViaje).not.toHaveBeenCalled();
  });

  it("no muestra el aviso si el viaje quedó elegido mientras se armaba la pantalla", () => {
    sessionStorage.clear();
    const getItem = Storage.prototype.getItem;
    let primeraLectura = true;
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(function leer(clave) {
      if (clave === "smarttrip.currentTripId") {
        if (primeraLectura) {
          primeraLectura = false;
          return null;
        }
        return "7";
      }
      return getItem.call(this, clave);
    });

    renderPage(<EditTrip />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir a Mis viajes" })).toBeInTheDocument();
  });

  it("muestra el error si no puede cargar el viaje", async () => {
    api.obtenerViaje.mockRejectedValue(new Error("Viaje no encontrado."));

    renderPage(<EditTrip />);

    expect(screen.getByRole("status")).toHaveClass("large");
    expect(await screen.findByRole("alert")).toHaveTextContent("Viaje no encontrado.");
  });

  it("no llama al backend si se guarda sin cambios y ofrece volver a generar", async () => {
    api.obtenerViaje.mockResolvedValue({ viaje });
    renderPage(<EditTrip />);

    expect(await screen.findByLabelText("Nombre del viaje")).toHaveValue("Europa");
    expect(screen.getByLabelText("Fecha de inicio")).toHaveValue("2030-05-01");
    expect(screen.getByLabelText("Fecha de inicio")).toHaveAttribute("min", hoy());
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(await screen.findByText("Cambios guardados. Podés generar nuevas alternativas cuando quieras.")).toBeInTheDocument();
    expect(api.actualizarViaje).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Volver a generar itinerarios" }));
    expect(mockNavigate).toHaveBeenCalledWith("/compare-itineraries");
  });

  it("envía solo los campos que cambiaron", async () => {
    api.obtenerViaje.mockResolvedValue(viaje);
    api.actualizarViaje.mockResolvedValue({});
    renderPage(<EditTrip />);

    fireEvent.change(await screen.findByLabelText("Nombre del viaje"), { target: { value: "Europa 2030" } });
    fireEvent.change(screen.getByLabelText("Personas"), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(await screen.findByText("Cambios guardados. Podés generar nuevas alternativas cuando quieras.")).toBeInTheDocument();
    expect(api.actualizarViaje).toHaveBeenCalledWith("7", { nombre: "Europa 2030", cantidadPersonas: 4 });
  });

  it("respeta una fecha de inicio pasada como mínimo del campo", async () => {
    api.obtenerViaje.mockResolvedValue({ viaje: { ...viaje, fechaInicio: "2020-01-15" } });

    renderPage(<EditTrip />);

    expect(await screen.findByLabelText("Fecha de inicio")).toHaveAttribute("min", "2020-01-15");
  });

  it("completa el código de los países que el backend manda solo como texto", async () => {
    const respuestas = {
      Francia: () => Promise.resolve({ resultados: [{ nombre: "FRANCIA", codigo: "FR" }] }),
      Atlantis: () => Promise.resolve({}),
      Mordor: () => Promise.resolve({ resultados: [{ nombre: "Gondor", codigo: "GD" }] }),
      Narnia: () => Promise.reject(new Error("sin catálogo")),
    };
    api.buscarPaises.mockImplementation((nombre) => respuestas[nombre]());
    api.obtenerViaje.mockResolvedValue({
      viaje: { ...viaje, paisesDetalle: undefined, paises: ["Francia", espana, "Atlantis", "Mordor", "Narnia"] },
    });
    api.actualizarViaje.mockResolvedValue({});
    renderPage(<EditTrip />);

    await waitFor(() => expect(api.buscarPaises).toHaveBeenCalledTimes(4));
    expect(api.buscarPaises).not.toHaveBeenCalledWith("España");
    fireEvent.change(screen.getByLabelText("Buscar ciudad"), { target: { value: "Lyo" } });
    await waitFor(() => expect(api.buscarCiudades).toHaveBeenCalledWith("Lyo", ["FR", "ES"]));
    expect(api.buscarPaises).toHaveBeenCalledTimes(4);

    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() => expect(api.actualizarViaje).toHaveBeenCalled());
    expect(api.actualizarViaje.mock.calls[0][1].paises).toEqual([
      { nombre: "FRANCIA", codigo: "FR" },
      espana,
      { nombre: "Atlantis", codigo: null },
      { nombre: "Mordor", codigo: null },
      { nombre: "Narnia", codigo: null },
    ]);
  });

  it("no busca ciudades si ningún país elegido tiene código", async () => {
    api.buscarPaises.mockResolvedValue({ resultados: [] });
    api.obtenerViaje.mockResolvedValue({ viaje: { ...viaje, paisesDetalle: undefined, paises: ["Atlantis"] } });
    renderPage(<EditTrip />);

    fireEvent.change(await screen.findByLabelText("Buscar ciudad"), { target: { value: "Atl" } });
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(api.buscarCiudades).not.toHaveBeenCalled();
  });

  it("parte de valores vacíos si el viaje no trae datos", async () => {
    api.obtenerViaje.mockResolvedValue({ viaje: { id: "7" } });

    renderPage(<EditTrip />);

    expect(await screen.findByLabelText("Nombre del viaje")).toHaveValue("");
    expect(screen.getByLabelText("Fecha de inicio")).toHaveValue("");
    expect(screen.getByLabelText("Duración en días")).toHaveValue(null);
    expect(screen.getByLabelText("Personas")).toHaveValue(1);
    expect(screen.getByLabelText("Buscar ciudad")).toBeDisabled();
  });

  it("no deja pasar de 10 países ni de 20 ciudades", async () => {
    const paises = Array.from({ length: 10 }, (_, i) => ({ nombre: `País ${i}`, codigo: `P${i}` }));
    const ciudades = Array.from({ length: 20 }, (_, i) => ({ idExterno: `c${i}`, nombre: `Ciudad ${i}`, pais: "País 0" }));
    api.obtenerViaje.mockResolvedValue({ viaje: { ...viaje, paisesDetalle: paises, ciudadesObligatorias: ciudades, duracionDias: 20 } });
    renderPage(<EditTrip />);
    await screen.findByRole("button", { name: "País 9 ×" });

    const pais = await buscarConPendiente(api.buscarPaises, buscarPais, "Esp");
    pais.resolve({ resultados: [espana] });
    fireEvent.click(await screen.findByRole("option", { name: "España · ES" }));
    expect(screen.queryByRole("button", { name: "España ×" })).not.toBeInTheDocument();

    const ciudad = await buscarConPendiente(api.buscarCiudades, buscarCiudad, "Mad");
    ciudad.resolve({ resultados: [madrid] });
    fireEvent.click(await screen.findByRole("option", { name: "Madrid, España" }));
    expect(screen.queryByRole("button", { name: "Madrid ×" })).not.toBeInTheDocument();
  });
});
