# GAP HARNESS — bugs à corriger côté `@fusengine/harness` (repo séparé)

État : 2026-07-19. Contexte : portage claude-plugins → codex-plugins terminé (agents+skills). Le **runtime des hooks** = le binaire compilé `@fusengine/harness` (dépendance), PAS les scripts `.ts` du repo (`ai-pilot/hooks.json` route 8/8 vers `hook codex <scope>`, 0 vers les `.ts` locaux → scripts locaux **vestigiaux**). Donc les bugs de comportement Codex se corrigent **dans le repo source du harness** (github.com/fusengine/harness). `0.1.78` et `0.1.79` ont depuis été publiés (voir §A1, §A5) et le pin local est remonté à `^0.1.79`.

Preuves ci-dessous = grep sur `node_modules/@fusengine/harness/dist/` (0.1.77 installé). Distinguer : le harness est **multi-cible** (adapters claude/hermes/codex) → beaucoup de `.claude/`/`Claude Code` sont LÉGITIMES (target Claude, commentaires, `.d.mts` de types). Ne lister ici que ce qui fuit dans le **chemin Codex** ou le **contenu injecté à un agent Codex**.

---

## A. BUGS HARNESS (chemin Codex) — priorité

### A1. Template APEX injecté (scope `aipilot`, UserPromptSubmit) — le plus important
✅ **CORRIGÉ par 0.1.78.** Preuve vérifiée : PR #85, commit `b5f983f`, nouveau module `src/policy/apex-target.ts` du harness — le template APEX est désormais target-aware (`apexPlanTool("codex") → "update_plan"`, `apexDocName("codex") → "AGENTS.md"`, segment `.codex/apex/`), et la ligne « triggers auto-commit » est retirée pour la cible Codex. La cible Claude reste identique.

Descriptif du bug (historique, conservé pour référence) :
Fichier compilé : `dist/validate-DnLU4IHy.mjs:1225-1292`. Ce template était injecté à l'agent Codex ; il contenait des Claude-ismes en dur :
- `**TRACKING FILE**: [project]/.claude/apex/task.json` → doit être `.codex/apex/task.json`
- `**IMPORTANT**: Read .claude/apex/task.json` → `.codex/apex/task.json`
- `⚠️ APEX MODE - Read .claude/apex/...` → `.codex/apex/`
- `2. **PLAN**: Use TaskCreate to break down tasks` → `Use \`update_plan\`` (voir A2)
- `3. TaskList → see pending tasks` / `4. TaskUpdate(in_progress)` / `7. TaskUpdate(completed) → triggers auto-commit` → idiome `update_plan` + **retirer « triggers auto-commit »** (mort sous Codex, aucun event émis)
- lecture `join(homedir(), ".claude", "CLAUDE.md")` (l.1239) + injection headers `# CLAUDE.md` (l.1247-1248) → pour la cible Codex, lire **`~/.codex/AGENTS.md`** et injecter un header `AGENTS.md`, pas `~/.claude/CLAUDE.md`.

→ Action harness : rendre ce template **target-aware** (codex ⇒ `.codex/`, `AGENTS.md`, `update_plan`). Vérifier que la fonction n'est pas partagée telle quelle entre claude et codex.

### A2. `update_plan` totalement absent du harness
`grep -r update_plan dist/` = **0**. Codex n'a PAS `TaskCreate/TaskUpdate/TaskList` (vérifié source openai/codex `tools/handlers/mod.rs`). L'outil de plan natif = **`update_plan`** :
- schéma : `{ explanation?: string, plan: [{ step: string, status: "pending"|"in_progress"|"completed" }] }`, sémantique **REPLACE** (renvoyer tout le tableau), 1 seul `in_progress`, jamais pending→completed direct.
- rendu natif Codex via la notification `turn/plan/updated`.
- **`update_plan` émet un `PostToolUse`** (dispatch générique pour tout tool `Function`, source `tools/registry.rs`).
→ Action harness : (1) remplacer toutes les guidances TaskCreate/Update/List par `update_plan` ; (2) OPTIONNEL mais recommandé pour « tout câblé » : ajouter un handler qui matche le `PostToolUse` de `update_plan`, parse `plan[]`, et alimente `.codex/apex/task.json` — ainsi l'injection de contexte APEX (« 3 dernières tâches ») redevient fonctionnelle sous Codex.

