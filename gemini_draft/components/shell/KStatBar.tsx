import { cn } from '@/lib/utils';
import { KOrdinal, KMeta } from './KTypography';

interface KStatItem {
  ordinal?: string;
  label: string;
  value: string;
}

/**
 * KStatBar — numerical / spec / metric display.
 *
 * For process steps, booth specs, event details, keepsake metadata.
 * Each item: optional ordinal, a mono label, a Fraunces value.
 * Iron Bark top hairline per item — the loom-frame rule.
 */
export function KStatBar({
  items,
  columns = 3,
  className,
}: {
  items: KStatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const cols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  };

  return (
    <div className={cn('grid grid-cols-1 gap-x-[var(--spacing-element-gap)] gap-y-12', cols[columns], className)}>
      {items.map((item, i) => (
        <div key={i} className="border-t border-katha-hammered-sequin pt-6">
          {item.ordinal && <KOrdinal>{item.ordinal}</KOrdinal>}
          <KMeta className="block mb-3">{item.label}</KMeta>
          <p className="font-display text-[1.5rem] leading-[1.2] text-text-primary">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
