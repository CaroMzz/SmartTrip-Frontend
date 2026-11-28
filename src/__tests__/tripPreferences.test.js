import { describe, expect, it } from "vitest";
import { defaultPriorities, normalizePriorities, rebalancePriorities } from "../pages/tripPreferences";

const suma = (valores) => Object.values(valores).reduce((total, valor) => total + valor, 0);

describe("normalizePriorities", () => {
  it.each([
    ["sin preferencias", undefined],
    ["sin ninguna prioridad conocida", { otra: 50 }],
    ["con todas en cero", { ahorro: 0, distancia: 0 }],
  ])("usa los valores por defecto %s", (_caso, preferencias) => {
    expect(normalizePriorities(preferencias)).toEqual(defaultPriorities);
  });

  it("devuelve una copia de los valores por defecto", () => {
    expect(normalizePriorities()).not.toBe(defaultPriorities);
  });

  it("respeta prioridades que ya suman 100, dentro o fuera de `prioridades`", () => {
    const guardadas = { ahorro: 50, distancia: 10, atractivos: 10, alojamiento: 10, tren: 10, panoramicas: 10 };

    expect(normalizePriorities({ prioridades: guardadas })).toEqual(guardadas);
    expect(normalizePriorities(guardadas)).toEqual(guardadas);
  });

  it("escala a 100 repartiendo los restos y trata valores inválidos o negativos como cero", () => {
    const resultado = normalizePriorities({ ahorro: 1, distancia: 1, atractivos: 1, alojamiento: "x", tren: -5 });

    expect(suma(resultado)).toBe(100);
    expect(resultado).toEqual({ ahorro: 34, distancia: 33, atractivos: 33, alojamiento: 0, tren: 0, panoramicas: 0 });
  });
});

describe("rebalancePriorities", () => {
  it("reparte lo que queda en proporción a los valores anteriores", () => {
    const resultado = rebalancePriorities(defaultPriorities, "ahorro", 50);

    expect(resultado.ahorro).toBe(50);
    expect(suma(resultado)).toBe(100);
  });

  it("toma como cero las prioridades que faltan", () => {
    const resultado = rebalancePriorities({ ahorro: 50, distancia: 50 }, "ahorro", 20);

    expect(resultado).toEqual({ ahorro: 20, distancia: 80, atractivos: 0, alojamiento: 0, tren: 0, panoramicas: 0 });
  });

  it("reparte en partes iguales si las demás prioridades estaban en cero", () => {
    const resultado = rebalancePriorities({ ahorro: 100 }, "ahorro", 40);

    expect(resultado).toEqual({ ahorro: 40, distancia: 12, atractivos: 12, alojamiento: 12, tren: 12, panoramicas: 12 });
  });
});
