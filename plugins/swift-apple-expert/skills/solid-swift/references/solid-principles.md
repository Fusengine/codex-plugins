---
name: solid-principles
applies-to: "**/*.swift"
description: Quick reference for all 5 SOLID principles applied to Swift 6 and SwiftUI
when-to-use: overview of SOLID, quick reference, principle selection
keywords: SOLID, overview, Swift 6, SwiftUI, principles, quick reference
priority: high
related: single-responsibility.md, open-closed.md, liskov-substitution.md, interface-segregation.md, dependency-inversion.md
---

# SOLID Principles - Swift Quick Reference

## Principles Overview

| Principle | Summary | Swift Pattern |
|-----------|---------|---------------|
| **SRP** | One responsibility per type | View, ViewModel, Service, Model |
| **OCP** | Open for extension, closed for modification | Protocol-based extensibility |
| **LSP** | Implementations honor protocol contracts | Contract consistency |
| **ISP** | Small, focused protocols | Role-based protocol splitting |
| **DIP** | Depend on protocols, not concrete types | Constructor injection |

---

## Architecture Rules (Features Modular MANDATORY)

```
Sources/
├── App/
│   └── MyApp.swift
├── Features/                    # Feature modules (MANDATORY)
│   ├── Auth/
│   │   ├── Views/
│   │   ├── ViewModels/
│   │   ├── Services/
│   │   └── Protocols/
│   └── Profile/
├── Core/                        # Shared (cross-feature)
│   ├── Services/
│   ├── Models/
│   ├── Protocols/
│   ├── Extensions/
│   └── Utilities/
└── Resources/
```

**NEVER use flat `Sources/` structure - always `Features/[Feature]/`**

---

## File Size

The only line limit is the hook ceiling (`FUSE_SOLID_MAX_LINES`). Split on responsibility, not on an invented count:

| Type | Split signal |
|------|--------------|
| View | Body ~30+ lines: extract subviews |
| ViewModel | Several roles: split by responsibility |
| Service | Several domains: split by domain |
| Model | Nested types pile up: separate them |
| Protocol | Several roles: split (ISP) |
| **Any file** | Near/over the hook ceiling: split; report if a fix cannot fit |

---

## Protocol Location (CRITICAL)

| Scope | Location |
|-------|----------|
| Feature protocols | `Features/[Feature]/Protocols/` |
| Shared protocols | `Core/Protocols/` |
| **FORBIDDEN** | Protocols in implementation files |

---

## Quick Checklist

- [ ] One responsibility per file; under the hook ceiling (`FUSE_SOLID_MAX_LINES`)
- [ ] Protocols in `Features/[Feature]/Protocols/` or `Core/Protocols/`
- [ ] ViewModels use `@Observable` + `@MainActor`
- [ ] Dependencies injected via protocols
- [ ] Models are `Sendable` structs
- [ ] Every View has `#Preview`
- [ ] `///` documentation on public APIs
- [ ] No `ObservableObject`, no completion handlers
- [ ] DRY: Grep before creating new code
