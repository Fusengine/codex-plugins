---
name: project-skill
description: Project skill bootstrap (step 3) and its update before the release (step 11) -- path, layout, who writes it, read-only rule
when-to-use: MUST read when <project root>/.agents/skills/project-<name>/SKILL.md does not exist (step 3), and at the commit cycle before the release PR (step 11)
keywords: project skill, bootstrap, skill-creator, .agents/skills, roadmap, layout
priority: high
related: release.md
---

# Project Skill

Moved from `SKILL.md` steps 3 and 11; `SKILL.md` keeps the trigger and the pointer.

## Bootstrap (step 3 Analyze)

When `<project root>/.agents/skills/project-<name>/SKILL.md` does not exist (`<name>` = the project root folder name, kebab-case), the lead hands the `explore-codebase` report of this Analyze (an `apex-quick` or no-Analyze mandate -> the lead launches `explore-codebase` for it first) to the `skill-creator` agent, in the same mandate, to create the initial project skill once, full layout below.

- **Never a gate.** The bootstrap runs in parallel with the mandate's own tasks; a trivial `apex-quick` fix or any other task proceeds without waiting for it, and the mandate is never reported blocked on it.
- Codex discovers `.agents/skills/<name>/SKILL.md` in every folder from the working directory up to the repository root, with no registration and no trust step, so every later session and sub-agent loads it instead of re-exploring; an existing project is covered the first time the lead works in it under a write mandate.
- A read-only mandate (audit / analyse / explain / check, WRITE: none — owner's verb rule, step 1) creates nothing: report the missing project skill and create it at the next write mandate.
- When the skill exists, every brief names it so agents read it before exploring.

## Layout

`skill-creator` "Project skill mode" owns it:

```
<project root>/.agents/skills/project-<name>/
  SKILL.md                    frontmatter name + "Use when working in the <name> project" description; what it does (2 lines), stack (1 line), key commands, table need -> references/ file
  references/architecture.md  modules, data flow, where things live
  references/stack.md         versions, key libs, technical choices
  references/commands.md      install, dev, test, build, deploy
  references/conventions.md   naming, file structure, style
  references/pitfalls.md      known traps and how to avoid them (history stays in LESSON.md)
```

## Update before the release (step 11)

At the commit cycle, after the WIP commits are verified and before the release PR, the lead launches the `skill-creator` agent once with the mandate's diff (`git diff <base>...HEAD`): it updates in place only the affected `references/` file(s) of the single project skill `<project root>/.agents/skills/project-<name>/` (layout above; never a second project skill, never a duplicated section) and, in the same run, `docs/roadmap.md` (finished items to Done, new items to Next). The lead writes neither file (it executes nothing). Once per mandate, not per WIP commit; the lead opens both diffs (step 9 Verify) and runs `sniper` on them (rule 02 code-quality route; `skill-creator` never runs it) before dispatching the full-mode `commit` agent; both land in the same PR as the code and ship with the release. No skill yet -> full creation from the `explore-codebase` report (bootstrap above).
