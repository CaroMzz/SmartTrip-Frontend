import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Faq from "../pages/faq/Faq";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const buscador = () => screen.getByPlaceholderText(/buscar por tarea o pregunta/i);

describe("Faq: navegación y filtros", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    render(<MemoryRouter><Faq /></MemoryRouter>);
  });

  it("la marca lleva al inicio y Volver regresa a la página anterior", () => {
    fireEvent.click(screen.getByText("SmartTrip", { selector: ".faq-brand-name" }));
    expect(mockNavigate).toHaveBeenCalledWith("/");

    fireEvent.click(screen.getByRole("button", { name: "← Volver" }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("busca también por el nombre de la categoría y limpia la búsqueda", () => {
    fireEvent.change(buscador(), { target: { value: "  CUENTA y perfil " } });

    expect(screen.getByRole("button", { name: /¿Cómo creo una cuenta nueva en SmartTrip\?/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /¿Qué es SmartTrip/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "✕" }));

    expect(buscador()).toHaveValue("");
    expect(screen.queryByRole("button", { name: "✕" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /¿Qué es SmartTrip/ })).toBeInTheDocument();
  });

  it("desde el estado vacío vuelve a mostrar todas las preguntas y categorías", () => {
    fireEvent.click(screen.getByRole("button", { name: "General" }));
    fireEvent.change(buscador(), { target: { value: "presupuesto" } });
    expect(screen.getByText(/no se encontraron preguntas/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ver todas las preguntas" }));

    expect(buscador()).toHaveValue("");
    expect(screen.getByRole("button", { name: "Todas las preguntas" })).toHaveClass("active");
    expect(screen.getAllByRole("article")).toHaveLength(12);
  });

  it("cada respuesta se puede abrir", () => {
    screen.getAllByRole("button", { expanded: false }).forEach((pregunta) => fireEvent.click(pregunta));

    expect(screen.queryAllByRole("button", { expanded: false })).toHaveLength(0);
    expect(screen.getByText(/modo de contingencia \(fallback\)/)).toBeInTheDocument();
  });
});
