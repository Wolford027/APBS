# UI/UX Checklist — React + MUI

Concrete things to look for during Step 2 of the audit, organized by the same five lenses used in SKILL.md. This is a reference to scan for relevant items, not a form to fill out top to bottom every time — pull what's relevant to the feature in front of you.

## 1. Visual consistency & polish

- Spacing between elements uses MUI's spacing scale (`theme.spacing()`, the `sx` prop's spacing shorthand, or `Stack`/`Grid`'s `spacing` prop) rather than arbitrary `px` values sprinkled inline
- Buttons, inputs, and cards use MUI components (`Button`, `TextField`, `Card`, etc.) rather than custom-styled `div`/`button` reinventions of the same thing
- Consistent `size` prop usage across a page (don't mix `small` and `medium` MUI components without reason)
- Headings follow one hierarchy (`Typography variant` used consistently — don't jump from an `h4`-styled title straight to `body2` text with no subtitle step)
- Icon usage is consistent in style and sizing with icons elsewhere in the app (stick to one icon set, typically `@mui/icons-material`)
- Tables, forms, and lists that appear in multiple places in the app look like the same design system, not like they were built at different times
- Unused imports and leftover styling code (dead `sx` objects, unused `styled()` components, imported-but-unreferenced MUI components) worth flagging even if out of scope to remove — this codebase's lint output tends to carry a fair number of `no-unused-vars` warnings already

## 2. Color/theme consistency

- No hard-coded hex/rgb values that duplicate a color already defined in the MUI theme (`theme.palette.*`) — use the theme value instead
- New colors introduced (if any) fit the existing palette rather than being picked ad hoc
- Status colors (success/warning/error/info) use MUI's semantic `color` props (`color="success"`, `color="error"`, etc.) instead of custom colors that happen to look similar
- If the app defines a custom theme via `ThemeProvider`, changes should pull from it rather than assuming MUI's default palette
- Sufficient contrast between text and its background, especially for muted/secondary text (`color="text.secondary"`) and for text placed over colored chips, badges, or buttons

## 3. Accessibility

- Every form input has an associated, visible label (MUI `TextField`'s `label` prop, or an explicit `InputLabel` for other inputs) — placeholder text alone is not a label
- Icon-only `IconButton`s and icon-only links have an `aria-label`
- Interactive elements are reachable and operable by keyboard alone (tab order makes sense, nothing interactive is only reachable via hover/click)
- Focus states are visible — don't strip MUI's default focus ring without providing an equally visible replacement
- Color is never the only way information is conveyed (e.g., a red-bordered `TextField` alone marking a form error — pair it with `helperText` and/or an icon)
- Semantic components/HTML are used where they fit (MUI `Button`/`Link` for actions and navigation, real `Typography` heading variants) instead of a generic `div` with an `onClick` bolted on
- Images/icons that convey meaning have alt text or an accessible label; purely decorative ones are hidden from assistive tech (`aria-hidden`)

## 4. Responsive / mobile layout

- Layouts use MUI's `Grid`/`Box`/`Stack` with responsive breakpoint props (e.g. `sx={{ display: { xs: 'block', md: 'flex' } }}`) or `useMediaQuery`/`theme.breakpoints` rather than fixed pixel widths that will overflow or clip on narrow screens
- Tables and dense data views have a sane narrow-screen behavior (horizontal scroll via `TableContainer`, column priority/hiding, or a card-based fallback) rather than just shrinking illegibly
- Touch targets (buttons, icon buttons, form controls) are large enough to tap reliably — not shrunk to `size="small"` everywhere purely to fit more on screen
- `Dialog`/`Drawer`/`Modal` components behave sensibly on small screens (consider the `fullScreen` prop on `Dialog` for mobile where appropriate; don't trap content behind a fixed header/footer)

## 5. Interaction states

- Loading state exists for anything that fetches data (`CircularProgress`, `Skeleton`, or a disabled-button-plus-spinner state) — not just a blank area until data arrives
- Empty state exists and is intentional (an icon + message, or a shared empty-state component if the app already has one), not just an empty table with no explanation
- Error state is handled and communicated to the user (`Alert severity="error"`, a snackbar, or an inline message) — not just a silent failure or a raw console error
- Form validation feedback appears inline, near the relevant field, using `TextField`'s `error`/`helperText` props consistently with how validation is handled elsewhere in the app (this app validates manually via `useState`, not a forms library — don't introduce one for a single form)
- Destructive actions (delete, etc.) have a confirmation step — check for an existing confirm-dialog pattern among the app's modal components before inventing a new one
- Success feedback exists for actions that need it (save confirmations, toasts) — check for an existing snackbar/toast helper in the app before introducing a new one
- Disabled/pending states on buttons during async actions (prevent double-submit) where relevant
