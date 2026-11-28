import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { setCurrentTripId } from "../auth";

const apiMocks = vi.hoisted(() => ({
  obtenerMiPerfil: vi.fn(),
  obtenerViaje: vi.fn(),
  guardarConfiguracion: vi.fn(),
}));

vi.mock("../api", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, ...apiMocks };
});

import { BudgetPreferences } from "../pages/TravelPages";

describe("BudgetPreferences", () => {
  beforeEach(() => {
    sessionStorage.clear();
    setCurrentTripId("trip-1");
    apiMocks.obtenerMiPerfil.mockResolvedValue({
      usuario: {
        preferencias: {
          ahorro: 60,
          distancia: 0,
          atractivos: 40,
          alojamiento: 0,
          tren: 0,
          panoramicas: 0,
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows only available transports and picks the first one when train is unavailable", async () => {
    apiMocks.obtenerViaje.mockResolvedValue({
      viaje: {
        id: "trip-1",
        presupuestoTotal: 3000,
        transportePreferido: "tren",
        transportesDisponibles: ["avion"],
        avisoTransporte: "Solo se puede llegar en avión.",
      },
    });

    render(
      <MemoryRouter>
        <BudgetPreferences />
      </MemoryRouter>
    );

    const transportSelect = await screen.findByLabelText("Transporte preferido");
    expect(transportSelect).toHaveValue("avion");
    expect(screen.getByText("Solo se puede llegar en avión.")).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /tren/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /auto/i })).not.toBeInTheDocument();
  });

  it("asks the user to select a transport again when the saved preference is null", async () => {
    apiMocks.obtenerViaje.mockResolvedValue({
      viaje: {
        id: "trip-1",
        presupuestoTotal: 3000,
        transportePreferido: null,
        transportesDisponibles: ["avion", "auto"],
        avisoTransporte: null,
      },
    });

    render(
      <MemoryRouter>
        <BudgetPreferences />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(
        "El transporte anterior ya no está disponible. Elegí uno nuevo para continuar."
      )
    ).toBeInTheDocument();

    const saveButton = screen.getByRole("button", {
      name: /guardar y comparar itinerarios/i,
    });
    expect(saveButton).toBeDisabled();

    fireEvent.change(await screen.findByRole("combobox"), {
      target: { value: "auto" },
    });
    expect(saveButton).toBeEnabled();
  });

  it("shows the backend reason when saving an unavailable transport fails", async () => {
    apiMocks.obtenerViaje.mockResolvedValue({
      viaje: {
        id: "trip-1",
        presupuestoTotal: 3000,
        transportePreferido: "tren",
        transportesDisponibles: ["tren", "avion"],
        avisoTransporte: null,
      },
    });
    apiMocks.guardarConfiguracion.mockRejectedValue(
      new Error("El tren no está disponible para este viaje.")
    );

    render(
      <MemoryRouter>
        <BudgetPreferences />
      </MemoryRouter>
    );

    fireEvent.click(
      await screen.findByRole("button", {
        name: /guardar y comparar itinerarios/i,
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("El tren no está disponible para este viaje.");
  });
});