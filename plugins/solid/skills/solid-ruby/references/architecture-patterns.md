---
name: architecture-patterns
applies-to: "**/*.rb"
description: Modular Rails - app/modules/[feature]/ MANDATORY structure
when-to-use: Project setup, file organization, layer responsibilities
keywords: architecture, modular, app/modules, layers
priority: critical
related: single-responsibility.md, dependency-inversion.md
---

# Architecture Patterns

## MANDATORY Structure

```
app/modules/[feature]/
├── controllers/      # HTTP I/O, delegate to services
├── services/        # Business logic
├── queries/         # Data retrieval
├── repositories/    # SQL abstraction
├── models/          # Associations, validations, scopes
├── contracts/       # Duck typing modules
└── concerns/        # Shared behavior

app/modules/core/
├── contracts/       # Shared interfaces
├── services/        # Shared logic (2+ features)
├── concerns/        # Shared mixins
└── models/
```

**NEVER use flat `app/` structure**

---

## Layer Responsibilities

| Layer | Responsibility |
|-------|---|
| Controller | HTTP, authorize, delegate |
| Service | Business logic |
| Query | Data retrieval |
| Repository | Persistence |
| Model | Associations, validations, scopes |
| Contract | Duck type interface |

---

## Layer Flow

```
Controller
    ↓ delegates to
Service
    ↓ uses
Repository/Query ← only layer touching DB
    ↓
Database
```

NO direct Controller→DB. NO business logic in Models.

---

## Feature Module Example

```
app/modules/users/
├── controllers/users_controller.rb
├── services/
│   ├── create_user_service.rb
│   └── reset_password_service.rb
├── queries/active_users_query.rb
├── repositories/user_repository.rb
├── models/user.rb
├── contracts/user_creator_contract.rb
└── concerns/user_timestamps_concern.rb
```

---

## DRY: Shared Code Location

- **Feature contracts** → `[feature]/contracts/`
- **Shared contracts** → `core/contracts/` (2+ features)
- **Shared services** → `core/services/` (2+ features)
- **Shared concerns** → `core/concerns/` (mixins)

---

## Import Rules

Within feature:
```ruby
require_relative '../services/create_user_service'
```

Cross-feature:
```ruby
require_relative '../../core/contracts/repository_contract'
```

---

## File Size Limits

- Every file within the hook ceiling `FUSE_SOLID_MAX_LINES` (default 200)
- Split mixed responsibilities (fat controllers, fat models, multi-purpose contracts)

Enforce: `find app/modules -name "*.rb" -exec wc -l {} \; | awk -v max="${FUSE_SOLID_MAX_LINES:-200}" '$1 > max'`
