#!/usr/bin/env node
// build_katha_dashboard.mjs — Katha State Map generator (HAM era).
// Reads the live .memory/ nodes and emits a self-contained, on-brand HTML
// dashboard: KATHA_STATE.html. Replaces the deprecated HCL_DASHBOARD.html.
// Single source of truth = .memory/, so the map can never drift from canon.
//
// Usage:  node scripts/build_katha_dashboard.mjs [--stamp "YYYY-MM-DD HH:MM"]
// Writes to BOTH the Vault (persistent on Samsung 970) and the repo root.

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";

// Paths overridable via env for portability (new machine / CI).
const VAULT = process.env.KATHA_VAULT || "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge";
const MEM = `${VAULT}/.memory`;
const REPO = process.env.KATHA_REPO || "/Users/jedg./Desktop/kat_ha_pb";

// Timestamp passed in (scripts can't use Date.now reliably across harnesses);
// fall back to a literal if absent.
const stampArg = process.argv.indexOf("--stamp");
const STAMP = stampArg > -1 ? process.argv[stampArg + 1] : "see git log";

const driveLive = existsSync(`${MEM}/patterns.md`);
const memDir = driveLive ? MEM : `${REPO}/.memory.mirror`;
const read = (f) => { try { return readFileSync(`${memDir}/${f}`, "utf8"); } catch { return ""; } };

let handoff = {};
try {
  handoff = JSON.parse(read("SESSION_HANDOFF.json") || "{}");
} catch (e) {
  console.log(`⚠️  SESSION_HANDOFF.json is malformed JSON — roadmap/architecture widgets will be empty.`);
  console.log(`   ${e.message}`);
  console.log(`   Fix the JSON and re-run; the dashboard will NOT reflect current state until you do.`);
}
const patternsMd = read("patterns.md");
const decisionsMd = read("decisions.md");
const inboxMd = read("inbox.md");

// ── helpers ───────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Pull hex swatches from patterns.md §1 tables: | Name | `#hex` | role |
function parsePalette(md) {
  const out = [];
  const re = /\|\s*([^|]+?)\s*\|\s*`(#[0-9A-Fa-f]{6})`\s*\|\s*([^|]+?)\s*\|/g;
  let m;
  while ((m = re.exec(md))) {
    const name = m[1].trim();
    if (/^token$/i.test(name) || name.startsWith("`") || name.includes("--")) continue; // skip header / var rows (handled below)
    out.push({ name, hex: m[2], role: m[3].trim() });
  }
  // ecru-safe vars: | `--katha-ecru-muted` | `#hex` | contrast |
  const re2 = /\|\s*`(--katha-ecru-[a-z-]+)`\s*\|\s*`(#[0-9A-Fa-f]{6})`\s*\|\s*([^|]+?)\s*\|/g;
  while ((m = re2.exec(md))) out.push({ name: m[1], hex: m[2], role: m[3].trim() });
  return out;
}

