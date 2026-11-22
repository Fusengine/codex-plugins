#!/usr/bin/env bash
# bench-agg.sh <bench-root> : markdown table of the 3x bench, per case and doctrine: mean (min-max) over the finished runs.
set -euo pipefail
H="$(cd "$(dirname "$0")" && pwd)"; ROOT="$1"
WRITE_CASES=" T1 T2 T4 T6 T7 T8 T9 "
echo "| case | doctrine | runs | secs | tokens (M) | spawns per agent_type (mean) | challenger | SKILL.md trunc | lead-orch trunc | lead edits | wrong executor | outside writes | skipped sniper (write case) | cut at 1800 s |"
echo "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|"
for c in T1 T2 T3 T4 T5 T6 T7 T8 T9; do
	for pair in "baseline:old" "new-t10-r6:new"; do
		l="${pair%%:*}"; name="${pair##*:}"; rows=""
		for r in 1 2 3; do
			[ -f "$ROOT/$l/out/$c.r$r.end" ] || continue
			rows="$rows$("$H/metrics.sh" "$ROOT" "$l" "$c.r$r")"$'\n'
		done
		[ -n "$rows" ] || { echo "| $c | $name | 0 | not run | | | | | | | | | | |"; continue; }
		printf '%s' "$rows" | jq -s -r --arg c "$c" --arg n "$name" --arg wc "$WRITE_CASES" '
		 def st(f): (map(f) | {m: ((add / length) * 10 | round / 10), lo: (min), hi: (max)}) | "\(.m) (\(.lo)-\(.hi))";
		 . as $r
		 | ($r | map(.spawns | to_entries[]) | group_by(.key) | map("\(.[0].key):\(((map(.value) | add) / ($r|length)) * 10 | round / 10)") | join(" ")) as $sp
		 | "| \($c) | \($n) | \($r|length) | \(st(.secs)) | \(st((.tokens_total/100000|round)/10)) | \($sp) | \(st(.challenger)) | \(st(.skill_trunc)) | \(st(.lo_trunc)) | \(st(.lead_edits)) | \(map(.wrong_executor)|add) | \(map(.outside_writes)|add) | \(if ($wc|contains(" "+$c+" ")) then (map(select(.sniper==0))|length) else "n/a" end) | \(map(select(.secs>=1795))|length) |"'
	done
done
