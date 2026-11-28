// Quita las barras finales sin regex: /\/+$/ tarda de forma cuadrática con muchas barras (Sonar S8786).
function sinBarrasFinales(url) {
  let fin = url.length;
  while (url[fin - 1] === "/") fin -= 1;
  return url.slice(0, fin);
}

const valor = import.meta.env.VITE_API_URL?.trim();
const API_URL = valor && sinBarrasFinales(valor);

export function getApiUrl() {
  if (!API_URL) {
    throw new Error("VITE_API_URL no está configurada.");
  }

  let url;
  try {
    url = new URL(API_URL);
  } catch {
    throw new Error("VITE_API_URL debe ser una URL absoluta HTTP o HTTPS.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("VITE_API_URL debe usar el protocolo HTTP o HTTPS.");
  }

  return API_URL;
}

export default API_URL;