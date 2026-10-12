---
name: hook-scripts-reference-2
description: Historical check-logic reference scripts (Swift SOLID, skill-read tracker) — algorithm illustration only, continued from hook-scripts-reference.md
keywords: hooks, scripts, bash, validation, solid, reference, swift
---

# Hook Scripts — Check-Logic Reference (continued)

Continued from `hook-scripts-reference.md` (split to stay under the `FUSE_SOLID_MAX_LINES`
ceiling). Read `hook-scripts.md` first: neither script below is, or ever was, wireable in this
Codex marketplace. Both are **historical illustrations** of check logic only — the Swift SOLID
check is superseded by the harness's `solid` scope handler (`fuse-harness` repo,
`src/runtime/lifecycle/solid-detect.ts`, `check-file-size.ts`); see `hook-scripts.md` §(c) for
how to change that logic. There is no porting step from these snippets into this repo.

---

## Swift SOLID Validation — File: scripts/validate-swift-solid.sh

```bash
#!/bin/bash
# Swift SOLID Validation
# Protocols in Sources/Interfaces/

set -e

FILE_PATH="${1:-}"
MAX_LINES="${FUSE_SOLID_MAX_LINES:-200}"  # the only file-size ceiling

if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Only check Swift files
case "$FILE_PATH" in
    *.swift)
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
        echo "Split: ViewModel + View + Service"
        exit 1
    fi
fi

# Check protocol location
if grep -q "^protocol " "$FILE_PATH" 2>/dev/null; then
    if [[ "$FILE_PATH" != *"Sources/Interfaces/"* ]] && [[ "$FILE_PATH" != *"Protocols/"* ]]; then
        echo "ERROR: Protocols must be in Sources/Interfaces/"
        exit 1
    fi
fi

exit 0
```

---

## Skill Read Tracker — File: scripts/track-skill-read.sh

```bash
#!/bin/bash
# Track skill usage for analytics
# PostToolUse on Read

FILE_PATH="${1:-}"
LOG_FILE="${PLUGIN_ROOT:-/tmp}/skill-reads.log"

if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Only track skill reads
if [[ "$FILE_PATH" == *"/skills/"* ]]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') READ: $FILE_PATH" >> "$LOG_FILE"
fi

exit 0
```