**Statut** : le point (1) (guidances → `update_plan`) est couvert par 0.1.78 (voir A1). Le point (2) (handler `PostToolUse` alimentant `.codex/apex/task.json`) reste **OUVERT**.

### A3. Événements Claude-only référencés (à vérifier côté dispatch codex)
`dist/runtime/index.*` référence `TaskCompleted`, `PostToolUseFailure`, `SessionEnd`, `InstructionsLoaded`, `TeammateIdle`, `subagent_type`. Ce sont des events **Claude-only** (Codex ne les émet JAMAIS — confirmé README harness + binaire codex : enum = PreToolUse/PermissionRequest/PostToolUse/Pre|PostCompact/SessionStart/UserPromptSubmit/SubagentStart/SubagentStop/Stop).
→ Action harness : s'assurer que le **dispatch codex** ne les attend pas / ne gate pas dessus. `TeammateIdle`→`SubagentStop`, `TaskCompleted`/`SessionEnd`→pas d'équivalent (ne rien attendre). (C'est déjà « by design » selon le README ; juste confirmer qu'aucun gate codex ne bloque en leur absence.)

### A4. Gate Stop / fenêtre de fraîcheur (à TESTER, non prouvé)
Aucune entrée du CHANGELOG harness 0.1.68→0.1.77 ne mentionne de fix « fenêtre de fraîcheur » du gate `validate-apex-workflow`. Le faux positif historique « Missing step: sniper » (crédit agent via `hide_spawn_agent_metadata=false` + matcher `spawn_agent`/`{ns}spawn_agent`) est censé être résolu depuis 0.1.67 — **à reconfirmer par un run réel** après install.

### A5. Règles execpolicy Codex
**Statut : côté harness TERMINÉ (0.1.79).** Reste le câblage installeur (en cours, autre chantier — non détaillé ici).

- Commande livrée : `harness codex-rules [--out <path>]`. Sans `--out` → Starlark sur **stdout**, exit 0. Avec `--out` → écrit le fichier, confirmation sur **stderr**.
- La commande **dérive les constantes exportées** de `security.ts` (`CRITICAL_PATTERNS → forbidden`, `ASK_PATTERNS → prompt`) ; elle **ne parse aucun `.ts` au runtime** — le harness est compilé.
- Sortie mesurée par dry run réel : **647 lignes, 69 `prefix_rule`**.
- Emplacement cible : `$CODEX_HOME/rules/fusengine.rules` (global uniquement ; le projet-local a été abandonné). Codex scanne tous les `*.rules` du dossier `rules/` de chaque couche de config active.
- **Chargement au DÉMARRAGE de Codex uniquement**, pas de hot-reload → un dépôt via SessionStart ne prend effet qu'au lancement suivant. Il faut redémarrer Codex après l'install.
- Switch d'activation : écrire `approval_policy = "on-request"`. La forme `approval_policy = { granular = { ... } }` **existe bien** dans Codex (vérifié sur le binaire 0.144.6 : `struct GranularApprovalConfig with 5 elements`, champs `rules`/`skill_approval`/`request_permissions`) mais on ne l'utilise pas : elle exige 5 champs et le seul bug d'enforcement ouvert la frappe.
- `approval_policy = "never"` est **fail-closed** : le Rust fait `AskForApproval::Never => Some(PROMPT_CONFLICT_REASON)`, ce qui transforme toute règle `prompt` en **blocage**, pas en contournement. Ce n'est donc pas un trou de sécurité, mais ça rend les règles inutilisables.
- Un `.rules` **malformé ne casse PAS le démarrage** de Codex : l'erreur de parse est capturée dans un slot `warning` et loggée via `tracing::warn!`.
- Couverture : les règles matchent l'**argv/prefix**. Non couvert (documenté en tête du fichier généré) : le dangereux obfusqué derrière une variable/substitution/redirection (`curl -fsSL "$URL" | sh`), la fork bomb, `> /dev/sda`, `> /etc/...` → ceux-là relèvent de `sandbox_mode`. Les règles sont une **couche complémentaire**, pas un remplacement du guard du harness.
- Limites de `codex execpolicy check` : ne découpe PAS les pipes contrairement au runtime, et ignore totalement `approval_policy` → un « prompt » vert au `check` ne garantit pas un vrai prompt au runtime. Signature confirmée sur binaire : `codex execpolicy check --rules <PATH> [--pretty] [--] <tokens...>`, `--rules` **requis** et répétable, sortie JSON `{"matchedRules": [...]}`.
- Bug ouvert à surveiller : openai/codex#25312 (prompt parfois sauté sous `danger-full-access`), état **OPEN** confirmé via l'API GitHub, filé contre 0.135.0, non corrigé à ce jour. Feature qualifiée d'expérimentale.
- ⚠️ Non reproduit de mon côté : les 13/13 tests sécurité annoncés par la session harness — mes commandes de test ont été bloquées par le guard fusengine lui-même. Note-le honnêtement comme « annoncé par la session harness, non re-vérifié ici ».

