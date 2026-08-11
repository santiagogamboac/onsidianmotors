# Hybrid Navigation, Pricing Section & Vehicle Detail Page

Date: 2026-08-11

## Context

Obsidian Motors is currently a single-page site. `App.tsx` renders `Nav`, `Hero`,
`BrandTicker`, `Fleet`, `HowItWorks`, `Experience`, `Reviews`, `Contact`, `Footer` in
order, all linked by anchor hashes (`#fleet`, `#how`, etc.).

Two earlier pieces of work exist in the codebase but are only half-wired:

- `Nav.tsx` has a full hamburger drawer (logo + hamburger button that opens a mobile
  panel with all links, phone, and a "Get in Touch" CTA) — already implemented and
  working.
- `BottomNav.tsx` exists (a 5-icon fixed bottom tab bar with `IntersectionObserver`
  scroll-spy, built per `docs/superpowers/specs/2026-08-11-responsive-bottom-nav-design.md`)
  but is **not rendered** in `App.tsx` — that spec intended it to *replace* the
  hamburger, but the hamburger was kept, so `BottomNav` was never mounted.

This spec:
1. Mounts `BottomNav` again, alongside the hamburger drawer, as a **hybrid** mobile
   navigation (both visible at once — they are not mutually exclusive).
2. Adds a **Pricing** section to the home page, and a pricing summary to the hamburger
   drawer.
3. Adds a **vehicle detail page** with an image gallery, reachable from each
   `VehicleCard`'s "View Details" button (currently a dead link to `#contact`).

Design system stays as-is: dark "obsidian" theme, gold `--color-accent`, `Space
Grotesk`/`Inter` fonts, pill buttons, `rounded-2xl` cards, `border-line`, the existing
`useInView` fade-up pattern, and the Pexels-CDN image convention in `fleet.ts` (the
`px(id, w, h)` helper).

## Routing

