import { CRITERIOS_BASE } from "./tripOptions";

export function TransportOptions({ transportes }) {
  return transportes.map(({ tipo, etiqueta }) => <option key={tipo} value={tipo}>{etiqueta}</option>);
}

export function Notice({ children, type = "error" }) {
  if (!children) return null;
  return <p className={`trip-notice ${type}`} role={type === "error" ? "alert" : "status"}>{children}</p>;
}

export function PrioritySliders({ values, onChange, criterios = CRITERIOS_BASE }) {
  return (
    <div className="priority-list">
      {criterios.map(({ clave: key, etiqueta: label }) => (
        <label className="priority-control" key={key}>
          <span><strong>{label}</strong><output>{values[key] ?? 0}%</output></span>
          <input
            type="range"
            min="0"
            max="100"
            value={values[key] ?? 0}
            onChange={(event) => onChange(key, Number(event.target.value))}
            aria-label={label}
          />
        </label>
      ))}
      <p className="priority-total">Total de prioridades <strong>{Object.values(values).reduce((sum, value) => sum + Number(value), 0)}%</strong></p>
    </div>
  );
}
