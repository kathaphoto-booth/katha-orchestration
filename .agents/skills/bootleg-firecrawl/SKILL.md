---
name: bootleg-firecrawl
description: Use when you need to fetch, parse, and convert DOM/HTML from a URL into clean markdown context for Gemini 3.1 Flash consolidation, especially when manual copy-pasting would lose structure.
---

# Bootleg Firecrawl

## Overview
This skill triggers a DIY HTML-to-Markdown scraper that fetches a URL (bypassing the need for Puppeteer/Playwright headless browsers where possible) and strips out `<style>` and `<script>` tags, navigation, and garbage DOM. It then feeds the cleaned markdown into the Gemini 3.1 Flash API to summarize and consolidate active architectural state.

## When to Use
- When you need to extract the core content of a webpage (like docs or a long chat session) without UI garbage.
- When you want to avoid spinning up a full headless Chromium instance if a simple HTTP request suffices.
- When manual copying via Cmd+A would lose code blocks, structure, or formatting.

## Implementation Workflow

Run the following script:

```bash
node /Users/jedg./Desktop/kat_ha_pb/.agents/skills/bootleg-firecrawl/scripts/bootleg-firecrawl.js \
  --url "https://example.com" \
  --cookie-file "./session_cookie.txt" \
  --output "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/handoff/bootleg_crawl_<session_id>.md"
```

## Verification

After the script runs:
1. Verify that the `.memory/handoff/bootleg_crawl_<session_id>.md` exists.
2. Read the file to ensure `<style>` tags, `<script>` tags, and empty `<noscript>` tags were properly stripped.
3. If the scraper hit a Cloudflare/Auth Wall (403) or a Client-Side Render Trap (empty body), the script should have exited with an explicit error rather than silently writing an empty file.

## Red Flags - STOP
- Do not use this tool as a commercial crawler (no proxy rotation, no massive concurrency).
- If the page requires complex JavaScript execution and a raw fetch fails, gracefully fail out—this script specifically avoids Playwright bloat.
