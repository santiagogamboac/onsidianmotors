# Light Mode ("Platinum & Gold") Theme

Date: 2026-08-12

## Context

Obsidian Motors currently ships a single dark theme ("obsidian" — near-black
backgrounds, warm gold accent) defined as CSS custom properties in a Tailwind v4
`@theme` block in [src/index.css](../../../src/index.css). Almost every component
consumes these tokens semantically (`bg-bg`, `text-accent`, `border-line`, ...) rather
than hardcoded colors, which makes a second theme tractable without touching most
component files.

The user finds the all-dark treatment too heavy for some contexts and wants an
alternative light theme ("Platinum & Gold" — cold platinum-white background, graphite
text, the same gold accent darkened for contrast), toggleable from the mobile hamburger
drawer, with an equivalent control in the desktop nav (which has no hamburger). The
theme should default to the device/browser's `prefers-color-scheme`, and remember a
manual choice across visits.

## Theming Mechanism

Keep the existing CSS-variable token system as the single source of truth. Add a light
variant of every token under a `[data-theme="light"]` selector in `src/index.css`,
mirroring the current `@theme` block. A `data-theme="light"` (or `"dark"`) attribute is
set on `<html>` at runtime; all existing Tailwind utility classes (`bg-bg`, `text-text`,
etc.) keep working unchanged because they resolve to the CSS variables, which flip
automatically when the attribute changes.

This was chosen over Tailwind's `dark:` variant strategy, which would require adding a
`dark:`-prefixed class next to every existing color utility across every component —
a much larger, more error-prone diff for a codebase that already centralizes color in
tokens.

## Palette — "Platinum & Gold" (light)

| Token | Dark (current) | Light (new) |
|---|---|---|
| `--color-bg` | `#0a0a0b` | `#f4f5f6` |
| `--color-surface` | `#131315` | `#ffffff` |
| `--color-surface-2` | `#1a1a1d` | `#eceef0` |
| `--color-line` | `rgba(255,255,255,.08)` | `rgba(0,0,0,.08)` |
| `--color-line-strong` | `rgba(255,255,255,.14)` | `rgba(0,0,0,.14)` |
| `--color-text` | `#edeceb` | `#1c1c1e` |
| `--color-muted` | `#9a9a9f` | `#6b6b70` |
| `--color-accent` | `#c6a15b` | `#7c5f29` |
| `--color-accent-soft` | `rgba(198,161,91,.14)` | `rgba(124,95,41,.10)` |

The accent is darkened (not a straight reuse of the dark-mode gold) because `#c6a15b`
on a near-white background fails WCAG AA text contrast. `#7c5f29` measures ~5:1 against
`#f4f5f6`, clearing the 4.5:1 AA threshold for normal text while still reading as gold/
bronze. `--color-muted` (`#6b6b70`) was chosen to clear ~4.5:1 as well, since it's used
for body copy (e.g. the Hero's supporting paragraph). Exact hex values may be nudged
±a few percent during implementation if manual visual QA finds an issue, but these are
validated starting points, not placeholders.

`::selection` in `index.css` currently hardcodes `color: #0a0a0b` (dark text on a gold
selection background) — this stays a fixed dark value in both themes, since it's
selecting *on top of* the accent color, not the page background.

## Default Detection, Persistence, Anti-Flash

Resolution order on load:
1. `localStorage.getItem("theme")` — if `"light"` or `"dark"`, use it (a past manual
   choice always wins).
2. Otherwise, `window.matchMedia("(prefers-color-scheme: dark)")` — reflects both OS and
   browser-level preference (there is no separate "browser setting" to check; browsers
   report the OS preference through this same API).
3. When the user flips the switch, persist the explicit choice to `localStorage` under
   key `theme`; from then on step 1 wins on every future load, and the site stops
   auto-following OS changes for that browser profile (until the user clears storage).

**Anti-flash:** resolving theme only inside React (`useEffect`) would paint the default
theme first and visibly snap to the correct one a moment later. To prevent this, a small
inline `<script>` is added directly in `index.html`, before `main.tsx` loads: it runs
synchronously, reads `localStorage`/`matchMedia`, and sets `data-theme` on
`<html>` before first paint. This script is the only place the initial theme is decided;
React reads the already-set attribute on mount rather than recomputing it.

## Hero: Fixed Dark Treatment

`Hero.tsx` renders a full-bleed night-time car photo with a dark gradient overlay, using
`text-text`/`text-muted` for its headline and body copy. If those tokens turned graphite
in light mode, the text would lose almost all contrast against the dark photo — and
unlike the Nav (below), the Hero's headline/body sit directly on the photo with no
blur or backdrop of their own to lean on.

**Decision:** the Hero's headline/body text keeps a fixed light color regardless of the
active site theme — it sits on a photograph, not the page background, so it's exempt
from theming. Its overlay gradient, which today hardcodes its final stop as `#0a0a0b`,
changes to `var(--color-bg)` so the seam between the Hero and the next section matches
whichever theme is active instead of leaving a dark band under a light page.

## Floating Nav: Theme-Aware, Not Exempt

Unlike the Hero, the Nav's un-scrolled floating state (which sits transparently over the
Hero with a `bg-linear-to-b from-black/60 to-transparent` scrim, `lg:14` header row) is
**not** exempt — it must read correctly in both themes, since it's a persistent piece of
site chrome the user may toggle while looking at it. Text and logo stay on the existing
`text-text`/`text-muted` tokens (graphite in light mode, off-white in dark mode) exactly
as before this design — no fixed-color special case needed here.

