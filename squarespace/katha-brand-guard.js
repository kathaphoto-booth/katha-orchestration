/**
 * KATHA BRAND GUARD — Squarespace live DOM enforcement
 * ──────────────────────────────────────────────────────────────────
 * Paste the entire contents of this file into:
 *   Settings → Advanced → Code Injection → FOOTER
 *   (wrap in <script> tags)
 *
 * What it does (Vince-Alignment 2.0, 2026-06-18):
 *   1. Corrects pure-black + legacy-OAX hex in inline styles → palette law
 *   2. Replaces OAX brand-name + legacy email → Katha (residual cruft cleanup)
 *   3. Rewrites forbidden voice tokens → canon substitutes. Note: `Curated`
 *      and `Handcrafted` are PERMITTED ≤3 uses per page each (Jed 2026-06-18
 *      narrowing). The guard COUNTS occurrences and logs `console.warn` on
 *      excess; it does NOT auto-rewrite the cap-exceeded instances (editorial
 *      discipline, not hostile enforcement of Vince's surface).
 *
 * What it INTENTIONALLY does NOT do:
 *   - Rewrite Vince's CTAs ("Request Bespoke Proposal", "Secure An
 *     Architecture"). "Commission" is the master CTA on book.kathabooth.com
 *     only. (2026-06-17 CTA-preservation lift survives the 2026-06-18 voice
 *     narrowing.)
 *   - Strip border-radius from his styling.
 *   - Replace his fonts (IvyMode + Proxima Nova are canon on both surfaces
 *     under Vince-Alignment 2.0).
 *
 * Runs once on DOMContentLoaded, then watches for Vince's CMS edits
 * via MutationObserver. Debounced at 50ms to stay performant.
 *
 * NOTE: This patches the RENDERED DOM only. The underlying Squarespace
 * CMS data is unchanged. Violations will re-appear if the page is
 * re-published with the same text. Fix the canonical CMS text when
 * you get a chance — the guard is a safety net, not a substitute.
 *
 * CANON SOURCE: DESIGN.md + vault patterns.md (2026-06-17)
 * ──────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  // ── Forbidden hex → nearest canon token ──────────────────────────
  // Map lowercase #rrggbb → replacement.
  const HEX_CORRECTIONS = {
    '#000000': '#0B0C10',  // → Obsidian (dark grounds resolve here; legacy #111112 target retired 2026-07-07)
    '#ffffff': '#EAE2D5',  // → Piña Ecru
    '#f9f6f0': '#EAE2D5',  // → Piña Ecru (near-miss, still forbidden)
    // Retired reds (2026-07-07 CTA integration) — corrects FROM the old
    // Loko Rust sacred-CTA fill #8C382A and its near-miss #9A3D2A.
    '#8c382a': '#3D2B1F',  // → Kamagong
    '#9a3d2a': '#3D2B1F',  // → Kamagong
    // OAX legacy palette
    '#0a0806': '#1A1816',  // → Knalum Ink
    '#bf9d2c': '#C4B59D',  // → Champagne Heirloom
    '#c4c1b8': '#9C958A',  // → Hammered Sequin
  };

  // ── OAX legacy brand-name cleanup ────────────────────────────────
  // Residual cruft from the prior brand identity.
  const VOICE_CORRECTIONS = [
    { re: /\bOAX Photo Booth\b/g,         with: 'Katha Booth' },
    { re: /\bOax Photo Booth\b/g,         with: 'Katha Booth' },
    { re: /\binfo@oaxphotobooth\.com\b/g, with: 'kathabooth@gmail.com' },
    { re: /\bOAX\b/g,                     with: 'Katha' },
    { re: /\bOax\b/g,                     with: 'Katha' },

    // ── Forbidden voice (Vince-Alignment 2.0, 2026-06-18 re-narrow) ──
    // Auto-rewrite the 13 forbidden tokens. `Curated` and `Handcrafted`
    // are PERMITTED (≤3 uses/page each — count + warn, NOT here).
    { re: /\btimeless\b/gi,        with: 'enduring' },
    { re: /\bcuration\b/gi,        with: 'composition' },
    { re: /\bcurating\b/gi,        with: 'composing' },
    { re: /\bexperiences\b/gi,     with: 'events' },
    { re: /\bexperience\b/gi,      with: 'event' },
    { re: /\bkeepsake\b/gi,        with: 'heirloom' },
    { re: /\bjourney\b/gi,         with: 'process' },
    { re: /\bunforgettable\b/gi,   with: 'enduring' },
    { re: /\bstunning\b/gi,        with: 'composed' },
    { re: /\bamazing\b/gi,         with: 'precise' },
    { re: /\bmagical\b/gi,         with: 'deliberate' },
    { re: /\belevating\b/gi,       with: 'refining' },
    { re: /\belevate\b/gi,         with: 'refine' },
  ];

  // ── Permitted-but-capped voice (≤3 per page each) ────────────────
  // Count occurrences across the live DOM; warn if exceeded.
  // Editorial discipline, not auto-rewrite — Vince keeps authorship.
  const PERMITTED_CAPPED = [
    { word: 'Curated',     cap: 3 },
    { word: 'Handcrafted', cap: 3 },
  ];

  // ── Expand shorthand #rgb → #rrggbb, lowercase ───────────────────
  function normaliseHex(h) {
    const s = h.toLowerCase();
    if (/^#[0-9a-f]{3}$/.test(s)) {
      return '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
    }
    return s;
  }

  // ── Patch inline style attributes for forbidden hex ───────────────
  function patchStyle(el) {
    const raw = el.getAttribute('style');
    if (!raw) return;
    const patched = raw.replace(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/g, function (h) {
      return HEX_CORRECTIONS[normaliseHex(h)] || h;
    });
    if (patched !== raw) el.setAttribute('style', patched);
  }

  // ── Patch text nodes for forbidden voice + OAX brand name ─────────
  function patchText(node) {
    let text = node.nodeValue;
    if (!text || !text.trim()) return;
    let changed = false;
    for (const { re, with: w } of VOICE_CORRECTIONS) {
      const next = text.replace(re, w);
      if (next !== text) { text = next; changed = true; }
    }
    if (changed) node.nodeValue = text;
  }

  // ── Walk a subtree, applying all patches ──────────────────────────
  function scanSubtree(root) {
    if (!root || root.nodeType !== Node.ELEMENT_NODE) return;
    // Skip subtrees that don't need scanning
    const tag = root.nodeName;
    if (tag === 'STYLE' || tag === 'SCRIPT' || tag === 'NOSCRIPT' || tag === 'SVG') return;

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          const n = node.nodeName;
          if (n === 'STYLE' || n === 'SCRIPT' || n === 'NOSCRIPT') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        patchStyle(node);
      } else if (node.nodeType === Node.TEXT_NODE) {
        patchText(node);
      }
    }
  }

  // ── Debounced MutationObserver ────────────────────────────────────
  let debounceTimer;
  const pendingRoots = new Set();

  const observer = new MutationObserver(function (mutations) {
    for (const m of mutations) {
      if (m.type === 'childList') {
        m.addedNodes.forEach(function (n) {
          if (n.nodeType === Node.ELEMENT_NODE) pendingRoots.add(n);
        });
      } else if (m.type === 'attributes' && m.attributeName === 'style') {
        patchStyle(m.target);
      } else if (m.type === 'characterData') {
        patchText(m.target);
      }
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      pendingRoots.forEach(scanSubtree);
      pendingRoots.clear();
      auditCaps();
    }, 50);
  });

  // ── Permitted-but-capped audit (debounced 1s, fires console.warn) ─
  let auditTimer;
  function auditCaps() {
    clearTimeout(auditTimer);
    auditTimer = setTimeout(function () {
      const text = document.body.innerText || '';
      for (const { word, cap } of PERMITTED_CAPPED) {
        const re = new RegExp('\\b' + word + '\\b', 'gi');
        const matches = text.match(re) || [];
        if (matches.length > cap) {
          console.warn(
            '[Katha brand-guard] "' + word + '" used ' + matches.length +
            ' times on this page — cap is ' + cap +
            ' (Vince-Alignment 2.0, 2026-06-18).'
          );
        }
      }
    }, 1000);
  }

  // ── Boot ──────────────────────────────────────────────────────────
  function boot() {
    scanSubtree(document.body);
    auditCaps();
    observer.observe(document.body, {
      subtree:         true,
      childList:       true,
      characterData:   true,
      attributes:      true,
      attributeFilter: ['style'],
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
