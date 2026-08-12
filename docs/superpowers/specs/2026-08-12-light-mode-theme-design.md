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

## Hero / Floating Nav: Fixed Dark Treatment

`Hero.tsx` renders a full-bleed night-time car photo with a dark gradient overlay, using
`text-text`/`text-muted` for its headline and body copy. If those tokens turned graphite
in light mode, the text would lose almost all contrast against the dark photo. The same
applies to `Nav.tsx`'s un-scrolled floating state, which sits transparently over the
Hero with a `from-black/60` scrim and theme-token text.

**Decision:** the Hero section, and the Nav's floating (pre-scroll) state, keep a fixed
dark/light-text treatment regardless of the active site theme — they sit on a
photograph, not the page background, so they're exempt from theming. Once the user
scrolls and the Nav becomes solid (`bg-bg/90`), it switches to theme-aware colors like
the rest of the page. This is the standard pattern for sites with photographic heroes.

Concretely: `Hero.tsx`'s headline/body text colors and the Nav's floating-state text
color become fixed light values (not the `--color-text`/`--color-muted` tokens) instead
of theme-aware ones. The Hero's overlay gradient, which today hardcodes its final stop
as `#0a0a0b`, changes to `var(--color-bg)` so the seam between the Hero and the next
section matches whichever theme is active instead of leaving a dark band under a light
page.

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
- `src/components/Nav.tsx` — desktop icon toggle; mobile drawer switch row; Hero-adjacent
  floating-state text becomes fixed (not theme-token) color.
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
- Confirm Hero/floating-nav text stays legible over the photo in both themes, and the
  Hero-to-next-section seam has no mismatched dark band in light mode.
- No automated test suite exists in this project; verified manually via the dev server.

## Alternatives Considered

- **Tailwind `dark:` class-variant strategy**: rejected — would require touching every
  color utility in every component instead of a handful of files, for no behavioral
  benefit over the token-swap approach given this codebase already centralizes color.
- **React Context for theme state**: rejected as unnecessary — only `Nav.tsx` renders
  theme controls; all other theming is automatic via CSS variables, so a single hook
  called once is sufficient (YAGNI).
- **Theme-aware Hero/floating-nav**: considered making the Hero fully theme-aware too,
  but rejected — the Hero is a fixed photographic treatment, and theme-aware text over a
  dark photo would be illegible in light mode without redesigning the photo overlay
  itself, which is out of scope.
