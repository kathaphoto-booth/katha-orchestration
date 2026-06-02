'use client';

import { cn } from '@/lib/utils';

/**
 * KFilterChip — gallery / template filter toggle.
 *
 * Active state: 2px Champagne Heirloom underline, font-weight 500.
 * Inactive: no underline, font-weight 400.
 *
 * NEVER uses Loko Rust — that is reserved for the sacred CTA (KCta 'sacred').
 * The brass ring is not for everything.
 *
 * Hover: subtle opacity lift 0.7 → 1.
 * Transition: var(--dur-fast) = 400ms, var(--ease-loom).
 * No border-radius (rounded-none) — deckled-edge aesthetic.
 */

interface KFilterChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function KFilterChip({
  label,
  active = false,
  onClick,
  className,
}: KFilterChipProps) {
  return (
    <button
      type="button"
      role="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        // Base
        'text-katha-iron-bark font-ui text-sm',
        'px-4 py-2',
        'rounded-none', // deckled aesthetic
        'cursor-pointer',
        'bg-transparent border-0',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-katha-iron-bark',
        // Hover opacity transition
        active ? 'opacity-100' : 'opacity-70 hover:opacity-100',
        className,
      )}
      style={{
        fontWeight: active ? 500 : 400,
        borderBottom: active
          ? '2px solid var(--katha-champagne-heirloom)'
          : '2px solid transparent',
        transition: `
          opacity var(--dur-fast, 400ms) var(--ease-loom, cubic-bezier(0.22, 1, 0.36, 1)),
          border-color var(--dur-fast, 400ms) var(--ease-loom, cubic-bezier(0.22, 1, 0.36, 1)),
          font-weight var(--dur-fast, 400ms) var(--ease-loom, cubic-bezier(0.22, 1, 0.36, 1))
        `.trim(),
      }}
    >
      {label}
    </button>
  );
}
