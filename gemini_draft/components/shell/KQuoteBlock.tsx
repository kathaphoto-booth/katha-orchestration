import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { KMeta } from './KTypography';

/**
 * KQuoteBlock — pull quote / testimonial.
 *
 * Fraunces italic, Champagne Heirloom hairline on the left (the loom thread).
 * Attribution in mono KMeta beneath.
 * Use for client perspectives, founder lines, philosophy callouts.
 */
export function KQuoteBlock({
  children,
  author,
  role,
  dark = false,
  className,
}: {
  children: ReactNode;
  author?: string;
  role?: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        'border-l-2 border-katha-champagne-heirloom pl-8 max-w-2xl',
        className
      )}
    >
      <blockquote
        className={cn(
          'font-display italic text-[1.875rem] leading-[1.3]',
          dark ? 'text-text-on-dark' : 'text-text-primary'
        )}
      >
        {children}
      </blockquote>
      {(author || role) && (
        <figcaption className="mt-6">
          {author && <KMeta dark={dark}>{author}</KMeta>}
          {author && role && <span className="mx-2 text-text-muted">·</span>}
          {role && (
            <span
              className={cn('font-mono', dark ? 'text-katha-hammered-sequin' : 'text-text-muted')}
              style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}
            >
              {role}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
