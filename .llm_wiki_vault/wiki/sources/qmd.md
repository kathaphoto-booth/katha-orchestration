---
type: karpathy_llm_wiki_node
source: https://github.com/tobi/qmd
extracted: 2026-06-30
tags: [source, tool, search, local]
---
# qmd (Local Search Engine)

## Overview
`qmd` is a local, command-line search engine tailored for markdown files, personal knowledge bases, and documentation. It tracks State of the Art (SOTA) approaches for semantic search while remaining entirely on-device.

## Core Capabilities
- Hybrid search (BM25 + vector search) over local markdown files.
- LLM re-ranking natively supported.
- Includes an MCP (Model Context Protocol) server, making it a native tool for local agents to query the LLM Wiki.

## Relevant to Katha Booth LLM Wiki
As the vault scales, `qmd` can be deployed as the local search backend to let agents query the vault using `mcp` instead of grep, fulfilling the "indexing and logging" search requirements outlined in the Karpathy LLM Wiki pattern.