What changes is the scrim itself. `from-black/60` is a fixed dark tint, which works for
dark-mode text (light-on-dark) but would leave light-mode graphite text sitting on the
same dark tint with too little contrast. It's replaced with a new theme-aware token,
`--color-nav-scrim`, baked-in alpha like the existing `--color-line` tokens:

| Token | Dark | Light |
|---|---|---|
| `--color-nav-scrim` | `rgba(0,0,0,0.6)` | `rgba(244,245,246,0.78)` |

used as `bg-linear-to-b from-[var(--color-nav-scrim)] to-transparent`. In dark mode this
is pixel-identical to the current hardcoded value — no visual regression to the
already-shipped look. In light mode it lightens the header row instead of darkening it,
so graphite text stays legible over the photo. `backdrop-blur-sm` is added to the
floating state in both themes (currently absent; only the scrolled state has blur) as a
legibility safety net — it softens whatever part of the photo sits behind the header
regardless of local brightness, rather than relying on gradient alpha alone.

The scrolled/solid Nav state (`bg-bg/90 backdrop-blur-md border-b border-line`) was
already theme-aware via `--color-bg` and needs no change.

The exact light-mode scrim alpha (`0.78`) is a starting point for manual visual QA
during implementation — the Hero's own dark overlay still sits underneath at that
scroll position, so the combined result should be checked over the actual hero photo,
not just assumed correct from the numbers.

## Theme State & Switch UI

A `useTheme()` hook (`src/hooks/useTheme.ts`, alongside the existing `useInView`,
`useScrollBehavior`, `useScrollProgress` hooks) is the single place theme state lives:

- Reads the initial value from `document.documentElement.dataset.theme` (already set by
  the inline script) rather than recomputing detection logic in React.
- Exposes `{ theme: "light" | "dark", toggle: () => void }`.
- `toggle()` flips the theme, updates `data-theme` on `<html>`, and writes the choice to
  `localStorage`.
- Subscribes to `matchMedia("(prefers-color-scheme: dark)")` `change` events; if no
  manual choice is stored, live OS-level theme changes update the site in real time
  while the tab is open.

Only `Nav.tsx` needs this hook (both the desktop icon and the mobile drawer switch are
rendered from within it), so no React Context is introduced — that would be
unused abstraction for a single consumer.

**Desktop:** a single icon button is added to the existing `hidden items-center gap-3
lg:flex` action group, before the "Get in Touch" CTA. Shows a `Moon` icon (lucide-react)
when dark mode is active, `Sun` when light mode is active — the icon always represents
the *current* mode; clicking toggles. `aria-label` reflects the action ("Switch to light
mode" / "Switch to dark mode").

**Mobile drawer:** a new row is added at the top of the existing footer block (the
`border-t border-line` block that currently holds the phone link and "Get in Touch"
CTA), above the phone link. It shows a label reflecting the current mode ("Modo oscuro"
/ "Modo claro") on the left and a pill-shaped switch (`role="switch"`,
`aria-checked`) on the right, styled consistently with the site's existing rounded-full,
bordered-pill visual language (filters, buttons).

## Components Touched

- `src/index.css` — add `[data-theme="light"]` token overrides.
- `index.html` — add the inline anti-flash theme-detection script in `<head>`.
- `src/hooks/useTheme.ts` — new hook (state, persistence, matchMedia subscription).
- `src/components/Nav.tsx` — desktop icon toggle; mobile drawer switch row; floating-state
  scrim switches from hardcoded `from-black/60` to the new `--color-nav-scrim` token,
  plus `backdrop-blur-sm`. Text/logo colors are unchanged (already theme-token driven).
- `src/components/Hero.tsx` — headline/body text becomes fixed light color; overlay
  gradient's final stop changes from `#0a0a0b` to `var(--color-bg)`.

No other component files are expected to need changes, since they already consume the
semantic color tokens.

## Testing

- Manual verification in a browser: toggle via desktop icon and mobile drawer switch,
  confirm every section (Hero, Fleet, Pricing, HowItWorks, Experience, Reviews, Contact,
  Footer, VehicleDetail page) re-colors correctly in both themes with no illegible text.
- Confirm first-load default matches OS/browser `prefers-color-scheme` with DevTools'
  rendering emulation (both light and dark), with `localStorage` cleared.
- Confirm a manual choice persists across a full page reload and across navigating to
  `/fleet/:id` and back.
- Confirm no dark-to-light (or light-to-dark) flash on load once a theme is stored.
- Confirm the Hero's headline/body text stays legible over the photo in both themes, and
  the Hero-to-next-section seam has no mismatched dark band in light mode.
- Confirm the floating Nav (pre-scroll) is legible in both themes at several scroll
  positions over the Hero photo (its brightness varies left-to-right/top-to-bottom), and
  that dark mode's floating Nav is visually unchanged from before this feature.
- No automated test suite exists in this project; verified manually via the dev server.

## Alternatives Considered

- **Tailwind `dark:` class-variant strategy**: rejected — would require touching every
  color utility in every component instead of a handful of files, for no behavioral
  benefit over the token-swap approach given this codebase already centralizes color.
- **React Context for theme state**: rejected as unnecessary — only `Nav.tsx` renders
  theme controls; all other theming is automatic via CSS variables, so a single hook
  called once is sufficient (YAGNI).
- **Fixed dark treatment for the floating Nav too** (mirroring the Hero): rejected per
  user feedback — the Nav is persistent site chrome the user interacts with directly
  (including the theme switch itself), so it must read correctly in light mode even
  before scrolling, unlike the Hero's headline/body which is pure photographic content.
