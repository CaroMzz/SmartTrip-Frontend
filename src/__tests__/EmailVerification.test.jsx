import { StrictMode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import EmailVerification from "../pages/email-verification/EmailVerification";

const api = vi.hoisted(() => ({ confirmarCorreo: vi.fn(), reenviarVerificacion: vi.fn() }));
vi.mock("../api", () => api);

const renderEn = (entrada) => render(
  <StrictMode>
    <MemoryRouter initialEntries={[entrada]}>
      <EmailVerification />
    </MemoryRouter>
  </StrictMode>
);

const reenviar = () => fireEvent.click(screen.getByRole("button", { name: "Reenviar enlace" }));

describe("EmailVerification", () => {
  beforeEach(() => {
    api.confirmarCorreo.mockReset();
    api.reenviarVerificacion.mockReset();
  });

  describe("con un enlace de confirmación", () => {
    it("confirma el correo una sola vez y ofrece iniciar sesión", async () => {
      api.confirmarCorreo.mockResolvedValue({ mensaje: "Listo, correo confirmado." });

      renderEn("/confirmar-correo?token=abc");

      expect(screen.getByRole("heading", { name: "Confirmando tu correo…" })).toBeInTheDocument();
      expect(screen.getByText("Estamos validando el enlace. Puede tardar unos segundos.")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Reenviar enlace" })).not.toBeInTheDocument();
      expect(await screen.findByRole("heading", { name: "Correo confirmado" })).toBeInTheDocument();
      expect(screen.getByText("Listo, correo confirmado.")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Iniciar sesión" })).toHaveAttribute("href", "/");
      expect(screen.queryByText(/correo no deseado/)).not.toBeInTheDocument();
      expect(api.confirmarCorreo).toHaveBeenCalledTimes(1);
      expect(api.confirmarCorreo).toHaveBeenCalledWith("abc");
    });

    it("usa un mensaje propio si el backend no envía uno", async () => {
      api.confirmarCorreo.mockResolvedValue({});

      renderEn("/confirmar-correo?token=abc");

      expect(await screen.findByText("Tu correo quedó confirmado. Ya podés iniciar sesión.")).toBeInTheDocument();
    });

    it("muestra el error si el enlace no sirve", async () => {
      api.confirmarCorreo.mockRejectedValue(new Error("El enlace venció."));

      renderEn("/confirmar-correo?token=vencido");

      expect(await screen.findByRole("alert")).toHaveTextContent("El enlace venció.");
      expect(screen.getByText("!")).toHaveClass("verification-icon", "failed");
      expect(screen.getByRole("heading", { name: "Revisá tu correo" })).toBeInTheDocument();
    });
  });

  describe("esperando la verificación", () => {
    it("explica a qué correo se envió el enlace", () => {
      renderEn({ pathname: "/email-verification", state: { email: "ana@example.test", correoEnviado: true } });

      expect(screen.getByText("Te enviamos un enlace a ana@example.test. Abrilo para verificar tu cuenta y empezar a planificar.")).toBeInTheDocument();
      expect(screen.getByText("✓")).not.toHaveClass("failed");
    });

    it("avisa si no se pudo enviar el correo", () => {
      renderEn({ pathname: "/email-verification", state: { email: "ana@example.test", correoEnviado: false } });

      expect(screen.getByText("Tu cuenta se creó, pero no se pudo enviar el correo a ana@example.test. Podés intentar reenviarlo.")).toBeInTheDocument();
    });

    it("avisa si no se pudo enviar el correo aunque no se conozca la dirección", () => {
      renderEn({ pathname: "/email-verification", state: { correoEnviado: false } });

      expect(screen.getByText("Tu cuenta se creó, pero no se pudo enviar el correo a la dirección indicada. Podés intentar reenviarlo.")).toBeInTheDocument();
    });

    it("sin datos del registro pide volver para reenviar", () => {
      renderEn("/email-verification");

      expect(screen.getByText("Revisá tu correo para encontrar el enlace de verificación y empezar a planificar.")).toBeInTheDocument();
      reenviar();

      expect(screen.getByRole("alert")).toHaveTextContent("Volvé al registro para indicar el correo al que querés reenviar el enlace.");
      expect(api.reenviarVerificacion).not.toHaveBeenCalled();
    });

    it("reenvía el enlace y muestra el mensaje del backend", async () => {
      let resolver;
      api.reenviarVerificacion.mockReturnValue(new Promise((resolve) => { resolver = resolve; }));
      renderEn({ pathname: "/email-verification", state: { email: "ana@example.test" } });

      reenviar();
      expect(screen.getByRole("button", { name: "Reenviando…" })).toBeDisabled();
      resolver({ mensaje: "Te enviamos otro enlace." });

      expect(await screen.findByRole("status")).toHaveTextContent("Te enviamos otro enlace.");
      expect(api.reenviarVerificacion).toHaveBeenCalledWith("ana@example.test");
    });

    it("usa un mensaje propio al reenviar si el backend no envía uno", async () => {
      api.reenviarVerificacion.mockResolvedValue({});
      renderEn({ pathname: "/email-verification", state: { email: "ana@example.test" } });

      reenviar();

      expect(await screen.findByRole("status")).toHaveTextContent("Enviamos un nuevo enlace a ana@example.test.");
    });

    it("muestra el error si el reenvío falla", async () => {
      api.reenviarVerificacion.mockRejectedValue(new Error("Demasiados intentos."));
      renderEn({ pathname: "/email-verification", state: { email: "ana@example.test" } });

      reenviar();

      expect(await screen.findByRole("alert")).toHaveTextContent("Demasiados intentos.");
      expect(screen.getByRole("button", { name: "Reenviar enlace" })).toBeEnabled();
    });
  });
});
