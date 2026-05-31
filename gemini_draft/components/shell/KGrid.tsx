import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

/**
 * KGrid — enforces Katha's asymmetric grid law.
 *
 * 6/6 symmetric splits are FORBIDDEN — they read generic.
 * All layouts use a Fukinsei (asymmetric) split:
 *  - '7/5'  (default): primary 7-col content, secondary 5-col
 *  - '8/4'            : heavy feature, light sidebar
 *  - '9/3'            : editorial wide, thin annotation
 *  - '5/7'            : secondary-lead (image left, copy right)
 *  - 'full'           : single 12-col full-width block
 *
 * On mobile: always stacks to single column.
 * The `reverse` prop swaps column order on desktop only.
 */
export function KGrid({
  children,
  split = '7/5',
  reverse = false,
  className,
  gap = true,
}: {
  children: ReactNode;
  split?: '7/5' | '8/4' | '9/3' | '5/7' | 'full';
  reverse?: boolean;
  className?: string;
  gap?: boolean;
}) {
  if (split === 'full') {
    return (
      <div className={cn('w-full', className)}>
        {children}
      </div>
    );
  }

  const gridCols = {
    '7/5': 'md:grid-cols-12',
    '8/4': 'md:grid-cols-12',
    '9/3': 'md:grid-cols-12',
    '5/7': 'md:grid-cols-12',
  } as const;

  return (
    <div
      className={cn(
        'grid grid-cols-1',
        gridCols[split],
        gap && 'gap-[var(--spacing-element-gap)]',
        reverse && 'md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * KGridPrimary — the wider column slot.
 * Pair with KGridSecondary inside a KGrid.
 */
export function KGridPrimary({
  children,
  className,
  split = '7/5',
}: {
  children: ReactNode;
  className?: string;
  split?: '7/5' | '8/4' | '9/3' | '5/7';
}) {
  const spans = {
    '7/5': 'md:col-span-7',
    '8/4': 'md:col-span-8',
    '9/3': 'md:col-span-9',
    '5/7': 'md:col-span-5',
  };
  return (
    <div className={cn(spans[split], className)}>
      {children}
    </div>
  );
}

/**
 * KGridSecondary — the narrower column slot.
 */
export function KGridSecondary({
  children,
  className,
  split = '7/5',
}: {
  children: ReactNode;
  className?: string;
  split?: '7/5' | '8/4' | '9/3' | '5/7';
}) {
  const spans = {
    '7/5': 'md:col-span-5',
    '8/4': 'md:col-span-4',
    '9/3': 'md:col-span-3',
    '5/7': 'md:col-span-7',
  };
  return (
    <div className={cn(spans[split], className)}>
      {children}
    </div>
  );
}
