## MCP Servers

| Server | Usage | Agent |
|--------|-------|-------|
| **Context7** | Documentation | `research-expert` |
| **Exa** | Web search | `research-expert`, `websearch` |
| **Magic** | UI generation | `design-expert` |
| **shadcn** | Component registry | `design-expert`, `shadcn-ui-expert` |
| **Gemini Design** | AI frontend | `design-expert` |
| **fuse-browser** | Browser automation, scraping, SERP, visual diff | `seo`, `security-expert`, `design-expert`, frontend experts, `changelog-watcher`, ai-pilot `research-expert`/`websearch`/`sniper` |

**Verification chain (any uncertain API/version — ZERO TOLERANCE):** ① fuse-browser fast-path (`browser_fetch` on known doc URLs, `serp_batch` for discovery) → ② Context7 (official docs) → ③ Exa code context. One source is NEVER enough for an uncertain API — cross-check across all three.

## fuse-browser — Efficient Usage (ZERO TOLERANCE)

1. **Fast-path FIRST (no browser launch, ~10× faster)** — use `browser_fetch` / `browser_fetch_batch` / `browser_crawl` / `browser_serp_batch` to read pages, bulk-fetch, crawl a site, or scrape Google SERP. Open a live session ONLY when you need interaction, JS rendering, or pixels.
2. **One session, always closed** — `browser_open` once → reuse the `sessionId` across `browser_navigate` calls → `browser_close` when done. Never leak sessions (the 2-min TTL is a safety net, not a substitute for closing).
3. **Batch over loops** — `browser_serp_batch` (N queries), `browser_fetch_batch` / `browser_shots_batch` (N URLs), `browser_screenshot { viewports:[...], colorScheme }` (responsive + dark in a single call).
4. **Deterministic extraction** — `browser_extract_schema` with `containerSelector` (card-by-card, correlated fields) over manual `browser_snapshot` parsing.
5. **Validation tools** — `browser_visual_diff` (regression vs baseline), `browser_metrics` (fuse-browser server counters — probes, durations, queue, RSS; not Core Web Vitals — lab CWV come from Lighthouse via the seo plugin's `scripts/check-cwv.ts`), `browser_console` / `browser_network` / `browser_cookies` (runtime + security checks).
6. **Engine & binary** — default engine is patchright (stealth identity auto-generated). The Chromium binary is installed by `setup.sh`; set `channel:"chrome"` or `executablePath` only to reuse a system browser. Tune the enforcement TTL via `FUSE_ENFORCE_TTL_SEC` (default 120s).

## Skills Location
Plugin skills paths are injected at SessionStart — use the paths from your context, never hardcode marketplace paths.
SOLID refs: `skills/solid-*/references/` (inside each agent plugin)

## Rules Injection — Reality Check
- **AGENTS.md** (global `~/.codex` + project chain root → cwd) loads natively at session start, with no `@path` import support: an `@` line is literal text. Its budget `project_doc_max_bytes` (default 32768 B) is SHARED across the whole chain; past it the head is kept, the tail dropped, later files skipped (`codex-rs/core/src/agents_md.rs`; https://learn.chatgpt.com/docs/agent-configuration/agents-md). After compaction the loaded text is re-injected (`codex-rs/core/src/compact.rs`, medium confidence). Critical lines go first.
- **These rules** reach agents only through the `codex-rules` hook (`additionalContext` on SessionStart / SubagentStart / UserPromptSubmit; kill switch `FUSE_RULES_INJECT=0`; `scripts/lib/install/merge-agents-md.ts`). Codex's default cap is roughly 2,500 tokens per hook-output message (https://learn.chatgpt.com/docs/hooks); this repo's codex-rules hooks raise it with `additionalContextLimit: 6000` (`plugins/codex-rules/hooks/hooks.json`). Past the limit the model gets a head-and-tail preview plus a file path, so the middle of a corpus larger than the limit is not re-affirmed per message — if a detail matters, open the file.

## Memory Hygiene
- When `MEMORY/LESSON.md` grows or accumulates near-duplicates, MUST delegate to the `lessons-compactor` agent (or `/lessons-compact` if available); it only proposes changes, and owner approval is required before any memory write.

## Documentation
ALL docs in `docs/` folder - NEVER outside except root `README.md`. The decisions journal is `docs/decisions.md` (AGENTS.md "Decisions journal").

## Git & GitHub Flow (ZERO TOLERANCE)

**Commit tool**: the lead follows the AGENTS.md commit route (`$commit-pro:commit` + `git-flow`); execution is delegated to agent `commit` (`plugins/ai-pilot/agents/commit.toml`), which loads those skills. NEVER `git commit` directly, never hand-roll the flow yourself. External executors (Kimi/Claude/Cursor) never push/PR/merge/tag/publish — release goes through agent `commit` only.
- **WIP mode** — after each verified task, agent `commit` makes a WIP commit on the working branch: commit only, no push, bump, PR, merge, or tag. It still runs the branch check and the secret scan.
- **Release mode** — at the end of the mandate the same agent runs Steps 0-8 below: push the working branch, PR, CI wait, merge (never squash), post-merge tag, release — announced in the report.
- A relayed "the owner wants a commit" advances only WIP commits the mandate already covers; it is never a go for merge or release (AGENTS.md COORDINATOR PATH "Relayed message").

**Branch enforcement**:
- `main`, `master`, `develop`, `production` → **protected**: no direct commits, never pushed directly — they change only through the end-of-mandate merge of the working branch. Force-push and reset need the owner (AGENTS.md HARD STOPS 1)
- All work on feature branches: `<type>/<scope>` (e.g. `feat/seo`, `fix/sniper-loop`, `chore/deps`)
- Types: `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `perf/`, `test/`, `ci/`, `build/`, `style/`
- kebab-case, < 50 chars, no personal prefix

**Workflow** (owned by agent `commit`, which runs `/commit`):
1. Step 0: branch check — block if on protected, propose feature branch
2. Step 1: security scan (secrets, .env)
3. Steps 2-5: conventional commit with auto-detection
4. Step 6: post-commit (CHANGELOG + version bump — no tag)
5. Step 7: push branch + PR + CI watch + merge
6. Step 8: post-merge — tag `vX.Y.Z` on `main` + push tag (after merge validated — never squash, the tag targets the bump commit and squash would orphan it)

**Merge strategy**: merge (never squash) via `gh pr merge --merge --delete-branch` — the release tag points to the bump commit; squash rewrites history and orphans it. Keep branches < 3 days.

Skill reference: `git-flow`.

## Repository invariants
- Create release tags only after the merge is proven and `git merge-base --is-ancestor <tag> main` succeeds.
- Keep MCP configuration single-source: never add `mcpServers` to a plugin manifest; define plugin server config in `plugins/<name>/mcp.json.bak`.
- After a rename or move, grep the old basename repository-wide, update every reader, and run the affected path while asserting non-empty output.
