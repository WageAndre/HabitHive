export function startOfUtcDay(value = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function addUtcDays(value, amount) {
  const date = startOfUtcDay(value);
  date.setUTCDate(date.getUTCDate() + amount);
  return date;
}

export function toDateKey(value) {
  return startOfUtcDay(value)?.toISOString().slice(0, 10) ?? null;
}

export function startOfUtcWeek(value = new Date()) {
  const date = startOfUtcDay(value);
  const day = date.getUTCDay();
  return addUtcDays(date, day === 0 ? -6 : 1 - day);
}

export function enumerateDays(start, end) {
  const days = [];
  for (let cursor = startOfUtcDay(start); cursor <= startOfUtcDay(end); cursor = addUtcDays(cursor, 1)) {
    days.push(cursor);
  }
  return days;
}

