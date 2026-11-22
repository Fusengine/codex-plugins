#!/usr/bin/env bash
# results-table.sh <bench-root> -> markdown table baseline vs new for every case that has both runs.
set -euo pipefail
H="$(cd "$(dirname "$0")" && pwd)"; ROOT="$1"
echo "| case | run | secs | tokens (M) | spawns | challenger | any SKILL.md reads (trunc) | lead-orchestration reads (trunc) | files changed | typo left | final says blocked | stop-words |"
echo "|---|---|---|---|---|---|---|---|---|---|---|---|"
for c in T1 T2 T3 T4 T5 T6 T7 T8 T9; do
	for l in baseline new; do
		[ -f "$ROOT/$l/out/$c.end" ] || { echo "| $c | $l | not run | | | | | | | | | |"; continue; }
		"$H/metrics.sh" "$ROOT" "$l" "$c" | jq -r --arg l "$l" '
			"| \(.case) | \($l) | \(.secs) | \((.tokens_total/1000000*10|round)/10) | \(.spawns|to_entries|map("\(.key):\(.value)")|join(" ")) | \(.challenger) | \(.skill_reads) (\(.skill_trunc)) | \(.lo_reads) (\(.lo_trunc)) | \(.files_changed) | \(.typo_left) | \(.blocked) | \(.stop_words) |"'
	done
done
