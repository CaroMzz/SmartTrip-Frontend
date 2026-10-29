# SmartTrip

Aplicación frontend de SmartTrip construida con React y Vite para registrar usuarios y planificar viajes con el backend.

## Desarrollo local

1. Instala Node.js y npm.
2. Copia `.env.example` a `.env` y configura `VITE_API_URL` con la URL base del backend.
3. Instala las dependencias con `npm install`.
4. Inicia el entorno local con `npm run dev`.

La URL debe ser absoluta y usar `http://` o `https://`. No incluyas credenciales ni secretos en variables `VITE_*`: Vite las incorpora al código público del navegador. La configuración local `.env` no se versiona.

La URL predeterminada del backend SmartTrip es `https://smarttrip-backend-naa5.onrender.com`; la documentación interactiva está en `/api-docs`.

## Funcionalidad

- Registro con confirmación de correo, reenvío del enlace e inicio/cierre de sesión.
- Sesión almacenada localmente, rutas privadas y cierre automático ante un token vencido.
- Crear, editar y eliminar viajes; el catálogo de países y ciudades alimenta el autocompletado.
- Configurar presupuesto, transporte y seis prioridades para generar y comparar itinerarios.
- Consultar tramos, mapa Leaflet/OpenStreetMap, ficha de ciudad, calendario y estimaciones de presupuesto.
- Consultar y actualizar el perfil y cambiar la contraseña.

## Validación

- `npm run lint`
- `npm test`
- `npm run build`

La compilación requiere `VITE_API_URL` y genera el sitio estático en `dist/`.

## Despliegue en Vercel

1. Importa el repositorio en Vercel y selecciona el preset **Vite**.
2. Configura `VITE_API_URL` en los entornos de Vercel. Debe apuntar a la URL pública base del backend, sin rutas de endpoints.
3. Confirma que el backend permita CORS desde el dominio del frontend.
4. Usa `npm run build` como comando de compilación y `dist` como directorio de salida.

`vercel.json` reescribe las rutas de la aplicación hacia `index.html` para que las rutas de React Router funcionen al abrirlas o recargarlas directamente.
