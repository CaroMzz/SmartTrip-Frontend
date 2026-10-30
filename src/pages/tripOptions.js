import { useEffect, useState } from "react";
import { obtenerOpciones } from "../api";

// Listas que también define el backend (GET /opciones). Se usan mientras carga o si no responde.
export const TRANSPORTES_BASE = [
  { tipo: "tren", etiqueta: "Tren" },
  { tipo: "avion", etiqueta: "Avión" },
  { tipo: "auto", etiqueta: "Auto" },
];
export const CRITERIOS_BASE = [
  { clave: "ahorro", etiqueta: "Minimizar costos" },
  { clave: "distancia", etiqueta: "Reducir kilómetros recorridos" },
  { clave: "atractivos", etiqueta: "Maximizar lugares turísticos" },
  { clave: "alojamiento", etiqueta: "Minimizar cambios de alojamiento" },
  { clave: "tren", etiqueta: "Priorizar tren sobre avión" },
  { clave: "panoramicas", etiqueta: "Priorizar rutas panorámicas" },
];

let opcionesPendientes = null;

// Transportes y criterios del backend: agregar uno allá alcanza para que aparezca en la interfaz.
export function useOpciones() {
  const [opciones, setOpciones] = useState({ transportes: TRANSPORTES_BASE, criterios: CRITERIOS_BASE });
  useEffect(() => {
    let active = true;
    opcionesPendientes ||= obtenerOpciones().catch(() => {
      opcionesPendientes = null;
      return null;
    });
    opcionesPendientes.then((respuesta) => {
      if (!active || !respuesta?.transportes?.length || !respuesta?.criterios?.length) return;
      setOpciones({ transportes: respuesta.transportes, criterios: respuesta.criterios });
    });
    return () => { active = false; };
  }, []);
  return opciones;
}
