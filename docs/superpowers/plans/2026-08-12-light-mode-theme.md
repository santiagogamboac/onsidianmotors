# Light Mode ("Platinum & Gold") Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a light "Platinum & Gold" theme alongside the existing dark "obsidian"
theme, toggleable from a switch in the mobile drawer and an icon in the desktop nav,
defaulting to the device/browser's `prefers-color-scheme` and remembering a manual
choice — matching
`docs/superpowers/specs/2026-08-12-light-mode-theme-design.md`.

**Architecture:** The existing CSS-custom-property token system in `src/index.css`
(`--color-bg`, `--color-text`, etc., defined in a Tailwind v4 `@theme` block) gets a
second set of values under a `:root[data-theme="light"]` selector. A `data-theme`
attribute on `<html>`, set by a synchronous inline script in `index.html` before React
mounts (to avoid a flash of the wrong theme) and thereafter owned by a `useTheme()`
React hook, is the single switch that flips every token — and with it, every component
that already consumes the tokens via Tailwind utility classes (`bg-bg`, `text-accent`,
`border-line`, ...). Only `Nav.tsx` (the toggle controls, plus a new theme-aware scrim
token for its floating pre-scroll state) and `Hero.tsx` (whose headline/body/eyebrow/
outline-CTA/brand-strip sit directly on a fixed dark photo and must stay fixed-light
regardless of theme) need code changes beyond the token table itself.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, lucide-react, Vite. Package
manager is `pnpm` (confirmed via `pnpm-lock.yaml`).

## Global Constraints

- Theming mechanism is CSS custom-property overrides under `:root[data-theme="light"]`
  — do **not** introduce Tailwind `dark:` variant classes anywhere.
- Light palette values (must match exactly, since contrast was pre-validated against
  these specific numbers):
  `--color-bg:#f4f5f6` `--color-surface:#ffffff` `--color-surface-2:#eceef0`
  `--color-line:rgba(0,0,0,0.08)` `--color-line-strong:rgba(0,0,0,0.14)`
  `--color-text:#1c1c1e` `--color-muted:#6b6b70` `--color-accent:#7c5f29`
  `--color-accent-soft:rgba(124,95,41,0.10)` `--color-nav-scrim:rgba(244,245,246,0.78)`.
- `--color-accent` (light) `#7c5f29` against `--color-bg` (light) `#f4f5f6` targets
  ~5:1 contrast (WCAG AA for normal text is 4.5:1) — if any manual visual QA step in
  this plan finds a case that reads as too light/low-contrast, darken `--color-accent`
  further rather than leaving it, but do not lighten it.
- `--color-nav-scrim` (dark) must be **exactly** `rgba(0, 0, 0, 0.6)` — identical to the
  current hardcoded `from-black/60` — so dark mode's floating nav has zero visual
  regression.
- `Hero.tsx`'s headline, body copy, eyebrow, the outlined "Get in Touch" CTA, and the
  brand strip all sit directly on the fixed dark hero photo with no solid/blurred
  backing of their own — all five stay fixed dark-photo-appropriate colors in **both**
  themes (not the `--color-text`/`--color-muted`/`--color-accent`/`--color-line*`
  tokens). Only the solid "View Fleet" button and the overlay gradient's final color
  stop are theme-aware.
- A manual theme choice is persisted to `localStorage` under key `"theme"` and wins over
  system preference on every subsequent load, per the approved spec.
- No new npm dependencies — `lucide-react` (already installed) supplies the `Sun`/`Moon`
  icons.
- This is a git repository — commit after each task's verification passes.
- No automated test suite exists in this project (confirmed: no test framework in
  `package.json`). Verification is manual: `pnpm build` (runs `tsc -b`) and `pnpm lint`
  (oxlint) must both pass with no errors, plus visual inspection in a browser.

---

### Task 1: Add the light theme and nav-scrim CSS tokens

