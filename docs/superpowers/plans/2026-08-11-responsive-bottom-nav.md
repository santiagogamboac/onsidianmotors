# Responsive Bottom Navigation & Camera-Mode Filter Swipe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mobile hamburger/dropdown nav with an Instagram-style fixed bottom
tab bar, and turn the Fleet section's Type/Brand filters into a horizontally swipeable,
snap-scrolling pill strip on mobile — matching the design in
`docs/superpowers/specs/2026-08-11-responsive-bottom-nav-design.md`.

**Architecture:** Pure React/Tailwind, no new dependencies. `Nav.tsx` loses its
hamburger/dropdown so the mobile header naturally reduces to logo-only (desktop nav
items are already `hidden lg:flex`). A new `BottomNav.tsx` renders a fixed bottom bar
with 5 icon tabs (lucide-react icons, already a dependency) whose active state is driven
by an `IntersectionObserver` watching the 5 section elements by id. `Fleet.tsx`'s
Type/Brand filter containers switch from `flex-col` to a `flex` row with
`overflow-x-auto snap-x` below the `lg` breakpoint, reusing existing `FilterPill`
styling. `Footer.tsx` gets mobile-only bottom padding so the fixed bar never covers
content.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, lucide-react, Vite. Package
manager is `pnpm` (confirmed via `pnpm-lock.yaml`).

## Global Constraints

- All new/changed markup is scoped to `<1024px` (the `lg` breakpoint) via Tailwind
  `lg:` variants — desktop layout and behavior must not change at all.
- No new npm dependencies — only `lucide-react` (already installed) is used for icons.
- Icon-only bottom tabs, no visible text labels (only `aria-label`), per the approved
  spec.
- Bottom tab bar is always visible (no hide-on-scroll), and must clear
  `env(safe-area-inset-bottom)`.
- Filter swipe strips use the simple CSS-only approach (no scroll-linked dynamic
  font-scaling) — explicitly deferred in the spec's "Alternatives Considered" section.
- **This directory is not a git repository.** Steps that would normally end in
  `git commit` instead end in a manual verification checkpoint. If the user initializes
  git before/during implementation, resume normal commit-per-task practice.
- No automated test suite exists in this project (confirmed: no test framework in
  `package.json`). Verification is manual: run `pnpm dev`, check `pnpm build` (runs
  `tsc -b`) and `pnpm lint` (oxlint) for errors, and visually inspect in a browser at
  mobile (375–414px), tablet (768–1023px), and desktop (≥1024px) widths.

---

### Task 1: Strip the hamburger/dropdown from `Nav.tsx`

Removing the hamburger button and mobile dropdown panel leaves the header showing only
the logo on mobile, since the desktop nav links and phone/CTA block are already
`hidden lg:flex`. This is a prerequisite for Task 2 (the bottom bar takes over mobile
navigation).

**Files:**
- Modify: `src/components/Nav.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new — `Nav` remains a default export with no props, rendered by
  `src/App.tsx` exactly as it is today.

- [ ] **Step 1: Replace the full contents of `src/components/Nav.tsx`**

```tsx
import { useEffect, useState } from "react";
import { Phone } from "lucide-react";

const LINKS = [
  { href: "#fleet", label: "Fleet" },
  { href: "#how", label: "How it works" },
  { href: "#experience", label: "Experience" },
  { href: "#reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-bg/90 backdrop-blur border-b border-line"
          : "bg-gradient-to-b from-black/60 to-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <a href="#" className="font-display text-lg tracking-[0.08em]">
          OBSIDIAN <span className="text-accent">MOTORS</span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-text"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="tel:+000000000"
            className="flex items-center gap-2 text-sm text-muted hover:text-text"
          >
            <Phone size={15} strokeWidth={1.75} />
            +00 000 000 000
          </a>
          <a
            href="#contact"
            className="rounded-full border border-accent/60 px-5 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-bg"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </header>
  );
}
```

This removes: the `open` state, the `Menu`/`X` icon imports, the hamburger `<button>`,
and the entire `{open && (...)}` mobile dropdown block. The `scrolled || open`
background condition becomes just `scrolled`.

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm build` and `pnpm lint`
Expected: both complete with no errors (no unused-import warnings for `Menu`/`X`/`open`).

