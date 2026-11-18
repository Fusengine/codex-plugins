# Conventions

## Files and naming

- Plugins: `plugins/<kebab-name>/` with `.codex-plugin/plugin.json`; agents `agents/<agent-name>.toml`; skills `skills/<skill-name>/SKILL.md` + `references/` (+ `references/templates/`).
- Skill frontmatter: `name` + `description` starting with "Use when ..."; cross-references use `$plugin:skill` (e.g. `$ai-pilot:lead-orchestration`).
- Agent TOML keys: `name`, `description` ("Use when: ..."), `model`, `model_reasoning_effort`, `sandbox_mode`, `nickname_candidates`, `developer_instructions`, `[[skills.config]]`. Model/effort come from `agent-toml.ts`, never hand-edited.
- Scripts: TypeScript ES modules, kebab-case file names, tests colocated as `<name>.test.ts`; exported functions carry JSDoc.
- File size: only the hook ceiling `FUSE_SOLID_MAX_LINES` applies; split rather than truncate.

## Docs

- All docs under `docs/`, except root `README.md`, `CHANGELOG.md`, `SECURITY.md`, `AGENTS.md`.
- One canonical place per fact: the model policy lives in `docs/workflow/agents.md`; other docs link to it.
- Real-condition runs: `docs/real-conditions-<topic>-<YYYY-MM-DD>.md` + artifacts under `docs/validation/<run>/`.
- Owner decisions: one dated line in `docs/decisions.md` with the owner's words verbatim; status in `docs/roadmap.md` (Done / In progress / Next).
- Artifacts (docs, code comments, skills, commits, CHANGELOG) are English.

## Governance

- `AGENTS.md` HARD STOPS: the lead delegates everything; one folder = one owner; never write `~/.codex` / `~/.claude` without the owner naming it.
- `plugins/` is the source; `portage/` (gitignored Claude snapshot) is never edited.
- Frozen artifacts: `docs/validation/security-agent-pilot/baseline.toml` (+ `.sha256`), `evidence/*.json`, CHANGELOG history lines, real-condition reports.

## Git

- Never commit by hand; the `commit` agent owns every git write.
- Branches `<type>/<scope>` kebab-case (`feat/`, `fix/`, `chore/`, `docs/` ...); `main` changes only through a merge (never squash).
- `plugins/*/.cartographer` is gitignored but older indexes are force-tracked: a new skill dir needs `git add -f` on every `index.md` level (never `.enriched.json`).
