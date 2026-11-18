#!/usr/bin/env bash
# usage: run.sh <name> <dir>   (prompt file <name>.prompt next to this script)
set -u
H="$(cd "$(dirname "$0")" && pwd)"
N="$1"; DIR="$2"
date +%s > "$H/$N.start"
codex exec --json --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox \
  -C "$DIR" -o "$H/$N.last" "$(cat "$H/$N.prompt")" > "$H/$N.jsonl" 2> "$H/$N.stderr"
echo $? > "$H/$N.rc"
date +%s > "$H/$N.end"
