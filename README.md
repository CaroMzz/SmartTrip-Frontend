# SmartTrip Frontend

Aplicación React para crear viajes, configurar presupuesto y preferencias, comparar itinerarios y consultar el mapa, calendario y estimaciones del viaje.

## Requisitos

- Node.js y npm
- Backend SmartTrip accesible en `VITE_API_URL`

La URL predeterminada es `https://smarttrip-backend-naa5.onrender.com`. Para usar otro backend, definí `VITE_API_URL` en un archivo `.env` en la raíz.

La documentación interactiva del backend está disponible en `/api-docs` en la URL configurada.

## Desarrollo

```sh
npm install
npm run dev
```

## Validación

```sh
npm run lint
npm run build
```

## Flujos principales

- Registro, confirmación y reenvío del correo, inicio y cierre de sesión.
- La sesión se conserva en `localStorage`; el viaje seleccionado se conserva en `sessionStorage`.
- Las pantallas privadas requieren una sesión y un `401` limpia la sesión vencida.
- Desde Mis viajes se puede crear un viaje con países y ciudades del autocompletado, configurar presupuesto y seis prioridades, generar y elegir alternativas.
- El itinerario incluye tramos y mapa interactivo con Leaflet/OpenStreetMap; sus ciudades abren una ficha de destino.
- El perfil, el cambio de contraseña, el calendario y el presupuesto consultan los endpoints del backend.
