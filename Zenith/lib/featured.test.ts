import { describe, it, expect } from 'vitest';
import { getFeaturedPresets } from './featured';
import { PRESETS } from './templates';

describe('getFeaturedPresets', () => {
  it('returns up to 6 presets', () => {
    const result = getFeaturedPresets();
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(6);
  });

  it('returns at most one Signature and one Classic per format', () => {
    const result = getFeaturedPresets();
    const counts = new Map<string, { sig: number; cls: number }>();
    for (const p of result) {
      const c = counts.get(p.type) ?? { sig: 0, cls: 0 };
      if (p.name.includes('Signature')) c.sig++; else c.cls++;
      counts.set(p.type, c);
    }
    for (const [, c] of counts) {
      expect(c.sig).toBeLessThanOrEqual(1);
      expect(c.cls).toBeLessThanOrEqual(1);
    }
  });

  it('covers all available formats present in PRESETS', () => {
    const formats = new Set(PRESETS.map(p => p.type));
    const resultFormats = new Set(getFeaturedPresets().map(p => p.type));
    for (const f of formats) {
      expect(resultFormats.has(f)).toBe(true);
    }
  });

  it('is deterministic across calls', () => {
    const a = getFeaturedPresets().map(p => p.id);
    const b = getFeaturedPresets().map(p => p.id);
    expect(a).toEqual(b);
  });
});
