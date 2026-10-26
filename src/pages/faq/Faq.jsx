import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Faq.css";

const FAQ_DATA = [
  {
    id: "que-es-smarttrip",
    categoria: "general",
    categoriaNombre: "General",
    tipo: "FAQ",
    pregunta: "¿Qué es SmartTrip y cuál es su objetivo principal?",
    respuesta: (
      <div>
        <p>
          <strong>SmartTrip</strong> es una plataforma web inteligente diseñada para centralizar y simplificar la planificación de viajes multidestino. Su objetivo es calcular automáticamente rutas óptimas, estimar presupuestos realistas y sugerir la distribución ideal de días según tus preferencias personales (ahorro, tiempo, comodidad o atractivos culturales).
        </p>
        <div className="faq-callout">
          <strong>Alcance del sistema:</strong> SmartTrip funciona como un motor inteligente de recomendación y planificación. No efectúa cobros comerciales ni reservas directas de pasajes o alojamientos.
        </div>
      </div>
    ),
  },
  {
    id: "requisitos-sistema",
    categoria: "general",
    categoriaNombre: "General",
    tipo: "Requisitos",
    pregunta: "¿Qué requisitos de sistema o navegador necesito para usar la plataforma?",
    respuesta: (
      <div>
        <p>Al ser una aplicación web moderna (SPA en React), solo necesitas:</p>
        <ul>
          <li><strong>Navegador web moderno:</strong> Google Chrome, Mozilla Firefox, Microsoft Edge o Safari (versiones actualizadas).</li>
          <li><strong>Conexión a Internet:</strong> Para la sincronización de datos con el servidor y la carga de mapas interactivos.</li>
          <li><strong>Dispositivo:</strong> Es 100% responsivo, compatible con PC, notebooks, tablets y teléfonos móviles.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "como-crear-cuenta",
    categoria: "cuenta",
    categoriaNombre: "Cuenta y Perfil",
    tipo: "Tarea",
    pregunta: "¿Cómo creo una cuenta nueva en SmartTrip?",
    respuesta: (
      <div>
        <ol className="faq-steps">
          <li>Dirígete a la pantalla de <strong>Registro</strong> (o haz clic en "¿Todavía no tenés una cuenta?").</li>
          <li>Ingresa tu <strong>nombre completo</strong>, tu <strong>correo electrónico</strong> y una <strong>contraseña segura</strong> (mínimo 15 caracteres).</li>
          <li>Presiona <strong>Crear cuenta</strong>. Tu clave se almacena encriptada de forma irreversible mediante el estándar <code>bcrypt</code>.</li>
          <li>Si la verificación de correo está activa, recibirás un enlace de confirmación en tu casilla antes de iniciar sesión.</li>
        </ol>
      </div>
    ),
  },
  {
    id: "inicio-cierre-sesion",
    categoria: "cuenta",
    categoriaNombre: "Cuenta y Perfil",
    tipo: "Tarea",
    pregunta: "¿Cómo inicio y cierro sesión de forma segura?",
    respuesta: (
      <div>
        <p>
          <strong>Para ingresar:</strong> Introduce tu correo y contraseña en la pantalla de Login. El sistema genera un token seguro de sesión (Bearer token) que autoriza tus solicitudes.
        </p>
        <p>
          <strong>Para salir:</strong> Haz clic en el botón <strong>Cerrar sesión</strong> ubicado en la parte inferior del menú lateral (Sidebar). El token se elimina inmediatamente de tu navegador.
        </p>
      </div>
    ),
  },
  {
    id: "preferencias-viaje",
    categoria: "cuenta",
    categoriaNombre: "Cuenta y Perfil",
    tipo: "Tarea",
    pregunta: "¿Cómo configuro mis preferencias de viaje por defecto?",
    respuesta: (
      <div>
        <p>
          En la sección <strong>Mi Perfil</strong> puedes definir los parámetros que SmartTrip usará como base para cada nuevo viaje:
        </p>
        <ul>
          <li><strong>Medio de transporte predilecto:</strong> Avión, Tren o Automóvil.</li>
          <li><strong>Balance de viaje:</strong> Enfoque más económico, trayectos más rápidos o recorridos con foco turístico/panorámico.</li>
          <li><strong>Tipo de hospedaje sugerido:</strong> Económico, intermedio o de confort.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "crear-nuevo-viaje",
    categoria: "viajes",
    categoriaNombre: "Planificación de Viajes",
    tipo: "Tarea",
    pregunta: "¿Cómo inicio la planificación de un nuevo viaje?",
    respuesta: (
      <div>
        <p>Desde el panel <strong>Mis Viajes</strong>, haz clic en el botón <strong>+ Crear nuevo viaje</strong>. Completa los datos iniciales obligatorios:</p>
        <ul>
          <li><strong>Nombre del viaje:</strong> Por ejemplo, <em>"Gira por Europa 2026"</em>.</li>
          <li><strong>Fecha de inicio:</strong> Debe ser igual o posterior a la fecha de hoy.</li>
          <li><strong>Duración en días:</strong> Cantidad de días totales proyectados para el viaje.</li>
          <li><strong>Presupuesto total estimado:</strong> En dólares (USD) para calcular factibilidad y rubros.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "destinos-transporte",
    categoria: "viajes",
    categoriaNombre: "Planificación de Viajes",
    tipo: "Tarea",
    pregunta: "¿Cómo selecciono los destinos y el transporte habilitado?",
    respuesta: (
      <div>
        <ol className="faq-steps">
          <li>En el formulario de creación, escribe el nombre de las ciudades que deseas visitar.</li>
          <li>Elige los medios de transporte permitidos: ✈️ <strong>Avión</strong>, 🚆 <strong>Tren</strong> o 🚗 <strong>Auto</strong>. Puedes tildar varios.</li>
          <li>Puedes ordenar los destinos manualmente o activar la opción <strong>"Optimizar orden geográfico"</strong> para que SmartTrip calcule el recorrido con menor distancia acumulada.</li>
        </ol>
      </div>
    ),
  },
  {
    id: "generacion-itinerarios",
    categoria: "itinerarios",
    categoriaNombre: "Itinerarios y Rutas",
    tipo: "FAQ",
    pregunta: "¿Cómo genera SmartTrip las alternativas de itinerario?",
    respuesta: (
      <div>
        <p>
          El motor de optimización analiza las distancias entre ciudades, los costos referenciales y las atracciones disponibles para ofrecerte generalmente <strong>3 alternativas contrastadas</strong>:
        </p>
        <ul>
          <li><strong>Opción Económica:</strong> Prioriza reducir el gasto global en pasajes y estadías.</li>
          <li><strong>Opción Recomendada / Balanceada:</strong> El mejor compromiso entre costo accesible, tiempos de traslado y aprovechamiento turístico.</li>
          <li><strong>Opción Panorámica / Turística:</strong> Maximiza la cantidad de sitios de interés y recorridos escénicos.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "comparar-rutas",
    categoria: "itinerarios",
    categoriaNombre: "Itinerarios y Rutas",
    tipo: "Tarea",
    pregunta: "¿Cómo comparo y selecciono entre las opciones generadas?",
    respuesta: (
      <div>
        <p>
          En la pantalla <strong>Comparar Itinerarios</strong> se despliegan tarjetas comparativas con métricas clave:
        </p>
        <ul>
          <li>Costo estimado total en USD.</li>
          <li>Horas estimadas totales dedicadas a traslados.</li>
          <li>Puntuación de aprovechamiento turístico (de 1 a 10).</li>
        </ul>
        <p>
          Haz clic en <strong>Seleccionar esta Ruta</strong> sobre la tarjeta preferida para fijarla como itinerario activo de tu viaje.
        </p>
      </div>
    ),
  },
  {
    id: "explorar-mapa",
    categoria: "itinerarios",
    categoriaNombre: "Itinerarios y Rutas",
    tipo: "Tarea",
    pregunta: "¿Cómo interactúo con el mapa interactivo de la ruta?",
    respuesta: (
      <div>
        <p>
          El mapa interactivo traza la ruta completa de tu viaje con coordenadas geográficas precisas:
        </p>
        <ul>
          <li><strong>Marcadores (Pins):</strong> Indican las ciudades de partida, escalas y destino final.</li>
          <li><strong>Líneas de conexión:</strong> Con colores diferenciados según el medio de transporte de cada tramo.</li>
          <li><strong>Puntos de interés:</strong> Haz clic en cualquier marcador para abrir la ficha de la ciudad con atracciones recomendadas y tiempos sugeridos de visita.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "desglose-presupuesto",
    categoria: "presupuesto",
    categoriaNombre: "Presupuesto y Calendario",
    tipo: "Tarea",
    pregunta: "¿Cómo se calcula y desglosa el presupuesto estimado?",
    respuesta: (
      <div>
        <p>El sistema divide los costos proyectados en 4 categorías principales:</p>
        <ul>
          <li><strong>Transporte:</strong> Vuelos, trenes o cálculo de combustible y peajes según kilómetros recorridos.</li>
          <li><strong>Alojamiento:</strong> Estadías estimadas por noche en cada ciudad.</li>
          <li><strong>Comidas y gastos diarios:</strong> Viáticos diarios de alimentación básica.</li>
          <li><strong>Actividades y entradas:</strong> Puntos de interés y actividades culturales.</li>
        </ul>
        <div className="faq-callout">
          <strong>Semáforo de presupuesto:</strong> Si el costo supera el presupuesto configurado, la barra se tornará ámbar/roja para advertirte del excedente antes de confirmar tu itinerario.
        </div>
      </div>
    ),
  },
  {
    id: "resolucion-problemas",
    categoria: "problemas",
    categoriaNombre: "Solución de Problemas",
    tipo: "Soporte",
    pregunta: "Errores comunes de validación y cómo resolverlos",
    respuesta: (
      <div>
        <ul className="faq-troubleshooting-list">
          <li>
            <strong>"Presupuesto insuficiente para la cantidad de días":</strong>
            <span>Incrementa el presupuesto proyectado o reduce los días/destinos del viaje para ajustarte a los costos mínimos calculados.</span>
          </li>
          <li>
            <strong>"Correo electrónico ya registrado":</strong>
            <span>Ya existe una cuenta con esa dirección. Utiliza el inicio de sesión o solicita restablecer contraseña.</span>
          </li>
          <li>
            <strong>"Seleccione al menos un medio de transporte":</strong>
            <span>Es obligatorio seleccionar al menos un transporte habilitado (avión, tren o auto) para que el algoritmo pueda calcular trayectos.</span>
          </li>
          <li>
            <strong>"Fallas temporales en servicios de mapas o APIs externas":</strong>
            <span>SmartTrip activa automáticamente su <em>modo de contingencia (fallback)</em> con distancias geográficas de catálogo para no interrumpir tu planificación.</span>
          </li>
        </ul>
      </div>
    ),
  },
];

const CATEGORIES = [
  { id: "todas", label: "Todas las preguntas" },
  { id: "general", label: "General" },
  { id: "cuenta", label: "Cuenta y Perfil" },
  { id: "viajes", label: "Planificar Viaje" },
  { id: "itinerarios", label: "Itinerarios y Rutas" },
  { id: "presupuesto", label: "Presupuesto" },
  { id: "problemas", label: "Solución de Problemas" },
];

function Faq() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState({ "que-es-smarttrip": true });

  const toggleItem = (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory =
      activeCategory === "todas" || item.categoria === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      item.pregunta.toLowerCase().includes(query) ||
      item.categoriaNombre.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="faq-standalone-page">
      {/* Barra de navegación pública superior */}
      <header className="faq-navbar">
        <div className="faq-navbar-inner">
          <div className="faq-brand" onClick={() => navigate("/")}>
            <span className="faq-brand-icon">✦</span>
            <span className="faq-brand-name">SmartTrip</span>
            <span className="faq-brand-divider">/</span>
            <span className="faq-brand-badge">Centro de Ayuda</span>
          </div>

          <nav className="faq-nav-actions">
            <button
              type="button"
              className="faq-nav-back-btn"
              onClick={() => navigate(-1)}
            >
              ← Volver
            </button>
            <Link to="/" className="faq-nav-link">
              Iniciar sesión
            </Link>
            <Link to="/register" className="faq-nav-btn primary">
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero / Encabezado */}
      <div className="faq-hero-container">
        <div className="faq-hero-content">
          <div className="faq-badge-container">
            <span className="faq-standard-badge">ISO/IEC/IEEE 26514</span>
            <span className="faq-version-badge">Manual de Usuario Moderno</span>
          </div>
          <h1>Preguntas Frecuentes y Guía de Tareas</h1>
          <p className="faq-description">
            Encuentra respuestas rápidas y guías paso a paso para organizar tus itinerarios, presupuestos y destinos.
          </p>

          {/* Buscador */}
          <div className="faq-search-wrapper">
            <span className="faq-search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              className="faq-search-input"
              placeholder="Buscar por tarea o pregunta (ej. crear viaje, presupuesto, itinerarios)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="faq-search-clear"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="faq-main-wrapper">
        {/* Filtros por Categoría */}
        <div className="faq-categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`faq-category-pill ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Lista de FAQs */}
        <div className="faq-list">
          {filteredFaqs.length === 0 ? (
            <div className="faq-empty">
              <p>No se encontraron preguntas que coincidan con tu búsqueda.</p>
              <button
                type="button"
                className="faq-reset-button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("todas");
                }}
              >
                Ver todas las preguntas
              </button>
            </div>
          ) : (
            filteredFaqs.map((item) => {
              const isOpen = !!openItems[item.id];
              return (
                <article
                  key={item.id}
                  className={`faq-card ${isOpen ? "open" : ""}`}
                >
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="faq-question-content">
                      <div className="faq-item-tags">
                        <span className="faq-tag-category">{item.categoriaNombre}</span>
                        <span className={`faq-tag-type ${item.tipo.toLowerCase()}`}>
                          {item.tipo}
                        </span>
                      </div>
                      <h3>{item.pregunta}</h3>
                    </div>
                    <span className="faq-toggle-icon" aria-hidden="true">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="faq-answer-body">
                      {item.respuesta}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        {/* Footer con referencia a estándares */}
        <footer className="faq-footer-card">
          <div className="faq-footer-content">
            <h4>Documentación para evaluadores y desarrolladores</h4>
            <p>
              El proceso de testing, cobertura con Jest y diseño técnico se rigen bajo los estándares <strong>IEEE 829 / ISO 29119-3 / ISO 12207</strong> y están detallados en el Manual Técnico del repositorio.
            </p>
          </div>
          <div className="faq-standards-list">
            <span title="Documentación de Usuario para Software">ISO/IEC/IEEE 26514</span>
            <span title="Documentación de Pruebas y Testing">IEEE 829 / ISO 29119-3</span>
            <span title="Ciclo de Vida de Desarrollo">ISO/IEC 12207</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Faq;
