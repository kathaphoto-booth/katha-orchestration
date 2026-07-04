#!/usr/bin/env bash
# SessionStart hook: fire the nightly wiki audit at most once per calendar day,
# in the background, under the interactive session's TCC context (Terminal has
# the SSD grant that launchd/cron background domains still lack). The launchd
# agent com.katha.wiki-audit remains loaded and takes over silently once a
# reboot clears its TCC denial — the once-per-day report check makes the two
# triggers mutually idempotent.
K="/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge"
AUDIT="/Volumes/samsung 970 pro - Data/KATHA_VAULT/bin/wiki-audit.sh"
[[ -d "$K/wiki" && -x "$AUDIT" ]] || exit 0
TODAY=$(date +%Y-%m-%d)
[[ -f "$K/.memory/handoff/${TODAY}_wiki-audit_report.md" ]] && exit 0
nohup bash "$AUDIT" >> "$HOME/Library/Logs/katha-wiki-audit.log" 2>&1 &
exit 0