Adds every color value the rest of the plan depends on. Nothing consumes
`data-theme="light"` yet, so this is verified by setting the attribute manually via
DevTools.

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes: nothing new.
- Produces: CSS custom properties `--color-bg`, `--color-surface`, `--color-surface-2`,
  `--color-line`, `--color-line-strong`, `--color-text`, `--color-muted`,
  `--color-accent`, `--color-accent-soft` overridden under `:root[data-theme="light"]`;
  a new `--color-nav-scrim` token (both themes) that later tasks reference as the
  Tailwind utility `from-nav-scrim` (Tailwind v4 auto-generates color utilities,
  including gradient stops, for every `--color-*` name inside `@theme`).

- [ ] **Step 1: Add `--color-nav-scrim` to the existing `@theme` block**

In `src/index.css`, change:

```css
@theme {
  --color-bg: #0a0a0b;
  --color-surface: #131315;
  --color-surface-2: #1a1a1d;
  --color-line: rgba(255, 255, 255, 0.08);
  --color-line-strong: rgba(255, 255, 255, 0.14);
  --color-text: #edeceb;
  --color-muted: #9a9a9f;
  --color-accent: #c6a15b;
  --color-accent-soft: rgba(198, 161, 91, 0.14);
  --font-display: "Space Grotesk", sans-serif;
  --font-body: "Inter", sans-serif;
}
```

to:

```css
@theme {
  --color-bg: #0a0a0b;
  --color-surface: #131315;
  --color-surface-2: #1a1a1d;
  --color-line: rgba(255, 255, 255, 0.08);
  --color-line-strong: rgba(255, 255, 255, 0.14);
  --color-text: #edeceb;
  --color-muted: #9a9a9f;
  --color-accent: #c6a15b;
  --color-accent-soft: rgba(198, 161, 91, 0.14);
  --color-nav-scrim: rgba(0, 0, 0, 0.6);
  --font-display: "Space Grotesk", sans-serif;
  --font-body: "Inter", sans-serif;
}
```

- [ ] **Step 2: Add the light theme override block**

Immediately after the `@theme { ... }` block's closing `}` (and before `html {
scroll-behavior: smooth; }`), insert:

```css

