import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Faq from "../pages/faq/Faq";

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Faq Component (Centro de Ayuda - ISO/IEC/IEEE 26514)", () => {
  it("renderiza el título principal y la insignia normativa", () => {
    renderWithRouter(<Faq />);

    expect(
      screen.getByRole("heading", { name: /preguntas frecuentes y guía de tareas/i })
    ).toBeInTheDocument();

    const badges = screen.getAllByText("ISO/IEC/IEEE 26514");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("renderiza las preguntas iniciales y la primera abierta por defecto", () => {
    renderWithRouter(<Faq />);

    // La primera pregunta debe estar en pantalla
    expect(
      screen.getByText(/¿Qué es SmartTrip y cuál es su objetivo principal\?/i)
    ).toBeInTheDocument();

    // El contenido de la primera debe estar visible
    expect(
      screen.getByText(/motor inteligente de recomendación y planificación/i)
    ).toBeInTheDocument();
  });

  it("permite abrir y cerrar un acordeón al hacer clic", () => {
    renderWithRouter(<Faq />);

    const botonPregunta = screen.getByRole("button", {
      name: /¿Cómo creo una cuenta nueva en SmartTrip\?/i,
    });

    // Inicialmente no está expandido
    expect(botonPregunta).toHaveAttribute("aria-expanded", "false");

    // Al hacer clic, se abre
    fireEvent.click(botonPregunta);
    expect(botonPregunta).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/mínimo 15 caracteres/i)).toBeInTheDocument();

    // Al hacer clic nuevamente, se cierra
    fireEvent.click(botonPregunta);
    expect(botonPregunta).toHaveAttribute("aria-expanded", "false");
  });

  it("filtra preguntas en tiempo real utilizando el buscador", () => {
    renderWithRouter(<Faq />);

    const searchInput = screen.getByPlaceholderText(/buscar por tarea o pregunta/i);

    // Escribir "presupuesto"
    fireEvent.change(searchInput, { target: { value: "presupuesto" } });

    // Debe mostrar la pregunta de presupuesto
    expect(
      screen.getByText(/¿Cómo se calcula y desglosa el presupuesto estimado\?/i)
    ).toBeInTheDocument();

    // No debe mostrar preguntas no relacionadas
    expect(
      screen.queryByText(/¿Cómo creo una cuenta nueva en SmartTrip\?/i)
    ).not.toBeInTheDocument();
  });

  it("muestra mensaje de estado vacío si la búsqueda no arroja resultados", () => {
    renderWithRouter(<Faq />);

    const searchInput = screen.getByPlaceholderText(/buscar por tarea o pregunta/i);
    fireEvent.change(searchInput, { target: { value: "terminoque_no_existe_xyz" } });

    expect(
      screen.getByText(/no se encontraron preguntas que coincidan con tu búsqueda/i)
    ).toBeInTheDocument();
  });

  it("filtra preguntas al seleccionar una categoría", () => {
    renderWithRouter(<Faq />);

    const pillProblemas = screen.getByRole("button", { name: "Solución de Problemas" });
    fireEvent.click(pillProblemas);

    expect(
      screen.getByText(/Errores comunes de validación y cómo resolverlos/i)
    ).toBeInTheDocument();

    expect(
      screen.queryByText(/¿Qué requisitos de sistema o navegador necesito/i)
    ).not.toBeInTheDocument();
  });
});
