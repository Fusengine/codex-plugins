---
name: init-tracking
description: APEX task-tracking initialization command (Step 0, mandatory first action)
---

# Step 0: Initialize Tracking

**BEFORE anything else**, run this command to initialize APEX tracking.

## Task Slug

Every artefact in `.codex/apex/` (task id, docs) is keyed on one `{task-slug}`; the verify/elicit proofs are not stored there (REPORT, or `docs/verify/` keyed on `<branch-slug>` — see "Proof artefacts" below). `{task-slug}` is derived — in order of preference — from:

1. An explicit update_plan id, if this task is already tracked on the board (`APEX_TASK_SLUG` below).
2. The current git branch name, stripped of its `type/` prefix and slugified.
3. A `task-<unix-timestamp>` fallback when neither is available (detached HEAD, no branch).

```bash
TASK_SLUG="${APEX_TASK_SLUG:-}"
[ -z "$TASK_SLUG" ] && TASK_SLUG=$(git branch --show-current 2>/dev/null \
  | sed -E 's#.*/##; s/[^a-zA-Z0-9]+/-/g; s/^-+|-+$//g' | tr '[:upper:]' '[:lower:]')
[ -z "$TASK_SLUG" ] && TASK_SLUG="task-$(date +%s)"
```

`{task-slug}` keys the tracking state only (`.codex/apex/task.json`, `.codex/apex/docs/task-{task-slug}.md` working notes). The eLicit and Verify proofs are NOT stored here — see below.

## Proof artefacts (not under `.codex/`)

The eLicit and Verify proofs live in the agent REPORT; their optional records go to `docs/verify/elicit-<branch-slug>.json` and `docs/verify/<branch-slug>.md` at the repo root (committable, and outside `.codex/`, which the Codex sandbox keeps read-only). `<branch-slug>` follows the `verification` skill's derivation (`references/verify-template.md`): `git branch --show-current`, drop the `<type>/` prefix, lowercase, every character outside `a-z0-9` becomes `-`; detached HEAD → `detached-<short sha>`.

```bash
BRANCH=$(git branch --show-current)
if [ -n "$BRANCH" ]; then
  BRANCH_SLUG=$(printf '%s' "${BRANCH#*/}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')
else
  BRANCH_SLUG="detached-$(git rev-parse --short HEAD)"
fi
```

## Command

```bash
TASK_SUBJECT="<the real task description>"   # e.g. "$ARGUMENTS" from the invoking command
NOW="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
mkdir -p .codex/apex/docs
jq -n --arg slug "$TASK_SLUG" --arg subject "$TASK_SUBJECT" --arg now "$NOW" \
  '{current_task: $slug, created_at: $now, tasks: {($slug): {
      subject: $subject, status: "in_progress", phase: "init-branch",
      started_at: $now, doc_consulted: {}
    }}}' > .codex/apex/task.json
echo "✅ APEX tracking initialized in $(pwd)/.codex/apex/ (task: $TASK_SLUG)"
```

Build the JSON with `jq -n`, not a heredoc: `TASK_SUBJECT` is the user's raw request and commonly contains `"` or `` ` `` — string-interpolating it into a heredoc produces invalid JSON (verified: a heredoc with quotes in the subject breaks `jq .` with a parse error). `jq --arg` escapes it correctly regardless of content.

This creates:
- `.codex/apex/task.json` — tracks documentation consultation status, current phase, and subject (see `phase` field, updated by each phase reference — `references/00-init-branch.md` through `references/09-create-pr.md`)
- `.codex/apex/docs/` — stores consulted documentation summaries

**The PreToolUse hooks will BLOCK Write/Edit until documentation is consulted.**