:root[data-theme="light"] {
  --color-bg: #f4f5f6;
  --color-surface: #ffffff;
  --color-surface-2: #eceef0;
  --color-line: rgba(0, 0, 0, 0.08);
  --color-line-strong: rgba(0, 0, 0, 0.14);
  --color-text: #1c1c1e;
  --color-muted: #6b6b70;
  --color-accent: #7c5f29;
  --color-accent-soft: rgba(124, 95, 41, 0.1);
  --color-nav-scrim: rgba(244, 245, 246, 0.78);
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm build` and `pnpm lint`
Expected: both complete with no errors (this step only changes CSS, so this mainly
guards against a stray syntax typo breaking the Vite build).

- [ ] **Step 4: Manual verification**

Run: `pnpm dev`, open the printed local URL in a browser, open DevTools.
- In the Elements panel, select the `<html>` tag and add the attribute
  `data-theme="light"` by hand.
- Confirm the whole page instantly re-colors: background turns platinum-white, body
  text turns graphite, the gold accent (nav "MOTORS", eyebrows, price figures, filter
  pills) turns a darker bronze-gold, borders turn subtly dark-on-light instead of
  light-on-dark.
- Remove the attribute (or set it to `data-theme="dark"`): page returns to exactly the
  current obsidian look.
- Confirm no console errors appear during either toggle.

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "Add light theme and nav-scrim CSS tokens"
```

---

### Task 2: Add the anti-flash theme-detection script

Ensures the correct theme is applied before first paint, based on a stored choice or
`prefers-color-scheme`, without waiting for React to mount.

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `localStorage` key `"theme"` (read-only here; nothing writes it yet).
- Produces: `data-theme="light"|"dark"` set on `<html>` before `main.tsx` runs. Task 3's
  `useTheme()` hook reads this attribute as its initial state.

- [ ] **Step 1: Add the inline script to `index.html`**

Change:

```html
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>obsidian-motors</title>
```

to:

```html
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script>
      (function () {
        var stored = localStorage.getItem("theme");
        var theme =
          stored === "light" || stored === "dark"
            ? stored
            : window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light";
        document.documentElement.setAttribute("data-theme", theme);
      })();
    </script>
    <title>obsidian-motors</title>
```

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: no errors. (`index.html` isn't part of the TypeScript build, so `pnpm build`
isn't a meaningful check for this step.)

- [ ] **Step 3: Manual verification**

Run: `pnpm dev` (if not already running) and open the app in a browser with DevTools
open.
- In DevTools, open the Rendering panel (`Cmd/Ctrl+Shift+P` → "Show Rendering") and set
  "Emulate CSS media feature `prefers-color-scheme`" to `light`. In the console, run
  `localStorage.clear()`, then reload. In the Elements panel, confirm `<html>` has
  `data-theme="light"` and the page renders light with no visible flash of the dark
  theme first.
- Switch the emulation to `dark`, clear `localStorage` again, reload: confirm
  `data-theme="dark"` and the obsidian look, no flash.
- With emulation still `dark`, run `localStorage.setItem("theme", "light")` in the
  console and reload: confirm `data-theme="light"` — the stored choice wins over the
  emulated system preference.
- Run `localStorage.clear()` again afterward so Task 3's testing starts from a clean
  slate.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Add anti-flash inline theme-detection script"
```

---

### Task 3: Add `useTheme()` and wire the toggle into `Nav.tsx`

Creates the hook that owns theme state going forward, and gives the user an actual,
clickable way to switch themes — the first fully end-to-end-testable piece of this
feature.

**Files:**
- Create: `src/hooks/useTheme.ts`
- Modify: `src/components/Nav.tsx`

**Interfaces:**
- Consumes: `document.documentElement`'s `data-theme` attribute (set by Task 2's inline
  script as the hook's initial value).
- Produces: `useTheme(): { theme: "light" | "dark"; toggle: () => void }`, a named
  export from `src/hooks/useTheme.ts`, used by `Nav.tsx` in this task and by no one else
  in this plan.

- [ ] **Step 1: Create `src/hooks/useTheme.ts`**

```ts
import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function readInitialTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  // Keep the DOM attribute in sync with state, however state changed
  // (manual toggle below, or the matchMedia listener).
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Live-follow the OS/browser preference for as long as the user hasn't
  // made an explicit choice.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(STORAGE_KEY)) return;
      setTheme(e.matches ? "dark" : "light");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  }

  return { theme, toggle };
}
```

- [ ] **Step 2: Import the hook and icons in `Nav.tsx`**

Change:

```tsx
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Phone, X } from "lucide-react";
import { fleet } from "../data/fleet";
```

to:

```tsx
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Moon, Phone, Sun, X } from "lucide-react";
import { fleet } from "../data/fleet";
import { useTheme } from "../hooks/useTheme";
```

If TypeScript reports that `Moon` or `Sun` aren't exported by the installed
`lucide-react` version, run
`node -e "console.log(Object.keys(require('lucide-react')).filter(k => /^(Sun|Moon)/.test(k)))"`
from the project root to find the closest available icon names and use those instead
(update both this import and Step 4/5 below).

- [ ] **Step 3: Call the hook inside `Nav`**

Change:

```tsx
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const startingPrice = Math.min(...fleet.map((v) => v.pricePerDay));
```

to:

```tsx
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const startingPrice = Math.min(...fleet.map((v) => v.pricePerDay));
  const { theme, toggle } = useTheme();
```

- [ ] **Step 4: Add the desktop icon toggle**

Change:

```tsx
          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <a
              href="tel:+000000000"
              className="flex items-center gap-2 text-sm text-muted hover:text-text"
            >
              <Phone size={15} strokeWidth={1.75} />
              +00 000 000 000
            </a>
            <SectionLink
              href="#contact"
              className="rounded-full border border-accent/60 px-5 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-bg"
            >
              Get in Touch
            </SectionLink>
          </div>
