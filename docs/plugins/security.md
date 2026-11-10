# fuse-security

Security vulnerability detection and reporting plugin.

## Overview

Security audit plugin that detects vulnerabilities, scans dependencies, checks OWASP Top 10:2025 patterns, researches CVEs, reviews AI-agent configuration, verifies every finding with a second refutation pass, and writes a report. It reports; it does not fix. The caller dispatches the domain expert, then sniper, with the findings.

## Agent

| Agent | Description |
|-------|-------------|
| `security-expert` | 6-phase security audit: DETECT, RESEARCH, SCAN, VERIFY, REPORT, HANDOFF |

## Skills (6)

| Skill | Description |
|-------|-------------|
| `security-scan` | OWASP Top 10 pattern scanning and secret patterns |
| `cve-research` | CVE lookup via NVD, OSV.dev, GitHub Advisory, Exa |
| `dependency-audit` | Package vulnerability audit (bun, npm, pnpm, Yarn, Composer, pip-audit, cargo audit, govulncheck, bundler-audit, OSV-Scanner; SwiftPM manual) |
| `security-headers` | HTTP headers validation (CSP, HSTS, CORS, X-Frame-Options), live header/cookie verification |
| `auth-audit` | Authentication patterns audit (JWT, sessions, OAuth2, PKCE) |
| `agentic-security` | Audits an AI-coding-agent setup — pre-trust project settings, plugin hooks, MCP servers, prompt-injection paths, permission rules, secrets in agent config, and CI agents on untrusted PRs |

## Commands (1)

| Command | Description |
|---------|-------------|
| `/prompts:scan` | Security audit — whole repository (default) or `--diff [base]` for a change vs its merge base ([command](../../plugins/security-expert/commands/scan.md)) |

## Workflow

```
Phase 1: DETECT     → Stack + agent configuration (.claude/, .mcp.json, hooks, plugins, skills)
Phase 2: RESEARCH   → CVEs via Exa + NVD/OSV.dev
Phase 3: SCAN       → Harness scanner + skill patterns + dependency audit (candidates)
Phase 4: VERIFY     → Read-only refutation pass, confidence 1-10, only ≥ 8 reported
Phase 5: REPORT     → report returned by the agent; the caller writes docs/security/YYYY-MM-DD-<scope>.md in the audited repository
Phase 6: HANDOFF    → Findings + report returned to the caller
```

Severity scale, noise policy and report format: [security-rules.md](../../plugins/security-expert/rules/security-rules.md).

## Scanner Coverage

The harness scanner (`bun ${PLUGIN_ROOT}/../node_modules/@fusengine/harness/dist/cli/bin.mjs scan <dir>`) is a first-pass pattern scanner whose coverage is narrower than the skill's patterns and is being extended; an empty result is not a clean result. The agent always completes it with the manual patterns of the `security-scan` skill for every language and file type in scope. External scanners are optional: checked with `command -v`, never installed, reported "not run" when absent.

## Supported Languages

Manual-pattern coverage of the `security-scan` skill: JS/TS (including Next.js, TanStack Start, Astro, Vue, Svelte), PHP/Laravel, Python, Swift, Go, Rust, Ruby, Java, Kotlin/Android, C#.

## Standards

OWASP Top 10:2025, OWASP ASVS 5.0.0, OWASP API Security Top 10 2023, OWASP MASVS 2.1.0, CWE Top 25 2025, OWASP Top 10 for LLM Applications 2025/2026, OWASP Top 10 for Agentic Applications for 2026.

## MCP Servers

- **Context7** - Documentation lookup
- **Exa** - CVE search, code context
- **Sequential Thinking** - Structured analysis
- **fuse-browser** - Documentation fetch, live header/cookie checks

## Hooks

- **PreToolUse** (Write/Edit) - Verify security skill read
- **PostToolUse** (Read) - Track skill reads
- **PostToolUse** (MCP) - Track research consultations