- [ ] **Step 3: Manual verification**

Run: `pnpm dev`, open the printed local URL in a browser.
- Resize to a mobile width (e.g. 390px): header shows only the "OBSIDIAN MOTORS" logo,
  no hamburger icon, no dropdown appears on tap anywhere.
- Resize to ≥1024px: header is pixel-identical to before — full link row, phone number,
  and gold "Get in Touch" button all present and functional.
- Scroll down at both widths: header background still transitions from transparent
  gradient to `bg-bg/90 backdrop-blur` past 12px of scroll.

- [ ] **Step 4: Checkpoint**

No git repository is present, so there is nothing to commit. Confirm Step 3 passed
before moving to Task 2.

---

### Task 2: Add the `BottomNav` component with scroll-spy

Creates the fixed, icon-only bottom tab bar and wires it into `App.tsx`. This is the
core of the feature — everything else in this plan supports or accommodates it.

**Files:**
- Create: `src/components/BottomNav.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: section elements with `id="fleet"`, `id="how"`, `id="experience"`,
  `id="reviews"`, `id="contact"` — these already exist (set by `Fleet.tsx`,
  `HowItWorks.tsx`, `Experience.tsx`, `Reviews.tsx`, `Contact.tsx` respectively, none of
  which are modified by this task).
- Produces: `BottomNav` — a default-exported React component with no props, rendered
  once in `App.tsx`.

- [ ] **Step 1: Create `src/components/BottomNav.tsx`**

```tsx
import { useEffect, useState } from "react";
import { Car, ListChecks, Sparkles, Star, MessageCircle } from "lucide-react";

const TABS = [
  { href: "#fleet", label: "Fleet", icon: Car },
  { href: "#how", label: "How it works", icon: ListChecks },
  { href: "#experience", label: "Experience", icon: Sparkles },
  { href: "#reviews", label: "Reviews", icon: Star },
  { href: "#contact", label: "Contact", icon: MessageCircle },
];

