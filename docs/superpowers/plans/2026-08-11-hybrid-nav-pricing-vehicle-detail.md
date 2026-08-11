# Hybrid Navigation, Pricing Section & Vehicle Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-mount the existing `BottomNav` alongside the hamburger drawer as a hybrid
mobile nav, add a home-page Pricing section (with a summary in the drawer), and add a
routed vehicle detail page with an image gallery — matching
`docs/superpowers/specs/2026-08-11-hybrid-nav-pricing-vehicle-detail-design.md`.

**Architecture:** Introduces `react-router-dom` (the project's first router) with two
routes — `/` (Home) and `/fleet/:id` (vehicle detail) — under a shared `Layout` that
renders `Nav` + `Outlet` + `Footer` + `BottomNav`. `Nav.tsx` and `BottomNav.tsx` become
route-aware: plain anchor links on Home (unchanged, zero regression), `Link`s to
`/#section` elsewhere, with a `useHashScroll` hook handling the resulting scroll. Vehicle
data gains an `images: string[]` gallery and a `description`. Pure React/Tailwind
otherwise, reusing all existing design tokens and patterns (`useInView` fade-ups,
`rounded-2xl` cards, pill buttons, the `px()` Pexels helper).

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, lucide-react, Vite, pnpm (see
`pnpm-lock.yaml`). New dependency: `react-router-dom` (ships its own TypeScript types —
do not additionally install `@types/react-router-dom`, it is deprecated/conflicting).

## Global Constraints

- **This directory is not a git repository** (confirmed via `git status` → "fatal: not
  a git repository"). Steps that would normally end in `git commit` instead end in a
  manual verification checkpoint. If the user initializes git before/during
  implementation, resume normal commit-per-task practice.
- No automated test suite exists (confirmed: no test framework in `package.json`).
  Verification is manual: `pnpm build` (runs `tsc -b`), `pnpm lint` (oxlint), and
  browser checks at mobile (375–414px) and desktop (≥1024px) widths via `pnpm dev`.
- Reuse existing design tokens only — no new colors/fonts. Use `--color-accent`,
  `--color-surface`, `--color-line`, `font-display`/`font-body`, `rounded-2xl`/
  `rounded-full`, and the `useInView` fade-up pattern already used throughout the
  codebase.
- Bottom bar stays icon-only (no visible text labels, `aria-label` only), always
  visible on mobile (`<1024px`, the `lg` breakpoint), per the existing `BottomNav`
  convention.
- On Home (`pathname === "/"`), every nav link keeps rendering as a plain
  `<a href="#section">` — this must not change, since it's what currently makes
  smooth-scroll work with zero risk of regression. Only routes other than `/` switch
  those same links to `<Link to="/#section">`.
- Vite's dev/preview servers default to SPA fallback (`appType: 'spa'`), so deep-linking
  directly to `/fleet/:id` works out of the box — no `vite.config.ts` changes needed.

---

### Task 1: Add `react-router-dom`

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml` (both updated automatically by `pnpm add`)

**Interfaces:**
- Consumes: nothing.
- Produces: the `react-router-dom` package, available to all later tasks for
  `BrowserRouter`, `Routes`, `Route`, `Link`, `Outlet`, `useLocation`, `useParams`.

- [ ] **Step 1: Install the dependency**

Run: `pnpm add react-router-dom`

- [ ] **Step 2: Verify it landed in `package.json`**

Open `package.json` and confirm a `"react-router-dom": "^..."` line now exists under
`"dependencies"`.

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm build` and `pnpm lint`
Expected: both complete with no errors (nothing imports the new package yet, so this
just confirms the install didn't break anything).

- [ ] **Step 4: Checkpoint**

No git repository is present. Confirm Step 3 passed before moving to Task 2.

---

### Task 2: Router shell — `Layout`, `Home` page, `App.tsx`, and re-mount `BottomNav`

This is the task that fixes the original bug (`BottomNav` exists but was never
rendered) and lays the routing foundation everything else builds on. After this task,
the site is a single `/` route behind `BrowserRouter`, visually identical to today
except the bottom tab bar is now visible on mobile.

**Files:**
- Create: `src/hooks/useHashScroll.ts`
- Create: `src/components/Layout.tsx`
- Create: `src/pages/Home.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `Nav` (`src/components/Nav.tsx`, default export, no props — unchanged in
  this task), `Footer` (`src/components/Footer.tsx`, default export, no props —
  unchanged), `BottomNav` (`src/components/BottomNav.tsx`, default export, no props —
  unchanged), and the existing `Hero`/`BrandTicker`/`Fleet`/`HowItWorks`/`Experience`/
  `Reviews`/`Contact` components (all unchanged, all default exports, no props).
- Produces: `useHashScroll()` — a hook with no arguments and no return value, to be
  called once per route render; `Layout` — default export, no props, renders the
  `<Outlet />` where page content goes; `Home` — default export, no props.

- [ ] **Step 1: Create `src/hooks/useHashScroll.ts`**

```tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Smooth-scrolls to the element matching the current URL hash. Needed because
 * React Router doesn't auto-scroll to hash targets the way a full page
 * navigation does — used when a Link like "/#pricing" lands on Home.
 */
export function useHashScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, [pathname, hash]);
}
```

- [ ] **Step 2: Create `src/components/Layout.tsx`**

```tsx
import { Outlet } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import { useHashScroll } from "../hooks/useHashScroll";

export default function Layout() {
  useHashScroll();

  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <Outlet />
      <Footer />
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 3: Create `src/pages/Home.tsx`**

```tsx
import Hero from "../components/Hero";
import BrandTicker from "../components/BrandTicker";
import Fleet from "../components/Fleet";
import HowItWorks from "../components/HowItWorks";
import Experience from "../components/Experience";
import Reviews from "../components/Reviews";
import Contact from "../components/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <BrandTicker />
      <Fleet />
      <HowItWorks />
      <Experience />
      <Reviews />
      <Contact />
    </>
  );
}
```

(The `Pricing` section is added here in Task 4, between `Fleet` and `HowItWorks`.)

- [ ] **Step 4: Replace the full contents of `src/App.tsx`**

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

(The `/fleet/:id` route is added here in Task 7.)

- [ ] **Step 5: Typecheck and lint**

Run: `pnpm build` and `pnpm lint`
Expected: both complete with no errors.

- [ ] **Step 6: Manual verification**

Run: `pnpm dev`, open the printed local URL.
- Desktop (≥1024px): page looks pixel-identical to before — Nav header, Hero, Brand
  ticker, Fleet, How it works, Experience, Reviews, Contact, Footer, in that order.
- Mobile width (e.g. 390px): same content, **plus** a fixed bottom bar with 5 icons is
  now visible (this is the fix for the missing bottom menu) — Fleet, How it works,
  Experience, Reviews, Contact tabs (still 5 at this point; trimmed to 4 in Task 6).
  Scrolling through the page updates the active (gold) icon via scroll-spy, same
  behavior as before this task existed in isolation.
- The hamburger button in the header still opens/closes the mobile drawer independently
  of the bottom bar — both are visible/usable at the same time.
- Footer's bottom padding already reserves space for the bar (set in prior work), so
  the footer's last line is not covered by the bottom bar.
- No console errors.

- [ ] **Step 7: Checkpoint**

No git repository is present. Confirm Step 6 passed before moving to Task 3.

---

### Task 3: Vehicle image galleries, descriptions, and detail-page links

**Files:**
- Modify: `src/data/fleet.ts`
- Modify: `src/components/VehicleCard.tsx`

**Interfaces:**
- Consumes: `Link` from `react-router-dom` (added in Task 1).
- Produces: `Vehicle.images: string[]` (replaces `Vehicle.image: string` — the gallery
  for the detail page, first element used as the card thumbnail) and
  `Vehicle.description: string` (used by the detail page in Task 7). `VehicleCard`'s
  "View Details" button now points to `/fleet/${vehicle.id}`.

- [ ] **Step 1: Replace the full contents of `src/data/fleet.ts`**

```ts
export type VehicleType = "Sedan" | "SUV";
export type Brand =
  | "BMW"
  | "Mercedes-Benz"
  | "Audi"
  | "Porsche"
  | "Range Rover";

export interface Vehicle {
  id: string;
  name: string;
  brand: Brand;
  type: VehicleType;
  pricePerDay: number;
  engine: string;
  zeroToHundred: string;
  doors: number;
  seats: number;
  images: string[];
  description: string;
}

// All images served from Pexels CDN (verified reachable, free for display use)
// Format: auto=compress&cs=tinysrgb for optimal delivery, w=800&h=600 for 4:3
const px = (id: number, w = 800, h = 600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;

export const fleet: Vehicle[] = [
  {
    id: "bmw-5er",
    name: "BMW 5 Series",
    brand: "BMW",
    type: "Sedan",
    pricePerDay: 139,
    engine: "R4",
    zeroToHundred: "6.3 s",
    doors: 4,
    seats: 5,
    images: [
      px(3802510), // silver BMW sedan, exterior
      px(112460), // BMW front three-quarter, alternate angle
      px(620335), // alloy wheel detail
    ],
    description:
      "A confident executive sedan that balances effortless performance with everyday comfort — ideal for business trips or a weekend away in style.",
  },
  {
    id: "bmw-7er",
    name: "BMW 7 Series",
    brand: "BMW",
    type: "Sedan",
    pricePerDay: 349,
    engine: "R6",
    zeroToHundred: "5.2 s",
    doors: 4,
    seats: 5,
    images: [
      px(1007410), // dark executive sedan, exterior
      px(100653), // BMW front three-quarter, alternate angle
      px(190537), // cabin / dashboard detail
    ],
    description:
      "The flagship BMW saloon — spacious, quiet, and finished with the kind of detail that makes long drives feel short.",
  },
  {
    id: "mercedes-e-klasse",
    name: "Mercedes-Benz E-Class",
    brand: "Mercedes-Benz",
    type: "Sedan",
    pricePerDay: 159,
    engine: "R4",
    zeroToHundred: "7.3 s",
    doors: 4,
    seats: 5,
    images: [
      px(244206), // Mercedes sedan on road
      px(810357), // Mercedes front three-quarter, alternate angle
      px(620335), // alloy wheel detail
    ],
    description:
      "The benchmark business sedan: smooth, refined, and equipped with just enough tech to make every journey effortless.",
  },
  {
    id: "mercedes-s-klasse",
    name: "Mercedes-Benz S-Class",
    brand: "Mercedes-Benz",
    type: "Sedan",
    pricePerDay: 399,
    engine: "V6",
    zeroToHundred: "4.9 s",
    doors: 4,
    seats: 5,
    images: [
      px(1000633), // luxury black sedan, exterior
      px(244553), // Mercedes front, alternate angle
      px(3729464), // Mercedes front three-quarter, alternate angle
      px(190537), // cabin / dashboard detail
    ],
    description:
      "Mercedes' flagship limousine — first-class comfort, a whisper-quiet cabin, and the kind of presence that turns heads on arrival.",
  },
  {
    id: "audi-a6",
    name: "Audi A6",
    brand: "Audi",
    type: "Sedan",
    pricePerDay: 179,
    engine: "V6",
    zeroToHundred: "5.8 s",
    doors: 4,
    seats: 5,
    images: [
      px(210019), // Audi on road
      px(1149831), // Audi front three-quarter, alternate angle
      px(620335), // alloy wheel detail
    ],
    description:
      "A sharp, understated sedan with quattro confidence and an interior built for focus behind the wheel.",
  },
  {
    id: "audi-q8",
    name: "Audi Q8",
    brand: "Audi",
    type: "SUV",
    pricePerDay: 229,
    engine: "V6",
    zeroToHundred: "5.9 s",
    doors: 5,
    seats: 5,
    images: [
      px(116675), // premium SUV exterior
      px(190537), // cabin / dashboard detail
      px(620335), // alloy wheel detail
    ],
    description:
      "Audi's coupé-SUV flagship — bold styling outside, first-class comfort for five inside.",
  },
  {
    id: "porsche-cayenne",
    name: "Porsche Cayenne",
    brand: "Porsche",
    type: "SUV",
    pricePerDay: 249,
    engine: "V6",
    zeroToHundred: "6.0 s",
    doors: 5,
    seats: 5,
    images: [
      px(1545743), // sports SUV, exterior
      px(620335), // alloy wheel detail
      px(190537), // cabin / dashboard detail
    ],
    description:
      "A sports car in an SUV's body — Porsche handling with room for the whole trip's luggage.",
  },
  {
    id: "range-rover-vogue",
    name: "Range Rover Vogue",
    brand: "Range Rover",
    type: "SUV",
    pricePerDay: 289,
    engine: "V6",
    zeroToHundred: "6.5 s",
    doors: 5,
    seats: 5,
    images: [
      px(627678), // large luxury SUV, exterior
      px(190537), // cabin / dashboard detail
      px(620335), // alloy wheel detail
    ],
    description:
      "The definitive luxury SUV — commanding on the road, serene inside, and ready for any terrain.",
  },
];

export const brandCounts = fleet.reduce<Record<string, number>>((acc, v) => {
  acc[v.brand] = (acc[v.brand] ?? 0) + 1;
  return acc;
}, {});
```

- [ ] **Step 2: Update `src/components/VehicleCard.tsx` imports**

Replace:

```tsx
import { useState } from "react";
import type { Vehicle } from "../data/fleet";
import { useInView } from "../hooks/useInView";
import VehicleCardSkeleton from "./VehicleCardSkeleton";
```

with:

```tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import type { Vehicle } from "../data/fleet";
import { useInView } from "../hooks/useInView";
import VehicleCardSkeleton from "./VehicleCardSkeleton";
```

- [ ] **Step 3: Use the gallery's first image as the thumbnail**

Replace:

```tsx
        {!imgError && (
          <img
            src={v.image}
```

with:

```tsx
        {!imgError && (
          <img
            src={v.images[0]}
```

- [ ] **Step 4: Point "View Details" at the new detail route**

Replace:

```tsx
          <a
            href="#contact"
            className="flex-1 rounded-full border border-line-strong py-2 text-center text-xs font-medium transition-colors hover:border-accent hover:text-accent"
          >
            View Details
          </a>
```

with:

```tsx
          <Link
            to={`/fleet/${v.id}`}
            className="flex-1 rounded-full border border-line-strong py-2 text-center text-xs font-medium transition-colors hover:border-accent hover:text-accent"
          >
            View Details
          </Link>
```

- [ ] **Step 5: Typecheck and lint**

Run: `pnpm build` and `pnpm lint`
Expected: both complete with no errors. If `tsc` complains about `v.image` still being
referenced anywhere, search the file for any remaining `v.image` (singular) usages and
update them to `v.images[0]`.

- [ ] **Step 6: Manual verification**

Run: `pnpm dev`, scroll to the Fleet section.
- Every card thumbnail still loads correctly (now sourced from `images[0]`).
- Clicking "View Details" on any card navigates the URL to `/fleet/<id>` (e.g.
  `/fleet/bmw-5er`). The page will currently render blank content between the header
  and footer — expected at this point, since the `/fleet/:id` route doesn't exist until
  Task 7. Confirm no console error is thrown (React Router silently renders nothing for
  an unmatched nested route) and that the header/footer/bottom bar still render.

- [ ] **Step 7: Checkpoint**

No git repository is present. Confirm Step 6 passed before moving to Task 4.

---

### Task 4: Pricing section

**Files:**
- Create: `src/components/Pricing.tsx`
- Modify: `src/pages/Home.tsx`

**Interfaces:**
- Consumes: `fleet` and `VehicleType` from `src/data/fleet.ts` (existing exports,
  unchanged), `useInView` from `src/hooks/useInView.ts` (existing, unchanged).
- Produces: `Pricing` — default export, no props, section id `pricing`.

- [ ] **Step 1: Create `src/components/Pricing.tsx`**

```tsx
import { Check } from "lucide-react";
import { fleet, type VehicleType } from "../data/fleet";
import { useInView } from "../hooks/useInView";

const TYPES: VehicleType[] = ["Sedan", "SUV"];

const INCLUDED = [
  "Full insurance coverage",
  "24/7 roadside assistance",
  "Delivery & pickup",
  "Unlimited mileage",
];

const DISCOUNTS = [
  { days: "3+ days", off: "5% off" },
  { days: "7+ days", off: "10% off" },
  { days: "30+ days", off: "20% off" },
];

function rangeFor(type: VehicleType) {
  const prices = fleet.filter((v) => v.type === type).map((v) => v.pricePerDay);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export default function Pricing() {
  const { ref: headingRef, inView: headingVisible } = useInView({ threshold: 0.2 });
  const { ref: cardsRef, inView: cardsVisible } = useInView({ threshold: 0.15 });

  return (
    <section id="pricing" className="bg-bg py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div
          ref={headingRef}
          className="transition-all duration-700 ease-out"
          style={{
            opacity: headingVisible ? 1 : 0,
            transform: headingVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <p className="eyebrow mb-3">Pricing</p>
          <h2 className="font-display max-w-lg text-3xl font-medium sm:text-4xl">
            Simple, transparent rates.
          </h2>
          <p className="mt-4 max-w-md text-sm text-muted">
            One daily rate, everything included — no hidden fees, no fine print.
          </p>
        </div>

        <div ref={cardsRef} className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {TYPES.map((type, i) => {
            const { min, max } = rangeFor(type);
            return (
              <div
                key={type}
                className="rounded-2xl border border-line bg-surface p-8 transition-all duration-700 ease-out"
                style={{
                  opacity: cardsVisible ? 1 : 0,
                  transform: cardsVisible ? "translateY(0)" : "translateY(24px)",
                  transitionDelay: `${i * 120}ms`,
                }}
              >
                <p className="eyebrow mb-2">{type}</p>
                <p className="font-display text-3xl text-text">
                  €{min}
                  {max !== min && <span className="text-muted"> – €{max}</span>}
                  <span className="text-sm text-muted"> /day</span>
                </p>
                <ul className="mt-6 flex flex-col gap-2.5">
                  {INCLUDED.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted">
                      <Check size={15} className="text-accent shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className="mt-8 inline-block rounded-full border border-accent/60 px-5 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-bg"
                >
                  Get in Touch
                </a>
              </div>
            );
          })}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 border-t border-line pt-10 sm:grid-cols-3">
          {DISCOUNTS.map((d) => (
            <div
              key={d.days}
              className="flex items-center justify-between rounded-xl border border-line bg-surface px-5 py-4 sm:flex-col sm:items-start sm:gap-1"
            >
              <span className="text-sm text-muted">{d.days}</span>
              <span className="font-display text-lg text-accent">{d.off}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire `Pricing` into `src/pages/Home.tsx`**

Replace:

```tsx
import Hero from "../components/Hero";
import BrandTicker from "../components/BrandTicker";
import Fleet from "../components/Fleet";
import HowItWorks from "../components/HowItWorks";
import Experience from "../components/Experience";
import Reviews from "../components/Reviews";
import Contact from "../components/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <BrandTicker />
      <Fleet />
      <HowItWorks />
      <Experience />
      <Reviews />
      <Contact />
    </>
  );
}
```

with:

```tsx
import Hero from "../components/Hero";
import BrandTicker from "../components/BrandTicker";
import Fleet from "../components/Fleet";
import Pricing from "../components/Pricing";
import HowItWorks from "../components/HowItWorks";
import Experience from "../components/Experience";
import Reviews from "../components/Reviews";
import Contact from "../components/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <BrandTicker />
      <Fleet />
      <Pricing />
      <HowItWorks />
      <Experience />
      <Reviews />
      <Contact />
    </>
  );
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm build` and `pnpm lint`
Expected: both complete with no errors.

- [ ] **Step 4: Manual verification**

Run: `pnpm dev`, scroll past Fleet.
- A new "Pricing" section appears between Fleet and "How it works", fading in the same
  way other sections do.
- Two cards, "Sedan" and "SUV", show correct min–max ranges: Sedan €139 – €399, SUV
  €229 – €289 (cross-check against `fleet.ts`'s `pricePerDay` values by type).
- The 3+/7+/30+ day discount row renders below the cards.
- Each card's "Get in Touch" link scrolls to Contact.
- Resize to desktop: two cards sit side by side; on mobile they stack.

- [ ] **Step 5: Checkpoint**

No git repository is present. Confirm Step 4 passed before moving to Task 5.

---

### Task 5: `Nav.tsx` — route-aware links, Pricing link, drawer pricing summary

**Files:**
- Modify: `src/components/Nav.tsx`

**Interfaces:**
- Consumes: `Link`, `useLocation` from `react-router-dom`; `fleet` from
  `src/data/fleet.ts` (existing export, unchanged).
- Produces: nothing new — `Nav` remains a default export with no props, rendered by
  `Layout` exactly as before.

- [ ] **Step 1: Replace the full contents of `src/components/Nav.tsx`**

```tsx
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Phone, X } from "lucide-react";
import { fleet } from "../data/fleet";

