import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Notice, PrioritySliders, TransportOptions } from "../pages/travelShared";

describe("travelShared", () => {
  it("Notice no muestra nada sin contenido y usa el rol según el tipo", () => {
    const { container, rerender } = render(<Notice>{""}</Notice>);
    expect(container).toBeEmptyDOMElement();

    rerender(<Notice>Algo falló</Notice>);
    expect(screen.getByRole("alert")).toHaveClass("trip-notice", "error");

    rerender(<Notice type="info">Dato útil</Notice>);
    expect(screen.getByRole("status")).toHaveClass("trip-notice", "info");
  });

  it("TransportOptions genera una opción por transporte", () => {
    render(<select aria-label="Transporte"><TransportOptions transportes={[{ tipo: "bus", etiqueta: "Micro" }]} /></select>);

    expect(screen.getByRole("option", { name: "Micro" })).toHaveValue("bus");
  });

  it("PrioritySliders usa los criterios base, muestra 0 si falta un valor y avisa los cambios", () => {
    const onChange = vi.fn();
    render(<PrioritySliders values={{ ahorro: 60, atractivos: 40 }} onChange={onChange} />);

    expect(screen.getByRole("slider", { name: "Minimizar costos" })).toHaveValue("60");
    expect(screen.getByRole("slider", { name: "Reducir kilómetros recorridos" })).toHaveValue("0");
    expect(screen.getByText("Total de prioridades").querySelector("strong")).toHaveTextContent("100%");

    fireEvent.change(screen.getByRole("slider", { name: "Minimizar costos" }), { target: { value: "25" } });
    expect(onChange).toHaveBeenCalledWith("ahorro", 25);
  });
});
