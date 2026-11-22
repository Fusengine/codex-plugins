## State Management (React / Next.js)

| State Type | Solution | Location |
|------------|----------|----------|
| Server (API) | TanStack Query | `modules/[feature]/src/hooks/` |
| Global UI | Zustand store | `modules/cores/stores/` |
| Feature shared | Zustand store | `modules/[feature]/src/stores/` |
| URL state | TanStack Router | Route validators |
| Form state | TanStack Form | `modules/[feature]/src/hooks/` |
| Local only | `useState` | Inside component |

## Zustand Rules
- Feature store: `modules/[feature]/src/stores/` | Global: `modules/cores/stores/`
- Store budget: 40 lines (owner rule, mirrors Claude 0.4 × `FUSE_SOLID_MAX_LINES` at its default 100), always use selectors, actions inside store

## FORBIDDEN
Prop drilling (3+ levels), `useContext` for global, `useEffect` for fetching, `useState` for shared, store in component file, subscribing to entire store
