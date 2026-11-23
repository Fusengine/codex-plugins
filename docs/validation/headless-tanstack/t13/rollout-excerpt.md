# T13 rollout excerpt (headless default, TanStack scaffold by CLI)

Source: working tree of the main checkout (main 9d39949c + uncommitted doctrine diff), rsync copy installed with `scripts/install-codex.ts --skip-env` into a throwaway `CODEX_HOME` (MCP stanzas fuse-browser + sequential-thinking, 94 hooks trusted), `gpt-6.2-sol`, lead effort `high`, hard cut 2100 s. Folder: `/Users/brunoazoulay/Downloads/dossier sans titre/t13-headless/`.

Prompt (names NO stack): « Crée ici une petite application web de prise de notes, livre quelque chose qui marche en 30 minutes maximum. » No question was asked to the owner.

Lead spawns: explore-codebase, research-expert, tanstack-start-expert (domain expert chosen by Codex), brainstorming x3, design-expert x2 (executor + independent review), skill-creator, challenger x2, sniper. Delivered at 1790 s.

Scaffold and shadcn commands (tanstack-start-expert rollout, `exec_command`):

1. `ls -la; test ! -e package.json && CI=1 npx -y @tanstack/cli@0.72.16 create . -y --package-manager npm --no-git </dev/null`
2. `test ! -e notes-foundation-stage && CI=1 npx -y @tanstack/cli@0.72.16 create notes-foundation-stage -y --package-manager npm --no-git --no-examples --toolchain biome </dev/null` (staged because the workspace was not empty)
3. tsconfig patched to drop the `#/*` alias (a Python heredoc attempt was blocked by the "Bash write to code file" hook; the patch then went through `apply_patch`): final `tsconfig.json` has only `"@/*": ["./src/*"]`
4. `CI=1 npx -y shadcn@4.23.0 init -t start -b radix -p nova -y </dev/null` (cwd = the staged project)
5. `CI=1 npx -y shadcn@4.23.0 add input textarea alert-dialog -y </dev/null`
6. `npm install --no-audit --no-fund` -> **blocked** (see below)

Hook block (exact): `Command blocked by PreToolUse hook: [downgraded from ask — Codex has no interactive approval] [CONFIRM] Dependency install. This command installs packages: npm install --no-audit --no-fund. To allow, reply: CONFIRM 6d4d. rule ID: policy:ask, rejection: no-token`. Reaction: Codex did not ask the owner and did not retry; it continued ("La base TanStack Start et les composants shadcn sont en place"), because the CLI scaffold (command 2, `--package-manager npm`) had already installed `node_modules` itself (the hook matches the explicit `npm install`, not the install inside `npx @tanstack/cli`).

Who wrote what: tanstack-start-expert = notes logic, hook, storage, tests, README and the TSX components/routes (`src/components/notes/*`, `src/routes/*`, via the shadcn primitives); design-expert = `src/notes-ui/design-system.md` and the stylesheets (`src/notes-ui/*.css`, `src/styles.css`); lead = `docs/decisions.md` and coordinator PRD files only; the design-expert read `never-do.md` (no truncation), the independent review ran with `never-do.md` too.

Evidence of the result (checked on the delivered folder): `components.json` `iconLibrary: lucide`, `style: radix-nova`; `lucide-react ^1.78.0`; `@tanstack/react-start 1.169.7`; shadcn primitives `alert-dialog`, `button`, `input`, `textarea` in `src/components/ui/`; 6 import lines from `@/components/ui/*` in app code; 3 files import `lucide-react`; 0 hand-drawn `<svg>` in app code (0 in `components/ui`); no `#/` import anywhere. Build (`vite build`) and `npm test` (5/5) re-run by me on a copy: pass; flow clicked on `vite preview`: create 2 notes, search "Courses" -> 1 row, reload -> 2 rows kept, delete with `alertdialog` confirmation -> 1 row; 0 page errors, 1 console 404 (static resource).