```

to:

```tsx
          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <a
              href="tel:+000000000"
              className="flex items-center gap-2 text-sm text-muted hover:text-text"
            >
              <Phone size={15} strokeWidth={1.75} />
              +00 000 000 000
            </a>
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-text"
            >
              {theme === "dark" ? (
                <Moon size={18} strokeWidth={1.75} />
              ) : (
                <Sun size={18} strokeWidth={1.75} />
              )}
            </button>
            <SectionLink
              href="#contact"
              className="rounded-full border border-accent/60 px-5 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-bg"
            >
              Get in Touch
            </SectionLink>
          </div>
```

- [ ] **Step 5: Add the mobile drawer switch row**

Change:

```tsx
        <div className="px-6 pb-8 pt-2 border-t border-line flex flex-col gap-3">
          <a
            href="tel:+000000000"
            className="flex items-center gap-2 text-sm text-muted hover:text-text"
            onClick={close}
          >
```

to:

```tsx
        <div className="px-6 pb-8 pt-2 border-t border-line flex flex-col gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={theme === "light"}
            onClick={toggle}
            className="flex items-center justify-between py-1"
          >
            <span className="text-sm text-muted">
              {theme === "dark" ? "Modo oscuro" : "Modo claro"}
            </span>
            <span
              className={`relative inline-flex h-6 w-11 items-center rounded-full border border-line-strong transition-colors ${
                theme === "light" ? "bg-accent" : "bg-surface-2"
              }`}
            >
              <span
                className="inline-block h-5 w-5 rounded-full bg-surface shadow transition-transform"
                style={{
                  transform: theme === "light" ? "translateX(22px)" : "translateX(2px)",
                }}
              />
            </span>
          </button>
          <a
            href="tel:+000000000"
            className="flex items-center gap-2 text-sm text-muted hover:text-text"
            onClick={close}
          >
```

- [ ] **Step 6: Typecheck and lint**

Run: `pnpm build` and `pnpm lint`
Expected: both complete with no errors.

- [ ] **Step 7: Manual verification**

Run: `pnpm dev`, open in a browser with `localStorage` cleared.
- At `≥1024px`: a sun/moon icon button appears in the header between the phone link and
  "Get in Touch". Clicking it flips the entire page between dark and light instantly,
  and the icon itself flips between `Moon` (dark active) and `Sun` (light active).
- At a mobile width (`<1024px`): open the hamburger drawer. A row reading "Modo oscuro"
  or "Modo claro" (matching the active theme) with a pill switch appears above the phone
  number. Tapping the row (anywhere — it's a single button) toggles the theme, the
  switch knob slides across, and the whole page (including the drawer itself) re-colors
  live while the drawer stays open.
- Reload the page after toggling: the last-chosen theme persists (no snap back to
  system default).
- Confirm both controls are reachable by keyboard (Tab to focus, Enter/Space to
  activate) and expose the expected accessible state (desktop button's `aria-label`
  changes with theme; drawer switch's `aria-checked` matches the active theme) via
  DevTools' Accessibility pane.

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useTheme.ts src/components/Nav.tsx
git commit -m "Add useTheme hook and wire theme toggle into Nav"
```

---

### Task 4: Make the floating nav theme-aware

Replaces the hardcoded dark scrim behind the un-scrolled header (which sits over the
Hero photo) with the theme-aware `--color-nav-scrim` token, so the header reads
correctly in light mode before the user scrolls — not just after.

**Files:**
- Modify: `src/components/Nav.tsx`

**Interfaces:**
- Consumes: `--color-nav-scrim` token / `from-nav-scrim` utility from Task 1.
- Produces: nothing new for later tasks.

- [ ] **Step 1: Swap the floating-state scrim class**

Change:

```tsx
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || open
            ? "bg-bg/90 backdrop-blur-md border-b border-line"
            : "bg-linear-to-b from-black/60 to-transparent"
        }`}
      >
```

to:

```tsx
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || open
            ? "bg-bg/90 backdrop-blur-md border-b border-line"
            : "bg-linear-to-b from-nav-scrim to-transparent backdrop-blur-sm"
        }`}
      >
```

