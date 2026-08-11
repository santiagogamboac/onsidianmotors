# Responsive Bottom Navigation & Camera-Mode Filter Swipe

Date: 2026-08-11

## Context

Obsidian Motors is a single-page site (`App.tsx` renders Nav, Hero, Fleet, HowItWorks,
Experience, Reviews, Contact, Footer in order, all linked by anchor hashes). On mobile
(`<1024px`), `Nav.tsx` currently shows a hamburger button that toggles a dropdown panel
listing the same links as the desktop nav, plus a "Get in Touch" CTA.

The design system: dark "obsidian" theme (`--color-bg`, `--color-surface`, etc.), gold
`--color-accent`, `Space Grotesk` display font, `Inter` body font, pill-shaped
(`rounded-full`) buttons and filters, `backdrop-blur` + `border-line` used for the
scrolled header state.

This spec replaces the mobile hamburger/dropdown with an Instagram-style bottom tab bar,
and reworks the Fleet section's Type/Brand filters into an iPhone-camera-style
horizontally swipeable pill strip. Both changes are mobile/tablet only (`<1024px`,
matching the existing `lg` breakpoint used throughout the codebase); desktop layout is
unchanged.

## Bottom Tab Bar

Replaces the hamburger + dropdown in `Nav.tsx`, active below the `lg` breakpoint only.

- Fixed to the bottom of the viewport, full width, `bg-bg/90 backdrop-blur` with a
  `border-t border-line` — reuses the same treatment as the header's scrolled state so
  it reads as one system.
- Five icon-only tabs, evenly spaced, one per main section, each with an `aria-label`
  for accessibility (no visible text, per Instagram reference):
  - Fleet → `Car`
  - How it works → `ListChecks`
  - Experience → `Sparkles`
  - Reviews → `Star`
  - Contact → `MessageCircle`
  (icons from `lucide-react`, already a project dependency)
- Active tab is derived from scroll position via `IntersectionObserver` watching each
  section (`#fleet`, `#how`, `#experience`, `#reviews`, `#contact`). The corresponding
  icon turns `text-accent` with a small dot indicator beneath it; inactive icons stay
  `text-muted`.
- Tapping a tab smooth-scrolls to its section (native anchor `href` behavior, consistent
  with existing links — `html { scroll-behavior: smooth }` already set in `index.css`).
- Bar is always visible (no hide-on-scroll behavior).
- Bottom-padded for `env(safe-area-inset-bottom)` so it clears the home indicator on
  notched iOS devices.
- Desktop (`≥1024px`) is untouched: full horizontal link row, phone link, and
  "Get in Touch" pill CTA remain exactly as they are today.

## Mobile Top Bar

- On mobile, the top bar collapses to just the `OBSIDIAN MOTORS` logo — no hamburger
  icon, no phone link, no CTA button (Contact is now reachable via the bottom tab bar,
  and phone/WhatsApp actions live inside the Contact section itself).
- Keeps the existing scroll-based transition: transparent-over-hero gradient when at the
  top, `bg-bg/90 backdrop-blur border-b border-line` once scrolled.
- Desktop top bar is unchanged.

## Content Spacing

- Because the bottom tab bar is fixed and overlays content, mobile layouts need bottom
  clearance equal to the bar's height plus the safe-area inset, applied once near the
  end of the page (e.g. on `Footer` or a wrapper in `App.tsx`), so the bar never
  visually overlaps the last section's content or links.

## Fleet Filters: Swipeable Strip

Applies to the `TYPE` and `BRAND` filter groups in `Fleet.tsx`'s `<aside>`, mobile only
(`<1024px`).

- Each group's container switches from a vertical `flex flex-col gap-2` stack to a
  horizontal scrollable strip: `flex gap-2 overflow-x-auto snap-x snap-mandatory`,
  scrollbar hidden.
- Each `FilterPill` gets `snap-center shrink-0` so swiping snaps one pill at a time to
  center, echoing the physical swipe/snap feel of the iOS camera mode picker.
- Pills keep their existing visual states unchanged — accent-filled/bordered when
  active, muted otherwise. No new visual language, no scroll-linked font scaling or
  dimming (that fuller "camera mode replica" was considered and explicitly deferred —
  see Alternatives Considered).
- A fade-out gradient mask on the left/right edges of each strip hints that more pills
  exist off-screen.
- Tapping a pill still sets the corresponding filter state exactly as it does today
  (no changes to `Fleet.tsx`'s filtering logic, only to the container/pill layout
  classes).
- At `≥1024px`, both groups revert to the current vertical sidebar stack — no swipe
  strip, no fade masks.
- The Sort control (`Featured` / `Price ↑` / `Price ↓`) is unchanged — stays a native
  `<select>` at all breakpoints, since 3 options don't benefit from swipe/scan tradeoffs
  the way a 6-item Brand list does.

## Alternatives Considered

- **Full camera-mode replica for filters** (scroll-linked JS growing/dimming the
  centered label in real time, like iOS Camera): more faithful to the reference, but
  introduces a new interaction pattern (per-row scroll listeners or
  `IntersectionObserver` thresholds) with no precedent in this codebase, for a feature
  that's a secondary filter control. Deferred in favor of the simpler CSS-only swipe
  strip, which is lower risk and easier to maintain.
- **Hide-on-scroll bottom bar**: considered for reclaiming vertical space while reading,
  but rejected in favor of an always-visible bar to match Instagram's reference
  behavior and keep primary navigation predictably available.
- **Keep phone/CTA in the mobile top bar**: rejected in favor of a logo-only top bar,
  since Contact is now one tap away via the bottom bar and duplicating the CTA in two
  places adds visual noise without added value.

## Components Touched

- `src/components/Nav.tsx` — remove hamburger/dropdown; add slim mobile top bar (logo
  only) and a new `BottomNav` (or inline bottom bar markup) with scroll-spy logic and
  icon tabs. Desktop markup unchanged.
- `src/components/Fleet.tsx` — `TYPE`/`BRAND` filter containers get responsive
  swipe-strip classes and edge fade masks; `FilterPill` gets `snap-center shrink-0` on
  mobile. No changes to filtering state/logic.
- `src/App.tsx` and/or `src/components/Footer.tsx` — add mobile-only bottom padding
  sized to the tab bar's height + safe-area inset.
- `src/index.css` — may need a small utility for hiding scrollbars on the swipe strips
  (e.g. a `.no-scrollbar` class), since Tailwind v4 doesn't ship one by default.

## Testing

- Manual verification at mobile widths (e.g. 375px, 414px) and tablet width (768–1023px)
  in a browser dev-tools device emulator: bottom bar renders, tabs scroll-spy correctly
  while scrolling through all five sections, tapping each tab jumps to the right
  section, Fleet filter strips swipe/snap and correctly set filter state, desktop
  (≥1024px) layout is pixel-identical to current behavior.
- No automated test suite currently exists in this project; this feature will be
  verified manually by running the dev server and exercising the flows above.
