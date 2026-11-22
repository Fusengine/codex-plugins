---
name: 03-execution
description: Implement code following plan (APEX Phase E)
prev_step: references/02-features-plan.md
next_step: references/03.5-elicit.md
---

# 03 - Execution

**Implement code following plan (APEX Phase E).**

## When to Use

- After plan is complete and approved
- Follow update_plan task order
- Update progress as you go

**MUST read `references/never-do-code.md` when starting this phase**, in its own tool call, before writing any code; every applicable rule holds for the deliverable and is re-checked at eLicit.

---

## Tests First (required artifact)

```text
Before the implementation (RED), then green:
✅ One test per pure function that gates input or interprets data
✅ One failure-path test per external call (error status, timeout, malformed payload)
✅ No test runner in the project → add a minimal one (or the language's built-in runner) in this task
❌ "Local testing passed" alone is not done: the REPORT names each test file and the command + output that ran it
```

---

## Execution Order

### Strict Sequence

```text
1. Interfaces/Types/Protocols FIRST
2. Constants/Config
3. Utilities/Helpers
4. Main implementation
5. Integration points
```

### Why This Order?

```text
✅ Types catch errors early
✅ Utilities are reusable
✅ Main code has dependencies ready
✅ Easier to test incrementally
```

---

## Code Quality Rules

### File Size (ABSOLUTE)

```text
🚨 Approaching `FUSE_SOLID_MAX_LINES` → Split by responsibility immediately
❌ NEVER exceed `FUSE_SOLID_MAX_LINES` (default 200; the hook blocks it)
📊 One responsibility per file; set no cap of your own
```

### Split Triggers

```text
If approaching `FUSE_SOLID_MAX_LINES`:
1. STOP writing
2. Identify logical boundaries
3. Extract to new file
4. Import and continue
```

---

## Documentation (Language-Specific)

Use your language's documentation standard:

| Language | Standard | Example |
| --- | --- | --- |
| TypeScript/JS | JSDoc | `/** @param name Description */` |
| PHP | PHPDoc | `/** @param string $name */` |
| Python | Docstrings | `"""Description."""` |
| Swift | DocC | `/// Description` |
| Go | GoDoc | `// FunctionName does X` |
| Rust | RustDoc | `/// Description` |

### Documentation Must Include

```text
✅ Brief function purpose
✅ Parameter descriptions
✅ Return value description
✅ Error/exception cases
✅ Usage example (complex functions)
```

---

## Pattern Compliance

### Follow Existing Patterns

```text
✅ Match naming conventions found in 01-analyze
✅ Use existing utilities (don't duplicate)
✅ Follow architectural patterns
✅ Consistent import ordering
```

### Interface Location (Language-Specific)

| Language | Location |
| --- | --- |
| TypeScript/JS | `src/interfaces/` or `src/types/` |
| PHP/Laravel | `app/Contracts/` |
| Swift | `Sources/Protocols/` |
| Go | Same package or `internal/` |
| Python | `interfaces/` or type hints |

---

## Commit Strategy

### Atomic Commits

Executors never commit. Every commit is made by the `commit` agent only (`06-tooling-rules` "WIP mode"; `AGENTS.md` HARD STOP 1): the lead launches it in WIP mode once per verified task. The executor's part is to keep each task's change atomic and to suggest the message below in its REPORT.

```text
✅ One logical change per commit (made by the commit agent)
✅ One WIP commit after each verified task, by the commit agent — never by the executor
✅ Conventional commit format (suggested in the REPORT)
```

### Commit Format

```text
<type>(<scope>): <description>

Types: feat, fix, refactor, docs, test, chore
Scope: component/feature name
Description: imperative mood, <50 chars
```

### Examples

```text
feat(auth): add login validation
refactor(api): extract fetch utilities
test(auth): add login component tests
```

---

## Progress Tracking

### Update tasks via update_plan

```text
After each task:
1. Mark task as completed (update_plan status: completed)
2. Note any deviations
3. Update estimates if needed
4. Flag blockers immediately (addBlockedBy)
```

---

## Error Handling

### During Execution

```text
If you encounter:

1. Unexpected complexity
   → STOP, reassess, update plan

2. Missing dependency
   → Add to plan, implement first

3. File size limit approaching
   → Split immediately, don't push limits

4. Pattern conflict
   → Follow existing pattern, document deviation

5. API discrepancy
   → Re-verify with research-expert
```

---

## Anti-Patterns

```text
❌ Skip interfaces, write inline types
❌ Create files above `FUSE_SOLID_MAX_LINES` (default 200) lines
❌ Duplicate existing utilities
❌ Ignore existing patterns
❌ Large commits with multiple features
❌ No documentation/comments
❌ Push without local testing
```

---

## Validation Checklist

```text
□ Interfaces/types created first
□ All files within `FUSE_SOLID_MAX_LINES` (default 200) lines
□ Documentation on all functions
□ Existing patterns followed
□ No duplicate utilities
□ Atomic change per task, commit message suggested in the REPORT (the commit agent commits, never the executor)
□ Tasks updated via update_plan
□ Local testing passed — proven by the Tests First artifact (test files + command + output), never by the claim alone
□ Every applicable `references/never-do-code.md` rule held
```

---

## Update Task Phase

At the **start** of this phase, record it in `.codex/apex/task.json`:

```bash
jq --arg p "execution" '.tasks[.current_task].phase = $p' .codex/apex/task.json \
  > .codex/apex/task.json.tmp && mv .codex/apex/task.json.tmp .codex/apex/task.json
```

---

## Next Phase

→ Proceed to `04-validation.md`
