---
name: solid-detection
description: "Use when determining which language-specific SOLID skill to load, detecting project type from config files, or resolving interface directory conventions."
---

<objective>
SOLID Detection identifies a project's language/framework from its config files (package.json + next/@tanstack/react-start/astro/react, tsconfig.json/bun files, composer.json + laravel, Package.swift/*.xcodeproj, pom.xml/build.gradle, *.csproj/*.sln, go.mod, Gemfile+Rakefile, Cargo.toml, pyproject.toml/requirements.txt) in a fixed priority order, then maps it to the matching SOLID skill. It reads the `SOLID_PROJECT_TYPE`, `SOLID_FILE_LIMIT`, and `SOLID_INTERFACE_DIR` environment variables exported by the solid SessionStart hook.

An interface found in the wrong location is a hard BLOCK; missing documentation, and exceeding the harness advisory `SOLID_FILE_LIMIT`, are WARNINGS only. The binding ceiling is `FUSE_SOLID_MAX_LINES` (default 200), which the write gate blocks. See `language-rules.md` for the full per-language interface-location, forbidden-zone, and line-counting rules.
</objective>

# SOLID Detection Skill

## References

- [language-rules.md](references/language-rules.md) - Load when: resolving the exact interface directory, file-limit, or pattern-detection regex for a specific language (Next.js, React, Generic TS, Laravel, Swift, Java, Go, Ruby, Rust, Python), or counting lines while excluding comments/blanks

## Project Detection

Detect project type from configuration files:

```bash
# Next.js (priority over React)
[ -f "package.json" ] && grep -q '"next"' package.json

# TanStack Start (priority over React)
[ -f "package.json" ] && grep -q '"@tanstack/react-start"' package.json

# Astro (priority over React)
[ -f "package.json" ] && grep -q '"astro"' package.json

# React (no next / TanStack Start / astro in package.json)
[ -f "package.json" ] && grep -q '"react"' package.json && ! grep -q '"next"' package.json

# Generic TypeScript (no react/next, has .ts files)
[ -f "package.json" ] && ! grep -q '"react"' package.json && ! grep -q '"next"' package.json
[ -f "tsconfig.json" ] || [ -f "bun.lock" ] || [ -f "bun.lockb" ] || [ -f "bunfig.toml" ]

# Laravel
[ -f "composer.json" ] && grep -q '"laravel' composer.json

# Swift
[ -f "Package.swift" ] || ls *.xcodeproj

# Java
[ -f "pom.xml" ] || [ -f "build.gradle" ] || [ -f "build.gradle.kts" ]

# C# / .NET
ls *.csproj *.sln *.slnx 2>/dev/null | grep -q .

# Go
[ -f "go.mod" ]

# Ruby
[ -f "Gemfile" ] && [ -f "Rakefile" ]

# Rust
[ -f "Cargo.toml" ]

# Python
[ -f "pyproject.toml" ] || [ -f "requirements.txt" ]
```

**Priority order:** Next.js > TanStack Start > Astro > React > Generic TS > Laravel > Swift > Java > C# > Go > Ruby > Rust > Python

For the full per-language rule tables (interface location, forbidden zones, pattern-detection regex) and line-counting rules, see [language-rules.md](references/language-rules.md).

## Validation Actions

| Severity | Action |
|----------|--------|
| Interface in wrong location | **BLOCK** (exit 2) |
| File over limit | **WARNING** (exit 0) |
| Missing documentation | **WARNING** |

## Skill Mapping

| Project Type | SOLID Skill | Skill Path |
|--------------|-------------|------------|
| `nextjs` | solid-nextjs | `nextjs-expert/skills/solid-nextjs/` |
| `tanstack-start` | solid-tanstack-start | `tanstack-start-expert/skills/solid-tanstack-start/` |
| `astro` | solid-astro | `astro-expert/skills/solid-astro/` |
| `react` | solid-react | `react-expert/skills/solid-react/` |
| `generic` | solid-generic | `solid/skills/solid-generic/` |
| `laravel` | solid-php | `laravel-expert/skills/solid-php/` |
| `swift` | solid-swift | `swift-apple-expert/skills/solid-swift/` |
| `java` | solid-java | `solid/skills/solid-java/` |
| `csharp` | solid-csharp | `solid/skills/solid-csharp/` |
| `go` | solid-go | `solid/skills/solid-go/` |
| `ruby` | solid-ruby | `solid/skills/solid-ruby/` |
| `rust` | solid-rust | `solid/skills/solid-rust/` |
| `python` | solid-python | `solid/skills/solid-python/` |

Each `solid-<stack>` skill defines that stack's own shared locations (DRY "Check shared locations" step) — load it before writing new code; never apply another stack's directories.

## Environment Variables

Exported by the solid SessionStart hook (`plugins/solid/hooks/hooks.json` → `@fusengine/harness`):

```bash
SOLID_PROJECT_TYPE=nextjs|tanstack-start|astro|react|generic|laravel|swift|java|csharp|go|ruby|rust|python|unknown
SOLID_FILE_LIMIT=100|150
SOLID_INTERFACE_DIR=path/to/interfaces
```

`SOLID_FILE_LIMIT` is a harness post-edit advisory (warning only), not a rule: the only binding file-size ceiling is `FUSE_SOLID_MAX_LINES`.

The hook may recognize fewer types than this skill maps; when it reports `unknown` or a less specific type, apply the Project Detection snippets above in priority order.
