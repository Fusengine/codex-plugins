---
name: commit
description: "Smart conventional commit with security validation, branch flow enforcement, and auto-detection. Use when committing changes, saving work, staging and committing, or choosing a conventional commit message."
---

# Smart Conventional Commit

## Preflight

Inspect the current state before acting:

```bash
git status
git diff --staged --stat
git log --oneline -5
git branch --show-current
```

## Instructions

Based on the context above, create a professional commit.

### Modes

- **WIP mode** (`mode: wip`, after each verified task of a mandate; the default when no mode is stated): Steps 0–5 only, on the working branch, files staged by name (`git add -- <paths>`). No Step 6 onward: no bump, no CHANGELOG, no push, no PR, no merge, no tag.
- **FULL release** (`mode: full`, end of the mandate): Steps 0–8 — push the working branch, open the PR, wait for CI, merge (never squash), tag, release — announced in the report. WIP commits already on the branch stay as they are; Step 6 bumps everything since the last bump.

Both modes run under the standing owner policy in `AGENTS.md` (hard stops) when the commit agent runs them: that policy is the go, never re-asked, and the confirmation prompts below do not apply; caller flags (`--no-merge`, `--no-pr`, `--no-bump`) still narrow the run. On `main`, `master`, `develop` or `production` never commit: Step 0 creates the working branch first.

When the owner runs this skill by hand (not the commit agent): before any write action, ask explicit user confirmation. This includes `git add`, `git commit`, tags, push, branch creation, reset, and revert. The per-stage authorization below applies in that case too.

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
- User explicitly requests `--no-branch-check`
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

If the user provides commit context, use it as a hint for the message.

### Step 6: Post-Commit (universal)

After step 5 succeeds, execute the `post-commit` skill (CHANGELOG + version bump only — **no tag here**, see Step 8 for why).

This runs for ALL repos — the skill auto-detects the repo type internally.

**Bump range**: the skill's Step 0 block decides (single source — do not restate it here): an explicit `--no-bump` request → skipped; branch already bumped with nothing new since → skipped; otherwise bumps what changed since the last bump (or since the fork point). A re-push round on the same PR never stacks a bump; a plugin changed after the first bump is never merged unbumped.

### Step 7: Optional Remote Flow (push + PR + CI watch + merge)

#### Step 7.0: Base branch + release target (every mode, on the current branch, BEFORE any push or merge)

`gh pr merge --delete-branch` switches to the base branch and deletes the local feature branch, so the release target is captured here, while the branch is still checked out and not yet merged:

```bash
# Base branch: caller's PR_BASE > the open PR's base > remote default branch > first local main/master/develop
base_branch="${PR_BASE:-$(gh pr view --json baseRefName -q .baseRefName 2>/dev/null)}"
[ -n "$base_branch" ] || base_branch="$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null)"
base_branch="${base_branch#origin/}"
if [ -z "$base_branch" ]; then
  for b in main master develop; do
    git rev-parse --verify --quiet "refs/heads/$b" >/dev/null && { base_branch="$b"; break; }
  done
fi
git fetch --quiet origin "$base_branch" 2>/dev/null
fork="$(git merge-base HEAD "origin/$base_branch" 2>/dev/null || git merge-base HEAD "$base_branch" 2>/dev/null)"
[ "$fork" = "$(git rev-parse HEAD)" ] && fork="$(git rev-parse -q --verify HEAD~1)"
# Release target = the last bump commit in fork..HEAD only (never older history)
bump_line=""
[ -n "$fork" ] && bump_line="$(git log -1 -E --format='%H %s' --grep='^chore: (bump marketplace and CHANGELOG|update CHANGELOG) to [0-9]+\.[0-9]+\.[0-9]+$' "$fork..HEAD")"
bump_sha="${bump_line%% *}"
version="$(printf '%s\n' "$bump_line" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+$')"
echo "base_branch=$base_branch bump_sha=${bump_sha:-none} version=${version:-none}"
```

`vX.Y.Z` below is `v$version`. Empty `bump_sha` → no tag in Step 8. Shell variables do not survive a new shell: the echoed line is the record — set the three values literally from it before Step 8 in another shell.

Run only the remote mutations explicitly authorized by the user (in commit-agent full mode, the standing AGENTS.md policy is that authorization). Permission to commit does not imply permission to push, create a PR, or merge.

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
2. **Create the PR if absent** (else reuse the existing one). Pipe the body through stdin to avoid quoting bugs and temporary files:
   ```bash
   gh pr view --json url -q .url 2>/dev/null || gh pr create --base "$base_branch" --title "<commit subject>" --body-file - <<'EOF'
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
3. If only push/PR was authorized (never the case in commit-agent full mode, where the standing AGENTS.md policy is that authorization, unless the caller passes `--no-merge`), watch CI (it fills the report's `ci:` line, `--no-merge` included; poll until checks register, never pipe `--watch`), output the PR URL + `ci:` and STOP.
4. **Surveillance + merge auto** — only when merge or full release flow was explicitly authorized (in commit-agent full mode, the standing AGENTS.md policy is that authorization). Use a real merge commit, **never squash**:
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

**Leave the PR OPEN (push + PR + CI watch, do NOT merge, skip Step 8) if**:
- User explicitly requests `--no-merge`
- CI checks **FAIL** → report the failing check, leave PR open for the user
- Branch protection rejects the merge → report, leave open

`--no-pr` skips PR creation. `--no-merge` leaves the PR open. Failed CI or rejected branch protection also leaves it open and forbids tagging.

### Step 8: Release Tag

The release tag points to the **bump commit** captured in Step 7.0 (`base_branch`, `bump_sha`, `version`), never to the merge commit or the base branch's tip. Never re-read it here: after the merge the feature branch may be gone. Empty `bump_sha` → no tag.

#### FULL mode

Run only after Step 7 confirms the PR actually merged. Every step is chained: any failure prints `TAG FAILED` and stops:

```bash
git checkout "$base_branch" && git pull --ff-only origin "$base_branch" && git fetch --prune \
  && git merge-base --is-ancestor "$bump_sha" "$base_branch" \
  && git tag vX.Y.Z "$bump_sha" \
  && git push origin vX.Y.Z \
  && git merge-base --is-ancestor vX.Y.Z "$base_branch" && echo "vX.Y.Z -> $bump_sha on $base_branch ok" \
  || { echo "TAG FAILED: vX.Y.Z -> $bump_sha on $base_branch" >&2; false; }
```

The real merge commit preserves the feature-branch commits, including the bump commit. Waiting until merge succeeds prevents publishing a tag for a commit rejected by CI or branch protection.

#### LOCAL or DEGRADED mode

For an explicitly requested release flow, tag the bump commit captured in Step 7.0 locally:

```bash
[ -n "$bump_sha" ] && git tag vX.Y.Z "$bump_sha"
```

Never push that local tag automatically. Print the manual push command for use only after the change reaches its permanent branch.

## Related skills

`commit-detection`, `git-flow`, `post-commit`.

## Skill routing metadata

related-skills: commit-detection, git-flow, post-commit
