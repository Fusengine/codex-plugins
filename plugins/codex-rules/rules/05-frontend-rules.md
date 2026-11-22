## Frontend Tasks

### UI Workflow (MANDATORY: route through `design-expert`)
**Executor (ZERO TOLERANCE):** any web deliverable with a UI — page, site, screen, component styling — is EXECUTED by `design-expert`: it is the named writer of the markup and styling (HTML/CSS, or the framework's component markup and styles). A framework or language expert (per `01-project-detection`) only wires logic, data and state, after or alongside, in files or blocks design-expert does not own; it never writes the styling. `design-expert` "consulted", reviewing, or advising someone else's markup never counts as this route. The design side of the method lives in `plugins/design-expert/**`. Verify bar: `02-apex-workflow` Full APEX Flow "Verify" row.
1. **`design-method` skill first** — 4-question brief, signature element, two-pass critique, anti-slop clusters, then routes to the target skill (web/webapp/ios/android)
2. **Direct generation is the primary path** — same method as Anthropic's `frontend-design` skill (commit to a point of view, verify with tools not vibes): direct HTML/CSS for targets without a web stack, composed from the kit of rule 3 on a web stack
3. **Web stack = shadcn/ui + Lucide (ZERO TOLERANCE)** — on a React-based web stack (Vite + React, Next.js, Astro with React islands, TanStack Start, Laravel + Inertia React) and any React web-app frontend, the UI is built with shadcn/ui components and Lucide icons (`lucide-react` or the framework's Lucide package), styled with the project's tokens — never a hand-made icon set or component kit. This includes marketing/landing sites on a web stack: identity comes from customizing shadcn (theme tokens/CSS variables, variants, composition, blocks) without distorting the components — no forked internals, no parallel home-made kit. An existing boilerplate or stack in the project is used as is, never re-scaffolded; a project already built on another kit or a non-React framework keeps it, with Lucide for icons where a Lucide package exists. An empty folder with no stack → before scaffolding, ask the owner once only what the request does not already state (TypeScript or JavaScript, which stack); no question when the request names them — never silently framework-less JS. Other targets (a plain static HTML page, mobile, CLI) are unchanged. Gemini Design MCP and Magic/21st.dev stay optional, NEVER a requirement; native direct generation is the fallback when they are unavailable (owner, `docs/decisions.md` 2026-11-22)
4. **Mobile (iOS/Android)** — tokens + HTML device-framed mockup + handoff spec ONLY, NEVER SwiftUI/Compose code (implementation stays with `swift-expert` / the Android developer)

### Optional Tools (never required)

| Tool | Usage |
|------|-------|
| `create_frontend` / `modify_frontend` / `snippet_frontend` (Gemini) | Fast first draft or surgical redesign |
| `shadcn-ui-expert` | Component registry, installation, patterns (`nextjs-shadcn` / `react-shadcn`) — the shadcn/Lucide kit itself is required on a web stack (rule 3); this helper agent stays optional |

**FORBIDDEN:** raw JSX/Tailwind/SwiftUI/Compose styling that skips the design-expert brief + tokens + verification pass
**ALLOWED without design-expert:** text changes, JS/Swift logic, data wiring, state management
