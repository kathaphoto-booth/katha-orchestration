---
type: karpathy_llm_wiki_node
source: https://docs.firecrawl.dev
extracted: 2026-06-30
tags: [source, ingestion, mcp, api]
---
# Firecrawl Documentation

## Overview
Firecrawl is a robust Web Data API for AI that allows agents to search, scrape, and interact with web pages. It takes URLs and converts them into clean markdown or structured JSON data.

## Key Features
- **LLM-ready output**: Clean markdown, structured JSON, and screenshots.
- **Advanced Scraping**: Handles proxies, anti-bot measures, JavaScript rendering, and dynamic content automatically.
- **Interact API**: Allows AI agents to interact with a page (e.g., searching for a product, clicking results).
- **MCP Server**: Can be integrated directly into agent context via the Model Context Protocol (MCP).

## Relevant to Katha Booth LLM Wiki
We use Firecrawl (`fetch.js` in the Master Orchestrator) to extract target web layouts and design tokens. It acts as the primary data ingestion engine for the 5-iteration autonomous Sniper Pipeline.