---

## B. RÉSIDUS repo codex-plugins (corriger ici, indépendant du harness)

### B1. 2 erreurs tsc PRÉEXISTANTES — ✅ CORRIGÉES (2026-07-18)
- `edit-targets.ts:25/26` (TS2322/TS2532) + `hook-output.ts:9` (TS2532) → fixées via guards `?? ""` (cause : `noUncheckedIndexedAccess` dans `plugins/ai-pilot/scripts/tsconfig.json`). tsc EXIT 0.
- RESTE OUVERT : `plugins/core-guards/statusline/` `TS2307 Cannot find module 'terminal-kit'` (`configure.ts:7`, `src/configure/render.ts:6`) — types manquants pour `terminal-kit`, cosmétique, tsconfig exclu de la racine.

### B2. Scripts `.ts` vestigiaux (dead-code Phase 3) — ✅ RÉSOLU (2026-09-19)
`build-hooks.ts` bundlait encore ~103 scripts `@hook-entry` / ~114 `*.native.ts`, mais `hooks.json` routait déjà tout vers le harness → ces `.ts` n'étaient PAS exécutés au runtime. Décision tranchée : purge (le harness porte seule la logique, `src/runtime/lifecycle/**` côté `fuse-harness`). Supprimés le 2026-09-19 : tous les `plugins/*/scripts/**/*.native.ts`, `scripts/build-hooks.ts`, `packages/codex-hooks/`, et leurs dépendances (`file:`/tgz) dans l'installeur. Seule surface hook exécutable restante : la commande `bun .../@fusengine/harness/.../bin.mjs hook codex <scope>` dans chaque `hooks/hooks.json`. Le même 2026-09-19, la strate `lib/` orpheline (helpers non-`.native.ts` sous `plugins/*/scripts/lib/**`, `_shared/scripts/**`, et les `*-triggers.ts` par framework — 91 fichiers, 5600 lignes au total) a été purgée pour la même raison : zéro consommateur, toute la logique déjà portée par le harness.

### B3. Trust des hooks à l'install
Codex skippe les hooks non-managés tant qu'ils ne sont pas trustés. L'install propose `bypass_hook_trust=true` ; sinon `/hooks` review manuel. À valider au test.

---

## C. À TESTER par run réel (après install)
1. Agents matérialisés dans `~/.codex/agents/` (36) + spawnables (`spawn_agent` / challenger).
2. Rules injectées à chaque prompt (UserPromptSubmit) ET dans les sous-agents (SubagentStart) — les 3 events câblés dans `codex-rules/hooks.json`.
3. Lessons : injection (SessionStart/SubagentStart/PostToolUse apply_patch) + rappel au Stop — vérifier si le rappel BLOQUE (decision:block) ou est un simple systemMessage.
4. Gate Stop APEX : pas de faux positif « Missing step: sniper » (cf. A4).
5. `apply_patch` PostToolUse fan-out (résolu harness 0.1.69) : les handlers post-edit (SOLID/tracking) se déclenchent bien.
6. Règles execpolicy déposées et effectives après redémarrage de Codex (cf. A5 — chargement au démarrage uniquement, pas de hot-reload).
7. `approval_policy` bien présent dans `~/.codex/config.toml` après install (cf. A5 — switch `"on-request"`).

