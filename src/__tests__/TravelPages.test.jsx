import { beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  BudgetPreferences,
  EditTrip,
  MyTrips,
  NewTrip,
  TripCalendar,
} from "../pages/TravelPages";
import { Profile } from "../pages/AccountPages";

const mockNavigate = vi.fn();
const api = vi.hoisted(() => ({
  actualizarMiPerfil: vi.fn(),
  buscarCiudades: vi.fn(),
  buscarPaises: vi.fn(),
  cerrarSesion: vi.fn(),
  obtenerCalendario: vi.fn(),
  obtenerMiPerfil: vi.fn(),
  obtenerOpciones: vi.fn(),
  obtenerViaje: vi.fn(),
  obtenerViajes: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../api", () => api);

const renderPage = (page) => render(<MemoryRouter>{page}</MemoryRouter>);

const trip = {
  id: "7",
  nombre: "Europa en tren",
  paises: ["Francia", "Espana"],
  paisesDetalle: [{ nombre: "Francia", codigo: "FR" }, { nombre: "Espana", codigo: "ES" }],
  ciudadesObligatorias: [
    { idExterno: "local-FR-paris", nombre: "Paris", pais: "Francia", latitud: 48.85, longitud: 2.35 },
  ],
  fechaInicio: "2027-03-10",
  duracionDias: 6,
  cantidadPersonas: 2,
  presupuestoTotal: 4200,
  transportePreferido: "auto",
  prioridades: { ahorro: 10, distancia: 20, atractivos: 30, alojamiento: 10, tren: 0, panoramicas: 30 },
  estado: "itinerario_seleccionado",
};

describe("Pantallas de viaje", () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
    mockNavigate.mockReset();
    sessionStorage.setItem("smarttrip.currentTripId", "7");
    api.obtenerOpciones.mockRejectedValue(new Error("sin backend"));
    api.obtenerMiPerfil.mockResolvedValue({ usuario: { nombre: "Ana", correo: "ana@example.test", preferencias: { transportePreferido: "tren", prioridades: { ahorro: 60, atractivos: 40 } } } });
    api.buscarCiudades.mockResolvedValue({ resultados: [] });
  });

  it("muestra los países guardados al editar un viaje y permite buscar ciudades (DEF-18)", async () => {
    api.obtenerViaje.mockResolvedValue({ viaje: trip });

    renderPage(<EditTrip />);

    expect(await screen.findByRole("button", { name: "Francia ×" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Espana ×" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Buscar ciudad"), { target: { value: "Barc" } });
    await waitFor(() => expect(api.buscarCiudades).toHaveBeenCalledWith("Barc", ["FR", "ES"]));
  });

  it("busca el código de los países si la API los devuelve solo como texto (DEF-18)", async () => {
    api.obtenerViaje.mockResolvedValue({ viaje: { ...trip, paisesDetalle: undefined } });
    api.buscarPaises.mockImplementation(async (nombre) => ({ resultados: [{ nombre, codigo: nombre === "Francia" ? "FR" : "ES" }] }));

    renderPage(<EditTrip />);

    expect(await screen.findByRole("button", { name: "Francia ×" })).toBeInTheDocument();
    await waitFor(() => expect(api.buscarPaises).toHaveBeenCalledTimes(2));
    fireEvent.change(screen.getByLabelText("Buscar ciudad"), { target: { value: "Madr" } });
    await waitFor(() => expect(api.buscarCiudades).toHaveBeenCalledWith("Madr", ["FR", "ES"]));
  });

  it("precarga presupuesto, transporte y prioridades guardados del viaje (DEF-19)", async () => {
    api.obtenerViaje.mockResolvedValue({ viaje: trip });

    renderPage(<BudgetPreferences />);

    expect(await screen.findByDisplayValue("4200")).toBeInTheDocument();
    expect(screen.getByLabelText("Transporte preferido")).toHaveValue("auto");
    expect(screen.getByRole("slider", { name: "Priorizar rutas panorámicas" })).toHaveValue("30");
  });

  it("muestra los transportes y criterios que define el backend (DEF-28)", async () => {
    api.obtenerViaje.mockResolvedValue({ viaje: trip });
    api.obtenerOpciones.mockResolvedValue({
      transportes: [{ tipo: "tren", etiqueta: "Tren" }, { tipo: "auto", etiqueta: "Auto" }, { tipo: "bus", etiqueta: "Micro" }],
      criterios: [{ clave: "ahorro", etiqueta: "Gastar menos" }, { clave: "distancia", etiqueta: "Reducir kilómetros recorridos" },
        { clave: "atractivos", etiqueta: "Maximizar lugares turísticos" }, { clave: "alojamiento", etiqueta: "Minimizar cambios de alojamiento" },
        { clave: "tren", etiqueta: "Priorizar tren sobre avión" }, { clave: "panoramicas", etiqueta: "Priorizar rutas panorámicas" }],
    });

    renderPage(<BudgetPreferences />);

    expect(await screen.findByRole("option", { name: "Micro" })).toBeInTheDocument();
    expect(await screen.findByRole("slider", { name: "Gastar menos" })).toBeInTheDocument();
  });

  it("ofrece Editar viaje y Presupuesto y preferencias desde las pantallas del viaje (DEF-19, DEF-31)", async () => {
    api.obtenerCalendario.mockResolvedValue({ calendario: [{ fecha: "2027-03-10", ciudad: "Paris", tipo: "estadia" }], ciudades: [] });

    renderPage(<TripCalendar />);

    expect(await screen.findByRole("link", { name: "Editar viaje" })).toHaveAttribute("href", "/edit-trip");
    expect(screen.getByRole("link", { name: "Presupuesto y preferencias" })).toHaveAttribute("href", "/budget-preferences");
  });

  it("permite editar desde la tarjeta un viaje con itinerario elegido (DEF-31)", async () => {
    api.obtenerViajes.mockResolvedValue({ viajes: [trip] });

    renderPage(<MyTrips />);

    fireEvent.click(await screen.findByRole("button", { name: "Editar" }));
    expect(sessionStorage.getItem("smarttrip.currentTripId")).toBe("7");
    expect(mockNavigate).toHaveBeenCalledWith("/edit-trip");
  });

  it("acepta una ciudad, nombres de 150 caracteres y fechas desde hoy (DEF-13, DEF-14, DEF-23)", () => {
    renderPage(<NewTrip />);

    expect(screen.getByLabelText("Nombre del viaje")).toHaveAttribute("maxLength", "150");
    expect(screen.getByText("Elegí entre 1 y 20 del buscador")).toBeInTheDocument();
    const hoy = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    expect(screen.getByLabelText("Fecha de inicio")).toHaveAttribute("min", hoy);
  });

  it("cambia el correo del perfil pidiendo la contraseña actual (DEF-20)", async () => {
    api.actualizarMiPerfil.mockResolvedValue({ usuario: { nombre: "Ana", correo: "ana.nueva@example.test" } });

    renderPage(<Profile />);

    const correo = await screen.findByLabelText("Correo electrónico");
    expect(screen.queryByLabelText("Contraseña actual")).not.toBeInTheDocument();
    fireEvent.change(correo, { target: { value: "Ana.Nueva@example.test" } });
    fireEvent.change(screen.getByLabelText("Contraseña actual"), { target: { value: "mi clave actual segura" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar perfil" }));

    await waitFor(() => expect(api.actualizarMiPerfil).toHaveBeenCalledWith(expect.objectContaining({
      email: "ana.nueva@example.test",
      contrasenaActual: "mi clave actual segura",
    })));
    expect(await screen.findByText(/iniciá sesión con el correo nuevo/)).toBeInTheDocument();
  });

  it("no envía el correo ni pide contraseña si solo cambia el nombre", async () => {
    api.actualizarMiPerfil.mockResolvedValue({ usuario: { nombre: "Ana P." } });

    renderPage(<Profile />);

    fireEvent.change(await screen.findByLabelText("Nombre"), { target: { value: "Ana P." } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar perfil" }));

    await waitFor(() => expect(api.actualizarMiPerfil).toHaveBeenCalled());
    expect(api.actualizarMiPerfil.mock.calls[0][0]).not.toHaveProperty("email");
    expect(api.actualizarMiPerfil.mock.calls[0][0]).not.toHaveProperty("contrasenaActual");
  });
});
