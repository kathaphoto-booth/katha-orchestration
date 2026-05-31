import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import Image from 'next/image';
import { DeckledCard } from '@/components/DeckledCard';
import { KGrid, KGridPrimary, KGridSecondary } from './KGrid';
import { KEyebrow, KHeading, KBody, KOrdinal } from './KTypography';
import { KCta } from './KCta';

/**
 * KFeatureCard — the standard image + text content pattern.
 *
 * The most-injected block: brother drops one of these per idea.
 * Image rides in a DeckledCard (torn edge) with a sombrado shadow plate.
 * Asymmetric 7/5 grid; alternate `reverse` for rhythm down a page.
 *
 * Everything optional except image + heading — the shell fills the rest
 * with correct Katha spacing, type, and color automatically.
 */
export function KFeatureCard({
  image,
  imageAlt,
  ordinal,
  eyebrow,
  heading,
  children,
  ctaLabel,
  ctaHref,
  reverse = false,
  deckled = 'a',
  className,
}: {
  image: string;
  imageAlt: string;
  ordinal?: string;
  eyebrow?: string;
  heading: ReactNode;
  children?: ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  reverse?: boolean;
  deckled?: 'a' | 'b' | 'c';
  className?: string;
}) {
  return (
    <KGrid split="7/5" reverse={reverse} className={cn('items-center', className)}>
      {/* Image — primary 7-col with sombrado shadow plate */}
      <KGridPrimary split="7/5" className="mb-10 md:mb-0">
        <div className="relative">
          {/* Sombrado shadow plate — opaque silhouette behind, offset */}
          <div
            aria-hidden="true"
            className="absolute inset-0 translate-x-1 translate-y-1.5 bg-katha-iron-bark opacity-[0.18]"
            style={{
              maskImage:
                "url(\"data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='black'/%3E%3C/svg%3E\")",
            }}
          />
          <DeckledCard variant={deckled} className="aspect-[4/5] bg-katha-champagne-heirloom relative overflow-hidden">
            <Image
              src={image}
              alt={imageAlt}
              fill
              referrerPolicy="no-referrer"
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover grayscale mix-blend-multiply opacity-80"
            />
          </DeckledCard>
        </div>
      </KGridPrimary>

      {/* Copy — secondary 5-col */}
      <KGridSecondary split="7/5">
        {ordinal && <KOrdinal>{ordinal}</KOrdinal>}
        {eyebrow && <KEyebrow>{eyebrow}</KEyebrow>}
        <KHeading size="xl" className="mb-6">
          {heading}
        </KHeading>
        {children && (
          <KBody size="md" className="mb-8">
            {children}
          </KBody>
        )}
        {ctaLabel && ctaHref && (
          <KCta variant="ghost" href={ctaHref}>
            {ctaLabel}
          </KCta>
        )}
      </KGridSecondary>
    </KGrid>
  );
}
