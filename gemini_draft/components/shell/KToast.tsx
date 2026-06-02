'use client';

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

/**
 * KToast — Katha notification toast.
 *
 * Variants:
 *  - 'success'  Capiz Sage background (harvested-husk green)
 *  - 'info'     Champagne Heirloom background (warm-sand neutral)
 *
 * Both carry Iron Bark text and a calado-dotted bottom border —
 * the geometric puncture pattern found in piña cloth.
 *
 * Appears fixed bottom-right, z-40.
 * Auto-dismisses after 4 seconds.
 * Fade-in / fade-out via CSS transition:
 *   duration: var(--dur-base)  = 700ms
 *   easing:   var(--ease-loom) = cubic-bezier(0.22, 1, 0.36, 1)
 */

interface KToastProps {
  message: string;
  variant?: 'success' | 'info';
  visible: boolean;
  onDismiss?: () => void;
}

export function KToast({
  message,
  variant = 'info',
  visible,
  onDismiss,
}: KToastProps) {
  // Internal state drives the CSS transition: we delay unmount until fade-out completes
  const [show, setShow] = useState(false);

  const dismiss = useCallback(() => {
    setShow(false);
    // Allow the fade-out animation to finish (700ms) before calling onDismiss
    const timer = setTimeout(() => {
      onDismiss?.();
    }, 700);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  // Sync internal show state with the `visible` prop
  useEffect(() => {
    if (visible) {
      // Small delay to ensure the initial opacity-0 frame paints first
      const frame = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(frame);
    } else {
      setShow(false);
    }
  }, [visible]);

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (!visible) return;

    const timeout = setTimeout(() => {
      dismiss();
    }, 4000);

    return () => clearTimeout(timeout);
  }, [visible, dismiss]);

  // Don't render at all when not visible AND fully faded out
  if (!visible && !show) return null;

  const variantStyles = {
    success: 'bg-katha-capiz-sage text-katha-iron-bark',
    info: 'bg-katha-champagne-heirloom text-katha-iron-bark',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-6 right-6 z-40',
        'max-w-sm px-5 py-4',
        'rounded-none', // deckled aesthetic — no border-radius
        'font-ui text-sm',
        'shadow-md',
        variantStyles[variant],
      )}
      style={{
        borderBottom: '1px dotted var(--katha-iron-bark)',
        opacity: show ? 1 : 0,
        transition: `opacity var(--dur-base, 700ms) var(--ease-loom, cubic-bezier(0.22, 1, 0.36, 1))`,
        pointerEvents: show ? 'auto' : 'none',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Message */}
        <span className="flex-1 leading-relaxed">{message}</span>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss notification"
          className={cn(
            'flex-shrink-0 mt-0.5',
            'text-katha-iron-bark/60 hover:text-katha-iron-bark',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-katha-iron-bark',
            'cursor-pointer',
          )}
          style={{
            transition: `color var(--dur-fast, 400ms) var(--ease-loom, cubic-bezier(0.22, 1, 0.36, 1))`,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
            aria-hidden="true"
          >
            <line x1="3" y1="3" x2="11" y2="11" />
            <line x1="11" y1="3" x2="3" y2="11" />
          </svg>
        </button>
      </div>
    </div>
  );
}
