import { describe, expect, it, vi } from "vitest";

const reactDom = vi.hoisted(() => {
  const render = vi.fn();
  return { render, createRoot: vi.fn(() => ({ render })) };
});

vi.mock("react-dom/client", () => ({ createRoot: reactDom.createRoot }));

describe("main.jsx", () => {
  it("monta la aplicación en #root", async () => {
    document.body.innerHTML = '<div id="root"></div>';

    await import("../main.jsx");

    expect(reactDom.createRoot).toHaveBeenCalledWith(document.getElementById("root"));
    expect(reactDom.render).toHaveBeenCalledTimes(1);
  });
});
