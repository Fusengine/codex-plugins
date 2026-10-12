---
name: 03-execution
description: Implement Swift features following SOLID principles
prev_step: references/swift/02-features-plan.md
next_step: references/swift/03.5-elicit.md
---

# Swift Implementation Guide

## View Pattern

```swift
import SwiftUI

struct ProfileView: View {
    @State private var viewModel: ProfileViewModel

    init(service: ProfileServiceProtocol = ProfileService()) {
        _viewModel = State(initialValue: ProfileViewModel(service: service))
    }

    var body: some View {
        Group {
            if viewModel.isLoading { ProgressView() }
            else if let profile = viewModel.profile { ProfileContent(profile: profile) }
            else if viewModel.error != nil { ErrorView(retry: { Task { await viewModel.load(id: "me") }})}
        }
        .navigationTitle("profile.title")
        .task { await viewModel.load(id: "me") }
    }
}

#Preview { NavigationStack { ProfileView() } }
```

## ViewModel Pattern (within `FUSE_SOLID_MAX_LINES` (default 200) lines)

```swift
@MainActor @Observable
final class ProfileViewModel {
    var profile: UserProfile?
    var isLoading = false
    var error: Error?
    private let service: ProfileServiceProtocol

    init(service: ProfileServiceProtocol) { self.service = service }

    func load(id: String) async {
        isLoading = true
        defer { isLoading = false }
        do { profile = try await service.fetchProfile(id: id) }
        catch { self.error = error }
    }
}
```

## SOLID Applied

```swift
// Dependency Inversion: depend on protocol
init(service: ProfileServiceProtocol) { ... }

// Interface Segregation: small protocols
protocol Fetchable { func fetch() async throws }
protocol Updatable { func update() async throws }
```

## Actor for Shared State

```swift
actor ProfileCache {
    private var cache: [String: UserProfile] = [:]
    func get(_ id: String) -> UserProfile? { cache[id] }
    func set(_ profile: UserProfile) { cache[profile.id] = profile }
}
```

## Localization (Mandatory)

```swift
Text("profile.welcome.title")           // Localized key
Text("profile.greeting \(profile.name)") // Interpolation
Button("button.save") { ... }
```

## Extract Mixed Sections

When a view section mixes several concerns, extract it to a subview:
`ProfileHeader`, `ProfileDetails`, `ProfileActions`

## Update Task Phase

At the **start** of this phase, record it in `.codex/apex/task.json`:

```bash
jq --arg p "execution" '.tasks[.current_task].phase = $p' .codex/apex/task.json \
  > .codex/apex/task.json.tmp && mv .codex/apex/task.json.tmp .codex/apex/task.json
```

## Next Phase

→ Proceed to `03.5-elicit.md`
