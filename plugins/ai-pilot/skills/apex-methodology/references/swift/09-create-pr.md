---
name: 09-create-pr
description: Run Swift pre-PR checks, prepare the PR, hand the release to the commit agent
prev_step: references/swift/08-check-test.md
next_step: null
---

# Swift Pull Request Guide

Run the Swift pre-PR checks, prepare the PR title and body, then hand the push / PR / CI / merge / tag to the `commit` agent (full mode). This phase never pushes, opens, merges or tags anything itself.

## Pre-PR Checks (run by the APEX agent)

```bash
swiftlint --strict && \
swift test
```

For an Xcode app target, run the scheme instead of `swift test`: `xcodebuild test -scheme MyApp -destination "platform=iOS Simulator,name=iPhone 16"`. Paste each command + result in your REPORT; a check not run is reported "not verified".

## Hand-off to the Commit Agent (end of mandate)

This phase never runs `git push`, `gh pr create`, `gh pr merge`, a rebase onto main, a force-push or a tag. Once the checks above are green and the Verify + sniper proofs are in the REPORT, the release goes to the `commit` agent in **full mode** (AGENTS.md Git policy; `$commit-pro:commit` + `$commit-pro:git-flow`):

- It pushes the working branch, opens the PR (against the repo's base branch, e.g. `develop`), waits for CI, merges with a real `--merge` commit — never squash, which would orphan the release tag's bump commit — then tags post-merge and watches the release run.
- The lead launches it at the end of the mandate and announces the merge/release in the report to the owner; an APEX sub-agent never launches it and never runs those commands itself.
- Brief it with: `mode: full`, the PR title and body below, the base branch, and the files of the mandate.
- Blocked (merge conflict, secret in the diff) → it stops with `status: blocked`; CI red → `status: left-open`, `ci: failed:<check>`. Either way: fix through the APEX loop (`06-fix-issue.md`), re-run the checks, hand off again.

## PR Body Template (handed to the commit agent)

```markdown
## Summary
Brief description (1-2 sentences).

## Changes
- Added `ProfileViewModel` with @Observable
- Created `ProfileServiceProtocol`

## Checklist
- [ ] MVVM architecture followed
- [ ] @Observable (not ObservableObject)
- [ ] Files within `FUSE_SOLID_MAX_LINES` (default 200) lines
- [ ] SwiftLint passes
- [ ] /// docs on public APIs
- [ ] Unit tests added
- [ ] #Preview for views
- [ ] Strings localized
- [ ] Models are Sendable

## Screenshots
| Before | After |
|--------|-------|
| N/A | [img] |
```

## Title Convention

```text
feat(scope): description (#ticket)
fix(scope): description (#ticket)
refactor(scope): description
```

## GitHub Actions Checks (what the commit agent's CI wait gates on)

```yaml
name: PR Checks
on: [pull_request]
jobs:
  lint:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - run: swiftlint --strict
  test:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - run: xcodebuild test -scheme MyApp -destination "platform=iOS Simulator,name=iPhone 16"
```

## After the Hand-off

```text
[ ] Commit agent report read: PR URL, CI result, merge commit, tag
[ ] Report to the owner: merge/release announced, with the PR URL and tag
```

## Update Task Phase

At the **start** of this phase, record it (and mark the task `completed` once the commit agent reports the merge) in `.codex/apex/task.json`:

```bash
jq --arg p "create-pr" '.tasks[.current_task].phase = $p' .codex/apex/task.json \
  > .codex/apex/task.json.tmp && mv .codex/apex/task.json.tmp .codex/apex/task.json
# after the commit agent reports the merge:
jq '.tasks[.current_task].status = "completed"' .codex/apex/task.json \
  > .codex/apex/task.json.tmp && mv .codex/apex/task.json.tmp .codex/apex/task.json
```
