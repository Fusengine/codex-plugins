---
description: Security-specific APEX workflow adaptation
alwaysApply: true
---

# Security APEX Workflow

## 6-Phase Security Audit

```
DETECT → RESEARCH → SCAN → VERIFY → REPORT → HANDOFF
```

The security-expert agent reports; it never fixes the audited project. Severity scale, confidence threshold, noise policy and report format: `security-rules.md` (single source).

### Phase Mapping to APEX

| Security Phase | APEX Phase | Agent/Tool |
|---------------|------------|------------|
| DETECT | Analyze | explore-codebase (run by the caller) |
| RESEARCH | Analyze | research-expert (run by the caller) + Context7/Exa |
| SCAN | Analyze | harness CLI `bun ${PLUGIN_ROOT}/../node_modules/@fusengine/harness/dist/cli/bin.mjs scan <dir>` + skill patterns + Grep |
| VERIFY | eLicit | read-only refutation pass; the caller may run challenger per candidate |
| REPORT | eLicit | report returned to the caller, who writes it to `docs/security/YYYY-MM-DD-<scope>.md` |
| HANDOFF | — (ends the audit) | findings returned; the caller then dispatches the domain expert, then sniper |

### Mandatory Rules

1. **NEVER skip DETECT** - Wrong stack = wrong patterns
2. **ALWAYS research CVEs** before scanning
3. **SCAN all categories** - XSS, SQLi, RCE, SSRF, secrets, agent configuration when present
4. **NEVER skip VERIFY** - Only confidence ≥ 8 with an exploit scenario is reported
5. **HANDOFF, never fix** - The agent writes nothing (read-only sandbox): it returns its report and the caller writes it; remediation goes through the caller (domain expert, then sniper)

### Integration with Main APEX

When used within the main APEX workflow:
- The security audit runs during **eXamine** (diff scope vs the merge base for a change review)
- CRITICAL and HIGH findings are flagged as blocking in the handoff; the caller decides and dispatches the fixes
