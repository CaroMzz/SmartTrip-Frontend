const API_URL = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");

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