The project currently has no router (no `react-router-dom` in `package.json`). This
spec adds **`react-router-dom`** (the project's first new runtime dependency) with two
routes:

- `/` — Home (all existing sections + new Pricing section)
- `/fleet/:id` — Vehicle detail page

A shared `Layout` component wraps both routes: `<Nav /> <Outlet /> <Footer />
<BottomNav />`. This keeps the header, footer, and bottom bar identical on both pages
instead of duplicating them.

**Cross-page anchor links:** Section links (`#fleet`, `#pricing`, `#how`, `#experience`,
`#reviews`, `#contact`) keep working as plain `<a href="#...">` tags whenever the
current route is `/` — this is unchanged from today, so existing smooth-scroll behavior
on Home has zero regression risk. When the current route is `/fleet/:id`, the same nav
items instead render as `<Link to={`/#${section}`}>` so they navigate back to Home
first. A small `useHashScroll` hook, run inside `Layout`, watches for a location hash on
Home and smooth-scrolls to the matching element once it's mounted (`element.scrollIntoView({ behavior: "smooth" })`).
This isolates all new scrolling logic to the cross-page case; on-page anchor behavior on
Home is untouched.

`Nav.tsx` and `BottomNav.tsx` both need access to the current route (`useLocation` from
react-router) to decide which link form to render.

## Mobile Navigation: Hybrid Bottom Bar + Hamburger Drawer

Both are visible simultaneously on mobile (`<1024px`) — the bottom bar is fixed and
always present; the hamburger button in the top header independently opens/closes the
full drawer. They are not alternatives to each other.

**Bottom bar (`BottomNav.tsx`)** — trimmed to 4 essential tabs (down from 5):
- Fleet, Pricing *(new)*, Reviews, Contact
- "How it works" and "Experience" are dropped from the bottom bar (still reachable via
  the hamburger drawer and the desktop nav) — four tabs keeps the bar uncluttered.
- Same visual treatment as today: icon-only, `aria-label`, active tab derived from
  `IntersectionObserver` on Home, gold + dot indicator when active.
- On `/fleet/:id`, no section ids exist to observe, so no tab shows active — this is
  already handled gracefully by the existing `active === null` initial state, no code
  change needed for that case.

**Hamburger drawer (`Nav.tsx`)** — keeps its current full link list, plus:
- "Pricing" added to the link list (Fleet, Pricing, How it works, Experience, Reviews,
  Contact).
- A new pricing summary block inserted above the link list: the lowest per-day price in
  the fleet (e.g. "From €139/day") plus a one-line "Insurance & 24/7 support included"
  note, linking to the Pricing section.

**Desktop nav** — unchanged except the new "Pricing" link is added to the existing
horizontal link row.

## Pricing Section (Home)

New `Pricing.tsx` component, section id `pricing`, placed between `Fleet` and
`HowItWorks` in `App.tsx`'s Home page.

- Eyebrow + heading, matching the visual pattern used by `Fleet`/`Reviews` headers.
- Two tier cards, computed from `fleet.ts` data (not hardcoded): **Sedan** and **SUV**,
  each showing the min–max `pricePerDay` for that type and a bullet list of what's
  included (Insurance, 24/7 roadside assistance, Delivery & pickup, Mileage).
- A duration-discount row (illustrative, placeholder content consistent with the rest of
  the site's placeholder contact info): 3+ days −5%, 7+ days −10%, 30+ days −20%.
- CTA button to `#contact`.
- Fades in via the existing `useInView` pattern, consistent with other sections.

## Vehicle Detail Page

**Data model change in `fleet.ts`:**
- `image: string` → `images: string[]` (3–4 photos per vehicle: exterior, interior,
  detail shot — sourced from Pexels via the existing `px(id, w, h)` helper, same
  "verified reachable" convention as the current single-image set).
- New field `description: string` — a 1–2 sentence blurb per vehicle for the detail
  page.
- `VehicleCard.tsx` updates to use `v.images[0]` as its thumbnail (only that one-line
  change to its image logic).
- `VehicleCard`'s "View Details" button changes from `href="#contact"` to
  `<Link to={`/fleet/${v.id}`}>`.

**New `VehicleDetail.tsx`, route `/fleet/:id`:**
- Reads `id` via `useParams`, looks up the vehicle in `fleet`. If not found: a simple
  "Vehicle not found" message with a link back to `#fleet` on Home (no fake 404 page).
- "← Back to Fleet" breadcrumb link at the top.
- Two-column layout on desktop (gallery left, info right), stacked on mobile — same
  responsive pattern as `Fleet`'s `lg:grid-cols-[260px_1fr]` sidebar approach.
- **Gallery:** large main image (`aspect-[4/3]`, `rounded-2xl`, same skeleton-shimmer
  loading treatment as `VehicleCard`) with a row of clickable thumbnails below it to
  swap the main image. Simple local `useState` for the selected index — no new
  dependency.
- **Info column:** vehicle name, brand, price/day (large, accent-colored, matching
  `VehicleCard`'s price styling), full spec grid (engine, 0–100, doors, seats, type),
  the new description paragraph, and the same WhatsApp/Contact CTA pair used on
  `VehicleCard`.
- **Related vehicles:** a row of up to 3 other vehicles sharing the same `type`
  (fallback to same `brand` if fewer than 3 exist of that type), reusing the existing
  `VehicleCard` component — no new card component needed.

## Components Touched / Created

- `package.json` — add `react-router-dom`.
- `src/main.tsx` or `src/App.tsx` — wrap with `BrowserRouter`, define the two routes.
- Create `src/components/Layout.tsx` — `Nav` + `Outlet` + `Footer` + `BottomNav`.
- Create `src/pages/Home.tsx` — current `App.tsx` section list plus `Pricing`.
- Create `src/pages/VehicleDetail.tsx` — new page described above.
- Create `src/components/Pricing.tsx` — new pricing section.
- Create `src/hooks/useHashScroll.ts` — cross-page hash scroll-on-mount.
- Modify `src/components/Nav.tsx` — route-aware link rendering (`useLocation`), add
  "Pricing" link, add drawer pricing summary block.
- Modify `src/components/BottomNav.tsx` — trim to 4 tabs (Fleet, Pricing, Reviews,
  Contact), route-aware link rendering.
- Modify `src/components/VehicleCard.tsx` — `v.images[0]`, "View Details" → `Link`.
- Modify `src/data/fleet.ts` — `image` → `images: string[]`, add `description`.
- `src/App.tsx` — becomes the router shell: wraps `BrowserRouter` around a `Routes`
  block with `Layout` as the parent route (`element={<Layout />}`) and `Home` /
  `VehicleDetail` as its two child routes.

## Testing

No automated test suite exists in this project (confirmed via `package.json`).
Verification is manual:
- `pnpm build` (`tsc -b`) and `pnpm lint` (oxlint) both pass with no errors.
- At mobile widths (375–414px): bottom bar shows 4 tabs and the hamburger drawer still
  opens independently with the full link list + pricing summary; both are usable at the
  same time without visual overlap.
- Home page: Pricing section renders correct min–max ranges per type, matches fleet
  data.
- From Home, click "View Details" on a card → lands on `/fleet/:id` with the right
  vehicle, gallery thumbnails swap the main image, spec grid and description are
  correct, related vehicles are relevant and clickable.
- From the detail page, click "Pricing" (drawer or bottom bar) → navigates to `/` and
  smooth-scrolls to the Pricing section. Browser back/forward buttons work correctly
  between Home and detail pages.
- Desktop (≥1024px): nav row includes "Pricing", layout otherwise unchanged from today
  except the new Pricing section and working "View Details" links.