---

## D. DÉJÀ FAIT (repo-side, ce cycle)
- Portage 36 agents `.toml` + 196 skills (schéma Codex fermé, frontmatter réduit, mécanismes traduits) — commité `3c96ec4` / release 1.0.36 `6de4316`.
- Bump pin harness `^0.1.67`→`^0.1.77` (package.json + `HARNESS_VERSION` + docs + test vert).
- `codex-rules/hooks.json` : ajout `SubagentStart` (parité 3 events avec la source Claude).
- `laravel-expert/.mcp.json` : +`fuse-browser`.
- Hygiène source ai-pilot : matchers morts `Task`/`TaskCreate|TaskUpdate` retirés de `hooks.json`, `sync-task-tracking.ts` + `task-helpers.ts` supprimés, 12 guidances `TaskCreate/Update/List`→`update_plan`, `triggers auto-commit` retiré.
- Cosmétique : statusline README → Codex, note prisma, shadcn rules `TaskCreate`→`update_plan`.
- **Fixes du 2026-07-18 (non committés, delta phase harness)** :
  - B1 tsc corrigées (voir §B1).
  - **Régression commit-pro attrapée au `bun test`** : le re-port fidèle avait écrasé le workflow codex-specific (modes FULL/LOCAL/DEGRADED, `--merge`/never-squash, tagging mode-aware) → RESTAURÉ (+ nouveau `commit/SKILL.md`), 3 tests `commit-workflow-parity` verts.
  - **Incohérence matrice modèle corrigée** : astro/nextjs/react étaient en `sol` (oubli de propagation du reversal sol→terra) → passés `terra`. Distribution périmée depuis le 2026-09-02 — voir `docs/workflow/agents.md` (Model Policy) pour la matrice courante ; fixture `agent-toml.test.ts` mise à jour. (`changelog-watcher`+`commit` restent sol = choix délibéré, à confirmer owner.) [historique : à cette date la matrice était 20 sol / 12 terra / 5 luna, xhigh conservé pour `design-expert` — deux fois superseded le même jour 2026-09-02 ("seul le designer en high" puis "passe en terra medium") ; état alors 17 sol / 15 terra / 5 luna, xhigh retiré — lui-même superseded le 2026-09-23 par la bascule GPT-6 (plus de tier terra ; 18 `gpt-6-sol`/medium + 1 `gpt-6-sol`/high + 18 `gpt-6-luna`/medium), elle-même superseded le 2026-09-27 (owner : « je dirais les luna medium => sol medium ») par 36 `gpt-6-sol`/medium + 1 `gpt-6-sol`/high ; superseded 2026-09-30 (owner: "okay passe les tous en v 6.1") par 36 `gpt-6.1-sol`/medium + 1 `gpt-6.1-sol`/high (`design-expert`), lui-même superseded 2026-10-29 (all `gpt-6.1-terra`) puis 2026-11-18 (`gpt-6.2-sol` default). Matrice courante : uniquement [`docs/workflow/agents.md` § Model Policy](workflow/agents.md#model-policy).]
  - `bun test` = **139 pass / 0 fail** ; `bun run validate` ✅.
  - ~~⚠️ CHANGELOG committé (1.0.36) dit « 12 sol/24 terra » → à corriger en 9/27~~ — **FAUX, rien à corriger** (2026-07-19) : `CHANGELOG.md` ne contient AUCUNE répartition chiffrée sol/terra (`grep -nE '[0-9]+ *(sol|terra)' CHANGELOG.md` → 0 hit). Le « 12/24 » provenait d'une note de session périmée, jamais du fichier. Répartition réelle prouvée : `grep -l 'gpt-5.6-sol' plugins/*/agents/*.toml | wc -l` = **7**, terra = **23**, luna = **7**, total = **37**.
