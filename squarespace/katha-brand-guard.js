/**
 * KATHA BRAND GUARD — Squarespace live DOM enforcement
 * ──────────────────────────────────────────────────────────────────
 * Paste the entire contents of this file into:
 *   Settings → Advanced → Code Injection → FOOTER
 *   (wrap in <script> tags)
 *
 * What it does:
 *   1. Corrects forbidden hex in inline styles → nearest canon token
 *   2. Replaces forbidden voice words in text nodes → canon substitutes
 *   3. Corrects wrong CTA labels on buttons/links → "Commission"
 *   4. Strips border-radius from inline style attributes
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
    '#000000': '#111112',  // → Obsidian Weave
    '#ffffff': '#EAE2D5',  // → Piña Ecru
    '#f9f6f0': '#EAE2D5',  // → Piña Ecru (near-miss, still forbidden)
    // OAX legacy palette
    '#0a0806': '#1A1816',  // → Knalum Ink
    '#bf9d2c': '#C4B59D',  // → Champagne Heirloom
    '#c4c1b8': '#9C958A',  // → Hammered Sequin
  };

  // ── Forbidden voice → canon replacement ──────────────────────────
  // All patterns use word boundaries to avoid over-matching substrings.
  // Order matters: longer/more-specific phrases before shorter roots.
  const VOICE_CORRECTIONS = [
    // OAX brand name (exact first, then short)
    { re: /\bOAX Photo Booth\b/g,       with: 'Katha Booth' },
    { re: /\bOax Photo Booth\b/g,       with: 'Katha Booth' },
    { re: /\binfo@oaxphotobooth\.com\b/g, with: 'kathabooth@gmail.com' },
    { re: /\bOAX\b/g,                   with: 'Katha' },
    { re: /\bOax\b/g,                   with: 'Katha' },
    // Forbidden voice
    { re: /\bcuration\b/gi,             with: 'composition' },
    { re: /\bcurating\b/gi,             with: 'composing' },
    { re: /\bcurated\b/gi,              with: 'considered' },
    { re: /\bexperiences\b/gi,          with: 'events' },
    { re: /\bexperience\b/gi,           with: 'event' },
    { re: /\btimeless\b/gi,             with: 'enduring' },
    { re: /\bkeepsake\b/gi,             with: 'heirloom' },
    { re: /\bjourney\b/gi,              with: 'process' },
    { re: /\bunforgettable\b/gi,        with: 'enduring' },
    { re: /\bstunning\b/gi,             with: 'composed' },
    { re: /\bamazing\b/gi,              with: 'precise' },
    { re: /\bmagical\b/gi,              with: 'deliberate' },
    { re: /\belevate\b/gi,              with: 'refine' },
    { re: /\belevating\b/gi,            with: 'refining' },
  ];

  // ── Wrong CTA labels → "Commission" ──────────────────────────────
  // Applied only to button/link text nodes, not all body copy.
  const CTA_CORRECTIONS = [
    { re: /Request Bespoke Proposal/gi, with: 'Commission' },
    { re: /Secure An Architecture/gi,   with: 'Commission' },
    { re: /Secure an Architecture/gi,   with: 'Commission' },
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

  // ── Strip border-radius from inline styles ────────────────────────
  function patchRadius(el) {
    const raw = el.getAttribute('style');
    if (!raw || !raw.includes('border-radius')) return;
    el.setAttribute('style', raw.replace(/border-radius\s*:[^;]+;?/gi, 'border-radius:0;'));
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

  // ── Patch CTA text on button/link elements ────────────────────────
  // Only touches elements with a single text-node child to avoid
  // destroying complex children (icon + label combos, etc.).
  function patchCTA(el) {
    if (!el.matches('a, button, [role="button"], .sqs-block-button-element')) return;
    if (el.childNodes.length !== 1 || el.firstChild.nodeType !== Node.TEXT_NODE) return;
    let text = el.firstChild.nodeValue;
    let changed = false;
    for (const { re, with: w } of CTA_CORRECTIONS) {
      const next = text.replace(re, w);
      if (next !== text) { text = next; changed = true; }
    }
    if (changed) el.firstChild.nodeValue = text;
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
        patchRadius(node);
        patchCTA(node);
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
        patchRadius(m.target);
      } else if (m.type === 'characterData') {
        patchText(m.target);
      }
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      pendingRoots.forEach(scanSubtree);
      pendingRoots.clear();
    }, 50);
  });

  // ── Boot ──────────────────────────────────────────────────────────
  function boot() {
    scanSubtree(document.body);
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
