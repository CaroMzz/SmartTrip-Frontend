export const defaultPriorities = {
  ahorro: 30,
  distancia: 10,
  atractivos: 30,
  alojamiento: 10,
  tren: 10,
  panoramicas: 10,
};

const priorityKeys = Object.keys(defaultPriorities);

export function normalizePriorities(preferences) {
  const source = preferences?.prioridades || preferences || {};
  const hasSavedValues = priorityKeys.some((key) => source[key] !== undefined);
  if (!hasSavedValues) return { ...defaultPriorities };

  const values = Object.fromEntries(
    priorityKeys.map((key) => [key, Math.max(0, Number(source[key]) || 0)])
  );
  const total = Object.values(values).reduce((sum, value) => sum + value, 0);
  if (total === 0) return { ...defaultPriorities };
  if (total === 100) return values;

  const scaled = priorityKeys.map((key) => {
    const exact = values[key] / total * 100;
    return { key, value: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let remainder = 100 - scaled.reduce((sum, item) => sum + item.value, 0);
  [...scaled]
    .sort((left, right) => right.remainder - left.remainder)
    .slice(0, remainder)
    .forEach((item) => { item.value += 1; });
  return Object.fromEntries(scaled.map(({ key, value }) => [key, value]));
}

export function rebalancePriorities(previous, key, value) {
  const next = { ...previous, [key]: value };
  const remainingKeys = priorityKeys.filter((priority) => priority !== key);
  const oldTotal = remainingKeys.reduce((total, priority) => total + Number(previous[priority] || 0), 0);
  const targetTotal = 100 - value;
  let assigned = 0;

  remainingKeys.forEach((priority, index) => {
    const weight = oldTotal
      ? Number(previous[priority] || 0) / oldTotal
      : 1 / remainingKeys.length;
    const part = index === remainingKeys.length - 1
      ? targetTotal - assigned
      : Math.floor(targetTotal * weight);
    next[priority] = part;
    assigned += part;
  });
  return next;
}
