# Next.js Expert Skills

Documentation and conventions for nextjs-expert plugin skills.

## Skill Structure

### 3 Patterns by Size

| Pattern | Size | Structure |
|---------|------|-----------|
| **Standalone** | Small topic | Everything in SKILL.md |
| **Light Hub** | Several sub-topics | SKILL.md + references/ |
| **Full Hub** | Large documentation set | SKILL.md index + tree |

### Standard Structure (Light Hub)

```
skill-name/
├── SKILL.md                    # Index + Quick Start
└── references/
    ├── patterns.md             # Code patterns
    ├── examples.md             # Advanced examples
    └── api.md                  # API reference (optional)
```

### Full Hub Structure

```
skill-name/
├── SKILL.md                    # Index only
├── getting-started/
├── concepts/
├── api-reference/
└── examples/
```

---

## Available Skills

### Standalone Skills
- `nextjs-stack` - Stack orchestrator

### Light Hub Skills
- `nextjs-shadcn` - shadcn/ui components
- `nextjs-zustand` - State management
- `nextjs-tanstack-form` - Forms with Server Actions
- `nextjs-i18n` - Internationalization
- `solid-nextjs` - SOLID architecture

### Full Hub Skills
- `better-auth` - Authentication (145 files)
- `nextjs-16` - Next.js documentation (376 files)
- `prisma-7` - Prisma ORM (415 files)

---

## Naming Convention

### Skill names
- Lowercase only
- `kebab-case` format
- Max 64 characters
- Examples: `nextjs-shadcn`, `better-auth`, `prisma-7`

### Files
- `SKILL.md` - Main file (UPPERCASE)
- `references/` - References folder (lowercase)
- Markdown files in `kebab-case.md`

---

## SKILL.md Frontmatter

```yaml
---
name: skill-name
description: Clear description for auto-invocation
version: 1.0.0
user-invocable: false
references:
  - path: references/patterns.md
    title: Code Patterns
  - path: references/examples.md
    title: Advanced Examples
---
```

### Required fields
- `name` - Unique identifier
- `description` - Description for Codex

### Recommended fields
- `version` - Semantic versioning
- `user-invocable` - `false` for knowledge-only
- `references` - List of reference files

---

## Best Practices

### SKILL.md
1. **Concise index** - Keep it focused; details go to references/
2. **Quick Start first** - Installation, basic config
3. **Essential examples** - One complete example
4. **Links to references/** - For details

### References
1. **patterns.md** - Reusable code patterns
2. **examples.md** - Advanced examples and use cases
3. **api.md** - Complete API reference (if needed)

### Large documentation
1. **Split by theme** - One file per concept
2. **Keep each file within `FUSE_SOLID_MAX_LINES`** (default 200) - Respect SOLID
3. **Clear index** - Easy navigation in SKILL.md

---

## Creation Workflow

1. Identify skill type (standalone/light hub/full hub)
2. Create appropriate folder structure
3. Write SKILL.md with complete frontmatter
4. Extract patterns to references/ when SKILL.md grows beyond an index
5. Add references in frontmatter
