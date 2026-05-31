/**
 * Katha motion enhancements — Next.js portal ONLY (book.kathabooth.com).
 * Do NOT use on the Squarespace storefront; these fight the platform.
 * All are gated behind prefers-reduced-motion + coarse-pointer checks.
 *
 * Harvested and bug-fixed from the quiet_lux boilerplate:
 *  - SpringCursor : spring-follower cursor with media-morph label
 *  - Magnetic     : cursor-attraction (fixed stale-bounds bug)
 *  - WhisperReveal: line-rise reveal (IntersectionObserver, no GSAP)
 *  - ScrollReveal : clip-path mask + parallax (native view-timeline + JS fallback;
 *                   fixes the missing ScrollTrigger-plugin bug)
 */
export { SpringCursor } from './SpringCursor';
export { Magnetic } from './Magnetic';
export { WhisperReveal } from './WhisperReveal';
export { ScrollReveal } from './ScrollReveal';