export default function BottomNav() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = TABS.map((t) =>
      document.getElementById(t.href.slice(1))
    ).filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-stretch justify-around border-t border-line bg-bg/90 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.href;
        return (
          <a
            key={t.href}
            href={t.href}
            aria-label={t.label}
            aria-current={isActive ? "true" : undefined}
            className="flex flex-1 flex-col items-center justify-center gap-1"
          >
            <Icon
              size={22}
              strokeWidth={1.75}
              className={isActive ? "text-accent" : "text-muted"}
            />
            <span
              className={`h-1 w-1 rounded-full bg-accent transition-opacity ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Render `BottomNav` in `src/App.tsx`**

Replace the full contents of `src/App.tsx` with:

```tsx
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Fleet from "./components/Fleet";
import HowItWorks from "./components/HowItWorks";
import Experience from "./components/Experience";
import Reviews from "./components/Reviews";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import BottomNav from "./components/BottomNav";

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <Hero />
      <Fleet />
      <HowItWorks />
      <Experience />
      <Reviews />
      <Contact />
      <Footer />
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm build` and `pnpm lint`
Expected: both complete with no errors. If `Car`, `ListChecks`, `Sparkles`, `Star`, or
`MessageCircle` are not exported by the installed `lucide-react` version, `tsc -b` will
fail with a named-export error — if that happens, run
`node -e "console.log(Object.keys(require('lucide-react')).filter(k => /^(Car|List|Sparkle|Star|Message)/.test(k)))"`
from the project root to find the closest available icon names and substitute them
(update both the import and the `TABS` array).

- [ ] **Step 4: Manual verification**

Run: `pnpm dev`, open in a browser at a mobile width (e.g. 390px).
- A fixed bar appears at the very bottom with 5 icons, evenly spaced, no text.
- On initial load (scrolled to the very top, inside Hero), no icon is highlighted gold.
- Scroll slowly through the whole page: as each section (Fleet → How it works →
  Experience → Reviews → Contact) crosses the vertical middle of the viewport, its
  corresponding icon turns gold with a small dot beneath it, and the previously active
  one returns to muted gray.
- Tap each icon from the top of the page: the page smooth-scrolls to the right section.
- Resize to ≥1024px: the bottom bar disappears entirely (`lg:hidden`).
- Confirm the bar's icons are reachable and announced correctly by resizing a screen
  reader/accessibility inspector (or browser dev tools' Accessibility pane) — each tab
  should expose its `aria-label` (e.g. "Fleet") and the active one should expose
  `aria-current="true"`.

- [ ] **Step 5: Checkpoint**

No git repository is present. Confirm Step 4 passed before moving to Task 3.

---

### Task 3: Clear the fixed bottom bar from page content

The bottom bar is fixed and overlays whatever is scrolled beneath it — without this
task, the last few rows of the footer are hidden behind it on mobile.

**Files:**
- Modify: `src/components/Footer.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new — `Footer` remains a default export with no props.

- [ ] **Step 1: Add mobile-only bottom padding to the footer**

In `src/components/Footer.tsx`, change the `<footer>` opening tag (currently
`className="border-t border-line bg-bg py-16"`) to:

```tsx
    <footer className="border-t border-line bg-bg py-16 pb-[calc(4rem+env(safe-area-inset-bottom)+2rem)] lg:pb-16">
```

(`4rem` matches `BottomNav`'s `h-16`; the extra `2rem` reproduces the original `py-16`
bottom spacing so the last line of the footer isn't flush against the bar. `lg:pb-16`
restores the original desktop-only padding exactly.)

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Manual verification**

Run: `pnpm dev` (if not already running), open at a mobile width and scroll to the very
bottom of the page.
- The "© 2026 OBSIDIAN MOTORS" line and the "Legal Notice"/"Privacy Policy" links are
  fully visible above the bottom tab bar, with a small visible gap — not clipped or
  flush against it.
- Resize to ≥1024px and scroll to the bottom: footer spacing looks exactly as it did
  before this change (no bottom bar is present at this width, so the extra padding
  must not apply — verify via `lg:pb-16` overriding the mobile value).

- [ ] **Step 4: Checkpoint**

No git repository is present. Confirm Step 3 passed before moving to Task 4.

---

### Task 4: Turn Fleet's Type/Brand filters into a swipeable strip on mobile

Converts the two vertical filter pill stacks in `Fleet.tsx`'s sidebar into horizontally
swipeable, snap-scrolling strips below `lg`, with edge fade masks, while leaving the
`≥1024px` sidebar layout untouched.

**Files:**
- Modify: `src/components/Fleet.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: nothing new — `type`, `setType`, `brand`, `setBrand`, `TYPES`, `BRANDS`,
  `brandCounts` all already exist in `Fleet.tsx` and are unchanged by this task.
- Produces: a `.no-scrollbar` utility class in `src/index.css`, used only within
  `Fleet.tsx`.

- [ ] **Step 1: Add the `.no-scrollbar` utility to `src/index.css`**

Append to the end of `src/index.css` (after the existing `::selection` block):

```css
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
```

- [ ] **Step 2: Update `FilterPill` in `src/components/Fleet.tsx`**

Find the `FilterPill` function (near the bottom of the file) and change its `<button>`
className from:

```tsx
      className={`flex items-center justify-between rounded-full border px-4 py-2 text-left text-sm transition-colors ${
```

to:

```tsx
      className={`flex shrink-0 snap-center items-center justify-between gap-2 rounded-full border px-4 py-2 text-left text-sm transition-colors ${
```

(`shrink-0` stops pills from being squeezed in the horizontal mobile layout;
`snap-center` makes each pill the swipe-snap target; `gap-2` keeps the label and the
brand count badge visibly separated now that the button no longer stretches to fill a
full-width column on mobile. None of this affects the `≥1024px` layout, where the
container is still `flex-col` and buttons stretch to full width via default flex
cross-axis stretch.)

- [ ] **Step 3: Convert the TYPE filter group to a swipe strip**

In `src/components/Fleet.tsx`, replace this block:

```tsx
            <div className="mb-8">
              <p className="mb-3 text-xs tracking-widest text-muted">TYPE</p>
              <div className="flex flex-col gap-2">
                <FilterPill active={type === "All"} onClick={() => setType("All")}>
                  All
                </FilterPill>
                {TYPES.map((t) => (
                  <FilterPill key={t} active={type === t} onClick={() => setType(t)}>
                    {t}
                  </FilterPill>
                ))}
              </div>
            </div>
```

with:

```tsx
            <div className="mb-8">
              <p className="mb-3 text-xs tracking-widest text-muted">TYPE</p>
              <div className="relative">
                <div className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                  <FilterPill active={type === "All"} onClick={() => setType("All")}>
                    All
                  </FilterPill>
                  {TYPES.map((t) => (
                    <FilterPill key={t} active={type === t} onClick={() => setType(t)}>
                      {t}
                    </FilterPill>
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-bg to-transparent lg:hidden" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-bg to-transparent lg:hidden" />
              </div>
            </div>
```

- [ ] **Step 4: Convert the BRAND filter group to a swipe strip**

In the same file, replace this block:

```tsx
            <div>
              <p className="mb-3 text-xs tracking-widest text-muted">BRAND</p>
              <div className="flex flex-col gap-2">
                <FilterPill active={brand === "All"} onClick={() => setBrand("All")}>
                  All
                </FilterPill>
                {BRANDS.map((b) => (
                  <FilterPill key={b} active={brand === b} onClick={() => setBrand(b)}>
                    {b}
                    <span className="text-muted">{brandCounts[b] ?? 0}</span>
                  </FilterPill>
                ))}
              </div>
            </div>
```

with:

```tsx
            <div>
              <p className="mb-3 text-xs tracking-widest text-muted">BRAND</p>
              <div className="relative">
                <div className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                  <FilterPill active={brand === "All"} onClick={() => setBrand("All")}>
                    All
                  </FilterPill>
                  {BRANDS.map((b) => (
                    <FilterPill key={b} active={brand === b} onClick={() => setBrand(b)}>
                      {b}
                      <span className="text-muted">{brandCounts[b] ?? 0}</span>
                    </FilterPill>
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-bg to-transparent lg:hidden" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-bg to-transparent lg:hidden" />
              </div>
            </div>
```

- [ ] **Step 5: Typecheck and lint**

Run: `pnpm build` and `pnpm lint`
Expected: both complete with no errors.

- [ ] **Step 6: Manual verification**

Run: `pnpm dev`, open at a mobile width (e.g. 390px) and scroll to the Fleet section.
- The TYPE row (All / Sedan / SUV) and BRAND row (All / BMW / Mercedes-Benz / Audi /
  Porsche / Range Rover) each render as a single horizontal line of pills, not a
  vertical stack.
- Swiping left/right on either row scrolls it horizontally and snaps to whichever pill
  ends up nearest the drag; a soft fade is visible at both edges of each row hinting
  more pills exist off-screen.
- Tapping any pill (whether fully visible or partially scrolled into view) sets the
  active filter exactly as before — the results grid and the "N Vehicles" count update,
  and the tapped pill turns gold-filled.
- The BRAND pills' count badges (e.g. "BMW 3") remain legible and visually separated
  from the label, not crammed together.
- Resize to ≥1024px: both filter groups revert to the original vertical sidebar stack
  with full-width pills, pixel-identical to current behavior — no fade masks, no
  horizontal scrolling.

- [ ] **Step 7: Checkpoint**

No git repository is present. Confirm Step 6 passed. This is the final task in the plan.

---

## Plan-Level Verification

After all four tasks are complete, do one final end-to-end pass:

- [ ] Run `pnpm build` and `pnpm lint` once more from a clean state — both must pass.
- [ ] At a mobile width, walk the entire page top to bottom: logo-only header → hero →
      Fleet with swipeable filters → How it works → Experience → Reviews → Contact →
      footer clear of the bottom bar, with the bottom tab bar's active icon tracking
      the section in view the whole way, and every tab tap jumping to the right place.
- [ ] At ≥1024px, walk the entire page top to bottom and confirm it is indistinguishable
      from the pre-change site (full nav header, no bottom bar, vertical sidebar
      filters).
