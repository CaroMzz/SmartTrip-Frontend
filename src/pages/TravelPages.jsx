import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import {
  actualizarViaje,
  buscarCiudades,
  buscarPaises,
  crearViaje,
  eliminarViaje,
  generarItinerarios,
  guardarConfiguracion,
  obtenerCalendario,
  obtenerItinerario,
  obtenerItinerarios,
  obtenerMiPerfil,
  obtenerPresupuesto,
  obtenerDestino,
  obtenerViaje,
  obtenerViajes,
  seleccionarItinerario,
} from "../api";
import { getCurrentTripId, setCurrentTripId } from "../auth";
import WorkspaceLayout from "../components/WorkspaceLayout";
import "leaflet/dist/leaflet.css";
import "./TravelPages.css";
import { Notice, PrioritySliders, TransportOptions } from "./travelShared";
import { useOpciones } from "./tripOptions";
import {
  defaultPriorities,
  normalizePriorities,
  rebalancePriorities,
} from "./tripPreferences";

function Loading({ children = "Cargando…", large = false }) {
  return <div className={`trip-loading${large ? " large" : ""}`} role="status">{children}</div>;
}

function apiFieldError(error, field) {
  const value = error?.errors?.[field];
  return typeof value === "string" ? value : value?.mensaje || value?.message || "";
}

function currentTripOrMessage() {
  const id = getCurrentTripId();
  return id ? null : "Elegí un viaje desde Mis viajes para ver esta información.";
}

