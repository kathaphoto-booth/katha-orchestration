'use client';

import { cn } from '@/lib/utils';

/**
 * KNarrativeThread — woven data list.
 *
 * Items are connected by a thin SVG path between circular indicators.
 * Each item shows a small dot:
 *   • Filled (Iron Bark) when `complete` is true
 *   • Outline-only when pending
 *
 * When ALL items are complete, a small brass-ring stamp with "KTHA"
 * appears at the bottom of the thread — a seal of completion.
 *
 * The connecting line uses Piña Ecru at stroke-width 1,
 * evoking the warp thread of a Piña loom.
 */

interface KNarrativeThreadItem {
  label: string;
  description?: string;
  complete?: boolean;
}

interface KNarrativeThreadProps {
  items: KNarrativeThreadItem[];
  className?: string;
}

/** Vertical spacing between item centers in SVG units */
const ITEM_GAP = 56;
/** Radius of the indicator dot */
const DOT_RADIUS = 4;
/** Horizontal center of the indicator column */
const DOT_CX = 12;
/** Start Y for the first dot */
const DOT_START_Y = 12;

export function KNarrativeThread({ items, className }: KNarrativeThreadProps) {
  const allComplete = items.length > 0 && items.every((item) => item.complete);
  const completedCount = items.filter((item) => item.complete).length;

  /** Total SVG height: items + optional brass ring space */
  const threadHeight = (items.length - 1) * ITEM_GAP + DOT_START_Y * 2;
  const totalHeight = allComplete ? threadHeight + 48 : threadHeight;

  return (
    <div
      className={cn('relative', className)}
      role="list"
      aria-label={`Narrative thread: ${completedCount} of ${items.length} steps complete`}
    >
      {/* SVG thread + dots layer — positioned behind the text */}
      <svg
        className="absolute left-0 top-0"
        width={DOT_CX * 2}
        height={totalHeight}
        viewBox={`0 0 ${DOT_CX * 2} ${totalHeight}`}
        fill="none"
        aria-hidden="true"
      >
        {/* Connecting line between first and last dot */}
        {items.length > 1 && (
          <line
            x1={DOT_CX}
            y1={DOT_START_Y}
            x2={DOT_CX}
            y2={DOT_START_Y + (items.length - 1) * ITEM_GAP}
            stroke="var(--katha-pina-ecru)"
            strokeWidth={1}
          />
        )}

        {/* Indicator dots */}
        {items.map((item, index) => {
          const cy = DOT_START_Y + index * ITEM_GAP;
          return (
            <circle
              key={index}
              cx={DOT_CX}
              cy={cy}
              r={DOT_RADIUS}
              fill={item.complete ? 'var(--katha-iron-bark)' : 'none'}
              stroke="var(--katha-iron-bark)"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Brass-ring stamp when all complete */}
        {allComplete && (
          <g>
            <circle
              cx={DOT_CX}
              cy={threadHeight + 28}
              r={14}
              fill="none"
              stroke="var(--katha-champagne-heirloom)"
              strokeWidth={1.5}
            />
            <text
              x={DOT_CX}
              y={threadHeight + 32}
              textAnchor="middle"
              fill="var(--katha-champagne-heirloom)"
              style={{
                fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                fontSize: '7px',
                letterSpacing: '0.08em',
              }}
            >
              KTHA
            </text>
          </g>
        )}
      </svg>

      {/* Text items */}
      <div className="flex flex-col" style={{ gap: `${ITEM_GAP - 20}px` }}>
        {items.map((item, index) => (
          <div
            key={index}
            role="listitem"
            className="flex items-start"
            style={{
              paddingLeft: `${DOT_CX * 2 + 12}px`,
              minHeight: `${ITEM_GAP}px`,
            }}
          >
            <div>
              <span
                className={cn(
                  'font-ui text-sm block leading-snug',
                  item.complete
                    ? 'text-katha-iron-bark'
                    : 'text-katha-iron-bark/50'
                )}
              >
                {item.label}
              </span>
              {item.description && (
                <span
                  className={cn(
                    'font-body text-xs block mt-1 leading-relaxed',
                    item.complete
                      ? 'text-katha-iron-bark/70'
                      : 'text-katha-iron-bark/30'
                  )}
                >
                  {item.description}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