const LINKS = [
  { href: "#fleet", label: "Fleet" },
  { href: "#pricing", label: "Pricing" },
  { href: "#how", label: "How it works" },
  { href: "#experience", label: "Experience" },
  { href: "#reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const startingPrice = Math.min(...fleet.map((v) => v.pricePerDay));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const close = () => setOpen(false);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || open
            ? "bg-bg/90 backdrop-blur-md border-b border-line"
            : "bg-linear-to-b from-black/60 to-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          {/* Logo */}
          <Link to="/" className="font-display text-lg tracking-[0.08em]">
            OBSIDIAN <span className="text-accent">MOTORS</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {LINKS.map((l) => (
              <SectionLink
                key={l.href}
                href={l.href}
                className="text-sm text-muted transition-colors hover:text-text"
              >
                {l.label}
              </SectionLink>
            ))}
          </nav>

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

          {/* Mobile hamburger */}
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-drawer"
            className="lg:hidden flex h-9 w-9 items-center justify-center text-text"
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className="transition-all duration-200"
              style={{ opacity: open ? 0 : 1, position: open ? "absolute" : "static" }}
            >
              <Menu size={22} />
            </span>
            <span
              className="transition-all duration-200"
              style={{ opacity: open ? 1 : 0, position: open ? "static" : "absolute" }}
            >
              <X size={22} />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      <div
        aria-hidden={!open}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={close}
      />

      {/* Mobile drawer panel */}
      <div
        id="mobile-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed inset-x-0 top-0 z-50 lg:hidden flex flex-col bg-bg border-b border-line transition-transform duration-300 ease-in-out"
        style={{
          transform: open ? "translateY(0)" : "translateY(-100%)",
          paddingTop: "calc(64px + env(safe-area-inset-top))",
        }}
      >
        {/* Pricing summary */}
        <div className="mx-6 mt-2 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3">
          <p className="font-display text-lg text-accent">
            From €{startingPrice}
            <span className="text-xs text-muted">/day</span>
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Insurance & 24/7 support included on every rental.
          </p>
        </div>

        <nav className="flex flex-col px-6 py-6 gap-1">
          {LINKS.map((l, i) => (
            <SectionLink
              key={l.href}
              href={l.href}
              onClick={close}
              className="flex items-center rounded-xl px-4 py-3.5 text-base text-muted transition-colors hover:bg-surface hover:text-text"
              style={{
                transitionDelay: open ? `${i * 40}ms` : "0ms",
                opacity: open ? 1 : 0,
                transform: open ? "translateX(0)" : "translateX(-12px)",
                transition: "opacity 0.3s ease, transform 0.3s ease, background-color 0.15s",
              }}
            >
              {l.label}
            </SectionLink>
          ))}
        </nav>

        <div className="px-6 pb-8 pt-2 border-t border-line flex flex-col gap-3">
          <a
            href="tel:+000000000"
            className="flex items-center gap-2 text-sm text-muted hover:text-text"
            onClick={close}
          >
            <Phone size={15} strokeWidth={1.75} />
            +00 000 000 000
          </a>
          <SectionLink
            href="#contact"
            onClick={close}
            className="rounded-full bg-accent px-5 py-3 text-center text-sm font-medium text-bg"
          >
            Get in Touch
          </SectionLink>
        </div>
      </div>
    </>
  );
}