If `from-nav-scrim` doesn't apply any background in the browser (check via DevTools'
Elements → Styles pane — the computed `background-image` should be a `linear-gradient`
starting from the token's color, not `none`), Tailwind v4 didn't pick up
`--color-nav-scrim` as a gradient-stop color in this project's config; fall back to the
explicit CSS-variable form: `from-[var(--color-nav-scrim)]`.

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm build` and `pnpm lint`
Expected: both complete with no errors.

- [ ] **Step 3: Manual verification**

Run: `pnpm dev`, open in a browser, scroll to the very top of the page so the Hero photo
is visible behind the header.
- In dark mode: the header area over the photo looks pixel-identical to how it looked
  before this task (same dark scrim strength) — this is the no-regression check called
  out in Global Constraints.
- Toggle to light mode (still scrolled to the top): the header area over the photo now
  reads as a lighter, semi-opaque strip rather than a dark one, and the "OBSIDIAN
  MOTORS" logo / nav text (graphite in light mode) stays legible against it, including
  over the brighter parts of the photo.
- Scroll down past 12px in both themes: header switches to the existing solid
  `bg-bg/90` state exactly as before, unaffected by this change.

- [ ] **Step 4: Commit**

```bash
git add src/components/Nav.tsx
git commit -m "Make floating nav scrim theme-aware"
```

---

### Task 5: Fix `Hero.tsx` to a dark-photo treatment in both themes

The Hero's headline, body copy, eyebrow label, outlined "Get in Touch" CTA, and brand
strip all render directly on the fixed dark hero photo with nothing solid behind them —
if left on the theme tokens, all five would lose legibility in light mode (graphite text
and darkened-bronze accent are illegible on a dark photo). This task pins all five to
their current dark-mode literal colors in both themes, and makes the overlay's bottom
edge theme-aware so it hands off cleanly to whatever section follows.

**Files:**
- Modify: `src/components/Hero.tsx`

**Interfaces:**
- Consumes: `--color-bg` token (for the overlay's final gradient stop only).
- Produces: nothing new for later tasks — this is the last task in the plan.

- [ ] **Step 1: Make the overlay's bottom edge theme-aware**

Change:

```tsx
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,11,0.55)_0%,rgba(10,10,11,0.3)_40%,rgba(10,10,11,0.85)_75%,#0a0a0b_100%)]" />
```

to:

```tsx
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,11,0.55)_0%,rgba(10,10,11,0.3)_40%,rgba(10,10,11,0.85)_75%,var(--color-bg)_100%)]" />
```

- [ ] **Step 2: Pin the eyebrow to a fixed gold**

Change:

```tsx
        <p
          className="eyebrow mb-6 transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transitionDelay: "100ms",
          }}
        >
```

to:

```tsx
        <p
          className="eyebrow mb-6 transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transitionDelay: "100ms",
            color: "#c6a15b",
          }}
        >
```

(An inline `style.color` is used here — not a `text-[#c6a15b]` class — because this
element already carries the shared `.eyebrow` class, whose own `color: var(--color-accent)`
rule would otherwise compete with a same-specificity utility class in a cascade order
that isn't guaranteed. The `.eyebrow` class itself is untouched, since every *other*
`.eyebrow` usage in the app — Fleet, Pricing, Reviews, etc. — sits on the page
background and should stay theme-aware.)

- [ ] **Step 3: Pin the headline and its nested span**

Change:

```tsx
        <h1
          className="font-display max-w-3xl text-5xl font-medium leading-[1.05] tracking-tight text-text sm:text-6xl lg:text-7xl transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transitionDelay: "220ms",
          }}
        >
          Drive what moves you.
          <br />
          <span className="text-muted">No strings attached.</span>
        </h1>
```

to:

```tsx
        <h1
          className="font-display max-w-3xl text-5xl font-medium leading-[1.05] tracking-tight text-[#edeceb] sm:text-6xl lg:text-7xl transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transitionDelay: "220ms",
          }}
        >
          Drive what moves you.
          <br />
          <span className="text-[#9a9a9f]">No strings attached.</span>
        </h1>
```

- [ ] **Step 4: Pin the body paragraph**

Change:

