import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { setCurrentTripId } from "../auth";

const apiMocks = vi.hoisted(() => ({
  obtenerMiPerfil: vi.fn(),
  obtenerViaje: vi.fn(),
  guardarConfiguracion: vi.fn(),
  verificarAutoDisponible: vi.fn(),
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
    apiMocks.verificarAutoDisponible.mockRejectedValue(
      new Error("No se pudo comprobar la ruta")
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("disables saving while loading and shows only airplane when Auto is unverified", async () => {
    let resolveTrip;
    apiMocks.obtenerViaje.mockReturnValue(
      new Promise((resolve) => {
        resolveTrip = resolve;
      })
    );

    render(
      <MemoryRouter>
        <BudgetPreferences />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Comprobando rutas por carretera…")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /guardar y comparar itinerarios/i })
    ).toBeDisabled();

    await act(async () => {
      resolveTrip({
        viaje: {
          id: "trip-1",
          presupuestoTotal: 3000,
        },
      });
    });

    expect(
      await screen.findByText(
        "No pudimos comprobar la ruta. Por ahora, elegí avión."
      )
    ).toBeInTheDocument();
    expect(apiMocks.verificarAutoDisponible).toHaveBeenCalledWith("trip-1");
    expect(screen.getByRole("button", { name: /avión/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /auto/i })).not.toBeInTheDocument();
  });
});