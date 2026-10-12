---
description: Smart conventional commit with security validation, branch flow enforcement, and auto-detection. Use for git commit, commit changes, save work, stage and commit.
argument-hint: "[message] | [type scope message] | (empty for auto-detection)"
---

# Smart Conventional Commit

## Current State

Run `git status` and use the output.

## Staged Changes

Run `git diff --staged --stat` and use the output.

## Recent Commits (style reference)

Run `git log --oneline -5` and use the output.

## Current Branch

Run `git branch --show-current` and use the output.

## Instructions

Before any write action, ask explicit user confirmation. This includes `git add`, `git commit`, tags, push, branch creation, reset, and revert.

Based on the context above, create a professional commit.

### Step 0: Branch Check (GitHub Flow enforcement)

Read current branch from above.

**If current branch is `main`, `master`, `develop`, or `production`:**

BLOCK direct commits and propose a feature branch:

```text
🌿 Branch Protection
───────────────────────────────
Current: <branch>
Issue: Direct commits to protected branches discouraged (GitHub Flow)
───────────────────────────────

Pre-detect commit type/scope from staged changes (Step 2 logic) to suggest branch name:
  - feat(seo) → feat/seo
  - fix(sniper) → fix/sniper
  - chore(deps) → chore/deps

Proposed branch: <type>/<scope-or-summary>

Options:
  Y → Create branch + continue commit
  N → Abort
  C → Custom branch name
```

If user accepts → execute `git checkout -b <branch>` then proceed to Step 1.
If user declines → STOP, do not commit.

**If current branch already a feature branch** (e.g. `feat/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`, `perf/*`, `test/*`, `ci/*`, `build/*`, `style/*`) → skip to Step 1 directly.

**Exceptions** (allow direct commit on main):
- Repo has only `main` branch and no remote (solo prototype)
- User explicitly passes `--no-branch-check` in `$ARGUMENTS`
- Commit type is `chore` AND scope is `release` or `version` (post-commit bump commits)

### Step 1: Security Check

BLOCK and output if secrets detected:

```text
🔒 Security Alert
───────────────────────────────
Found: [file or pattern]
Action: Commit blocked
Fix: Remove sensitive data before committing
```

Check for:
- `.env`, `.env.*` files
- Patterns: `password=`, `secret=`, `api_key=`, `token=`
- Files: `*.pem`, `*.key`, `*credentials*`

### Step 2: Analyze and Detect

Output analysis:

```text
📊 Analysis
───────────────────────────────
Files changed: [X]
Files staged: [Y]
Pattern detected: [type]
```

### Step 3: Generate Message

Format: `type(scope): imperative description`

**FORBIDDEN (NO AI SIGNATURE):**
- NEVER add any AI signature, Co-authored-by line, or generated-by mention
- Commit must appear 100% human-written

### Step 4: Propose Commit

Output proposal:

```text
📝 Proposed Commit
───────────────────────────────
type(scope): description

[body if needed]
───────────────────────────────

⚡ Ready to commit? [Y/N/E]
```

### Step 5: Execute and Confirm

On confirmation, execute and output:

```text
✅ Committed successfully
───────────────────────────────
Hash: [short-hash]
Message: type(scope): description
Files: [X] changed
```

Execute with HEREDOC format:

```bash
git commit -m "$(cat <<'EOF'
type(scope): description
EOF
)"
```

If $ARGUMENTS provided, use as hint for the message.

### Step 6: Post-Commit (universal)

After step 5 succeeds, execute the `post-commit` skill (CHANGELOG + version bump only — **no tag here**, see Step 8 for why).

This runs for ALL repos — the skill auto-detects the repo type internally.

### Step 7: Optional Remote Flow (push + PR + CI watch + merge)

Run only the remote mutations explicitly authorized by the user. Permission to commit does not imply permission to push, create a PR, or merge.

Inspect the execution mode first:

```bash
git remote -v
command -v gh
gh auth status
```

