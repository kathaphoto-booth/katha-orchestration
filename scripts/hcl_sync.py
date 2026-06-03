import json
import os
import re
from datetime import datetime

# Paths
workspace_root = "/Users/jedg./Desktop/kat_ha_pb"
vault_dir = "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge"

handoff_json_path = os.path.join(vault_dir, "SESSION_HANDOFF.json")
hcl_md_path = os.path.join(vault_dir, "HCL.md")
memory_md_path = os.path.join(vault_dir, "MEMORY.md")
skills_dir = os.path.join(workspace_root, ".agents/skills")
claude_md_path = os.path.join(workspace_root, "CLAUDE.md")

def get_handoff_data():
    if os.path.exists(handoff_json_path):
        try:
            with open(handoff_json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading handoff JSON: {e}")
    return {}

def get_active_skills():
    skills = []
    if os.path.exists(skills_dir):
        for name in os.listdir(skills_dir):
            skill_path = os.path.join(skills_dir, name)
            if os.path.isdir(skill_path):
                skill_md = os.path.join(skill_path, "SKILL.md")
                if os.path.exists(skill_md):
                    try:
                        with open(skill_md, 'r', encoding='utf-8') as f:
                            content = f.read()
                        # Parse YAML frontmatter if exists
                        desc = "No description available."
                        match = re.search(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
                        if match:
                            meta = match.group(1)
                            desc_match = re.search(r"description:\s*(.*)", meta)
                            if desc_match:
                                desc = desc_match.group(1).strip()
                        skills.append({"name": name, "description": desc, "path": f".agents/skills/{name}/SKILL.md"})
                    except Exception as e:
                        print(f"Error reading skill {name}: {e}")
    return skills

def parse_claude_md():
    commands = []
    if os.path.exists(claude_md_path):
        try:
            with open(claude_md_path, 'r', encoding='utf-8') as f:
                content = f.read()
            # Simple regex search for commands in build section
            build_section = re.search(r"## Build Commands\n(.*?)(?:\n##|\Z)", content, re.DOTALL)
            if build_section:
                cmd_lines = build_section.group(1).strip().split('\n')
                for line in cmd_lines:
                    if line.strip().startswith('-'):
                        commands.append(line.strip().lstrip('-').strip())
        except Exception as e:
            print(f"Error parsing CLAUDE.md: {e}")
    return commands

def build_hcl():
    handoff = get_handoff_data()
    skills = get_active_skills()
    commands = parse_claude_md()
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    md = f"""# Katha Booth - Handoff & Control Ledger (HCL)

**Last Synced:** `{timestamp}`  
**Source Source of Truth**: `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/`

---

## 1. Active Checkpoint & Handoff State
- **Current Milestone**: `{handoff.get('checkpoint', 'Phase 1 Complete')}`
- **Last Updated By**: `{handoff.get('updated_by', 'AG (Antigravity)')}`
- **Handoff Timestamp**: `{handoff.get('timestamp', '2026-06-03')}`

### Locked Architectural State
*   **True Taheng Grepo (Style Base)**: {handoff.get('architectural_state', {}).get('true_taheng_grepo', 'Locked')}
*   **Canvas Grid**: {handoff.get('architectural_state', {}).get('canvas', 'Locked')}
*   **Calado Grid**: {handoff.get('architectural_state', {}).get('calado_grid', 'Locked')}
*   **CTA Action Model**: {handoff.get('architectural_state', {}).get('cta', 'Locked')}

---

## 2. Active Agent Skills & Commands

### Invokable Project Skills
Each skill resides in the project `.agents/skills/` directory and guides agent execution:

"""
    for s in skills:
        md += f"- **[{s['name']}]({s['path']})**: {s['description']}\n"
        
    md += """
### Build & Validation Commands
Run these commands in the terminal to validate code correctness and maintain strict design tokens:

"""
    for cmd in commands:
        md += f"- `{cmd}`\n"
        
    md += """
### Available Slash Commands (Chat UI)
Recommend these commands to the user to trigger automated multi-agent pipelines:
- `/goal`: Launch a long-running execution target that won't stop until fully completed.
- `/schedule`: Set up recurring cron checks or one-shot notification reminders.
- `/browser`: Trigger Chrome DevTools browser automation, scraping, or accessibility audits.
- `/grill-me`: Initiate an interactive Q&A alignment sequence to clarify design decisions.

---

## 3. Roadmap Checklist
Tracked status of all active deliverables:

"""
    roadmap = handoff.get("roadmap", {})
    for phase, desc in roadmap.items():
        status = "[x] Completed" if "COMPLETED" in desc.upper() else "[ ] Planned"
        clean_desc = desc.replace("COMPLETED — ", "").replace("NEXT — ", "")
        md += f"- `{status.replace('[x]', 'x').replace('[ ]', ' ')}` **{phase.upper()}**: {clean_desc}\n"
        
    md += """
---

## 4. Critical Issues & SS Media Strategy
- **Preserve & Adjust Mandate**: Keep all native `imgg-demo-*` placeholder assets on Gallery, Founders, and Installations in place. Target them exclusively using global CSS overrides (Archival Matte margins + Binakul optical shift).
- **Hero Video Fallback**: `FOLIO.mp4` lacks a mobile fallback cover image. Must be added immediately to avoid black space on iOS/Android.
- **Banned Copy Watch**: Strict zero-tolerance for adjectives of desperation ("keepsake", "raw silk", "magical", etc.). All CTA actions must use single heavy words (e.g. `Commission KTHA`).

---

## 5. How to Sync the Ledger
This ledger is kept up-to-date by running the following command from the project root:
```bash
python3 scripts/hcl_sync.py
```
This script pulls from `SESSION_HANDOFF.json`, `CLAUDE.md`, and active skills to keep coordination pristine across CC and AG sessions.
"""
    
    # Write HCL.md
    with open(hcl_md_path, 'w', encoding='utf-8') as f:
        f.write(md)
    print(f"Generated HCL.md at {hcl_md_path}")
    
    # Update MEMORY.md to index HCL.md
    if os.path.exists(memory_md_path):
        with open(memory_md_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Check if HCL.md is already indexed
        has_hcl = any("HCL.md" in line for line in lines)
        if not has_hcl:
            # Insert HCL.md index link right after SESSION_HANDOFF.json line or under Active Project Knowledge
            for idx, line in enumerate(lines):
                if "SESSION_HANDOFF.json" in line:
                    lines.insert(idx + 1, "- [Handoff & Control Ledger](HCL.md) — Live dynamic checklist mapping checkpoints, active skills, and commands. Synced dynamically.\n")
                    break
            with open(memory_md_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            print("Indexed HCL.md inside MEMORY.md successfully.")

if __name__ == "__main__":
    build_hcl()
