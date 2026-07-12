---
name: frontend-ui-ux
description: Use this skill whenever the user wants to improve, polish, redesign, or audit the UI/UX of a specific feature, page, component, or folder in this Laravel + React (MUI) frontend. Trigger on requests like "improve the UI/UX of the invoices module", "clean up the dashboard folder", "make the settings page feel more polished", "review this component for accessibility", or any mention of fixing spacing, inconsistent styling, responsiveness, color/theme inconsistency, or missing loading/empty/error states in a named part of the frontend. This skill always produces a written, file-by-file improvement plan and waits for explicit approval before touching any code, even if the request sounds urgent or the user seems to want it done right away — never skip straight to implementation.
---

# Frontend UI/UX Improver

## What this does

Given a feature, page, component, or folder the user points at, audit the existing React UI, write a concrete and prioritized improvement plan, and only edit code after the user gives explicit go-ahead. The plan-then-approve loop is the whole point of this skill: UI changes are highly visible, easy to disagree with in hindsight, and annoying to redo — so the user gets a chance to steer before anything actually changes.

Never collapse Step 3 and Step 5. Even if the user's original request already sounded detailed and confident ("clean up the invoices page, fix the spacing and add loading states"), that's a request for the plan to *cover* those things — not permission to skip the plan.

## Tech stack context

- React (functional components, Hooks), plain JSX — no TypeScript, so don't introduce type annotations or `.tsx` files unless the repo has already started doing that
- MUI (Material UI) is the primary UI kit — prefer its components, props, and theme tokens over hand-rolled markup or a competing library
- Styling is via MUI's `sx` prop and `styled()` API — not Tailwind, not separate SCSS/CSS files — look for existing theme tokens (`theme.palette`, `theme.spacing`, custom theme values) before inventing new colors or spacing values
- State: plain `useState`/props. There's no Redux/Zustand/Context store to route changes through — keep new state local to the component (or lifted to the nearest shared parent) the way the rest of the app already does
- Forms: plain controlled inputs (`useState` + `onChange`), no React Hook Form/Formik — validation and error display are handled manually per field, typically via MUI `TextField`'s `error`/`helperText` props
- Dates: `date-fns` (v3.x) paired with `@mui/x-date-pickers`'s `AdapterDateFns` — if a change touches a date picker, keep the adapter/import style consistent with what's already there (mixing v2- and v3-style date-fns imports is a common source of build breaks in this stack)
- Tables: check whether the feature in scope uses MUI's own `Table`/`TableContainer` components or `@mui/x-data-grid` — don't assume one without looking, they have different idiomatic patterns
- Lint/format: ESLint (create-react-app's `react-app` config) — changes should pass lint, not just look right. Existing files may already have a number of `no-unused-vars` warnings; not in scope to fix unless the plan calls for it, but fine to mention if trivial and adjacent to a change already being made
- Tests: not assumed present — check the repo for a testing setup (Jest + React Testing Library is Create React App's default) before assuming one exists or needs updating

Treat this as a starting orientation, not gospel — if the actual repo uses different tokens, a different design system, or different conventions than described here, follow what's actually in the repo.

## Workflow

### Step 1 — Locate the target

The user names a feature, page, folder, or component (in words, a path, or by pointing at an upload). Find every file in scope: the `.jsx` files plus any paired custom hooks or shared components specific to that feature.

- **Claude Code / direct repo access:** search the codebase for the matching folder or component name (this React frontend commonly lives under `src/`, e.g. `src/Components`, `src/Pages`, or feature-prefixed folders like `src/_Modals`, `src/_Payroll` — confirm the actual folder names rather than assume).
- **Claude.ai / Cowork without direct repo access:** work from what's uploaded or in project knowledge; if the folder isn't available, ask the user to paste or upload the relevant files rather than guessing at their contents.

If the name is ambiguous — more than one folder plausibly matches — ask which one instead of picking for them.

### Step 2 — Audit

Read every file in scope. Evaluate each one against these five lenses, in this default priority order (the user can reorder or drop lenses for a given request):

1. **Visual consistency & polish** — spacing/sizing scale, typographic hierarchy, alignment, whether MUI components are used idiomatically vs. reinvented by hand, consistent use of existing theme tokens/`sx` patterns rather than one-off values
2. **Color/theme consistency** — matches the app's existing palette and MUI theme tokens; flag hard-coded hex values that duplicate an existing `theme.palette` entry, and any component that's drifted from the rest of the app's look
3. **Accessibility** — labels on inputs, `aria-label` on icon-only buttons/`IconButton`s, sufficient color contrast, visible focus states, keyboard operability, semantic components over generic `div`/`span` soup
4. **Responsive/mobile layout** — behavior at common breakpoints, fixed widths that would break on small screens, touch target sizing
5. **Interaction states** — loading, empty, and error states exist and look intentional (not just a blank screen); form validation feedback is clear and consistent with how it's handled elsewhere in the app (manual `useState` + MUI `error`/`helperText`)

See `references/ui_ux_checklist.md` for concrete things to look for under each lens — use it during this step, especially for the less obvious accessibility and interaction-state issues.

Take notes with specifics (file name, what's there, what's wrong) — the plan in Step 3 needs to reference actual files, not vague impressions.

### Step 3 — Write the plan

Present the plan in the chat itself (not a file, unless the user asks for one), grouped by file. For each file:

```
### ComponentName.jsx
- Issue: <what's wrong, one line>
- Fix: <what you'll change, one line>
- Why: <which lens from Step 2 this addresses>
```

Order files by impact — the change that most improves the experience first, cosmetic nitpicks last. Close with a one-line summary of scope (how many files, roughly how invasive) and this question, or something close to it:

> Want me to go ahead with all of this, a subset, or should I adjust anything first?

### Step 4 — Wait for approval

Do not edit any code until the user gives an explicit go-ahead ("yes", "go ahead", "do it", "just the first three", etc.). This holds regardless of how the request was originally phrased.

If they approve only part of the plan, or ask for changes to it, update the plan and confirm the revised scope before touching anything.

### Step 5 — Implement

Once approved, for the approved scope only:

- Match the existing code style in each file exactly — naming, component structure, plain-JSX-with-Hooks patterns already used there (don't introduce TypeScript, class components, or a state/forms library that isn't already in use)
- Reuse existing MUI theme tokens and components rather than introducing new ones, unless the plan specifically called for adding something new
- Stay inside the approved scope even if you notice other issues along the way — note those at the end ("also noticed X while I was in there, want me to include that too?") rather than fixing them unasked
- If lint, typecheck, or test commands exist in the repo's `package.json` (e.g. `react-scripts test`, `eslint`) and you have shell access, run them after editing and fix anything that breaks before calling the work done

### Step 6 — Summarize

Give a short, file-by-file summary of what actually changed, and call out anything from the approved plan that ended up skipped or deferred and why.

## Reference files

- `references/ui_ux_checklist.md` — expanded, concrete checklist for Step 2, organized by the same five lenses, with React/MUI-specific things to look for (not just abstract principles).
