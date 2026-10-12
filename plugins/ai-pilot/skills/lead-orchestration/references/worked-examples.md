---
name: worked-examples
description: Three bad-vs-good lead behaviours taken from audited Claude and Codex sessions (Oct 2026)
when-to-use: When unsure how a lead-orchestration step looks in practice
keywords: follow-up, hand-back, visual verification, executor, release
priority: medium
related: brief-template.md
---

# Worked Examples

Drawn from session audits (Claude lead sessions and Codex sessions, 3-12 Oct 2026). Each one maps to a step of the procedure in `SKILL.md`.

---

## 1. Executor left alone, then releases on its own (steps 4 + 5)

**Bad.** The lead launched an external executor for four small fixes, promised a duration it did not hold, and did not poll. The owner asked "where is it? 27 min ... 39 min ... 47 min". Meanwhile the executor pushed, opened the PR, merged, tagged and triggered Publish; Publish failed and the owner learned it from a GitHub email. Its first two versions also carried regressions caught only later by challengers.

**Good.**
- Brief says: write code only, no push/PR/merge/tag/publish; status line at a fixed cadence; tests first.
- Lead polls with `wait_agent` (timeout) plus output files and mtimes; posts "fix 2/4 done, tests green, fix 3 in progress" before being asked.
- Stall -> `followup_task` with the next step to the same executor, not a new spawn.
- Executor done -> challenger on the diff -> `$commit-pro:commit` runs the release and watches Publish to success.

---

## 2. A manual step handed back to the owner (step 6)

**Bad.** Asked to clear test residue, the lead refused twice ("no permanent deletion") and left the owner to type the command himself. Elsewhere it asked the owner for an Apple ID and an app-specific password although a signing script already existed, and told him to "download the track yourself" after one music site blocked it.

**Good.**
- Residue -> `mv <files> ~/.Trash/` (reversible, authorized), then `ls` to prove it is gone.
- Signing -> find and run the owner's existing script; ask nothing.
- Blocked site -> another scriptable CC0 / free-licence source, licence recorded.
- Only a CAPTCHA, a password prompt, or an approval the owner must type goes back: one line, the exact text to type.

---

## 3. "Done" without opening the output (step 7)

**Bad.** Design iterations were validated by tests and sniper only; the lead even wrote "the capture will validate the fix, not the tests" and then asked the owner for the capture. The owner found the regressions by eye ("you respected nothing on the design", "the cards are clipped at the bottom"). On the Codex side, isolated tests were green while the real page was empty with 504 errors, and code shipped against a table the real database did not have.

**Good.**
- Produce the screenshot / frames against the real target, open them, cite what is visible ("cards end 12 px above the fold, no clipping") with the image path.
- Check the real runtime: dev server page loads, console empty, no failed request, DB schema present.
- Tick each part of the request by name; an unproven part = "not verified".
- Then sniper (code) and challenger (the claim) -- and only then report "done".
