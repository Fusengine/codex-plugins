# T12 rollout excerpt (who wrote the UI)

Run: fresh throwaway `CODEX_HOME` installed with `scripts/install-codex.ts` from commit `3b2c3cf9` (`git archive`, `--skip-env`, MCP `fuse-browser` + `sequential-thinking` stanzas, 94 hooks trusted, 40 agents), `gpt-6.2-sol`, lead effort `high`, `FUSE_HARNESS_AUTO_UPDATE=0`, hard cut 1800 s. Codex worked in `/Users/brunoazoulay/Downloads/dossier sans titre/t12-shadcn/`.

Prompt (verbatim): « Crée ici une petite application web de gestion de tâches en Next.js et TypeScript, livre quelque chose qui marche en 30 minutes maximum. »

Lead spawns (rollout order, local time): 23:50:46 explore-codebase, 23:50:53 research-expert, 23:51:02 nextjs-expert, 23:51:09 and 23:51:56 brainstorming, 23:52:40 design-expert, 23:53:35 skill-creator, 00:07:47 challenger. No question was asked to the owner (stack and language named).

Files written per agent (from `apply_patch` inputs in the rollouts):

| agent | product files |
|---|---|
| nextjs-expert | `app/layout.tsx`, `app/page.tsx`, `lib/utils.ts`, `components/ui/*.tsx` (generated from the shadcn registry items `base-nova` button, input, card, checkbox fetched with fuse-browser), `modules/tasks/components/task-row.tsx`, `modules/tasks/components/task-workspace.tsx`, `modules/tasks/src/**` (hook, interfaces, services, validators, store), `tests/*.test.ts` |
| design-expert | `app/globals.css`, `modules/tasks/components/task-composer.tsx`, `modules/tasks/components/task-row.tsx`, `modules/tasks/components/design-system.md` |
| lead | coordinator PRD files only (no product edit) |

The nextjs-expert read `never-do-code.md` (no truncation) and fetched `https://ui.shadcn.com/r/styles/base-nova/{button,input,card,checkbox}.json` before writing `components/ui/*`. The design-expert read `never-do.md` (no truncation).

Codex's own final message (not hidden): the sources were delivered but **the app was not started by Codex**: its hook asked `CONFIRM fe3e` before `npm install --no-audit --no-fund` (the throwaway home has no owner to answer), so build, lint, types and the browser flow were reported "not verified". No sniper was spawned (spawns: brainstorming 2, challenger 1, design-expert 1, explore 1, nextjs-expert 1, research 1, skill-creator 1). The build/start/flow proof below was therefore produced by the test harness on a copy of the delivered folder (`npm install`, `npm run build`, `next start`).
