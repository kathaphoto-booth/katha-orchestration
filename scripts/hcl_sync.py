import json
import os
import re
from datetime import datetime

# Paths
workspace_root = "/Users/jedg./Desktop/kat_ha_pb"
vault_dir = "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge"

handoff_json_path = os.path.join(vault_dir, "SESSION_HANDOFF.json")
hcl_md_path = os.path.join(vault_dir, "HCL.md")
hcl_html_path = os.path.join(vault_dir, "HCL_DASHBOARD.html")
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
            build_section = re.search(r"## Build Commands\n(.*?)(?:\n##|\Z)", content, re.DOTALL)
            if build_section:
                cmd_lines = build_section.group(1).strip().split('\n')
                for line in cmd_lines:
                    if line.strip().startswith('-'):
                        commands.append(line.strip().lstrip('-').strip())
        except Exception as e:
            pass
    return commands

def build_html_dashboard(handoff, skills, commands, timestamp, tokens):
    # 1. Swatches
    swatches_html = ""
    for name, hexcode in tokens:
        color = "#fff" if hexcode in ["#111112", "#241E1A", "#1A1816", "#8C382A", "#A35C44", "#5A5D5A", "#9C958A"] else "#111112"
        swatches_html += f'<div class="swatch-card"><div class="swatch-color" style="background-color: {hexcode}; color: {color};">{hexcode}</div><div class="swatch-label">{name}</div></div>'

    # 2. Kanban
    kanban_html = ""
    roadmap = handoff.get("roadmap", {})
    for phase, data in roadmap.items():
        if isinstance(data, str):
            status = "COMPLETED" if "COMPLETED" in data.upper() else "PLANNED"
            title = data.replace("COMPLETED — ", "").replace("NEXT — ", "")
            steps = []
        else:
            status = data.get("status", "PLANNED")
            title = data.get("title", "")
            steps = data.get("steps", [])
            
        is_completed = status == "COMPLETED"
        status_class = "card-completed" if is_completed else "card-planned"
        icon = "✓" if is_completed else "○"
        steps_html = "<ul style='margin-top: 10px; padding-left: 20px; font-size: 0.85rem; opacity: 0.8;'>" + "".join([f"<li style='margin-bottom: 5px;'>{s}</li>" for s in steps]) + "</ul>" if steps else ""
        kanban_html += f'<div class="kanban-card {status_class}"><div class="kanban-header"><span class="kanban-title">{phase.upper()}: {title}</span><span class="kanban-icon">{icon}</span></div><div class="kanban-desc">{steps_html}</div></div>'

    # 3. Skills
    skills_html = ""
    for s in skills:
        skills_html += f'''
        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid var(--champagne);">
            <strong style="color: var(--champagne); font-family: monospace;">/{s['name']}</strong>
            <p style="margin: 5px 0 0 0; font-size: 0.85rem; opacity: 0.9;">{s['description']}</p>
        </div>
        '''

    # 4. Approved Gallery Images (Only from approved canonical directories)
    gallery_html = ""
    search_dirs = [
        "/Volumes/samsung 970 pro - Data/KATHA_VAULT/brand_assets",
        "/Users/jedg./Desktop/kat_ha_pb/CC_ITERATION",
        "/Users/jedg./Desktop/kat_ha_pb/squarespace_injection"
    ]
    images = []
    for d in search_dirs:
        if os.path.exists(d):
            for root, dirs, files in os.walk(d):
                if '.git' in dirs: dirs.remove('.git')
                if 'node_modules' in dirs: dirs.remove('node_modules')
                for f in files:
                    if f.lower().endswith(('.png', '.jpg', '.jpeg', '.svg', '.gif', '.webm', '.mp4')):
                        images.append(os.path.join(root, f))
                        
    images.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    for img in images:
        filename = os.path.basename(img)
        if img.lower().endswith(('.webm', '.mp4')):
            media = f'<video src="file://{img}" controls muted loop></video>'
        else:
            media = f'<img src="file://{img}" loading="lazy" alt="{filename}">'
        gallery_html += f'''
        <div class="gallery-card">
            <div class="gallery-img-container">{media}</div>
            <div class="gallery-footer">
                <strong style="color: var(--champagne);">{filename}</strong><br/>
                <span style="font-size: 0.7rem; opacity: 0.6;">{img.replace('/Users/jedg./Desktop/kat_ha_pb/', '')}</span>
            </div>
        </div>
        '''

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Katha - Visual Control Center</title>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..500&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({{ startOnLoad: true, theme: 'dark', fontFamily: 'Inter' }});
    </script>
    <style>
        :root {{ --obsidian: #111112; --ecru: #EAE2D5; --champagne: #C4B59D; --iron: #241E1A; --loko: #8C382A; }}
        body {{ background-color: var(--obsidian); color: var(--ecru); font-family: 'Inter', sans-serif; margin: 0; padding: 40px; }}
        h1, h2, h3 {{ font-family: 'Fraunces', serif; font-weight: 400; color: var(--champagne); }}
        h1 {{ border-bottom: 1px solid rgba(196, 181, 157, 0.2); padding-bottom: 10px; margin-bottom: 30px; }}
        .section-box {{ background: rgba(255,255,255,0.03); border: 1px solid rgba(196, 181, 157, 0.1); padding: 30px; border-radius: 8px; margin-bottom: 30px; }}
        
        /* Swatches */
        .swatch-container {{ display: flex; flex-wrap: wrap; gap: 15px; margin-top: 20px; }}
        .swatch-card {{ border: 1px solid rgba(196, 181, 157, 0.2); border-radius: 4px; overflow: hidden; width: 140px; background: var(--iron); }}
        .swatch-color {{ height: 60px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-family: monospace; }}
        .swatch-label {{ padding: 10px; font-size: 0.75rem; text-align: center; color: var(--ecru); }}
        
        /* Kanban */
        .kanban-board {{ display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }}
        .kanban-card {{ padding: 15px 20px; border-radius: 4px; border-left: 4px solid var(--iron); background: rgba(255,255,255,0.05); }}
        .card-completed {{ border-left-color: var(--champagne); background: rgba(196, 181, 157, 0.08); }}
        .card-planned {{ border-left-color: var(--loko); }}
        .kanban-header {{ display: flex; justify-content: space-between; font-weight: 600; font-size: 0.9rem; margin-bottom: 5px; color: var(--champagne); text-transform: uppercase; letter-spacing: 0.1em; }}
        .kanban-desc {{ font-size: 0.9rem; color: var(--ecru); opacity: 0.9; }}
        
        /* Gallery */
        .gallery-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-top: 20px; }}
        .gallery-card {{ background: rgba(255,255,255,0.02); border: 1px solid rgba(196, 181, 157, 0.1); border-radius: 6px; overflow: hidden; transition: border-color 0.2s; }}
        .gallery-card:hover {{ border-color: rgba(196, 181, 157, 0.4); }}
        .gallery-img-container {{ width: 100%; height: 200px; background: var(--iron); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }}
        .gallery-img-container::before {{ content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 10px 10px; pointer-events: none; }}
        .gallery-img-container img, .gallery-img-container video {{ max-width: 100%; max-height: 100%; object-fit: contain; z-index: 1; }}
        .gallery-footer {{ padding: 12px; font-size: 0.75rem; word-break: break-all; border-top: 1px solid rgba(196, 181, 157, 0.1); }}
        
        .sync-stamp {{ font-family: monospace; font-size: 0.8rem; opacity: 0.5; margin-bottom: 20px; }}
    </style>
