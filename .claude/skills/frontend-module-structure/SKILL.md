---
name: frontend-module-structure
description: Use this skill whenever the user wants to reorganize, restructure, or set up folder structure for a feature/module in this React (MUI) frontend, wants to move files into a module-based layout, or wants to scaffold a brand-new feature/module. Trigger on requests like "reorganize the Payroll folder", "set up a module for Login", "move these files into modules", "clean up the folder structure", "where should this component live", or any mention of organizing components/views/hooks/services by feature. This skill always produces a written before/after file-move plan — including every import path that needs updating — and waits for explicit approval before moving, renaming, or creating any files, even if the request sounds urgent or the scope seems obvious.
---

# Frontend Module/Folder Structure

## What this does

Enforces, and when asked migrates the codebase toward, a consistent per-module folder structure: each feature/domain area of the app gets its own folder under `src/modules/`, containing its own `components/`, `views/`, `hooks/`, `services/`, `styles/`, and `utils/` subfolders. Given a feature name, or an existing set of files scattered across generic folders (`Components`, `Pages`, `_Modals`, `_Accounts`, `_Employee`, `_Payroll`, `_SystemVariable`, etc.), this skill figures out where everything should live, writes a plan, and only moves/creates files once the user approves.

The plan-then-approve loop matters even more here than for pure UI/UX tweaks: moving a file means every import path that references it has to be rewritten too. A missed import isn't a cosmetic nitpick — it's a broken build. Never collapse the planning step and the implementation step, even if the request already sounds fully decided ("just move all the Payroll stuff into src/modules/Payroll").

## Target structure

```
src/modules/<ModuleName>/
├── components/   # reusable UI pieces specific to this module (modals, cards, table rows, etc.)
├── views/        # page-level / route-level components — what the router renders
├── hooks/        # custom hooks specific to this module (data fetching, form logic, etc.)
├── services/     # API calls for this module (axios/fetch calls, request/response shaping)
├── styles/       # ONLY for genuine style overrides — a dedicated styled() component
│                 # definition or a theme-override file. Do NOT move a component's own
│                 # `sx` prop usage here; `sx` stays inline in the component that uses it.
│                 # This folder is often empty or near-empty for a given module, and that's fine.
└── utils/        # helper functions and constants specific to this module
```

- `ModuleName` is PascalCase (e.g. `Login`, `Employee`, `Payroll`, `SystemVariable`), matching the app's existing component-naming convention.
- Anything genuinely shared across two or more modules (a generic modal wrapper, a notification component, a shared date-formatting helper) goes in `src/shared/` with the same subfolder shape (`components/`, `hooks/`, `services/`, `utils/`) rather than living inside any one module. Don't move something into `shared/` just because it seems generic — confirm it's actually imported by 2+ modules first.

Treat this as a starting convention, not gospel — if the repo has already deviated from it somewhere deliberately, ask rather than silently "fixing" it.

## Workflow

### Step 1 — Determine scope

Nail down exactly what's in scope before touching anything:

- **One existing module** (e.g. "reorganize Payroll") — find every file across the current folders that belongs to that feature. Look at actual usage — imports, route definitions, where it's rendered from — not just which folder it currently sits in or what its filename suggests. A file in `_Modals` is almost certainly a component, but that doesn't tell you which module it belongs to.
- **A brand-new module** (e.g. "set up a Login module") — see "Setting up a brand-new module" below; skip straight there if there's no existing code to migrate.
- **The whole app** — work through one module at a time, with its own plan and approval, rather than proposing one giant multi-module move. If the user explicitly asks for the whole thing in one go, it's still worth breaking the *plan* into per-module sections so approval can be granular.

If a file's ownership is ambiguous (used by more than one candidate module, or genuinely unclear), don't guess — flag it as a call the user needs to make in Step 3.

### Step 2 — Classify each file

For every file identified in Step 1, decide which subfolder it belongs in:

- **views/** — rendered directly by a route/the router, or is clearly a top-level "page" for the module
- **components/** — used within the module's views but not directly routed (this covers most of what's currently grouped in `_Modals` — a modal is a component of whichever module uses it)
- **hooks/** — an existing custom hook (a function named `useX`), or logic inside a component that's clearly hook-shaped (heavy data-fetching/state logic) — only extract a new hook if the plan calls for it; don't refactor uninvited while moving files
- **services/** — direct API-call functions (axios/fetch), whether already grouped somewhere or currently inline inside a component
- **utils/** — constants and pure helper functions specific to the module
- **styles/** — only pre-existing dedicated `styled()`/theme-override files; if none exist yet, this folder starts empty rather than being populated speculatively
- **src/shared/`** (parallel subfolders) — anything actually imported by 2+ modules; verify with a real search across the codebase before deciding something is shared

Note every ambiguous case from this pass and carry it into the plan rather than resolving it silently.

### Step 3 — Write the migration plan

Present a before/after listing in the chat (not a file, unless the user asks for one), grouped by module:

```
### Payroll module
- src/_Payroll/Payroll.jsx           → src/modules/Payroll/views/Payroll.jsx
- src/_Payroll/Loans.jsx             → src/modules/Payroll/views/Loans.jsx
- src/_Modals/AddEmpLoans.jsx        → src/modules/Payroll/components/AddEmpLoans.jsx
- src/_Modals/ViewListLoans.jsx      → src/modules/Payroll/components/ViewListLoans.jsx
```

Directly below the table for each module, call out:

- **Every import path that will need updating** as a result of the moves — actually search the codebase for imports of each file being moved; don't rely on assumptions about who imports what
- **Ambiguous files** from Step 2 and how you're proposing to resolve them
- **Anything proposed for `src/shared/`**, and what else imports it (the evidence, not just a hunch)

Close with a scope summary (how many files/modules, roughly how invasive) and this question, or something close to it:

> Want me to go ahead with all of this, a subset, or should I adjust anything first?

### Step 4 — Wait for approval

Do not move, rename, or create any files until the user gives an explicit go-ahead. This holds regardless of how confidently the original request was phrased.

If they approve only part of the plan, or push back on a classification, update the plan and confirm the revised scope before touching anything.

### Step 5 — Implement

For the approved scope only:

- Create the new folders/files and move the code over as-is — this is a move, not a rewrite, unless the user separately asked for actual code changes
- Update every import path across the codebase that referenced a moved file — search for the old import paths directly rather than relying on what was noted in Step 3, since new references can exist that weren't caught earlier
- Delete the old file once its content is moved and every reference is updated — don't leave duplicate copies behind
- Watch for relative import paths *inside* a moved file itself (e.g. `import './something.css'` or `import SideNav from '../Components/SideNav'`) — these often need adjusting because the file's new location changes how many directories up something is
- If lint, typecheck, build, or test commands exist in `package.json` and you have shell access, run them after the migration and fix anything broken before calling the work done — a missed or miscounted relative import is the most common failure here

### Step 6 — Summarize

Give a short summary of what moved where, confirm build/lint status if you ran it, and flag anything from the plan that ended up skipped, deferred, or needs a follow-up decision.

## Setting up a brand-new module

When there's no existing code to migrate (e.g. "set up a Login module" from scratch), skip straight to scaffolding:

```
src/modules/Login/
├── components/
├── views/
├── hooks/
├── services/
├── styles/
└── utils/
```

Only create the subfolders that will actually be used right away — an empty `styles/` or `services/` folder for a module that doesn't need one yet is fine to skip until it's actually needed, rather than scaffolding placeholders nobody asked for. Ask what the first view or component should be if the user hasn't said, rather than generating stub files speculatively.
