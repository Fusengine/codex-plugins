#!/usr/bin/env bash
# Real A/B doctrine bench (Codex CLI, real hooks, throwaway CODEX_HOME). Never touches ~/.codex.
#
#   BENCH_ROOT=<dir> bench.sh prepare <label> git:<rev>|dir:<path>   # install a doctrine tree
#   BENCH_ROOT=<dir> bench.sh run     <label> <case-id>              # one real run of a case
#   BENCH_ROOT=<dir> bench.sh metrics <label> <case-id>              # jq metrics -> stdout (TSV row)
#   BENCH_ROOT=<dir> bench.sh guard   <before|after>                 # ls -lT of the real ~/.codex files
#
# Cases live in cases.tsv (id TAB turn1 TAB optional-turn2). Effort/model mirror the owner's real
# config (gpt-6.2-sol, medium). Target project = a CLONE (cp -c) of fiduplex per run.
set -euo pipefail
H="$(cd "$(dirname "$0")" && pwd)"
REPO="${BENCH_REPO:-/Users/brunoazoulay/Labo/docker-lab/dev.local/Dev/AI/Harness/codex-plugins}"
FIDUPLEX="${BENCH_TARGET:-/Users/brunoazoulay/Labo/docker-lab/dev.local/Projets/Collaborateurs/BotXnext/Website/fiduplex}"
: "${BENCH_ROOT:?set BENCH_ROOT to a scratch dir}"
MODEL="${BENCH_MODEL:-gpt-6.2-sol}"
EFFORT="${BENCH_EFFORT:-medium}"
REAL="$HOME/.codex"
cmd="${1:-}"; shift || true

guard() { # before|after: stat the real files; never read them
	local f="$BENCH_ROOT/guard.$1"
	{ ls -lT "$REAL/config.toml" "$REAL/AGENTS.md" "$REAL/auth.json"; ls -lTd "$REAL/agents"; } >"$f"
	if [ "$1" = after ] && [ -f "$BENCH_ROOT/guard.before" ]; then
		if diff -q "$BENCH_ROOT/guard.before" "$f" >/dev/null; then echo "GUARD OK: ~/.codex files unchanged"; else echo "GUARD DIFF"; diff "$BENCH_ROOT/guard.before" "$f"; fi
	fi
}

prepare() {
	local label="$1" src="$2" d="$BENCH_ROOT/$1"
	rm -rf "$d"; mkdir -p "$d/repo" "$d/home"
	case "$src" in
	git:*) git -C "$REPO" archive "${src#git:}" | tar -x -C "$d/repo" ;;
	dir:*) rsync -a --exclude .git --exclude node_modules --exclude portage --exclude .claude "${src#dir:}/" "$d/repo/" ;;
	*) echo "bad source $src" >&2; exit 2 ;;
	esac
	ln -s "$REPO/node_modules" "$d/repo/node_modules"
	cp "$REAL/auth.json" "$d/home/auth.json"; chmod 600 "$d/home/auth.json"
	"$H/drive-install.exp" "$d/repo" "$d/home" >"$d/install.log" 2>&1 || { echo "installer failed, see $d/install.log"; exit 1; }
	# Pin the owner's real runtime values (top-level keys only, before the first table).
	local cfg="$d/home/config.toml" tmp="$d/home/config.toml.new"
	{
		printf 'approval_policy = "never"\nsandbox_mode = "danger-full-access"\nmodel = "%s"\nmodel_reasoning_effort = "%s"\n' "$MODEL" "$EFFORT"
		awk 'BEGIN{t=0} /^\[/{t=1} { if(!t && $0 ~ /^(approval_policy|sandbox_mode|model|model_reasoning_effort)[ ]*=/) next; print }' "$cfg"
	} >"$tmp" && mv "$tmp" "$cfg"
	# --skip-env configures NO MCP server, but the real home has fuse-browser (design gates need its
	# screenshots) and sequential-thinking. Add exactly those two keyless stanzas (same shape as the
	# owner's real config; no key, token or other server is copied).
	printf '\n[mcp_servers.fuse-browser]\ncommand = "npx"\nargs = ["-y", "@fusengine/browser-mcp@latest"]\n\n[mcp_servers.sequential-thinking]\ncommand = "npx"\nargs = ["-y", "@modelcontextprotocol/server-sequential-thinking"]\n' >>"$cfg"
	echo "prepared $label: hooks trusted=$(grep -c '^\[hooks.state' "$cfg") agents=$(ls "$d/home/agents" 2>/dev/null | wc -l | tr -d ' ')"
}