</head>
<body>
    <h1>Katha - Visual Control Center</h1>
    <div class="sync-stamp">Last Synced: {timestamp}</div>

    <div class="section-box">
        <h2>1. Architecture & Orchestration Flow</h2>
        <div style="display: flex; gap: 30px; flex-wrap: wrap; margin-top: 20px;">
            <div style="flex: 1; min-width: 300px; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 6px;">
                <h3 style="margin-top:0; font-size: 1rem;">Orchestration Chain</h3>
                <pre class="mermaid">
                flowchart TD
                    J[Jed <br/>Founder & Batman] -->|Directs| CC[Claude Code <br/>Lead Architect]
                    CC -->|Orchestrates| AG[Antigravity <br/>Heavy Execution]
                    AG -->|Writes to Vault| V[(Samsung 970 Vault)]
                    V -->|Syncs State| CC
                    AG -.->|Direct Translation| CC
                </pre>
            </div>
            <div style="flex: 1; min-width: 400px; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 6px;">
                <h3 style="margin-top:0; font-size: 1rem;">Data Pipeline</h3>
                <pre class="mermaid">
                flowchart LR
                    SS[Squarespace <br/>Frontend] -->|3-Field Intake| API[Next.js API <br/>Route]
                    API -->|Save Lead| DB[(Supabase)]
                    API -->|Webhook| HB[HoneyBook CRM]
                    API -->|Trigger| R[Resend Email]
                    R -->|Magic Link| C[Client]
                </pre>
            </div>
        </div>
    </div>

    <div class="section-box">
        <h2>2. Active Agent Skills (/commands)</h2>
        <p style="opacity: 0.8; font-size: 0.9rem;">Available operational skills and their capabilities.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">
            {skills_html}
        </div>
    </div>

    <div class="section-box">
        <h2>3. Roadmap Kanban</h2>
        <div class="kanban-board">
            {kanban_html}
        </div>
    </div>
    
    <div class="section-box">
        <h2>4. The 10-Token Brand Palette</h2>
        <div class="swatch-container">
            {swatches_html}
        </div>
    </div>

    <div class="section-box">
        <h2>5. Approved Design Gallery</h2>
        <p style="opacity: 0.8; font-size: 0.9rem;">Canonical visual assets (SVGs, layout iterations) restricted to approved vault and CC directories.</p>
        <div class="gallery-grid">
            {gallery_html}
        </div>
    </div>

