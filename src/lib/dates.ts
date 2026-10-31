// Calendar-day helpers. Streaks and daily missions use the device's LOCAL day,
// so cooking at 11pm and again at 8am counts as two days for the user.

export function localDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Whole calendar days from a to b ('YYYY-MM-DD'). Uses UTC math on the
// date parts so DST shifts never produce 0.958-day gaps.
export function daysBetween(a: string, b: string): number {
  const toUTC = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUTC(b) - toUTC(a)) / 86_400_000);
}

// Small stable hash so "today's mission" is the same all day on every device
export function dayHash(day: string): number {
  let h = 0;
  for (const ch of day) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}
