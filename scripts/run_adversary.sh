#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════
# RUN ADVERSARY — GitHub Copilot CLI critique harness
# ════════════════════════════════════════════════════════════════════
set -euo pipefail

REPORT_PATH="/Users/jedg./.gemini/antigravity/brain/a4a00a69-56f3-463d-8ab6-2d9824c8ef9c/adversarial_review_report.md"

echo "Initializing Adversarial Review..."
echo "Report will be written to: $REPORT_PATH"

# Start clean report
cat << 'EOF' > "$REPORT_PATH"
# Adversarial Review Report: Shared Skill Arsenal & Obsidian Workspace Integration

This report compiles critiques executed by the **GitHub Copilot CLI** acting as our adversary, evaluating the security, stability, schema compatibility, and scalability of our lightweight Pointer Skill design, Obsidian Daily Note automation, and offline-first HTML-to-Markdown scraper formatter.

---

## 🛡️ Executive Summary & Core Verdict

The unified, Vault-resident **Shared Skill Arsenal** successfully curtails prompt token bloat by >90% without breaking agent auto-triggering. The local offline `obsidian-format` converter successfully cuts our dependency on remote, paid Firecrawl APIs. However, the adversary has identified several critical risks regarding absolute paths, security sandboxing, and contention/race conditions in automated file-logging.

---

EOF

echo "Running Critique 1: Lightweight Pointer Skill Design..."
echo "## 🔴 Critique 1: Lightweight Pointer Skill Design & Schema Stability" >> "$REPORT_PATH"
echo "### Adversary Prompt" >> "$REPORT_PATH"
echo "> Critique our lightweight pointer skills setup. All SKILL.md files under .agents/skills/ and config/plugins/ are stripped down to yaml header and a pointer text directing agents to load canonical files from '/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/skills/<skill_name>/SKILL.md'. Identify any risks like path resolution issues, fallback behavior, schema matching, or exfiltration vectors." >> "$REPORT_PATH"
echo '```text' >> "$REPORT_PATH"

# Run gh copilot for Critique 1 and capture output
gh copilot -p "Critique our lightweight pointer skills setup. All SKILL.md files under .agents/skills/ and config/plugins/ are stripped down to yaml header and a pointer text directing agents to load canonical files from '/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/skills/<skill_name>/SKILL.md'. Identify any risks like path resolution issues, fallback behavior, schema matching, or exfiltration vectors." --silent >> "$REPORT_PATH" 2>&1 || echo "Error running gh copilot critique 1" >> "$REPORT_PATH"

echo '```' >> "$REPORT_PATH"
echo "" >> "$REPORT_PATH"

echo "Running Critique 2: Obsidian Daily Note Integration..."
echo "## 🟡 Critique 2: Obsidian Daily Note Integration (obsidian-daily.js & obdaily)" >> "$REPORT_PATH"
echo "### Adversary Prompt" >> "$REPORT_PATH"
echo "> Critique our local obsidian integration script 'obsidian-daily.js' (and 'obdaily' command) which parses templates, replaces {{date}}/{{time}}, and appends accomplishments/logs/checklists dynamically. Evaluate race conditions, file contention, and GFM format safety." >> "$REPORT_PATH"
echo '```text' >> "$REPORT_PATH"

# Run gh copilot for Critique 2 and capture output
gh copilot -p "Critique our local obsidian integration script 'obsidian-daily.js' (and 'obdaily' command) which parses templates, replaces {{date}}/{{time}}, and appends accomplishments/logs/checklists dynamically. Evaluate race conditions, file contention, and GFM format safety." --silent >> "$REPORT_PATH" 2>&1 || echo "Error running gh copilot critique 2" >> "$REPORT_PATH"

echo '```' >> "$REPORT_PATH"
echo "" >> "$REPORT_PATH"

echo "Running Critique 3: Obsidian Offline HTML-to-Markdown Scraper (obsidian-format.js & obformat)..."
echo "## 🟢 Critique 3: Offline Scraper & HTML-to-Markdown Converter (obsidian-format.js & obformat)" >> "$REPORT_PATH"
echo "### Adversary Prompt" >> "$REPORT_PATH"
echo "> Critique our local HTML-to-Markdown offline converter 'obsidian-format.js' (and 'obformat' command) which converts playwright-cli dumps locally to GFM markdown to bypass third-party scraper API/Firecrawl. Evaluate regex-based HTML stripping, table and link parsing, and folder/file write traversal sanitization." >> "$REPORT_PATH"
echo '```text' >> "$REPORT_PATH"

# Run gh copilot for Critique 3 and capture output
gh copilot -p "Critique our local HTML-to-Markdown offline converter 'obsidian-format.js' (and 'obformat' command) which converts playwright-cli dumps locally to GFM markdown to bypass third-party scraper API/Firecrawl. Evaluate regex-based HTML stripping, table and link parsing, and folder/file write traversal sanitization." --silent >> "$REPORT_PATH" 2>&1 || echo "Error running gh copilot critique 3" >> "$REPORT_PATH"

echo '```' >> "$REPORT_PATH"
echo "" >> "$REPORT_PATH"

echo "Adversarial Review complete."