// Parse inbox checkboxes grouped by ## section
function parseInbox(md) {
  const groups = [];
  let cur = null;
  for (const line of md.split("\n")) {
    const h = line.match(/^##\s+(.*)/);
    if (h) { cur = { title: h[1].trim(), items: [] }; groups.push(cur); continue; }
    const it = line.match(/^\s*-\s*\[([ xX])\]\s*(.*)/);
    if (it && cur) cur.items.push({ done: it[1].toLowerCase() === "x", text: it[2].replace(/\*\*/g, "").trim() });
  }
  return groups.filter((g) => g.items.length);
}

// Extract a markdown section body by heading text (until next same/higher heading)
function section(md, headingRe) {
  const lines = md.split("\n");
  let start = -1, level = 0;
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^(#{1,6})\s+(.*)/);
    if (h && headingRe.test(h[2])) { start = i + 1; level = h[1].length; break; }
  }
  if (start === -1) return "";
  const body = [];
  for (let i = start; i < lines.length; i++) {
    const h = lines[i].match(/^(#{1,6})\s+/);
    if (h && h[1].length <= level) break;
    body.push(lines[i]);
  }
  return body.join("\n").trim();
}

// Minimal, safe markdown → HTML (headings, bold, code, lists, tables, hr, p)
function md2html(md) {
  if (!md) return "";
  const lines = md.split("\n");
  let html = "", inUl = false, tbl = null;
  const inline = (t) => esc(t)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[\[([^\]]+)\]\]/g, "<em>$1</em>");
  const closeUl = () => { if (inUl) { html += "</ul>"; inUl = false; } };
  const closeTbl = () => {
    if (tbl) {
      html += "<table>" + tbl.rows.map((r, i) =>
        "<tr>" + r.map((c) => (i === 0 ? `<th>${inline(c)}</th>` : `<td>${inline(c)}</td>`)).join("") + "</tr>"
      ).join("") + "</table>";
      tbl = null;
    }
  };
  for (let raw of lines) {
    const line = raw.replace(/\s+$/, "");
    if (/^\|(.+)\|$/.test(line)) {
      const cells = line.slice(1, -1).split("|").map((c) => c.trim());
      if (/^[-:\s|]+$/.test(line.replace(/\|/g, ""))) continue; // separator row
      if (!tbl) tbl = { rows: [] };
      tbl.rows.push(cells);
      continue;
    } else closeTbl();
    const h = line.match(/^(#{1,6})\s+(.*)/);
    if (h) { closeUl(); html += `<h4>${inline(h[2])}</h4>`; continue; }
    const li = line.match(/^\s*[-*]\s+(.*)/);
    if (li) { if (!inUl) { html += "<ul>"; inUl = true; } html += `<li>${inline(li[1])}</li>`; continue; }
    closeUl();
    if (/^---+$/.test(line)) { html += "<hr>"; continue; }
    if (line.trim() === "") continue;
    if (/^>/.test(line)) { html += `<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`; continue; }
    html += `<p>${inline(line)}</p>`;
  }
  closeUl(); closeTbl();
  return html;
}

// ── widgets ─────────────────────────────────────────────────────────────
const palette = parsePalette(patternsMd);
const inbox = parseInbox(inboxMd);
const roadmap = handoff.roadmap || {};

const statusColor = (s = "") => {
  s = s.toUpperCase();
  if (s.includes("COMPLETE")) return "var(--capiz)";
  if (s.includes("ACTIVE")) return "var(--loko)";
  return "var(--abel)";
};

const phaseCards = Object.entries(roadmap).map(([key, p]) => `
  <div class="phase" style="border-top:3px solid ${statusColor(p.status)}">
    <div class="phase-h">
      <span class="phase-k">${esc(key.replace("_", " ").toUpperCase())}</span>
      <span class="badge" style="background:${statusColor(p.status)}">${esc(p.status || "")}</span>
    </div>
    <div class="phase-t">${esc(p.title || "")}</div>
    <ul class="steps">${(p.steps || []).map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
  </div>`).join("");

const swatches = palette.map((c) => `
  <div class="sw">
    <div class="chip" style="background:${c.hex}"></div>
    <div class="sw-meta"><b>${esc(c.name)}</b><code>${c.hex}</code><span>${esc(c.role)}</span></div>
  </div>`).join("");

const openCount = inbox.reduce((n, g) => n + g.items.filter((i) => !i.done).length, 0);
const inboxHtml = inbox.map((g) => `
  <div class="ibx-group">
    <h4>${esc(g.title)}</h4>
    <ul>${g.items.map((i) => `<li class="${i.done ? "done" : ""}">${i.done ? "✓" : "○"} ${esc(i.text)}</li>`).join("")}</ul>
  </div>`).join("");

const arch = handoff.architectural_state || {};
const archHtml = Object.entries(arch).map(([k, v]) =>
  `<div class="kv"><b>${esc(k.replace(/_/g, " "))}</b><span>${esc(v)}</span></div>`).join("");

const boundaries = (handoff.strict_boundaries || []).map((b) => `<li>${esc(b)}</li>`).join("");

// Handoff panel — latest AG→CC artifacts from .memory/handoff/
const handoffDir = `${memDir}/handoff`;
let handoffPanels = "";
try {
  const allDated = readdirSync(handoffDir).filter((f) => /^\d/.test(f) && f.endsWith(".md")).sort().reverse();
  const visible = allDated.slice(0, 3);
  const moreCount = allDated.length - 3;
  handoffPanels = visible.map((f) => {
    const parts = f.replace(".md", "").split("_");
    const date = parts[0] || "";
    const type = parts[parts.length - 1] || "";
    const slug = parts.slice(1, parts.length - 1).join("-") || "";
    const body = md2html(readFileSync(`${handoffDir}/${f}`, "utf8"));
    return `<details class="hoff">
      <summary class="hoff-hd"><span class="hoff-date">${esc(date)}</span> · <span class="hoff-slug">${esc(slug)}</span> · <span class="hoff-type">${esc(type)}</span></summary>
      <div class="hoff-body prose">${body}</div>
    </details>`;
  }).join("");
  if (visible.length === 0) handoffPanels = `<p style="font-size:12px;color:var(--abel)">No handoff artifacts yet.</p>`;
  if (moreCount > 0) handoffPanels += `<p class="hoff-more">+ ${moreCount} more in .memory/handoff/</p>`;
} catch {
  handoffPanels = `<p style="font-size:11px;color:var(--abel)">handoff/ not found — create .memory/handoff/ to enable.</p>`;
}

// ── compose ───────────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Katha · State Map</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=EB+Garamond&family=Inter:wght@400;500&family=JetBrains+Mono&display=swap" rel="stylesheet">
<style>
:root{--obsidian:#111112;--ecru:#EAE2D5;--loko:#8C382A;--champagne:#C4B59D;--iron:#241E1A;--sequin:#9C958A;--knalum:#1A1816;--terra:#A35C44;--abel:#5A5D5A;--capiz:#B5B8A3;--ecrumut:#6E6A62;}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--obsidian);color:var(--ecru);font-family:'Inter',sans-serif;line-height:1.5;padding:0 0 80px}
.lframe{position:fixed;top:0;left:0;width:16px;height:100vh;background:rgba(196,181,157,.18);border-right:1px solid rgba(196,181,157,.25);pointer-events:none;z-index:99}
.lframe-t{position:fixed;top:0;left:0;width:100vw;height:16px;background:rgba(196,181,157,.18);border-bottom:1px solid rgba(196,181,157,.25);pointer-events:none;z-index:99}
.wrap{max-width:1180px;margin:0 auto;padding:48px 40px 0}
header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid rgba(196,181,157,.2);padding-bottom:24px;margin-bottom:8px}
.brand{font-family:'Fraunces',serif;font-weight:600;font-size:13px;letter-spacing:.5em;color:var(--loko);text-transform:uppercase}
h1{font-family:'Fraunces',serif;font-weight:400;font-size:40px;letter-spacing:-.02em;margin-top:6px}
.meta{text-align:right;font-size:11px;color:var(--sequin);font-family:'JetBrains Mono',monospace;letter-spacing:.04em}
.health{display:inline-block;margin-top:8px;padding:4px 12px;border:1px solid;border-radius:2px;font-size:10px;text-transform:uppercase;letter-spacing:.15em}
.health.ok{border-color:var(--capiz);color:var(--capiz)}
.health.warn{border-color:var(--loko);color:var(--loko)}
section{margin-top:48px}
.eyebrow{font-size:10px;text-transform:uppercase;letter-spacing:.28em;color:var(--ecrumut);margin-bottom:18px;font-family:'Inter'}
.phases{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.phase{background:var(--knalum);padding:18px 16px;border-radius:1px}
.phase-h{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px}
.phase-k{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--sequin);letter-spacing:.1em}
.badge{font-size:8px;color:var(--obsidian);padding:3px 7px;border-radius:1px;text-transform:uppercase;letter-spacing:.1em;font-weight:600}
.phase-t{font-family:'Fraunces',serif;font-size:16px;margin-bottom:10px;color:var(--ecru)}
.steps{list-style:none;font-size:11px;color:var(--ecrumut)}
.steps li{padding:3px 0 3px 12px;position:relative}
.steps li:before{content:'·';position:absolute;left:0;color:var(--champagne)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.swatches{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.sw{display:flex;gap:10px;align-items:center}
.chip{width:40px;height:40px;border-radius:1px;border:1px solid rgba(234,226,213,.15);flex-shrink:0}
.sw-meta{display:flex;flex-direction:column;font-size:11px}
.sw-meta b{font-weight:500}.sw-meta code{font-family:'JetBrains Mono',monospace;color:var(--champagne);font-size:10px}
.sw-meta span{color:var(--ecrumut);font-size:9px;line-height:1.3;margin-top:2px}
.type-row{padding:12px 0;border-bottom:1px dashed rgba(196,181,157,.15)}
.type-row .nm{font-size:10px;color:var(--sequin);text-transform:uppercase;letter-spacing:.15em}
.fr{font-family:'Fraunces',serif;font-size:30px}.eb{font-family:'EB Garamond',serif;font-size:22px}
.in{font-family:'Inter';font-size:18px}.jb{font-family:'JetBrains Mono',monospace;font-size:16px}
.ibx-group{margin-bottom:18px}
.ibx-group h4{font-family:'Inter';font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:var(--champagne);margin-bottom:8px}
.ibx-group ul{list-style:none;font-size:12px}
.ibx-group li{padding:4px 0;color:var(--ecru)}
.ibx-group li.done{color:var(--abel);text-decoration:line-through}
.kv{padding:10px 0;border-bottom:1px dashed rgba(196,181,157,.15)}
.kv b{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--sequin);margin-bottom:3px}
.kv span{font-size:13px;color:var(--ecru)}
.prose h4{font-family:'Fraunces',serif;font-weight:400;font-size:15px;margin:16px 0 6px;color:var(--champagne)}
.prose p{font-size:12.5px;color:var(--ecru);margin:5px 0}
.prose ul{margin:6px 0 6px 18px;font-size:12.5px;color:var(--ecru)}
.prose li{margin:3px 0}
.prose code{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--champagne)}
.prose table{width:100%;border-collapse:collapse;margin:10px 0;font-size:11.5px}
.prose th{text-align:left;color:var(--sequin);text-transform:uppercase;font-size:9px;letter-spacing:.1em;padding:6px;border-bottom:1px solid rgba(196,181,157,.2)}
.prose td{padding:6px;border-bottom:1px dashed rgba(196,181,157,.1);color:var(--ecru)}
.prose hr{border:0;border-top:1px dashed rgba(196,181,157,.15);margin:14px 0}
.prose blockquote{border-left:2px solid var(--terra);padding-left:12px;color:var(--ecrumut);font-size:12px;margin:8px 0}
.triad{display:flex;align-items:center;justify-content:center;gap:18px;font-family:'Fraunces',serif;font-size:18px;padding:18px 0}
.triad .arrow{color:var(--loko);font-size:14px}
.triad .node{text-align:center}.triad .node small{display:block;font-family:'Inter';font-size:9px;color:var(--ecrumut);letter-spacing:.1em;text-transform:uppercase;margin-top:3px}
footer{max-width:1180px;margin:60px auto 0;padding:24px 40px 0;border-top:1px solid rgba(196,181,157,.2);font-size:10px;color:var(--abel);font-family:'JetBrains Mono',monospace}
details.hoff{background:var(--knalum);margin-bottom:12px;border-radius:1px}
.hoff-hd{padding:14px 18px;cursor:pointer;list-style:none;font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--champagne);letter-spacing:.04em;user-select:none}
.hoff-hd::-webkit-details-marker{display:none}
details.hoff[open] .hoff-hd{border-bottom:1px dashed rgba(196,181,157,.2)}
.hoff-date{color:var(--sequin)}.hoff-slug{color:var(--ecru)}.hoff-type{color:var(--terra)}
.hoff-body{padding:18px 18px 14px;max-height:400px;overflow-y:auto}
.hoff-more{font-size:10px;color:var(--sequin);font-family:'JetBrains Mono',monospace;margin-top:8px}
@media(max-width:860px){.phases,.swatches{grid-template-columns:1fr 1fr}.grid2,.grid3{grid-template-columns:1fr}}
</style></head>
<body>
<div class="lframe"></div><div class="lframe-t"></div>
<div class="wrap">
<header>
  <div><div class="brand">katha</div><h1>State Map</h1></div>
  <div class="meta">generated ${esc(STAMP)}<br>checkpoint: ${esc(handoff.checkpoint || "—")}<br>
    <span class="health ${driveLive ? "ok" : "warn"}">${driveLive ? "● Samsung 970 live" : "▲ mirror fallback"}</span>
  </div>
</header>

<section>
  <div class="eyebrow">Roadmap · ${esc(handoff.checkpoint || "")}</div>
  <div class="phases">${phaseCards}</div>
</section>

<section>
  <div class="eyebrow">Latest Handoff · AG → CC</div>
  ${handoffPanels}
</section>

<section>
  <div class="eyebrow">The Triad</div>
  <div class="triad">
    <div class="node">Jed<small>Final Authority</small></div><span class="arrow">→</span>
    <div class="node">CC<small>Orchestrator</small></div><span class="arrow">→</span>
    <div class="node">AG<small>Heavy Execution</small></div>
  </div>
</section>

<section>
  <div class="eyebrow">Palette · ${palette.length} tokens</div>
  <div class="swatches">${swatches}</div>
</section>

<section>
  <div class="eyebrow">Typography</div>
  <div class="type-row"><span class="nm">Display</span> <span class="fr">Fraunces — carved headlines</span></div>
  <div class="type-row"><span class="nm">Body</span> <span class="eb">EB Garamond — narrative authority</span></div>
  <div class="type-row"><span class="nm">UI default</span> <span class="in">Inter — interface scaffold</span></div>
  <div class="type-row"><span class="nm">Meta</span> <span class="jb">JetBrains Mono — stamps</span></div>
</section>

<div class="grid2">
  <section>
    <div class="eyebrow">Open Work · ${openCount} active</div>
    ${inboxHtml}
  </section>
  <section>
    <div class="eyebrow">Architecture (Taheng Grepo)</div>
    ${archHtml}
  </section>
</div>

<section>
  <div class="eyebrow">Locked Decisions</div>
  <div class="prose">${md2html(section(decisionsMd, /Locked Decisions/i))}</div>
</section>

<div class="grid2">
  <section>
    <div class="eyebrow">Infrastructure</div>
    <div class="prose">${md2html(section(decisionsMd, /Infrastructure/i))}</div>
  </section>
  <section>
    <div class="eyebrow">Voice Guardrails</div>
    <div class="prose">${md2html(section(patternsMd, /^§3\. Voice/i))}</div>
  </section>
</div>

<section>
  <div class="eyebrow">Strict Boundaries</div>
  <div class="prose"><ul>${boundaries}</ul></div>
</section>

<section>
  <div class="eyebrow">HAM Memory Map · boot order</div>
  <div class="prose">${md2html(section(read("README.md"), /The nodes/i))}</div>
</section>

<footer>
  Katha State Map · generated from <code>.memory/</code> (single source of truth) ·
  regenerate: <code>node scripts/build_katha_dashboard.mjs</code> ·
  ${driveLive ? "canonical: Samsung 970" : "WARNING: drive unmounted — mirror data may be stale"}
</footer>
</div></body></html>`;

// ── write ──────────────────────────────────────────────────────────────────
const targets = [`${VAULT}/KATHA_STATE.html`, `${REPO}/KATHA_STATE.html`];
for (const t of targets) {
  try { writeFileSync(t, html); console.log(`✅ wrote ${t}`); }
  catch (e) { console.log(`⚠️  could not write ${t}: ${e.message}`); }
}
console.log(`   palette:${palette.length} phases:${Object.keys(roadmap).length} open-work:${openCount} drive:${driveLive ? "live" : "mirror"}`);
