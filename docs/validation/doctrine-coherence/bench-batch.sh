#!/usr/bin/env bash
# bench-batch.sh <bench-root> : the 3x A/B bench. 9 cases x 3 runs x 2 doctrines, at most 2 Codex processes at once.
#   baseline = main 94691750 (home <root>/baseline), new = current worktree doctrine (home <root>/new-t10-r6);
#   both homes: gpt-6.2-sol, effort high, fuse-browser + sequential-thinking MCP, BENCH_TIMEOUT=1800 per run.
# Jobs are ordered case by case, baseline/new adjacent, so a case pair finishes together.
set -euo pipefail
H="$(cd "$(dirname "$0")" && pwd)"
export BENCH_ROOT="$1" BENCH_TIMEOUT="${BENCH_TIMEOUT:-1800}"
for c in T1 T2 T3 T4 T5 T6 T7 T8 T9; do
	for r in 1 2 3; do
		printf '%s %s.r%s\n%s %s.r%s\n' baseline "$c" "$r" new-t10-r6 "$c" "$r"
	done
done | xargs -P 2 -L 1 sh -c '"$0/bench.sh" run "$1" "$2" >> "$BENCH_ROOT/batch.log" 2>&1' "$H"
echo "batch done" >> "$BENCH_ROOT/batch.log"