```tsx
        <p
          className="mt-6 max-w-xl text-base text-muted lg:text-lg transition-all duration-700 ease-out"
```

to:

```tsx
        <p
          className="mt-6 max-w-xl text-base text-[#9a9a9f] lg:text-lg transition-all duration-700 ease-out"
```

- [ ] **Step 5: Pin the outlined "Get in Touch" CTA**

Change:

```tsx
          <a
            href="#contact"
            className="rounded-full border border-line-strong px-7 py-3 text-sm font-medium text-text backdrop-blur-sm transition-colors hover:border-accent/60 hover:text-accent"
          >
            Get in Touch
          </a>
```

to:

```tsx
          <a
            href="#contact"
            className="rounded-full border border-[rgba(255,255,255,0.14)] px-7 py-3 text-sm font-medium text-[#edeceb] backdrop-blur-sm transition-colors hover:border-[#c6a15b]/60 hover:text-[#c6a15b]"
          >
            Get in Touch
          </a>
```

(The "View Fleet" solid gold button directly above this one is untouched — its own
`bg-accent`/`text-bg` pairing is self-contained and stays theme-aware on purpose.)

- [ ] **Step 6: Pin the brand strip**

Change:

```tsx
        <div
          className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-line pt-8 transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transitionDelay: "580ms",
          }}
        >
          {BRANDS.map((b, i) => (
            <span
              key={b}
              className="font-display text-sm tracking-wide text-muted/70 transition-all duration-500 ease-out"
```

to:

```tsx
        <div
          className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-[rgba(255,255,255,0.08)] pt-8 transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transitionDelay: "580ms",
          }}
        >
          {BRANDS.map((b, i) => (
            <span
              key={b}
              className="font-display text-sm tracking-wide text-[#9a9a9f]/70 transition-all duration-500 ease-out"
```

- [ ] **Step 7: Typecheck and lint**

Run: `pnpm build` and `pnpm lint`
Expected: both complete with no errors.

- [ ] **Step 8: Manual verification**

Run: `pnpm dev`, open in a browser, scroll to the very top (Hero visible).
- In dark mode: the Hero section looks pixel-identical to before this task — same
  headline/body/eyebrow/CTA/brand-strip colors.
- Toggle to light mode while still looking at the Hero: nothing in the Hero changes —
  headline, body text, eyebrow, the outlined CTA (border and text), and the brand names
  all stay exactly as they were in dark mode, fully legible against the photo.
- Scroll from the Hero into the next section (Fleet) in light mode: confirm there is no
  mismatched dark band at the bottom of the Hero — the overlay fades into the same
  platinum background the Fleet section uses, a clean seam.
- Scroll from the Hero into Fleet in dark mode: confirm this transition is unchanged
  from before (still fades into the near-black background).

- [ ] **Step 9: Commit**

```bash
git add src/components/Hero.tsx
git commit -m "Pin Hero's photo-overlay content to a fixed dark treatment"
```

---

## Plan-Level Verification

After all five tasks are complete, do one final end-to-end pass:

- [ ] Run `pnpm build` and `pnpm lint` once more from a clean state — both must pass.
- [ ] Clear `localStorage`, set the OS/browser to light mode, reload: site loads light
      by default, Hero stays dark-photo styled, floating nav reads correctly, no flash.
- [ ] Repeat with the OS/browser set to dark: site loads dark by default.
- [ ] Toggle the theme via the desktop icon, walk the entire page top to bottom (Hero →
      Fleet → Pricing → How it works → Experience → Reviews → Contact → Footer), and
      via the `/fleet/:id` vehicle detail page: every section re-colors correctly, no
      illegible text, no leftover hardcoded-dark elements outside the Hero's exempted
      content.
- [ ] Repeat the same walk toggling via the mobile drawer switch at a mobile width.
- [ ] Reload after toggling: the manual choice persists across the reload and across
      navigating to `/fleet/:id` and back.
- [ ] Confirm dark mode is visually indistinguishable from the pre-feature site at every
      point in this walk (the whole feature is additive from dark mode's perspective).
