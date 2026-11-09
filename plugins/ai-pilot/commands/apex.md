---
description: APEX Methodology - The systematic Analyze-Plan-Execute-eLicit-eXamine approach for intelligent development. Eliminates hallucinations, errors, and bugs to produce clean, maintainable code.
argument-hint: "[--auto] <task description>" # --skip-elicit is a legacy flag, IGNORED (I3: eLicit is always automatic, never skippable)
---

# APEX: Analyze-Plan-Execute-eLicit-eXamine

Execute the comprehensive APEX methodology for professional-grade development.

**Complete documentation**: `skills/apex-methodology/SKILL.md`

---

## Phase 1: ANALYZE (Deep Exploration)

> Use explore-codebase to understand relevant parts of the system

**Scope rule** (owner decision 2026-11-08): read-only question → `explore-codebase` alone; anything that touches code → the Analyze trio (`explore-codebase` + `research-expert` + the domain expert) in one parallel message; a trivial 1-3 line change → `/prompts:apex-quick`, one delegated agent (the lead never edits). One agent per task (one verifiable deliverable, exclusive files); at most 6 agents concurrently — a ceiling, never a minimum; more tasks → waves of up to 6. Allocation details: `$ai-pilot:lead-orchestration`.

**Goals**:
- Identify where changes need to be made; understand existing patterns and conventions
- Map dependencies and impacts; locate relevant tests

**Deliverable**: Exploration summary with affected components

---

## Phase 2: PLAN (Strategic Design)

> Use research-expert to validate approach against best practices

**Goals**:
- Design solution following project patterns; identify edge cases and error handling
- Plan test strategy; estimate impact and complexity

**Deliverable**: Implementation plan with step-by-step approach

**Plan Format**:
```markdown
### Implementation Steps
1. [Component A]: [Required changes]
2. [Component B]: [Required changes]
3. [Tests]: [Test cases to add]

### Edge Cases
- [Case 1]: [Handling approach]
- [Case 2]: [Handling approach]

### Testing Strategy
- Unit tests: [What to test]
- Integration tests: [Scenarios]
- Manual testing: [Steps]
```

---

## Phase 3: EXECUTE (Precise Implementation)

Implement the solution:
1. Follow the plan step-by-step
2. Maintain existing code style and patterns
3. Add inline documentation for complex logic
4. Create/update tests alongside code

**Quality Standards**:
- SOLID principles without exception
- DRY, KISS, YAGNI
- Max `FUSE_SOLID_MAX_LINES` (default 200) lines per file
- Separate types/interfaces
- Security validation (OWASP Top 10)

---

## Phase 3.5: eLICIT (Self-Review) - NEW

> Expert agent self-reviews and self-corrects before sniper validation

**Modes**:
eLicit is always automatic — no manual or skip mode exists (I3, `lead-orchestration/SKILL.md` §2; `elicitation/SKILL.md`).
- `--auto`: Auto-select techniques based on code type (default, and the only live path)
- `--manual`: legacy flag, IGNORED — superseded by `--auto`
- `--skip-elicit`: legacy flag, IGNORED — eLicit never skips to eXamine

**Workflow**:
```
┌─────────────────────────────────────────────────────────┐
│  ELICIT (6 steps)                                       │
│                                                         │
│  Init → Analyze → Select → Apply → Correct → Report    │
│                                                         │
│  Expert applies elicitation techniques from 12 cats:   │
│  - Security (7)      - Performance (6)                 │
│  - Architecture (6)  - Testing (6)                     │
│  - Documentation (6) - UX/a11y (6)                     │
│  - Data (6)          - Concurrency (6)                 │
│  - Integration (7)   - Observability (6)               │
│  - Code Quality (7)  - Maintainability (6)             │
│                                                         │
│  Total: 75 techniques                                   │
└─────────────────────────────────────────────────────────┘
```

**Auto-Detection Matrix**:
| Code Type | Auto-Selected Techniques |
|-----------|--------------------------|
| Auth/Security | SEC-01, SEC-02, SEC-03 |
| API Endpoints | INT-01, DOC-01, TEST-01 |
| Database | PERF-01, DATA-02, CONC-06 |
| UI Components | UX-01, TEST-01, ARCH-04 |
| Business Logic | ARCH-01, TEST-01, CQ-01 |

**Benefits**:
- Expert catches own mistakes before sniper
- Faster validation (less sniper corrections)
- Knowledge retention (expert learns from self-review)

**Full skill**: `skills/elicitation/SKILL.md`

---

## Phase 4: eXAMINE (Rigorous Validation)

Comprehensive validation:

### 1. **Run Linters** (ZERO TOLERANCE):
   ```bash
   bun run lint
   eslint .
   prettier --check .
   tsc --noEmit
   ```

### 2. **Run Tests**:
   ```bash
   bun test
   bun test:integration
   pytest
   ```

### 3. **Build Verification**:
   ```bash
   bun run build
   npm run build
   ```

### 4. **Security Audit**:
   ```bash
   npm audit fix
   snyk test
   ```

### 5. **Research Validation**:
   > Use research-expert to confirm:
   - Solutions are up-to-date
   - No deprecated APIs used
   - Best practices followed

### 6. **Manual Testing**:
   - Execute test plan scenarios
   - Verify edge cases
   - Check error handling

### 7. **Final Verification**:
   > Use sniper to ensure 0 linter errors

**Deliverable**: Tested, validated code ready for deployment

---

## APEX Guarantees

✅ **Zero Hallucination**: Complete exploration + research
✅ **Zero Linter Errors**: Sniper with zero tolerance
✅ **Zero Bugs**: Exhaustive tests + rigorous validation
✅ **Maintainable Code**: SOLID + established patterns
✅ **Self-Corrected**: Expert auto-review before validation (NEW)

---

## Usage

**Arguments**:
- $ARGUMENTS specifies the feature/task to implement

**Examples**:
- `/prompts:apex Add user profile editing` → Full APEX for feature
- `/prompts:apex Fix authentication bug` → APEX for bug fix
- `/prompts:apex Refactor payment module` → APEX for refactoring

---

## Metrics

- **Production Bugs**: -90%
- **Debug Time**: -70%
- **Development Speed**: +300% (parallel agents)
- **Code Maintainability**: +200%
- **Code Confidence**: 98%

---

**See full documentation**: `skills/apex-methodology/SKILL.md`
