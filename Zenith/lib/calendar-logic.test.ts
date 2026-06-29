import { describe, it, expect } from 'vitest';
import { buildMonthGrid, isBlocked, isInRange, formatISO } from './calendar-logic';

describe('formatISO', () => {
  it('formats a Date to YYYY-MM-DD UTC', () => {
    expect(formatISO(new Date(Date.UTC(2026, 6, 4)))).toBe('2026-07-04');
  });
});

describe('buildMonthGrid', () => {
  it('returns 42 cells (6 weeks × 7 days)', () => {
    expect(buildMonthGrid(2026, 6).length).toBe(42);
  });

  it('first cell is a Sunday', () => {
    expect(buildMonthGrid(2026, 6)[0].getUTCDay()).toBe(0);
  });

  it('contains July 1 2026 (Wednesday) at index 3', () => {
    const grid = buildMonthGrid(2026, 6);
    expect(formatISO(grid[3])).toBe('2026-07-01');
  });
});

describe('isBlocked', () => {
  it('returns true when date is in blocked list', () => {
    expect(isBlocked('2026-07-04', ['2026-07-04', '2026-12-31'])).toBe(true);
  });
  it('returns false when not in list', () => {
    expect(isBlocked('2026-07-05', ['2026-07-04'])).toBe(false);
  });
});

describe('isInRange', () => {
  it('returns true when iso is between min and max inclusive', () => {
    expect(isInRange('2026-08-15', '2026-07-27', '2027-12-27')).toBe(true);
  });
  it('returns false when before min', () => {
    expect(isInRange('2026-07-01', '2026-07-27', '2027-12-27')).toBe(false);
  });
  it('returns false when after max', () => {
    expect(isInRange('2028-01-01', '2026-07-27', '2027-12-27')).toBe(false);
  });
});
