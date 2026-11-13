# Real test: solid-swift LoadState wording change (Codex)

Date: 2026-11-13. Result: **PASS**.

Change under test (branch feat/solid-swift-load-state): `references/state-machines.md` (`LoadState<Value>` / `LoadFailure`), `templates/viewmodel.md` and `templates/view.md` use `state: LoadState<...>` instead of `isLoading`.

## Command

Temp project (empty): `/private/tmp/claude-501/-Users-brunoazoulay-Labo-docker-lab-dev-local-Dev-ai-claude-code-claude-plugins/2723977a-20cc-47b1-bf76-10a7db930be8/scratchpad/realtest/codex`

```
cd <temp dir> && codex exec --json --ephemeral --skip-git-repo-check -s workspace-write -o last.txt \
  "Read <worktree>/plugins/swift-apple-expert/skills/solid-swift/SKILL.md and the references it lists, then use that skill to write a SwiftUI FeatureViewModel and FeatureView that load a list of articles from an ArticleService. Write them to ArticlesViewModel.swift and ArticlesView.swift." \
  > events.jsonl 2> stderr.txt
```

`<worktree>` = `/Users/brunoazoulay/Labo/docker-lab/dev.local/Dev-ai/codex/codex-plugins-wt-swift`. codex-cli 0.167.1, exit 0. Sandbox workspace-write, cwd = the temp dir (no `--add-dir`). `--ephemeral` so no session files persisted. Log: `<temp dir>/events.jsonl` (68 JSONL events).

## Evidence the new skill text was read (from the worktree)

`command_execution` items in `events.jsonl`, exit 0:

```
/bin/zsh -lc 'cat /Users/.../codex-plugins-wt-swift/plugins/swift-apple-expert/skills/solid-swift/references/state-machines.md ...'
  out head: --- name: state-machines applies-to: "**/*.swift" description: Model state so illegal states are unrepresentable - sum t...
/bin/zsh -lc 'cat .../solid-swift/references/templates/view.md ...'
  out head: --- name: view-template ...
```

Both `references/state-machines.md` and `references/templates/viewmodel.md` appear under the worktree path (`.../codex-plugins-wt-swift/...`); the grep counts in the log are 9 (state-machines.md), 13 (templates/viewmodel.md), 9 (templates/view.md).

## Evidence the produced Swift uses LoadState

- `ArticlesViewModel.swift`: `private(set) var state: LoadState<[Article]> = .idle`, `@MainActor @Observable final class`, `state = .loading` / `.loaded(articles)` / `.failed(LoadFailure(error))`.
- `ArticlesView.swift`: exhaustive `switch viewModel.state { case .idle, .loading ... case .loaded ... case .failed ... }`, `#Preview` present.
- `grep -rn isLoading . --include='*.swift'` in the temp dir: no match (exit 1).
- Codex also generated its own `Core/Models/LoadState.swift` (`enum LoadState<Value: Sendable>` with `idle/loading/loaded/failed(LoadFailure)`), `Features/Articles/{Models/Article.swift, Protocols/ArticleService.swift, Services/PreviewArticleService.swift}` and `Tests/Articles/ArticlesTests.swift`.

## Typecheck

```
swiftc -swift-version 6 -typecheck -module-cache-path <scratchpad>/realtest/mc-codex \
  ArticlesView.swift ArticlesViewModel.swift Core/Models/LoadState.swift \
  Features/Articles/Models/Article.swift Features/Articles/Protocols/ArticleService.swift \
  Features/Articles/Services/PreviewArticleService.swift
```

Apple Swift 6.4.2. Exit code **0**. Nothing was stubbed by the tester: every type used (`LoadState`, `LoadFailure`, `Article`, `ArticleService`, `PreviewArticleService`) was written by Codex. `Tests/Articles/ArticlesTests.swift` was not typechecked (no XCTest target set up).

## Notes

- Codex's own session hit the installed harness Bash gate on a `/tmp` swiftc invocation (token "CONFIRM ..."), then continued with other means; not related to the skill text.
- A `.harness/` state dir was created in the temp dir by the installed hooks; it is inside the temp dir only.
- Not verified: behaviour through the installed (deployed) plugin copy; the prompt named the worktree path explicitly, so this proves the worktree text is read and followed, not automatic skill discovery.