/**
 * Renders a plain anchor on Home (unchanged smooth-scroll behavior) or a
 * React Router Link to "/#section" on any other route, so section links keep
 * working from the vehicle detail page.
 */
function SectionLink({
  href,
  className,
  onClick,
  style,
  children,
}: {
  href: string;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();
  return pathname === "/" ? (
    <a href={href} className={className} onClick={onClick} style={style}>
      {children}
    </a>
  ) : (
    <Link to={`/${href}`} className={className} onClick={onClick} style={style}>
      {children}
    </Link>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm build` and `pnpm lint`
Expected: both complete with no errors.

- [ ] **Step 3: Manual verification**

Run: `pnpm dev`.
- On Home, desktop nav row now reads: Fleet, Pricing, How it works, Experience,
  Reviews, Contact — clicking each still smooth-scrolls exactly as before (unchanged
  `<a>` behavior).
- On Home, mobile: open the hamburger drawer — a gold-bordered "From €139/day" summary
  card appears above the link list, and "Pricing" is present in the link list. Tapping
  any link closes the drawer and scrolls to the right section.
- Navigate to any `/fleet/:id` URL directly in the address bar (still blank content
  until Task 7, that's fine) — click a nav link (desktop or drawer): the browser
  navigates to `/` and lands on the correct section (drawer/desktop links now render as
  `Link to="/#section"`, and `useHashScroll` from Task 2 handles the scroll once Home
  mounts).
- "Get in Touch" (desktop button and drawer's bottom CTA) behave the same way — smooth
  scroll on Home, cross-page navigate-then-scroll elsewhere.

- [ ] **Step 4: Checkpoint**

No git repository is present. Confirm Step 3 passed before moving to Task 6.

---

### Task 6: `BottomNav.tsx` — trim to 4 tabs, route-aware links

**Files:**
- Modify: `src/components/BottomNav.tsx`

**Interfaces:**
- Consumes: `Link`, `useLocation` from `react-router-dom`; `BadgeEuro` icon from
  `lucide-react` (verified present in the installed version alongside the already-used
  `Car`, `Star`, `MessageCircle`).
- Produces: nothing new — `BottomNav` remains a default export with no props.

- [ ] **Step 1: Replace the full contents of `src/components/BottomNav.tsx`**

```tsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Car, BadgeEuro, Star, MessageCircle } from "lucide-react";

const TABS = [
  { href: "#fleet", label: "Fleet", icon: Car },
  { href: "#pricing", label: "Pricing", icon: BadgeEuro },
  { href: "#reviews", label: "Reviews", icon: Star },
  { href: "#contact", label: "Contact", icon: MessageCircle },
];

export default function BottomNav() {
  const [active, setActive] = useState<string | null>(null);
  const { pathname } = useLocation();

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
  }, [pathname]);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-stretch justify-around border-t border-line bg-bg/90 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.href;
        const className = "flex flex-1 flex-col items-center justify-center gap-1";
        const content = (
          <>
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
          </>
        );
        return pathname === "/" ? (
          <a
            key={t.href}
            href={t.href}
            aria-label={t.label}
            aria-current={isActive ? "true" : undefined}
            className={className}
          >
            {content}
          </a>
        ) : (
          <Link
            key={t.href}
            to={`/${t.href}`}
            aria-label={t.label}
            aria-current={isActive ? "true" : undefined}
            className={className}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm build` and `pnpm lint`
Expected: both complete with no errors. If `BadgeEuro` is not exported by the installed
`lucide-react` version (already verified present, but re-check if this fails), run
`node -e "console.log(Object.keys(require('lucide-react')).filter(k => /badge|euro/i.test(k)))"`
from the project root and substitute the closest match in both the import and `TABS`.

- [ ] **Step 3: Manual verification**

Run: `pnpm dev`, resize to a mobile width.
- Bottom bar now shows exactly 4 icons: Fleet, Pricing (euro badge icon), Reviews,
  Contact — "How it works" and "Experience" tabs are gone from the bar (still reachable
  via the hamburger drawer, confirmed in Task 5).
- Scrolling through Home updates the active icon correctly for all 4 remaining
  sections.
- Tapping "Pricing" jumps to the new Pricing section.
- Navigate to a `/fleet/:id` URL (still blank until Task 7): the bottom bar is present,
  no tab is highlighted, and tapping any tab navigates to `/` and lands on the right
  section (via `Link to="/#section"` + `useHashScroll`).
- Resize to ≥1024px: bar disappears (`lg:hidden`), as before.

- [ ] **Step 4: Checkpoint**

No git repository is present. Confirm Step 3 passed before moving to Task 7.

---

### Task 7: Vehicle detail page

**Files:**
- Create: `src/pages/VehicleDetail.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `fleet` from `src/data/fleet.ts` (with `images`/`description` added in Task
  3), `VehicleCard` from `src/components/VehicleCard.tsx` (unchanged export, takes
  `{ vehicle: Vehicle; index?: number }`), `useParams`/`Link` from `react-router-dom`.
- Produces: `VehicleDetail` — default export, no props, rendered at route
  `/fleet/:id`.

- [ ] **Step 1: Create `src/pages/VehicleDetail.tsx`**

```tsx
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { fleet } from "../data/fleet";
import VehicleCard from "../components/VehicleCard";

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const vehicle = fleet.find((v) => v.id === id);

  if (!vehicle) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-32 text-center lg:px-10">
        <p className="font-display text-2xl">Vehicle not found</p>
        <p className="mt-2 text-sm text-muted">
          It may have left the fleet, or the link is out of date.
        </p>
        <Link
          to="/#fleet"
          className="mt-6 inline-block rounded-full border border-accent/60 px-5 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-bg"
        >
          Back to Fleet
        </Link>
      </div>
    );
  }

  const sameType = fleet.filter((v) => v.id !== vehicle.id && v.type === vehicle.type);
  const related =
    sameType.length > 0
      ? sameType.slice(0, 3)
      : fleet.filter((v) => v.id !== vehicle.id && v.brand === vehicle.brand).slice(0, 3);

  return (
    <div className="pt-24 lg:pt-32">
      <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-10 lg:pb-32">
        <Link
          to="/#fleet"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-text"
        >
          <ArrowLeft size={15} strokeWidth={1.75} />
          Back to Fleet
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <Gallery images={vehicle.images} name={vehicle.name} />

          <div>
            <p className="eyebrow mb-2">{vehicle.brand}</p>
            <h1 className="font-display text-3xl font-medium sm:text-4xl">
              {vehicle.name}
            </h1>
            <p className="font-display mt-3 text-2xl text-accent">
              €{vehicle.pricePerDay}
              <span className="text-sm text-muted">/day</span>
            </p>

            <p className="mt-6 text-sm leading-relaxed text-muted">
              {vehicle.description}
            </p>

            <div className="spec mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6 sm:grid-cols-4">
              <Spec label="Engine" value={vehicle.engine} />
              <Spec label="0–100" value={vehicle.zeroToHundred} />
              <Spec label="Doors" value={String(vehicle.doors)} />
              <Spec label="Seats" value={String(vehicle.seats)} />
            </div>

            <div className="mt-8 flex gap-3">
              <Link
                to="/#contact"
                className="flex-1 rounded-full border border-line-strong py-3 text-center text-sm font-medium transition-colors hover:border-accent hover:text-accent"
              >
                Contact
              </Link>
              <a
                href="https://wa.me/00000000000"
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded-full bg-accent py-3 text-center text-sm font-medium text-bg transition-colors hover:bg-accent/90"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20 border-t border-line pt-14">
            <p className="eyebrow mb-6">Similar Vehicles</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-text">{value}</p>
    </div>
  );
}

function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});

  return (
    <div>
      <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-surface-2 relative">
        {!loaded[active] && (
          <div className="absolute inset-0 skeleton-shimmer" aria-hidden="true" />
        )}
        <img
          key={images[active]}
          src={images[active]}
          alt={`${name} — view ${active + 1}`}
          loading="eager"
          decoding="async"
          onLoad={() => setLoaded((l) => ({ ...l, [active]: true }))}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            loaded[active] ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-current={i === active}
              className={`aspect-[4/3] overflow-hidden rounded-lg border transition-colors ${
                i === active ? "border-accent" : "border-line hover:border-line-strong"
              }`}
            >
              <img
                src={img}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Wire the route into `src/App.tsx`**

Replace:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

with:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import VehicleDetail from "./pages/VehicleDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/fleet/:id" element={<VehicleDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `pnpm build` and `pnpm lint`
Expected: both complete with no errors.

- [ ] **Step 4: Manual verification**

Run: `pnpm dev`.
- From Home, click "View Details" on any Fleet card: lands on `/fleet/<id>` showing
  that vehicle's name, brand, price, description, and 3–4 image gallery with a large
  main image and thumbnail row below it.
- Click each thumbnail: the main image swaps, the clicked thumbnail gets a gold border,
  a brief skeleton shimmer shows while each new main image loads.
- Spec grid (Engine, 0–100, Doors, Seats) matches the values in `fleet.ts` for that
  vehicle.
- "Contact" button navigates to `/#contact` (a `Link`, since this page always needs to
  leave `/fleet/:id` to reach the Contact section on Home) and lands correctly on the
  Contact section via `useHashScroll`. "WhatsApp" opens `https://wa.me/...` in a new
  tab.
- "Similar Vehicles" row at the bottom shows up to 3 other vehicles of the same type
  (e.g. viewing a Sedan shows other Sedans), each a fully working `VehicleCard`
  (clicking one navigates to its own detail page).
- Visit `/fleet/does-not-exist` directly: shows the "Vehicle not found" message with a
  working "Back to Fleet" link.
- Browser back/forward buttons work correctly between Home and any detail page.
- Bottom bar and hamburger drawer both still work correctly from the detail page
  (confirmed in Tasks 5–6, re-verify here now that the route actually exists).
- Resize to ≥1024px: two-column layout (gallery left, info right); resize to mobile:
  stacked, gallery on top.

- [ ] **Step 5: Checkpoint**

No git repository is present. Confirm Step 4 passed. This is the final task in the plan.

---

## Plan-Level Verification

After all seven tasks are complete, do one final end-to-end pass:

- [ ] Run `pnpm build` and `pnpm lint` once more from a clean state — both must pass.
- [ ] At a mobile width, walk the entire site: Home shows the bottom bar (Fleet,
      Pricing, Reviews, Contact) always visible, the hamburger drawer opens
      independently with the full link list + pricing summary, the new Pricing section
      renders correct ranges, every "View Details" link opens a working detail page
      with a working gallery, and cross-page nav (drawer, bottom bar, breadcrumb) all
      correctly return to the right Home section.
- [ ] At ≥1024px, walk the entire site: desktop nav row includes "Pricing", Pricing
      section renders as two side-by-side cards, detail page renders as two columns,
      no bottom bar at any point.
- [ ] Confirm the fix for the original bug: the bottom tab bar, which existed in the
      codebase but was never rendered, is now visible and functional on every page at
      mobile widths.
