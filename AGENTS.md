---
type: "constitution"
node_id: "AGENTS.md"
owner: "CC"
status: "active"
description: "Katha Vault Rule Pointer"
---
# Katha Booth Project Rules

For any Katha Booth tasks, the canonical project rules, workflow gates, agent personas, and brand law live in the Samsung 970 Vault.
Agents MUST retrieve their context on demand by reading the following vault files:
- **Vault Schema (READ FIRST — LLM Wiki law, boot order, council lane, naming law):** `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/AGENTS.md`
- General Instructions & Protocols: `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/instructions.md`
- Agent Personas & Roles: `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/agents.md`
- Antigravity (AG) Charter & Gates: `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/gemini.md`

Always query `patterns.md` and `decisions.md` directly for brand law, lock numbers, and architectural decisions.
Do NOT preload or duplicate these files in the local workspace rules.

## Template Design & Context Integrity Rules

### 1. Thematic Palette Rule
* **Rule**: Color variables generated or parsed for photobooth presets must align strictly with their semantic roles. Accent or metallic highlights (e.g., `#D4AF37` Gold, `#C9A57B` Champagne) must NEVER be set as backgrounds for deconstructed dark themes. Dark background presets must default strictly to high-fidelity obsidian/space ground colors (e.g., `#0B0C10`).

### 2. Multi-Directory Workspace Isolation
* **Rule**: In workspaces containing active parallel directories or development copies (e.g., `pb-v1`, `pb-v2`, `pb-v3`), all operations, file edits, and git checks must target the designated active copy folder exclusively. Always verify folder hierarchy prior to creating or modifying files.

### 3. Explicit Slots Typings
* **Rule**: Never allow variables holding slot coordinate sets or geometric arrays to compile with implicit any typings. Ensure explicit coordinates interface binding is declared.

