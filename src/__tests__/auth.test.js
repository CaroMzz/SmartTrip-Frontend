import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CURRENT_TRIP_KEY,
  TOKEN_KEY,
  USER_KEY,
  clearSession,
  getCurrentTripId,
  getStoredUser,
  getToken,
  saveSession,
  setCurrentTripId,
  updateStoredUser,
} from "../auth";

describe("auth (sesión en el navegador)", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("guarda el token y el usuario, y avisa que el usuario cambió", () => {
    const listener = vi.fn();
    window.addEventListener("smarttrip:user-updated", listener);

    saveSession("token-1", { nombre: "Ana" });

    expect(getToken()).toBe("token-1");
    expect(getStoredUser()).toEqual({ nombre: "Ana" });
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener("smarttrip:user-updated", listener);
  });

  it("borra el usuario guardado si la sesión nueva no trae uno", () => {
    updateStoredUser({ nombre: "Ana" });

    saveSession("token-2", null);

    expect(getToken()).toBe("token-2");
    expect(localStorage.getItem(USER_KEY)).toBeNull();
    expect(getStoredUser()).toBeNull();
  });

  it("descarta un usuario guardado que no es JSON válido", () => {
    localStorage.setItem(USER_KEY, "{roto");

    expect(getStoredUser()).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });

  it("recuerda el viaje actual y lo olvida al cerrar la sesión", () => {
    saveSession("token-3", { nombre: "Ana" });
    setCurrentTripId("42");
    expect(getCurrentTripId()).toBe("42");

    clearSession();

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
    expect(sessionStorage.getItem(CURRENT_TRIP_KEY)).toBeNull();
  });
});
