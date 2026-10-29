export function Notice({ children, type = "error" }) {
  if (!children) return null;
  return <p className={`trip-notice ${type}`} role={type === "error" ? "alert" : "status"}>{children}</p>;
}

export function PrioritySliders({ values, onChange }) {
  return (
    <div className="priority-list">
      {[
        ["ahorro", "Minimizar costos"],
        ["distancia", "Reducir kilómetros recorridos"],
        ["atractivos", "Maximizar lugares turísticos"],
        ["alojamiento", "Minimizar cambios de alojamiento"],
        ["tren", "Priorizar tren sobre avión"],
        ["panoramicas", "Priorizar rutas panorámicas"],
      ].map(([key, label]) => (
        <label className="priority-control" key={key}>
          <span><strong>{label}</strong><output>{values[key]}%</output></span>
          <input
            type="range"
            min="0"
            max="100"
            value={values[key]}
            onChange={(event) => onChange(key, Number(event.target.value))}
            aria-label={label}
          />
        </label>
      ))}
      <p className="priority-total">Total de prioridades <strong>{Object.values(values).reduce((sum, value) => sum + Number(value), 0)}%</strong></p>
    </div>
  );
}
