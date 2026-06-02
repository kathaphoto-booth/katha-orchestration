/**
 * Katha Design Shell — barrel export.
 *
 * Import any primitive from one path:
 *   import { KSection, KGrid, KHeading, KCta } from '@/components/shell';
 *
 * These primitives encode the Katha spatial + type + color grammar.
 * Any content composed through them inherits the brand automatically.
 */

export { KSection } from './KSection';
export { KGrid, KGridPrimary, KGridSecondary } from './KGrid';
export {
  KEyebrow,
  KHeading,
  KBody,
  KMeta,
  KOrdinal,
} from './KTypography';
export { KCta } from './KCta';
export { KFeatureCard } from './KFeatureCard';
export { KQuoteBlock } from './KQuoteBlock';
export { KStatBar } from './KStatBar';
export { KNarrativeThread } from './KNarrativeThread';
export { KToast } from './KToast';
export { KFilterChip } from './KFilterChip';
export { KBinakulField } from './KBinakulField';
export { SequinCanvas } from './SequinCanvas';

// Marks (re-exported for one-stop importing)
export { KathaWordmark } from '../marks/KathaWordmark';
export { KathaLogomark } from '../marks/KathaLogomark';
export { KthaMark } from '../marks/KthaMark';
export { KathaThread } from '../marks/KathaThread';
export { CaladoDivider } from '../marks/CaladoDivider';
export { DeckledCard, DeckledCardRotator } from '../DeckledCard';

// Enhancements (re-exported for convenience)
export { ScrollRevealCSS } from '../enhancements/ScrollRevealCSS';