</body>
</html>
"""
    with open(hcl_html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Generated Visual Dashboard at {hcl_html_path}")

def build_hcl():
    handoff = get_handoff_data()
    skills = get_active_skills()
    commands = parse_claude_md()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    tokens = [
        ("Obsidian Weave", "#111112"),
        ("Piña Ecru", "#EAE2D5"),
        ("Loko Rust", "#8C382A"),
        ("Champagne Heirloom", "#C4B59D"),
        ("Iron Bark", "#241E1A"),
        ("Hammered Sequin", "#9C958A"),
        ("Knalum Ink", "#1A1816"),
        ("Terracotta Earth", "#A35C44"),
        ("Abel Slate", "#5A5D5A"),
        ("Capiz Sage", "#B5B8A3")
    ]

    md = f"""# Katha Booth - Handoff & Control Ledger (HCL)

**Last Synced:** `{timestamp}`  
**Source Source of Truth**: `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/`

---

## 1. The 10-Token Brand Palette
"""
    for name, hexcode in tokens:
        md += f"- **{name}**: `{hexcode}`\n"

    md += f"""
---

## 2. Active Checkpoint & Handoff State
- **Current Milestone**: `{handoff.get('checkpoint', 'Phase 1 Complete')}`
- **Last Updated By**: `{handoff.get('updated_by', 'AG (Antigravity)')}`
- **Handoff Timestamp**: `{handoff.get('timestamp', '2026-06-03')}`

---

## 3. Active Agent Skills & Commands
"""
    for s in skills:
        md += f"- **[{s['name']}]({s['path']})**: {s['description']}\n"
        
    md += """
---

## 4. Project Topography (Directory Map)
"""
    topography = handoff.get("project_topography", {})
    for folder, desc in topography.items():
        md += f"- **`{folder}/`**: {desc}\n"
        
    md += """
---

## 5. Architecture & Orchestration Flow

```mermaid
flowchart TD
    J[Jed <br/>Founder & Batman] -->|Directs| CC[Claude Code <br/>Lead Architect]
    CC -->|Orchestrates| AG[Antigravity <br/>Heavy Execution]
    AG -->|Writes to Vault| V[(Samsung 970 Vault)]
    V -->|Syncs State| CC
    AG -.->|Direct Translation| CC
```

```mermaid
flowchart LR
    SS[Squarespace <br/>Frontend] -->|3-Field Intake| API[Next.js API <br/>Route]
    API -->|Save Lead| DB[(Supabase)]
    API -->|Webhook| HB[HoneyBook CRM]
    API -->|Trigger| R[Resend Email]
    R -->|Magic Link| C[Client]
```

---

## 6. Roadmap Checklist
"""
    roadmap = handoff.get("roadmap", {})
    for phase, data in roadmap.items():
        if isinstance(data, str):
            status_str = "[x] Completed" if "COMPLETED" in data.upper() else "[ ] Planned"
            title = data.replace("COMPLETED — ", "").replace("NEXT — ", "")
            md += f"- `{status_str.replace('[x]', 'x').replace('[ ]', ' ')}` **{phase.upper()}**: {title}\n"
        else:
            status = data.get("status", "PLANNED")
            title = data.get("title", "")
            steps = data.get("steps", [])
            status_str = "x" if status == "COMPLETED" else " "
            md += f"- `{status_str}` **{phase.upper()}**: {title}\n"
            for step in steps:
                sub_status = "x" if status == "COMPLETED" else " "
                md += f"  - [{sub_status}] {step}\n"
        
    md += """
---
## 7. How to Sync the Ledger
Run `python3 scripts/hcl_sync.py` to regenerate `HCL.md` and the visual `HCL_DASHBOARD.html`.
"""
    
    with open(hcl_md_path, 'w', encoding='utf-8') as f:
        f.write(md)
    print(f"Generated HCL.md at {hcl_md_path}")
    
    build_html_dashboard(handoff, skills, commands, timestamp, tokens)
    
if __name__ == "__main__":
    build_hcl()
