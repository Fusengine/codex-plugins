#!/usr/bin/env bash
# t10-evidence.sh <bench-root> <label> <case>  (e.g. ... new-t10-r2 T10.r2)
# Per rollout of the run: agent role, writes touching html/css/js/test files (who EXECUTED the page),
# reads of never-do*.md and whether the read output was truncated. jq only.
set -euo pipefail
ROOT="$1"; LABEL="$2"; CASE="$3"
D="$ROOT/$LABEL"; W="$(readlink "$D/work/$CASE")"
while IFS= read -r f; do
	jq -s -c '
	 (map(select(.type=="session_meta"))|.[0].payload) as $m
	 | [ .[] | select(.type=="response_item") | .payload ] as $p
	 | ($p|map(select(.type=="custom_tool_call_output" and (.output|tostring|test("truncated output")))|.call_id)) as $trunc
	 | { role: ($m.agent_role // "lead"), id: $m.id[0:8],
	     writes_html_css: ([ $p[] | select(.type=="custom_tool_call" and (.input|tostring|test("\\*\\*\\* (Add|Update) File:[^\\n]*\\.(html|css)"))) ] | length),
	     writes_js: ([ $p[] | select(.type=="custom_tool_call" and (.input|tostring|test("\\*\\*\\* (Add|Update) File:[^\\n]*\\.(js|ts|mjs)\\b"))) ] | length),
	     writes_tests: ([ $p[] | select(.type=="custom_tool_call" and (.input|tostring|test("\\*\\*\\* (Add|Update) File:[^\\n]*(test|spec)[^\\n]*"))) ] | length),
	     never_do_reads: ([ $p[] | select(.type=="custom_tool_call" and (.input|tostring|test("never-do"))) | {file: (.input|[match("never-do[a-z-]*\\.md";"g").string]|unique|join(",")), truncated: (.call_id as $i | $trunc | index($i) != null)} ]) }' "$f"
done < <(grep -l "\"cwd\":\"$W\"" "$D"/home/sessions/*/*/*/rollout*.jsonl)
