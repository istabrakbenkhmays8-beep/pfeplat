/** Format an ISO date "2026-06-15" or full ISO as "15 Jun". */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
}

/** Format a session range "15 → 19 Jun" (when same month) or "15 Jun → 02 Jul". */
export function sessionRange(start: string, end: string): string {
  const a = new Date(start);
  const b = new Date(end);
  const sameMonth = a.getUTCMonth() === b.getUTCMonth();
  if (sameMonth) {
    return `${a.toLocaleDateString("en-GB", { day: "2-digit", timeZone: "UTC" })} → ${b.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" })}`;
  }
  return `${shortDate(start)} → ${shortDate(end)}`;
}
