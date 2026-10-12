---
name: hook-scripts-reference
description: Historical check-logic reference scripts (SOLID size/interface rules) — algorithm illustration only, superseded by the harness's `solid` scope
keywords: hooks, scripts, bash, validation, solid, reference
---

# Hook Scripts — Check-Logic Reference

Split out of `hook-scripts.md` to stay under the `FUSE_SOLID_MAX_LINES` ceiling. Read
`hook-scripts.md` first: none of these scripts are, or ever were, wireable in this Codex
marketplace — `hooks/hooks.json` only ever calls the canonical Harness route. Each block below
is a **historical illustration** of the check logic (what to detect, what message to raise),
kept only as a language-per-stack reference. The equivalent live behavior is implemented as the
harness's `solid` scope handler (`fuse-harness` repo, `src/runtime/lifecycle/solid-detect.ts`,
`check-file-size.ts`) — see `hook-scripts.md` §(c) for how to change that logic. There is no
porting step from these snippets into this repo; they are not a template for a file to write
here.

---

## SOLID Validation — File: scripts/validate-solid.sh

```bash
#!/bin/bash
# SOLID Validation Script for PreToolUse hooks
# Validates file size and interface location before Write/Edit

set -e

# Configuration - adjust per stack
MAX_LINES="${FUSE_SOLID_MAX_LINES:-200}"  # the only file-size ceiling
INTERFACE_DIR="src/interfaces"  # Or app/Contracts for Laravel

# Get file being written/edited
FILE_PATH="${1:-}"

if [ -z "$FILE_PATH" ]; then
    exit 0  # No file specified, allow
fi

# Skip non-code files
case "$FILE_PATH" in
    *.md|*.json|*.yml|*.yaml|*.txt|*.env*)
        exit 0
        ;;
esac

# Check if file exists (for Edit)
if [ -f "$FILE_PATH" ]; then
    LINE_COUNT=$(wc -l < "$FILE_PATH" | tr -d ' ')

    if [ "$LINE_COUNT" -gt "$MAX_LINES" ]; then
        echo "ERROR: File exceeds $MAX_LINES lines ($LINE_COUNT lines)"
        echo "Split into smaller files following SOLID principles"
        exit 1
    fi
fi

# Check interface location
if [[ "$FILE_PATH" == *"/interfaces/"* ]] || [[ "$FILE_PATH" == *"/Contracts/"* ]]; then
    # Interface file - verify correct location
    if [[ "$FILE_PATH" != *"$INTERFACE_DIR"* ]]; then
        echo "ERROR: Interfaces must be in $INTERFACE_DIR"
        exit 1
    fi
fi

exit 0
```

---

## Next.js SOLID Validation — File: scripts/validate-nextjs-solid.sh

```bash
#!/bin/bash
# Next.js SOLID Validation
# Interfaces in modules/[feature]/src/interfaces/

set -e

FILE_PATH="${1:-}"
MAX_LINES="${FUSE_SOLID_MAX_LINES:-200}"  # the only file-size ceiling
INTERFACE_PATTERN="modules/*/src/interfaces/"

if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Skip non-code files
case "$FILE_PATH" in
    *.md|*.json|*.yml|*.yaml|*.txt|*.env*|*.css)
        exit 0
        ;;
esac

# Check file size
if [ -f "$FILE_PATH" ]; then
    LINE_COUNT=$(wc -l < "$FILE_PATH" | tr -d ' ')

    if [ "$LINE_COUNT" -gt "$MAX_LINES" ]; then
        echo "ERROR: File exceeds $MAX_LINES lines ($LINE_COUNT lines)"
        echo "Split: main.ts + validators.ts + types.ts + utils.ts"
        exit 1
    fi
fi

# Check interface in component
if [[ "$FILE_PATH" == *"/components/"* ]]; then
    if grep -q "^interface\|^type.*=" "$FILE_PATH" 2>/dev/null; then
        echo "ERROR: Interfaces/types in components"
        echo "Move to: $INTERFACE_PATTERN"
        exit 1
    fi
fi

exit 0
```

---

## Laravel SOLID Validation — File: scripts/validate-php-solid.sh

```bash
#!/bin/bash
# Laravel SOLID Validation
# Interfaces in app/Contracts/

set -e

FILE_PATH="${1:-}"
MAX_LINES="${FUSE_SOLID_MAX_LINES:-200}"  # the only file-size ceiling

if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Only check PHP files
case "$FILE_PATH" in
    *.php)
        ;;
    *)
        exit 0
        ;;
esac

# Check file size
if [ -f "$FILE_PATH" ]; then
    LINE_COUNT=$(wc -l < "$FILE_PATH" | tr -d ' ')

    if [ "$LINE_COUNT" -gt "$MAX_LINES" ]; then
        echo "ERROR: File exceeds $MAX_LINES lines ($LINE_COUNT lines)"
        echo "Split: Service + Repository + Action + DTO"
        exit 1
    fi
fi

# Check interface location
if grep -q "^interface " "$FILE_PATH" 2>/dev/null; then
    if [[ "$FILE_PATH" != *"app/Contracts/"* ]]; then
        echo "ERROR: Interfaces must be in app/Contracts/"
        exit 1
    fi
fi

exit 0
```

---

Continued (Swift SOLID Validation, Skill Read Tracker) in `hook-scripts-reference-2.md` — split to stay under the `FUSE_SOLID_MAX_LINES` ceiling.
