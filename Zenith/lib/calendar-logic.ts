export function formatISO(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(Date.UTC(year, month, 1));
  const firstDow = first.getUTCDay();
  const start = new Date(Date.UTC(year, month, 1 - firstDow));
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + i)));
  }
  return cells;
}

export function isBlocked(iso: string, blocked: string[]): boolean {
  return blocked.includes(iso);
}

export function isInRange(iso: string, minIso: string, maxIso: string): boolean {
  return iso >= minIso && iso <= maxIso;
}
