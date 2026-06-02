import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

/**
 * DeckledCard — replaces every rectangular container border.
 * Mimics the salvage edge of hand-torn abacá paper or frayed loom weave.
 *
 * Three mask variants for visual asymmetry (Fukinsei):
 *  - 'a' (default): top edge torn, others loose
 *  - 'b': right edge torn, asymmetric lean
 *  - 'c': full perimeter irregular
 *
 * Squarespace note: same data-URI mask works in CSS Code Blocks.
 * Fallback: @supports check provides clip-path inset for browsers
 * without mask-image support (per modern-web-guidance: complex-shapes).
 */

const MASKS = {
  // Top edge heavily torn, sides loose, bottom clean-ish
  a: `url("data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 1,4 Q 8,0 16,3 Q 24,6 32,1 Q 40,0 48,3 Q 55,6 63,2 Q 71,0 79,4 Q 87,7 95,2 Q 99,1 99,8 Q 100,25 98,42 Q 100,60 99,77 Q 100,88 98,95 Q 90,100 78,98 Q 65,100 52,99 Q 39,100 26,98 Q 13,100 2,99 Q 0,90 1,77 Q 0,60 2,42 Q 0,25 1,8 Z' fill='black'/%3E%3C/svg%3E")`,

  // Right edge torn — asymmetric lean (Fukinsei)
  b: `url("data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 2,2 Q 50,0 98,3 Q 100,10 97,22 Q 100,33 96,44 Q 100,55 97,67 Q 100,78 96,88 Q 100,95 98,99 Q 75,100 52,98 Q 28,100 5,99 Q 0,90 2,75 Q 0,60 2,45 Q 0,30 2,15 Z' fill='black'/%3E%3C/svg%3E")`,

  // Full perimeter irregular — the most wabi-sabi
  c: `url("data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 3,2 Q 12,0 22,3 Q 33,1 44,4 Q 56,0 67,3 Q 78,1 89,4 Q 97,2 99,6 Q 100,18 97,30 Q 100,42 98,55 Q 100,67 97,80 Q 100,90 98,97 Q 88,100 76,97 Q 64,100 52,98 Q 40,100 28,97 Q 16,100 4,98 Q 0,90 2,78 Q 1,66 3,54 Q 0,42 2,30 Q 0,18 3,6 Z' fill='black'/%3E%3C/svg%3E")`,
} as const;

type DeckledVariant = keyof typeof MASKS;

const VARIANT_ORDER: DeckledVariant[] = ['a', 'b', 'c'];

export function DeckledCard({
  children,
  className,
  variant = 'a',
}: {
  children: ReactNode;
  className?: string;
  variant?: DeckledVariant;
}) {
  const mask = MASKS[variant];

  return (
    <div
      className={cn('overflow-hidden', className)}
      style={{
        // Standard (modern browsers — Baseline since Dec 2023)
        maskImage: mask,
        maskSize: '100% 100%',
        maskPosition: 'center',
        maskRepeat: 'no-repeat',
        // Vendor prefix (mandatory per modern-web-guidance for wider support)
        WebkitMaskImage: mask,
        WebkitMaskSize: '100% 100%',
        WebkitMaskPosition: 'center',
        WebkitMaskRepeat: 'no-repeat',
        // No border-radius — deckled, never rounded
        borderRadius: 0,
      }}
    >
      {children}
    </div>
  );
}

/**
 * DeckledCardRotator — automatically cycles through a|b|c variants
 * based on item index to prevent visual repetition in lists/grids.
 *
 * Usage:
 *   {items.map((item, i) => (
 *     <DeckledCardRotator key={item.id} index={i}>
 *       <img src={item.src} />
 *     </DeckledCardRotator>
 *   ))}
 */
export function DeckledCardRotator({
  children,
  index,
  className,
}: {
  children: ReactNode;
  index: number;
  className?: string;
}) {
  const variant = VARIANT_ORDER[index % VARIANT_ORDER.length];

  return (
    <DeckledCard variant={variant} className={className}>
      {children}
    </DeckledCard>
  );
}
