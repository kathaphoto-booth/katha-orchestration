export type Tier = {
  id: 'Signature' | 'Editorial' | 'Modernist' | 'Monochrome';
  price: number;
  flagship?: boolean;
  booth: 'Oak' | 'White';
  formats: string;
  blurb: string;
};

export const TIERS: Tier[] = [
  { id: 'Signature',  price: 949,  booth: 'Oak',   formats: '2×6 or 4×6', blurb: 'Weathered oak booth, DSLR capture, archival cotton prints handed over in the room.' },
  { id: 'Editorial',  price: 1149, booth: 'Oak',   formats: '4×6', flagship: true, blurb: 'The full build — oak booth, refined black-and-white retouching, every print hand-finished.' },
  { id: 'Modernist',  price: 749,  booth: 'White', formats: '2×6 or 4×6', blurb: 'The white shell booth, built for galleries, lofts, and modern rooms.' },
  { id: 'Monochrome', price: 949,  booth: 'White', formats: '4×6', blurb: 'The white booth tuned for high-contrast black-and-white, razor frames that last.' },
];

export const ADDONS: Record<string, number> = {
  'Heirloom Guestbook': 150,
  'Extra Hour of Service': 200,
  'Custom Backdrop': 250,
};
