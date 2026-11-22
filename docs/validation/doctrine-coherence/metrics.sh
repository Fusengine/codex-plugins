#!/usr/bin/env bash
# metrics.sh <bench-root> <label> <case>  -> one JSON object on stdout (jq only, no python).
# Rollouts of a run = every session file under <root>/<label>/home/sessions whose session_meta cwd is
# <root>/<label>/work/<case> (the lead rollout + its spawned children).
#   spawns        agent_type -> count over ALL rollouts of the run (nested spawns included)
#   challenger    spawns of agent_type "challenger"
#   skill_reads   lead exec calls whose script mentions SKILL.md
#   skill_trunc   of those, how many outputs carry Codex's "truncated output" marker
#   lead_writes   heuristic: lead (root rollout) exec calls with apply_patch|sed -i|perl -pi|writeFile|tee
#   files_changed hard evidence: git status of the project clone after minus before
#   tokens_*      last token_count total_token_usage of each rollout (sum / lead only)
#   fusengine_ch  tool calls mentioning fusengine.ch (T9 owner-named reference actually consulted)
#   blocked       final message of the lead contains bloqu / blocked
#   stop_words    final message contains "je m'arrête"/"j'arrête" (T8 must be 0)
set -euo pipefail
ROOT="$1"; LABEL="$2"; CASE="$3"
D="$ROOT/$LABEL"; W="$(readlink "$D/work/$CASE" || echo "$D/work/$CASE")"; BASE="${CASE%%.*}"
START="$(cat "$D/out/$CASE.start")"; END="$(cat "$D/out/$CASE.end")"
LAST="$D/out/$CASE.last"; LAST2="$D/out/$CASE.last2"
files=()
while IFS= read -r f; do files+=("$f"); done < <(grep -l "\"cwd\":\"$W\"" "$D"/home/sessions/*/*/*/rollout*.jsonl 2>/dev/null || true)
[ "${#files[@]}" -gt 0 ] || { echo "{\"case\":\"$CASE\",\"error\":\"no rollout\"}"; exit 0; }
per_file='
 . as $all
 | ($all | map(select(.type=="session_meta")) | .[0].payload) as $m
 | [ $all[] | select(.type=="response_item") | .payload ] as $p
 | [ $all[] | select(.type=="event_msg" and .payload.type=="token_count") | .payload.info.total_token_usage ] as $tk
 | ([ $all[] | select(.type=="event_msg" and .payload.type=="task_started") | .timestamp ]) as $ts
 | { root: ($m.thread_source=="user"), role: ($m.agent_role // "lead"),
     spawns_t2: (if ($ts|length) > 1 then [ $all[] | select(.type=="response_item" and .payload.type=="function_call" and .payload.name=="spawn_agent" and .timestamp > $ts[1]) ] | length else 0 end),
     spawns: [ $p[] | select(.type=="function_call" and .name=="spawn_agent") | (.arguments|fromjson|.agent_type // "?") ],
     lo_ids: [ $p[] | select(.type=="custom_tool_call" and (.input|tostring|test("lead-orchestration/SKILL\\.md"))) | .call_id ],
     skill_ids: [ $p[] | select(.type=="custom_tool_call" and (.input|tostring|test("SKILL\\.md"))) | .call_id ],
     trunc_ids: [ $p[] | select(.type=="custom_tool_call_output" and (.output|tostring|test("truncated output"))) | .call_id ],
     writes: [ $p[] | select(.type=="custom_tool_call" and (.input|tostring|test("apply_patch|sed -i|perl -pi|writeFile|\\btee\\b"))) | .call_id ],
     edits: [ $p[] | select(.type=="custom_tool_call" and (.input|tostring|test("apply_patch|sed -i|perl -pi|writeFile|\\btee\\b")) and ((.input|tostring|test("\\.codex/apex/prd"))|not)) | .call_id ],
     wpaths: [ $p[] | select(.type=="custom_tool_call") | (.input|tostring) | [match("\\*\\*\\* (Add|Update) File: ([^\\n]+)";"g").captures[1].string] | .[] ],
     fus: [ $p[] | select((.type=="custom_tool_call" or .type=="function_call") and ((.input // .arguments)|tostring|test("fusengine\\.ch"))) | .call_id ],
     tokens: (($tk|last).total_tokens // 0), tok_in: (($tk|last).input_tokens // 0), tok_out: (($tk|last).output_tokens // 0) }'
sum="$(for f in "${files[@]}"; do jq -s -c "$per_file" "$f"; done | jq -s -c '.')"
before="$(wc -l <"$D/work/$CASE.status.before" | tr -d ' ')"; after="$(wc -l <"$D/work/$CASE.status.after" | tr -d ' ')"
# files_changed = files of the run's clone whose CONTENT differs from the pristine project
# (checksum compare, noise dirs excluded). T1/T8 seed a typo in the clone: 0 = typo fixed, 1 = not fixed.
FIDUPLEX="${BENCH_TARGET:-/Users/brunoazoulay/Labo/docker-lab/dev.local/Projets/Collaborateurs/BotXnext/Website/fiduplex}"
changed="$(rsync -rcn --itemize-changes --exclude node_modules --exclude .git --exclude dist --exclude .astro --exclude .harness --exclude .cartographer "$W/" "$FIDUPLEX/" | grep -c '^[<>c.]f' || true)"
[ "$BASE" != T10 ] || changed="$(find "$W" -type f ! -name .DS_Store | wc -l | tr -d ' ')" # T10: files produced in the real folder
typo_left=-1
case "$BASE" in T1|T8) typo_left="$(grep -c fiducaires "$W/src/modules/marketing/pages/locales/fr-CH/faq.json" || true)" ;; esac
final="$(cat "$LAST" 2>/dev/null || true)$(cat "$LAST2" 2>/dev/null || true)"
printf '%s' "$sum" | jq -c --arg w "$W" --arg c "$CASE" --argjson secs "$((END-START))" --argjson changed "$changed" --argjson typo "$typo_left" --arg final "$final" '
 . as $r | ($r | map(select(.root))) as $lead
 | { case:$c, secs:$secs, rollouts:($r|length),
     spawns: ([ $r[].spawns[] ] | group_by(.) | map({(.[0]): length}) | add // {}),
     challenger: ([ $r[].spawns[] | select(.=="challenger") ] | length),
     skill_reads: ([ $lead[].skill_ids[] ] | length),
     skill_trunc: ([ $lead[] | . as $l | $l.skill_ids[] | select(. as $i | $l.trunc_ids | index($i)) ] | length),
     lo_reads: ([ $lead[].lo_ids[] ] | length), lo_trunc: ([ $lead[] | . as $l | $l.lo_ids[] | select(. as $i | $l.trunc_ids | index($i)) ] | length),
     lead_writes: ([ $lead[].writes[] ] | length), spawns_turn2: ([ $lead[].spawns_t2 ] | add),
     files_changed: $changed, typo_left: $typo,
     lead_edits: ([ $lead[].edits[] ] | length),
     writer_roles: ([ $r[] | select(.wpaths | map(select((test("\\.codex/|\\.agents/|\\.harness/|^/(private/)?tmp/")) | not)) | length > 0) | .role ] | unique),
     wrong_executor: ([ $r[] | select(.role != "lead" and (.wpaths | map(select((test("\\.codex/|\\.agents/|\\.harness/|^/(private/)?tmp/")) | not)) | length > 0)) | .role | select(. as $x | ["astro-expert","design-expert","shadcn-ui-expert","tailwindcss-expert","skill-creator"] | index($x) | not) ] | length),
     outside_writes: ([ $r[].wpaths[] | select(startswith("/")) | select((startswith($w) or test("^/(private/)?tmp/")) | not) ] | length),
     sniper: ([ $r[].spawns[] | select(.=="sniper") ] | length),
     tokens_total: ([ $r[].tokens ] | add), tokens_lead: ([ $lead[].tokens ] | add),
     fusengine_ch: ([ $r[].fus[] ] | length),
     blocked: ($final | test("bloqu|blocked"; "i")),
     stop_words: ($final | test("je m.arrête|j.arrête|je te laisse|laisse voir|I.ll stop|I stop here"; "i")) }'