- **LOCAL**: no remote. Do not push, create a PR, or merge. For an explicitly requested release flow, create only the local tag described in Step 8 and report the future manual commands.
- **DEGRADED**: a remote exists but `gh` is missing or unauthenticated. Push only when authorized, report the failed prerequisite, and do not create or merge a PR. For an explicitly requested release flow, use the local-only tag behavior from Step 8.
- **FULL**: remote exists and `gh` is authenticated. Continue below.

After post-commit completes, if the current branch is a feature branch:

1. **Push branch**:
   ```bash
   git push -u origin <current-branch>
   ```
2. **Create the PR if absent** (else reuse the existing one):
   ```bash
   gh pr view --json url -q .url 2>/dev/null || gh pr create --base main --title "<commit subject>" --body-file - <<'EOF'
   ## Summary
   - <bullets from commit body>

   ## Changes
   <major changes>

   ## Test plan
   - [x] / [ ] as applicable

   ## Breaking changes
   None / <description>
   EOF
   ```
3. If only push/PR was authorized, output the PR URL and STOP.
4. **Surveillance + merge auto** — only when merge or full release flow was explicitly authorized. Use a real merge commit, **never squash**:
   - Prefer GitHub native auto-merge (merges once required checks pass):
     ```bash
     gh pr merge <pr> --auto --merge --delete-branch
     ```
     `--auto` may only enable auto-merge. Before Step 8, require proof that the merge completed:
     ```bash
     test -n "$(gh pr view <pr> --json mergedAt -q .mergedAt)" || { echo "merge pending; tag skipped"; exit 1; }
     ```
   - If auto-merge is not enabled, watch checks then merge. Never pipe `gh pr checks`; preserve its exit status:
     ```bash
     gh pr checks <pr> --watch && gh pr merge <pr> --merge --delete-branch
     ```
   - If the repo has **no CI checks**, merge immediately:
     ```bash
     gh pr merge <pr> --merge --delete-branch
     ```
5. After every merge path, require a non-empty `mergedAt`. Output the PR URL + merge status and proceed to **Step 8** only after that proof succeeds.

**Leave the PR OPEN (push + PR only, do NOT merge, skip Step 8) if**:
- User passes `--no-merge` in `$ARGUMENTS`
- CI checks **FAIL** → report the failing check, leave PR open for the user
- Branch protection rejects the merge → report, leave open

`--no-pr` skips PR creation. `--no-merge` leaves the PR open. Failed CI or rejected branch protection also leaves it open and forbids tagging.

### Step 8: Release Tag

`vX.Y.Z` is the version bumped by `post-commit` in Step 6.

#### FULL mode

Run only after Step 7 confirms the PR actually merged:

```bash
git checkout main && git pull --ff-only
git fetch --prune   # drop remote-tracking refs (origin/*) of branches already deleted on the remote
git tag vX.Y.Z
git push origin vX.Y.Z
git merge-base --is-ancestor vX.Y.Z main && echo "tag on main ✅"
```

The real merge commit preserves the feature-branch commits, including the bump commit. Waiting until merge succeeds prevents publishing a tag for a commit rejected by CI or branch protection.

#### LOCAL or DEGRADED mode

For an explicitly requested release flow, create the tag locally after the Step 6 bump commit:

```bash
git tag vX.Y.Z
```

Never push that local tag automatically. Print the manual push command for use only after the change reaches its permanent branch.

### Step 9: Release Workflow — watch it to the end (FULL mode only)

The release ends at the registry, not at the tag. Full procedure: `skills/git-flow/references/release-workflow.md`.

1. No `on: push: tags` workflow in `.github/workflows/` (verified, not assumed) → `publish: none`; stop here.
2. Otherwise find the tag's runs (`gh run list --commit "$(git rev-list -n1 vX.Y.Z)" --event push`, polled ~90s) and `gh run watch <id> --exit-status` each one, never piped.
3. Failure → `gh run view <id> --log-failed` at once. Flaky (threshold just over, network/registry timeout, runner crash) → `gh run rerun <id> --failed`, max 2 reruns, then escalate. Real defect → stop, never rerun; report run URL, job, step and log lines.
4. Announce "published" only when the final attempt is fully green (post-publish verify jobs included) **and** the registry serves X.Y.Z (`npm view <pkg> version` or the matching query). Until then: `tagged, publish pending` or `publish failed:<job>`.
