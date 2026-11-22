---
name: verify-by-type
description: Step 9 proof rules for deliverables that need more than a diff -- migration, deploy, production data, visual item, owner-named reference
when-to-use: MUST read at lead-orchestration step 9 when a ledger item is a migration, a deploy, a production-data change, a visual/UI item, or carries an owner-named reference (site, file, mockup)
keywords: verify, proof by type, migration, deploy, production data, screenshot, reference, done
priority: high
related: worked-examples.md
---

# Verify by Type (step 9)

Moved from `SKILL.md` step 9 item 4; the general proof-by-type list (UI, tests, commit, migration/deploy, platform advice) stays owned by `$ai-pilot:verification` "Proof by type".

- **Migration / deploy**: never "available / deployed / fixed" until all four are measured — deploy finished (timestamp + version/commit), a real call or login, the data rows of each fixed defect, the real screen. Check for an existing session before asking the owner to sign in.
- **Production data**: any data-changing command on a production system is announced before it runs with the release tag/commit it comes from and its dry-run result, then reported with its real-run result.
- **Visual item**: the proof is a screenshot taken after the last edit (the `AGENTS.md` rule: screenshot before naming a cause or claiming a fix); the lead opens it and cites what is visible, with the image path.
- **UI deliverable (page, site, screen)** (owning rule: `05-frontend-rules`; `02-apex-workflow` Verify row): a UI is verified against its reference bar before done — the owner-named reference, else 2 named same-domain references — by section-by-section screenshot comparison at the same viewport, light + dark; one line per section: equal / better / worse (what). Any section worse than the bar = not done: it goes back to the `design-expert` executor as a targeted fix inside the same cycle. A section not compared is "not verified". The functional side of a web deliverable also runs the minimum Verify matrix of `$ai-pilot:apex-methodology` `references/never-do-code.md` (invalid input, non-existent target, offline/provider error, keyboard, each viewport × light/dark); an empty or zero-row capture is a failed run, not a pass.
  - **Never-do ledger (gate)**: a `design-expert` report without its never-do ledger — every rule of `design-method/references/never-do.md` (N1-N18 today) marked pass / fail / n.a. with its capture path — is not a report: resume the same agent (`followup_task`) and ask for the ledger; nothing is accepted before it.
  - **Independent design review (gate)**: before "done" on any UI, the lead launches ONE fresh `design-expert` in review mode, given only the captures and `never-do.md` — never the executor's report or claims — which scores every rule on the real captures. Any fail → the resumed executor fixes it, new captures are taken, the review re-runs on them; done only at 0 fail. Rules added, never enforced, changed nothing in the T10 run-4 output: this gate is what enforces them.
- **Owner-named reference** (site, file, mockup the owner pointed at): it is the bar, not a hint. Compare the deliverable with it section by section — one line per section: matches / differs (what) — before any "done"; a section not compared is "not verified". The comparison happens inside the same cycle: a gap goes back to the same executor as a targeted fix (`followup_task`), then the section is re-compared; it never opens a new full cycle (no new Analyze trio, sniper, or WIP commit for that gap).
