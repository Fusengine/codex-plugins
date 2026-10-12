## SOLID Skill per Stack (read before coding)

| Agent | Skill | Interfaces |
|-------|-------|------------|
| nextjs-expert | `solid-nextjs/references/` | `modules/[feature]/src/interfaces/` |
| laravel-expert | `solid-php/references/` | `app/Contracts/` |
| swift-expert | `solid-swift/references/` | `Sources/Interfaces/` |
| react-expert | `solid-react/references/` | `modules/[feature]/src/interfaces/` |
| astro-expert | `solid-astro/references/` | `src/interfaces/` |
| other languages | `solid` plugin: `solid-detection` → `solid-{python,go,java,rust,ruby,csharp,generic}/references/` | per stack convention |

**Split:** `main.ts` + `validators.ts` + `types.ts` + `utils.ts` + `constants.ts`

## DRY (ZERO TOLERANCE)

Before ANY new code: grep the codebase, then load the stack's SOLID skill — `$solid:solid-detection` routes to the right `solid-<stack>` (solid-nextjs, solid-react, solid-tanstack-start, solid-astro, solid-swift, solid-php, solid-go, solid-rust, solid-python, solid-java, solid-csharp, solid-ruby, solid-generic), which defines that stack's shared locations; extend/reuse what exists.