function dateLabel(date) {
  if (!date) return "Fecha pendiente";
  const parsed = new Date(/^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00` : date);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(parsed);
}

function tripId(trip) {
  return trip?.id || trip?._id || trip?.viajeId;
}

// Fecha local de hoy en formato AAAA-MM-DD (mínimo del campo de fecha de inicio).
function todayIso() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

// Accesos para cambiar el viaje desde cualquier pantalla del viaje (DEF-19, DEF-31).
function TripActions() {
  return (
    <nav className="trip-inline-links trip-actions" aria-label="Acciones del viaje">
      <Link className="trip-button secondary" to="/edit-trip">Editar viaje</Link>
      <Link className="trip-button secondary" to="/budget-preferences">Presupuesto y preferencias</Link>
    </nav>
  );
}

export function MyTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    obtenerViajes()
      .then((response) => { if (active) setTrips(response.viajes || []); })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "No se pudieron cargar tus viajes.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const openTrip = (trip) => {
    const id = tripId(trip);
    if (!id) {
      setError("El viaje recibido no tiene un identificador válido.");
      return;
    }
    setCurrentTripId(String(id));
    if (trip.estado === "itinerario_seleccionado") navigate("/itinerary");
    else if (trip.estado === "alternativas_generadas") navigate("/compare-itineraries");
    else navigate("/edit-trip");
  };

  const deleteTrip = async (trip) => {
    if (!window.confirm(`¿Querés eliminar el viaje "${trip.nombre}"? Esta acción no se puede deshacer.`)) return;
    const id = tripId(trip);
    if (!id) {
      setError("El viaje recibido no tiene un identificador válido.");
      return;
    }
    try {
      await eliminarViaje(id);
      setTrips((currentTrips) => currentTrips.filter((item) => tripId(item) !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar el viaje.");
    }
  };

  return (
    <WorkspaceLayout
      title="Mis viajes"
      description="Todos tus planes, desde la primera idea hasta el itinerario elegido."
    >
      <div className="trip-toolbar">
        <span>{trips.length} {trips.length === 1 ? "viaje" : "viajes"}</span>
        <Link className="trip-button primary" to="/new-trip">+ Crear viaje</Link>
      </div>
      <Notice>{error}</Notice>
      {loading ? <Loading large /> : trips.length === 0 ? (
        <div className="trip-empty">
          <span className="trip-empty-icon" aria-hidden="true">✦</span>
          <h2>Tu próxima aventura empieza acá</h2>
          <p>Creá un viaje para elegir destinos, definir tu presupuesto y comparar itinerarios.</p>
          <Link className="trip-button primary" to="/new-trip">Crear mi primer viaje</Link>
        </div>
      ) : (
        <div className="trip-card-grid">
          {trips.map((trip) => (
            <article className="trip-card" key={tripId(trip) || trip.nombre}>
              <button className="trip-card-open" type="button" onClick={() => openTrip(trip)}>
                <span className="trip-card-top">
                  <span className="trip-card-icon" aria-hidden="true">✦</span>
                  <span className={`trip-status ${trip.estado || "borrador"}`}>
                    {trip.estado === "itinerario_seleccionado" ? "Itinerario elegido" : trip.estado === "alternativas_generadas" ? "Alternativas listas" : "Borrador"}
                  </span>
                </span>
                <strong className="trip-card-title">{trip.nombre}</strong>
                <span className="trip-card-dates">
                  {dateLabel(trip.fechaInicio)}{trip.fechaFin ? ` – ${dateLabel(trip.fechaFin)}` : ""}
                </span>
                <span className="trip-card-meta">
                  Creado {dateLabel(trip.creadoEn)}
                </span>
                <span className="trip-card-meta">
                  {trip.ciudadesObligatorias?.length || 0} ciudades · {trip.presupuestoTotal ?? "—"} USD
                </span>
              </button>
              <div className="trip-card-actions">
                <button type="button" onClick={() => openTrip(trip)}>Abrir viaje</button>
                <button type="button" onClick={() => { setCurrentTripId(String(tripId(trip))); navigate("/edit-trip"); }}>Editar</button>
                <button type="button" className="danger-link" onClick={() => deleteTrip(trip)}>Eliminar</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </WorkspaceLayout>
  );
}

function TripDetailsForm({ initialTrip, onSubmit, submitLabel }) {
  const [name, setName] = useState(initialTrip?.nombre || "");
  const [startDate, setStartDate] = useState(initialTrip?.fechaInicio?.slice(0, 10) || "");
  const [duration, setDuration] = useState(initialTrip?.duracionDias || "");
  const [travelers, setTravelers] = useState(initialTrip?.cantidadPersonas || 1);
  const [countries, setCountries] = useState(() => initialTrip?.paisesDetalle
    || (initialTrip?.paises || []).map((country) => (typeof country === "string" ? { nombre: country, codigo: null } : country)));
  const [cities, setCities] = useState(initialTrip?.ciudadesObligatorias || []);
  const codesLookedUp = useRef(false);
  const [countryQuery, setCountryQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [countryOptions, setCountryOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [countryLoading, setCountryLoading] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Con un backend que todavía devuelve los países como texto, busca su código en el catálogo (DEF-18).
  useEffect(() => {
    const missing = countries.filter((country) => !country.codigo);
    if (codesLookedUp.current || !missing.length) return;
    codesLookedUp.current = true;
    Promise.all(missing.map((country) => buscarPaises(country.nombre)
      .then((response) => (response.resultados || []).find((option) => option.nombre.toLowerCase() === country.nombre.toLowerCase()))
      .catch(() => null)))
      .then((found) => {
        setCountries((current) => current.map((country) => country.codigo ? country
          : found.find((option) => option?.nombre.toLowerCase() === country.nombre.toLowerCase()) || country));
      });
  }, [countries]);

  useEffect(() => {
    if (countryQuery.trim().length < 2) return undefined;
    let active = true;
    const timer = window.setTimeout(async () => {
      setCountryLoading(true);
      try {
        const response = await buscarPaises(countryQuery.trim());
        if (active) {
          setCountryOptions(response.resultados || []);
          setLookupError("");
        }
      } catch (requestError) {
        if (active) setLookupError(requestError.message);
      } finally {
        if (active) setCountryLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [countryQuery]);

  const countryCodes = useMemo(
    () => countries.map((country) => country.codigo).filter(Boolean),
    [countries]
  );
  useEffect(() => {
    if (cityQuery.trim().length < 2 || countryCodes.length === 0) return undefined;
    let active = true;
    const timer = window.setTimeout(async () => {
      setCityLoading(true);
      try {
        const response = await buscarCiudades(cityQuery.trim(), countryCodes);
        if (active) {
          setCityOptions(response.resultados || []);
          setLookupError("");
        }
      } catch (requestError) {
        if (active) setLookupError(requestError.message);
      } finally {
        if (active) setCityLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [cityQuery, countryCodes]);

  const removeCountry = (country) => {
    setCountries((selected) => selected.filter((item) => item.codigo !== country.codigo));
    setCities((selected) => selected.filter((city) => city.pais !== country.nombre));
    setCityOptions([]);
  };

  const addCountry = (country) => {
    if (countries.length >= 10 || countries.some((item) => item.codigo === country.codigo)) return;
    setCountries((selected) => [...selected, country]);
    setCountryQuery("");
    setCountryOptions([]);
  };

  const addCity = (city) => {
    if (cities.length >= 20 || cities.some((item) => item.idExterno === city.idExterno)) return;
    setCities((selected) => [...selected, city]);
    setCityQuery("");
    setCityOptions([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    if (countries.length < 1) {
      setError({ message: "Elegí al menos un país del autocompletado." });
      return;
    }
    if (cities.length < 1) {
      setError({ message: "Elegí al menos una ciudad del buscador." });
      return;
    }
    if (Number(duration) < cities.length) {
      setError({ message: "La duración debe ser de al menos un día por ciudad." });
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        nombre: name.trim(),
        paises: countries,
        ciudadesObligatorias: cities,
        fechaInicio: startDate,
        duracionDias: Number(duration),
        cantidadPersonas: Number(travelers),
      });
    } catch (submitError) {
      setError(submitError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="trip-form" onSubmit={handleSubmit}>
      <label className="trip-field">
        <span>Nombre del viaje</span>
        <input maxLength="150" value={name} onChange={(event) => setName(event.target.value)} required />
        <FieldError error={error} field="nombre" />
      </label>
      <label className="trip-field">
        <span>Países <small>Elegí entre 1 y 10 del catálogo</small></span>
        <input
          value={countryQuery}
          onChange={(event) => {
            setCountryQuery(event.target.value);
            if (event.target.value.trim().length < 2) {
              setCountryOptions([]);
              setCountryLoading(false);
            }
          }}
          placeholder="Buscá un país"
          autoComplete="off"
          aria-label="Buscar país"
        />
        {countryQuery.trim().length >= 2 && countryLoading && <div className="autocomplete-feedback">Buscando países…</div>}
        {countryQuery.trim().length >= 2 && !countryLoading && countryOptions.length > 0 && (
          <div className="autocomplete-options" role="listbox">
            {countryOptions.map((country) => (
              <button type="button" role="option" key={country.codigo} onClick={() => addCountry(country)}>
                {country.nombre} · {country.codigo}
              </button>
            ))}
          </div>
        )}
        <span className="trip-chip-list">
          {countries.map((country) => (
            <button type="button" className="trip-chip" key={country.codigo} onClick={() => removeCountry(country)}>
              {country.nombre} ×
            </button>
          ))}
        </span>
        <FieldError error={error} field="paises" />
      </label>
      <label className="trip-field">
        <span>Ciudades obligatorias <small>Elegí entre 1 y 20 del buscador</small></span>
        <input
          value={cityQuery}
          onChange={(event) => {
            setCityQuery(event.target.value);
            if (event.target.value.trim().length < 2) {
              setCityOptions([]);
              setCityLoading(false);
            }
          }}
          placeholder={countries.length ? "Buscá una ciudad" : "Primero elegí un país"}
          autoComplete="off"
          disabled={!countries.length}
          aria-label="Buscar ciudad"
        />
        {cityQuery.trim().length >= 2 && cityLoading && <div className="autocomplete-feedback">Buscando ciudades…</div>}
        {cityQuery.trim().length >= 2 && !cityLoading && cityOptions.length > 0 && (
          <div className="autocomplete-options" role="listbox">
            {cityOptions.map((city) => (
              <button type="button" role="option" key={city.idExterno} onClick={() => addCity(city)}>
                {city.nombre}{city.region ? `, ${city.region}` : ""}, {city.pais}
              </button>
            ))}
          </div>
        )}
        <span className="trip-chip-list">
          {cities.map((city) => (
            <button type="button" className="trip-chip" key={city.idExterno} onClick={() => setCities((items) => items.filter((item) => item.idExterno !== city.idExterno))}>
              {city.nombre} ×
            </button>
          ))}
        </span>
        <FieldError error={error} field="ciudadesObligatorias" />
      </label>
      <Notice>{lookupError}</Notice>
      <div className="trip-form-columns">
        <label className="trip-field">
          <span>Fecha de inicio</span>
          <input
            type="date"
            min={initialTrip?.fechaInicio && initialTrip.fechaInicio.slice(0, 10) < todayIso() ? initialTrip.fechaInicio.slice(0, 10) : todayIso()}
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            required
          />
          <FieldError error={error} field="fechaInicio" />
        </label>
        <label className="trip-field">
          <span>Duración en días</span>
          <input type="number" min={Math.max(1, cities.length)} max="60" value={duration} onChange={(event) => setDuration(event.target.value)} required />
          <FieldError error={error} field="duracionDias" />
        </label>
        <label className="trip-field">
          <span>Personas</span>
          <input type="number" min="1" max="20" value={travelers} onChange={(event) => setTravelers(event.target.value)} required />
          <FieldError error={error} field="cantidadPersonas" />
        </label>
      </div>
      {error?.message && <Notice>{error.message}</Notice>}
      <button className="trip-button primary" type="submit" disabled={submitting}>
        {submitting ? "Guardando…" : submitLabel}
      </button>
    </form>
  );
}

function FieldError({ error, field }) {
  const message = apiFieldError(error, field);
  return message ? <small className="trip-field-error">{message}</small> : null;
}

export function NewTrip() {
  const navigate = useNavigate();
  const handleCreate = async (payload) => {
    const response = await crearViaje(payload);
    const id = tripId(response.viaje);
    if (!id) throw new Error("El servidor creó el viaje sin devolver su identificador.");
    setCurrentTripId(String(id));
    navigate("/budget-preferences");
  };

  return (
    <WorkspaceLayout title="Nuevo viaje" description="Contanos qué lugares querés conocer y cuándo te gustaría viajar.">
      <section className="trip-panel">
        <div className="trip-panel-heading">
          <span className="trip-step">01</span>
          <div><h2>Datos del viaje</h2><p>Buscá tus destinos en el catálogo de SmartTrip o en OpenStreetMap.</p></div>
        </div>
        <TripDetailsForm onSubmit={handleCreate} submitLabel="Continuar con presupuesto" />
      </section>
    </WorkspaceLayout>
  );
}

export function EditTrip() {
  const navigate = useNavigate();
  const id = getCurrentTripId();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    obtenerViaje(id)
      .then((response) => setTrip(response.viaje || response))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id]);

  const saveChanges = async (payload) => {
    const previous = {
      nombre: trip.nombre,
      paises: trip.paisesDetalle || trip.paises,
      ciudadesObligatorias: trip.ciudadesObligatorias,
      fechaInicio: trip.fechaInicio?.slice(0, 10),
      duracionDias: trip.duracionDias,
      cantidadPersonas: trip.cantidadPersonas,
    };
    const changes = Object.fromEntries(
      Object.entries(payload).filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(previous[key]))
    );
    if (Object.keys(changes).length === 0) {
      setSaved(true);
      return;
    }
    await actualizarViaje(id, changes);
    setSaved(true);
  };

  if (!id) {
    return <WorkspaceLayout title="Editar viaje"><Notice>{currentTripOrMessage()}</Notice><Link className="trip-button secondary" to="/my-trips">Ir a Mis viajes</Link></WorkspaceLayout>;
  }
  if (loading) return <WorkspaceLayout title="Editar viaje"><Loading large /></WorkspaceLayout>;
  if (error) return <WorkspaceLayout title="Editar viaje"><Notice>{error}</Notice></WorkspaceLayout>;

  return (
    <WorkspaceLayout title="Editar viaje" description="Actualizá los datos de tu viaje. Al guardar podés volver a generar las alternativas.">
      <section className="trip-panel">
        <Notice type="info">Guardar cambios reinicia el estado del viaje y elimina las alternativas anteriores.</Notice>
        <TripDetailsForm key={id} initialTrip={trip} onSubmit={saveChanges} submitLabel="Guardar cambios" />
        {saved && (
          <div className="trip-success-actions">
            <Notice type="success">Cambios guardados. Podés generar nuevas alternativas cuando quieras.</Notice>
            <button className="trip-button primary" type="button" onClick={() => navigate("/compare-itineraries")}>Volver a generar itinerarios</button>
            <Link className="trip-button secondary" to="/budget-preferences">Presupuesto y preferencias</Link>
            <Link className="trip-button secondary" to="/my-trips">Volver a Mis viajes</Link>
          </div>
        )}
      </section>
    </WorkspaceLayout>
  );
}

export function BudgetPreferences() {
  const navigate = useNavigate();
  const id = getCurrentTripId();
  const { transportes, criterios } = useOpciones();
  const [budget, setBudget] = useState("");
  const [transport, setTransport] = useState("tren");
  const [priorities, setPriorities] = useState(defaultPriorities);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Un viaje ya configurado muestra su presupuesto, transporte y prioridades; uno nuevo parte del perfil.
  useEffect(() => {
    if (!id) return;
    Promise.all([obtenerViaje(id), obtenerMiPerfil()])
      .then(([tripResponse, profileResponse]) => {
        const trip = tripResponse.viaje || tripResponse;
        const profile = profileResponse.usuario || profileResponse;
        const configured = trip.presupuestoTotal != null;
        if (configured) setBudget(String(trip.presupuestoTotal));
        setTransport(trip.transportePreferido || profile.preferencias?.transportePreferido || "tren");
        setPriorities(normalizePriorities(configured ? trip.prioridades : profile.preferencias));
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id]);

  const save = async (event) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    if (!id) return;
    if (Object.values(priorities).reduce((sum, value) => sum + Number(value), 0) !== 100) {
      setError("Las seis prioridades deben sumar 100%.");
      return;
    }
    setSaving(true);
    try {
      await guardarConfiguracion(id, {
        presupuestoTotal: Number(budget),
        moneda: "USD",
        transportePreferido: transport,
        prioridades: priorities,
      });
      navigate("/compare-itineraries");
    } catch (saveError) {
      setError(saveError.message);
      setFieldErrors(saveError.errors || {});
    } finally {
      setSaving(false);
    }
  };

  if (!id) return <WorkspaceLayout title="Presupuesto y preferencias"><Notice>{currentTripOrMessage()}</Notice><Link className="trip-button secondary" to="/my-trips">Ir a Mis viajes</Link></WorkspaceLayout>;
  if (loading) return <WorkspaceLayout title="Presupuesto y preferencias"><Loading large /></WorkspaceLayout>;

  return (
    <WorkspaceLayout title="Presupuesto y preferencias" description="Definí cuánto querés gastar y qué hace especial tu manera de viajar.">
      <form className="trip-panel trip-form" onSubmit={save}>
        <Notice>{error}</Notice>
        <div className="trip-form-columns">
          <label className="trip-field">
            <span>Presupuesto total (USD)</span>
            <input type="number" min="1" step="1" value={budget} onChange={(event) => setBudget(event.target.value)} required />
            <FieldError error={{ errors: fieldErrors }} field="presupuestoTotal" />
          </label>
          <label className="trip-field">
            <span>Transporte preferido</span>
            <select value={transport} onChange={(event) => setTransport(event.target.value)}>
              <TransportOptions transportes={transportes} />
            </select>
            <FieldError error={{ errors: fieldErrors }} field="transportePreferido" />
          </label>
        </div>
        <div className="trip-section-heading">
          <h2>Tus seis prioridades</h2>
          <p>Al mover un deslizador, el resto se ajusta para mantener el total en 100%.</p>
        </div>
        <PrioritySliders criterios={criterios} values={priorities} onChange={(key, value) => setPriorities((current) => rebalancePriorities(current, key, value))} />
        <FieldError error={{ errors: fieldErrors }} field="prioridades" />
        <button className="trip-button primary" type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Guardar y comparar itinerarios"}
        </button>
      </form>
    </WorkspaceLayout>
  );
}

function getItineraries(response) {
  return response.itinerarios || response.alternativas || [];
}

// Aclaraciones del backend sobre el recorrido, por ejemplo que sin OpenRouteService la distancia une las
// ciudades en línea aproximada (DEF-34).
function RouteNotes({ notes }) {
  if (!notes?.length) return null;
  return <ul className="route-notes" aria-label="Aclaraciones del recorrido">{notes.map((note) => <li key={note}>{note}</li>)}</ul>;
}

export function CompareItineraries() {
  const navigate = useNavigate();
  const id = getCurrentTripId();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");
  const [selecting, setSelecting] = useState("");

  useEffect(() => {
    if (!id) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        let response = await obtenerItinerarios(id);
        let options = getItineraries(response);
        if (options.length === 0) {
          await generarItinerarios(id);
          response = await obtenerItinerarios(id);
          options = getItineraries(response);
        }
        if (active) setItineraries(options);
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id]);

  const choose = async (option) => {
    const optionId = option.id || option.itinerarioId || option._id;
    if (!optionId) {
      setError("La alternativa no tiene un identificador válido.");
      return;
    }
    setSelecting(optionId);
    setError("");
    try {
      await seleccionarItinerario(id, optionId);
      navigate("/itinerary");
    } catch (requestError) {
      setError(requestError.message);
      setSelecting("");
    }
  };

  if (!id) return <WorkspaceLayout title="Comparar itinerarios"><Notice>{currentTripOrMessage()}</Notice><Link className="trip-button secondary" to="/my-trips">Ir a Mis viajes</Link></WorkspaceLayout>;
  if (loading) return <WorkspaceLayout title="Comparar itinerarios"><Loading large>Generando tus alternativas… La primera solicitud puede demorar hasta 50 segundos.</Loading></WorkspaceLayout>;

  return (
    <WorkspaceLayout title="Comparar itinerarios" description="Elegí la alternativa que mejor se adapta a tus prioridades.">
      <Notice>{error}</Notice>
      <TripActions />
      <RouteNotes notes={[...new Set(itineraries.flatMap((option) => option.notas || []))]} />
      {!itineraries.length ? <div className="trip-empty"><h2>No se generaron alternativas</h2><button className="trip-button primary" onClick={() => window.location.reload()} type="button">Intentar nuevamente</button></div> : (
        <div className="comparison-scroll">
          <table className="comparison-table">
            <thead>
              <tr><th>Alternativa</th><th>Tiempo total de traslados</th><th>Distancia recorrida</th><th>Costo estimado</th><th>Ciudades</th><th>Cambios de alojamiento</th><th>Puntaje turístico</th><th>Según tus prioridades</th><th /></tr>
            </thead>
            <tbody>
              {itineraries.map((option, index) => {
                const metrics = option.metricas || {};
                const idOption = option.id || option.itinerarioId || option._id || `option-${index}`;
                return (
                  <tr key={idOption} className={option.recomendada ? "recommended-row" : ""}>
                    <th>
                      <strong>{option.tipo === "equilibrada" ? "Equilibrada" : option.tipo === "mas_ahorro" ? "Más ahorro" : option.tipo === "mas_experiencias" ? "Más experiencias" : `Opción ${index + 1}`}</strong>
                      {option.recomendada && <span className="recommended-badge">Recomendada</span>}
                    </th>
                    <td>{metrics.tiempoTrasladosHoras ?? "—"} h</td>
                    <td>{metrics.distanciaTotalKm ?? "—"} km</td>
                    <td>${option.presupuesto?.totalEstimado ?? option.presupuesto?.total ?? "—"} USD</td>
                    <td>{metrics.cantidadCiudades ?? option.ciudades?.length ?? "—"}</td>
                    <td>{metrics.cambiosAlojamiento ?? "—"}</td>
                    <td>{metrics.puntajeTuristico ?? "—"}/100</td>
                    <td>{option.puntaje ?? "—"}</td>
                    <td><button className="trip-button primary small" onClick={() => choose(option)} disabled={Boolean(selecting)} type="button">{selecting === idOption ? "Eligiendo…" : "Elegir"}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </WorkspaceLayout>
  );
}

function CityDetail({ city, onClose }) {
  const idExterno = city.idExterno;
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    obtenerDestino(idExterno, { nombre: city.nombre, pais: city.pais })
      .then((response) => { if (active) setDestination(response.destino || response); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [idExterno, city.nombre, city.pais]);

  const interests = destination?.puntosInteres || {};
  const categories = [
    ["atracciones", "Atracciones"],
    ["museos", "Museos"],
    ["monumentos", "Monumentos"],
    ["parques", "Parques"],
    ["restaurantes", "Restaurantes"],
  ];
  const noData = destination?.categoriasSinDatos || [];
  const warningText = Array.isArray(destination?.avisos)
    ? destination.avisos.join(" ")
    : destination?.avisos;

  return (
    <div className="city-modal-backdrop" role="presentation" onClick={onClose}>
      <section className="city-modal" role="dialog" aria-modal="true" aria-label="Ficha de ciudad" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="city-modal-close" onClick={onClose} aria-label="Cerrar ficha">×</button>
        {loading ? <Loading /> : error ? <Notice>{error}</Notice> : (
          <>
            <p className="workspace-eyebrow">FICHA DE DESTINO</p>
            <h2>{destination.nombre}</h2>
            <p className="city-description">{destination.descripcion || "Descripción no disponible."}</p>
            <p className="city-suggested-time">Tiempo sugerido: {destination.tiempoSugeridoDias ?? "—"} días</p>
            {warningText && <Notice type="info">{warningText}</Notice>}
            {destination.fotos?.length > 0 && (
              <div className="city-photos">
                {destination.fotos.map((photo) => <img key={photo.url} src={photo.url} alt={photo.textoAlternativo || `Vista de ${destination.nombre}`} loading="lazy" />)}
              </div>
            )}
            {categories.map(([key, label]) => {
              const rows = interests[key] || [];
              const unavailable = (Array.isArray(noData) ? noData.includes(key) : Boolean(noData[key])) || rows.length === 0;
              return (
                <section className="city-interest" key={key}>
                  <h3>{label}</h3>
                  {unavailable ? <p>Sin datos disponibles</p> : rows.map((place, index) => (
                    <article key={place.id || place.nombre || index}>
                      <strong>{place.nombre}</strong>
                      {place.descripcion && <p>{place.descripcion}</p>}
                      {(place.fuenteContenido || place.urlFuente) && <small>Fuente: {place.fuenteContenido} {place.urlFuente && <a href={place.urlFuente} target="_blank" rel="noreferrer">Ver fuente</a>}</small>}
                    </article>
                  ))}
                </section>
              );
            })}
            {destination.fuenteContenido && <p className="city-source">Fuente del contenido: {destination.fuenteContenido}</p>}
          </>
        )}
      </section>
    </div>
  );
}

// Encuadra el mapa para que se vean todas las ciudades del recorrido (DEF-32).
function FitToCities({ locations }) {
  const map = useMap();
  const key = JSON.stringify(locations);
  useEffect(() => {
    const points = JSON.parse(key);
    if (points.length > 1) map.fitBounds(points, { padding: [36, 36] });
    else if (points.length === 1) map.setView(points[0], 9);
  }, [map, key]);
  return null;
}

export function Itinerary() {
  const id = getCurrentTripId();
  const [itinerary, setItinerary] = useState(null);
  const [geometry, setGeometry] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    if (!id) return;
    obtenerItinerario(id)
      .then((response) => {
        setItinerary(response.itinerario || response);
        const geoJson = response.geometria || response.itinerario?.geometria || null;
        setGeometry(geoJson?.geometry || geoJson);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id]);

  const cities = itinerary?.ciudades || [];
  const routeLines = useMemo(() => {
    if (!geometry?.coordinates) return [];
    const lines = geometry.type === "MultiLineString" ? geometry.coordinates : [geometry.coordinates];
    return lines
      .map((line) => line.map(([longitude, latitude]) => [latitude, longitude]))
      .filter((line) => line.length > 1);
  }, [geometry]);
  const locations = cities
    .filter((city) => Number.isFinite(Number(city.latitud)) && Number.isFinite(Number(city.longitud)))
    .map((city) => [Number(city.latitud), Number(city.longitud)]);
  const center = locations[0] || [-34.6037, -58.3816];
  const cityIcon = useMemo(() => L.divIcon({
    className: "trip-map-marker",
    html: '<span class="trip-map-marker-dot"></span>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  }), []);

  if (!id) return <WorkspaceLayout title="Tu itinerario"><Notice>{currentTripOrMessage()}</Notice><Link className="trip-button secondary" to="/my-trips">Ir a Mis viajes</Link></WorkspaceLayout>;
  if (loading) return <WorkspaceLayout title="Tu itinerario"><Loading large /></WorkspaceLayout>;

  return (
    <WorkspaceLayout title="Tu itinerario" description="Recorré tu ruta y abrí cada ciudad para conocer sus lugares destacados.">
      <Notice>{error}</Notice>
      {itinerary && (
        <>
          <section className="trip-panel itinerary-map-panel">
            <div className="trip-panel-heading">
              <div><h2>Mapa de la ruta</h2><p>Arrastrá para explorar y acercá el mapa para ver cada ciudad.</p></div>
            </div>
            <div className="trip-map">
              <MapContainer center={center} zoom={5} scrollWheelZoom aria-label="Mapa interactivo del itinerario">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitToCities locations={locations} />
                {routeLines.map((line, index) => <Polyline key={`line-${index}`} positions={line} pathOptions={{ color: "#317b65", weight: 4 }} />)}
                {cities.map((city, index) => {
                  if (!Number.isFinite(Number(city.latitud)) || !Number.isFinite(Number(city.longitud))) return null;
                  return (
                    <Marker
                      key={city.idExterno || city.nombre || index}
                      position={[Number(city.latitud), Number(city.longitud)]}
                      icon={cityIcon}
                      title={city.nombre}
                      eventHandlers={{
                        // Leaflet crea el marcador como botón sin nombre accesible (axe: aria-command-name).
                        add: (event) => event.target.getElement()?.setAttribute("aria-label", `${city.nombre}: ver ficha`),
                        click: () => city.idExterno && setSelectedCity(city),
                      }}
                    >
                      <Popup><button className="map-popup-button" type="button" onClick={() => city.idExterno && setSelectedCity(city)}>{city.nombre} · Ver ficha</button></Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
            <p className="map-attribution">{geometry?.atribucionMapa || "Mapa y datos geográficos"} · © OpenStreetMap contributors</p>
          </section>

          <section className="trip-panel">
            <div className="trip-section-heading"><h2>Ciudades</h2><p>Seleccioná una ciudad para abrir su ficha.</p></div>
            <div className="itinerary-cities">
              {cities.map((city, index) => (
                <button key={city.idExterno || city.nombre || index} type="button" onClick={() => city.idExterno && setSelectedCity(city)}>
                  <span>{String(index + 1).padStart(2, "0")}</span><strong>{city.nombre}</strong><small>{city.pais}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="trip-panel">
            <div className="trip-section-heading"><h2>Tramos del viaje</h2><p>En el orden de tu itinerario. Las excursiones son de ida y vuelta.</p></div>
            <RouteNotes notes={itinerary.notas} />
            <div className="itinerary-legs">
              {(itinerary.tramos || []).map((leg, index) => (
                <article key={leg.id || `${leg.origen}-${leg.destino}-${index}`}>
                  <span className="itinerary-leg-number">{String(index + 1).padStart(2, "0")}</span>
                  <div><strong>{leg.origen} → {leg.destino}</strong><p>{leg.transporte}{leg.tipo === "excursion" ? " · Excursión, sin cambio de alojamiento" : ""}</p></div>
                  <span>{leg.distanciaKm} km · {leg.tiempoHoras} h</span>
                  <strong>${leg.costoUsd} USD</strong>
                </article>
              ))}
            </div>
          </section>
          <div className="trip-inline-links">
            <Link className="trip-button secondary" to="/trip-calendar">Ver calendario</Link>
            <Link className="trip-button secondary" to="/trip-budget">Ver presupuesto</Link>
          </div>
          <TripActions />
        </>
      )}
      {selectedCity && <CityDetail city={selectedCity} onClose={() => setSelectedCity(null)} />}
    </WorkspaceLayout>
  );
}

export function TripCalendar() {
  const id = getCurrentTripId();
  const [calendar, setCalendar] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    obtenerCalendario(id)
      .then((response) => {
        setCalendar(response.calendario || []);
        setCities(response.ciudades || []);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) return <WorkspaceLayout title="Calendario del viaje"><Notice>{currentTripOrMessage()}</Notice><Link className="trip-button secondary" to="/my-trips">Ir a Mis viajes</Link></WorkspaceLayout>;
  if (loading) return <WorkspaceLayout title="Calendario del viaje"><Loading large /></WorkspaceLayout>;

  const cityName = (cityId) => cities.find((city) => city.idExterno === cityId || city.id === cityId)?.nombre || cityId || "Día libre";
  return (
    <WorkspaceLayout title="Calendario del viaje" description="Un día a la vez: estadías, traslados y excursiones.">
      <Notice>{error}</Notice>
      <TripActions />
      {calendar.length === 0 ? <div className="trip-empty"><h2>El calendario todavía no está disponible</h2><Link className="trip-button secondary" to="/compare-itineraries">Comparar itinerarios</Link></div> : (
        <div className="calendar-list">
          {calendar.map((day, index) => (
            <article className="calendar-day" key={`${day.fecha}-${index}`}>
              <div className="calendar-day-date"><span>DÍA {index + 1}</span><strong>{dateLabel(day.fecha)}</strong></div>
              <div className="calendar-day-content">
                <span className={`calendar-type ${day.tipo}`}>{day.tipo === "traslado_y_estadia" ? "Traslado y estadía" : day.tipo === "excursion" ? "Excursión" : "Estadía"}</span>
                <h2>{cityName(day.ciudad)}</h2>
                {day.alojamiento && <p>Alojamiento: {day.alojamiento}</p>}
                {day.tipo === "excursion" && <p>Visita de ida y vuelta; no cambia el alojamiento.</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </WorkspaceLayout>
  );
}

export function TripBudget() {
  const id = getCurrentTripId();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    obtenerPresupuesto(id)
      .then(setBudget)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) return <WorkspaceLayout title="Presupuesto del viaje"><Notice>{currentTripOrMessage()}</Notice><Link className="trip-button secondary" to="/my-trips">Ir a Mis viajes</Link></WorkspaceLayout>;
  if (loading) return <WorkspaceLayout title="Presupuesto del viaje"><Loading large /></WorkspaceLayout>;
  const data = budget?.presupuesto || {};
  const categories = data.categorias || {};
  const labels = { transporte: "Transporte", hospedaje: "Hospedaje", alimentacion: "Alimentación", actividades: "Actividades" };
  const spent = Number(data.totalEstimado) || 0;
  const total = Number(data.presupuestoTotal) || 0;
  const percentage = Math.max(0, Math.min(100, Number(data.porcentajeUsado) || (total ? spent / total * 100 : 0)));

  return (
    <WorkspaceLayout title="Presupuesto del viaje" description="Una estimación para planificar con más claridad. Los precios no son tarifas reales.">
      <Notice>{error}</Notice>
      <TripActions />
      {budget && (
        <>
          <Notice type="info">Estimaciones en USD. No representan precios reales.{budget.esEstimacion === false ? "" : " El total es estimado."}</Notice>
          <section className="budget-summary trip-panel">
            <div><span>Presupuesto ingresado</span><strong>${data.presupuestoTotal ?? "—"} USD</strong></div>
            <div><span>Total estimado</span><strong>${data.totalEstimado ?? "—"} USD</strong></div>
            <div><span>Restante estimado</span><strong className={Number(data.restanteEstimado) < 0 ? "over-budget" : ""}>${data.restanteEstimado ?? "—"} USD</strong></div>
          </section>
          <section className="trip-panel">
            <div className="budget-progress-label"><h2>Uso del presupuesto</h2><strong>{Math.round(percentage)}%</strong></div>
            <div className="budget-progress"><span style={{ width: `${percentage}%` }} /></div>
            <div className="budget-category-list">
              {Object.entries(labels).map(([key, label]) => {
                const value = Number(categories[key]) || 0;
                const categoryPercent = spent > 0 ? Math.min(100, value / spent * 100) : 0;
                return (
                  <div className="budget-category" key={key}>
                    <div><span>{label}</span><strong>${value.toFixed(2)} USD</strong></div>
                    <div className="budget-progress thin"><span style={{ width: `${categoryPercent}%` }} /></div>
                  </div>
                );
              })}
            </div>
            {budget.notas?.length > 0 && <ul className="budget-notes">{budget.notas.map((note) => <li key={note}>{note}</li>)}</ul>}
          </section>
        </>
      )}
    </WorkspaceLayout>
  );
}
