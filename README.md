# SmartTrip

Aplicación frontend de SmartTrip construida con React y Vite.

## Desarrollo local

1. Instala Node.js y npm.
2. Instala las dependencias con `npm install`.
3. Copia `.env.example` a `.env` y configura `VITE_API_URL` con la URL base del backend.
4. Inicia el entorno local con `npm run dev`.

La URL debe ser absoluta y usar `http://` o `https://`. No incluyas credenciales ni secretos en variables `VITE_*`: Vite las incorpora al código público del navegador.

## Validación

- `npm run lint`
- `npm test`
- `npm run build`

La compilación requiere `VITE_API_URL` y genera el sitio estático en `dist/`.

## Despliegue en Vercel

1. Importa el repositorio en Vercel y selecciona el preset **Vite**.
2. Configura la variable `VITE_API_URL` en las variables de entorno de Vercel para cada entorno a utilizar (Production, Preview y/o Development). Debe apuntar a la URL pública del backend, por ejemplo `https://api.tu-dominio.com`, sin agregar rutas de endpoints.
3. Confirma que el backend permita solicitudes CORS desde el dominio del frontend en Vercel.
4. Usa `npm run build` como comando de compilación y `dist` como directorio de salida. Vercel suele detectarlos automáticamente al elegir Vite.

`vercel.json` reescribe las rutas de la aplicación hacia `index.html`, para que las rutas de React Router funcionen también al abrirlas directamente o recargar la página.
