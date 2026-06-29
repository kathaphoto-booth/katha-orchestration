import { PRESETS, type PhotoboothPreset } from './templates';

const FORMATS = ['strip', 'postcard-vertical', 'postcard'] as const;

export function getFeaturedPresets(): PhotoboothPreset[] {
  const out: PhotoboothPreset[] = [];
  for (const fmt of FORMATS) {
    const signature = PRESETS.find(p => p.type === fmt && p.name.includes('Signature'));
    const classic   = PRESETS.find(p => p.type === fmt && !p.name.includes('Signature'));
    if (signature) out.push(signature);
    if (classic)   out.push(classic);
  }
  return out;
}