cx() { # cx <label> <case> <cwd> <prompt> [resume]
	local label="$1" case="$2" cwd="$3" prompt="$4" resume="${5:-}" d="$BENCH_ROOT/$1" out="$BENCH_ROOT/$1/out"
	mkdir -p "$out"
	local -a base=(env -i HOME="$HOME" USER="$USER" LANG="${LANG:-en_US.UTF-8}" TERM=xterm-256color PATH="$PATH"
		CODEX_HOME="$d/home" FUSE_HARNESS_MARKETPLACES=fusengine-codex timeout ${BENCH_TIMEOUT:-3600} codex exec)
	if [ -n "$resume" ]; then
		local tid; tid="$(jq -r 'select(.type=="thread.started")|.thread_id' "$out/$case.jsonl" | head -1)"
		"${base[@]}" resume "$tid" --json --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox \
			-m "$MODEL" -o "$out/$case.last2" "$prompt" >"$out/$case.jsonl2" 2>"$out/$case.stderr2" || true
	else
		"${base[@]}" --json --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox \
			-m "$MODEL" -C "$cwd" -o "$out/$case.last" "$prompt" >"$out/$case.jsonl" 2>"$out/$case.stderr" || true
	fi
}

run() {
	local label="$1" case="$2" d="$BENCH_ROOT/$1"
	# A case id may carry a run suffix (T1.r2): prompt/seed come from the base id (T1).
	local base="${case%%.*}"
	local line; line="$(awk -F'\t' -v c="$base" '$1==c' "$H/cases.tsv")"
	[ -n "$line" ] || { echo "unknown case $case"; exit 2; }
	local t1 t2; t1="$(printf '%s' "$line" | cut -f2)"; t2="$(printf '%s' "$line" | cut -f3)"
	local w="$d/work/$case"; mkdir -p "$d/work"
	if [ -n "${BENCH_CWD:-}" ]; then
		w="$BENCH_CWD" # T10: the owner-named real folder, used as is (no clone, no seed, never deleted)
		ln -sfn "$w" "$d/work/$case"
	else
		rm -rf "$w"; cp -cR "$FIDUPLEX" "$w"; rm -rf "$w/.harness"
	fi
	# Seed: T1/T8 name a typo that does not exist in the real project; plant it in the CLONE only.
	case "$base" in T1|T8)
		local faq="$w/src/modules/marketing/pages/locales/fr-CH/faq.json"
		jq '.meta.title = "Questions fréquentes pour les fiducaires"' "$faq" >"$faq.tmp" && mv "$faq.tmp" "$faq" ;;
	esac
	git -C "$w" status --porcelain >"$d/work/$case.status.before" 2>/dev/null || true
	mkdir -p "$d/out"; date +%s >"$d/out/$case.start"
	cx "$label" "$case" "$w" "$t1"
	[ -z "$t2" ] || cx "$label" "$case" "$w" "$t2" resume
	date +%s >"$d/out/$case.end"
	git -C "$w" status --porcelain >"$d/work/$case.status.after" 2>/dev/null || true
	echo "ran $label/$case in $(( $(cat "$d/out/$case.end") - $(cat "$d/out/$case.start") ))s"
}

case "$cmd" in
prepare) mkdir -p "$BENCH_ROOT"; prepare "$@" ;;
run) run "$@" ;;
metrics) "$H/metrics.sh" "$BENCH_ROOT" "$@" ;;
guard) mkdir -p "$BENCH_ROOT"; guard "$@" ;;
*) sed -n 2,12p "$0"; exit 2 ;;
esac
