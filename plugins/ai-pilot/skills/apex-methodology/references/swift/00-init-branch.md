---
name: 00-init-branch
description: Git flow and branching strategy for Swift/iOS projects
prev_step: null
next_step: references/swift/01-analyze-code.md
---

# Swift Branching Strategy

## Git Flow for iOS Projects

```text
main (production)
  └── develop (integration)
       ├── feature/AUTH-123-login-screen
       └── bugfix/UI-789-button-crash
```

## Branch Naming

```bash
feature/TICKET-description    # New features
bugfix/TICKET-description     # Bug fixes
release/1.2.0                 # Releases
hotfix/1.2.1-critical-fix     # Hotfixes
```

## Creating Feature Branch

```bash
git checkout develop && git pull origin develop
git checkout -b feature/AUTH-123-login-screen
```

The branch stays local; the `commit` agent pushes it at the end of the mandate (`mode: full`).

## SPM Package Versioning

Release tags (SemVer, e.g. `1.2.0`) are created only by the `commit` agent in full mode, after the merge is confirmed — never by hand in this phase.

```swift
// Package.swift dependency
.package(url: "https://github.com/org/Package", from: "1.2.0")
```

## Essential .gitignore

```text
xcuserdata/
DerivedData/
.build/
Pods/
*.xcscmblueprint
```

## Merge Strategy

Merges are done only by the `commit` agent (full mode, end of mandate): PR into the base branch, CI wait, then a real `--merge` commit — never squash, which would orphan the release tag's bump commit. No manual rebase, merge or commit in this phase.

## Branch Protection Rules

- Require PR reviews (min 1)
- Require status checks (SwiftLint, tests)
- No force push to main/develop

## Release Process

Version bump, CHANGELOG, merge and post-merge tag are all run by the `commit` agent (`$commit-pro:commit` + `$commit-pro:git-flow`) in full mode, announced by the lead in the report (AGENTS.md Git policy). This phase only creates the working branch.

## Update Task Phase

At the **start** of this phase, record it (and the resolved task subject) in `.codex/apex/task.json`:

```bash
jq --arg p "init-branch" --arg s "$TASK_SUBJECT" \
  '.tasks[.current_task].phase = $p | .tasks[.current_task].subject = $s' \
  .codex/apex/task.json > .codex/apex/task.json.tmp && mv .codex/apex/task.json.tmp .codex/apex/task.json
```

Replace `$TASK_SUBJECT` with the real task description, quoted for the shell.

## Next Phase

→ Proceed to `01-analyze-code.md`
