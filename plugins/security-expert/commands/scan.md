---
description: Launch a security audit on the current project (whole repository or a change vs its merge base). Detects vulnerabilities, scans dependencies, checks OWASP Top 10:2025, verifies each finding, and writes a structured report under docs/security/.
argument-hint: "[--full] [--diff [base]] [--deps-only] [--headers] [--auth] [path]"
---

# Security Scan

Execute a security audit following the 6-phase workflow of the `security-expert` agent. The audit reports; it never modifies the audited code.

## Usage

- `/prompts:scan` or `/prompts:scan --full` - Full security audit of the current repository (default scope)
- `/prompts:scan --diff [base]` - Review of a change: files changed vs the merge base (`base` defaults to `origin/HEAD`) plus untracked files; only issues introduced by the change are reported
- `/prompts:scan --deps-only` - Dependency audit only
- `/prompts:scan --headers` - Security headers check only
- `/prompts:scan --auth` - Authentication patterns audit only
- `/prompts:scan path/to/dir` - Scan a specific directory

## Workflow

Severity scale, confidence threshold, noise policy and report format: [`../rules/security-rules.md`](../rules/security-rules.md).

### Phase 1: DETECT
- Marker files (package.json, composer.json, go.mod, Cargo.toml, ...) and framework versions
- Agent configuration (`.claude/`, `.mcp.json`, `.claude-plugin/`, hooks, skills, agents, `.github/workflows/` running an AI agent) → skill `agentic-security`
- Diff scope: `git diff --name-only --merge-base <base>` + `git ls-files --others --exclude-standard` (read-only git only)

### Phase 2: RESEARCH
- CVEs and advisories for the detected stack (skill `cve-research`)

### Phase 3: SCAN (candidates)
- Run `bun ${PLUGIN_ROOT}/../node_modules/@fusengine/harness/dist/cli/bin.mjs scan <dir>` — a first-pass pattern scanner whose coverage is narrower than the skill's patterns; an empty result is NOT a clean result
- Always complete it with the manual patterns of skill `security-scan` for every language and file type in scope (secrets: `references/secrets-patterns.md`)
- Dependency audit (skill `dependency-audit`); optional CLIs checked with `command -v`, never installed, missing = "not run"
- Headers/cookies (skill `security-headers`), auth (skill `auth-audit`)
- Agent configuration, when detected (skill `agentic-security`)
- Data-flow review: untrusted input traced to sensitive sinks in the scoped files

### Phase 4: VERIFY
- Second read-only pass per candidate that tries to refute it (data flow, framework protections, reachability)
- Confidence 1-10; ≥ 8 with an exploit scenario → finding; < 8 → "Needs manual review"

### Phase 5: REPORT
- Return the report; the session running `/prompts:scan` writes it to `docs/security/YYYY-MM-DD-<scope>.md` in the audited repository (the agent sandbox is read-only)
- Each finding: id, title, severity, confidence, CWE, standard reference, location, evidence, exploit scenario, recommendation
- Never print a secret value: file:line and secret type only

### Phase 6: HANDOFF
- Return the report (the caller writes it and reports its path), counts per severity, the findings, the "Needs manual review" list and the tools "not run"
- Fixes are dispatched by the caller (domain expert, then sniper); `/prompts:scan` itself changes no audited file

## Arguments

- `$ARGUMENTS` specifies scan options and target path

## Examples

- `/prompts:scan` → Full OWASP + dependency + secrets audit of the repository
- `/prompts:scan --diff` → Security review of the current branch vs `origin/HEAD`
- `/prompts:scan --deps-only` → Quick dependency vulnerability check
- `/prompts:scan src/api/` → Scan only the API directory
