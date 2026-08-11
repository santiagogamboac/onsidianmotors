import { useEffect, useRef, useState } from "react";
import { useInView } from "../hooks/useInView";

// Pexels CDN — verified reachable
const px = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop`;

const STEPS = [
  {
    n: "01",
    title: "Choose",
    copy: "Browse our fleet and choose your vehicle — from the executive sedan to the performance-driven SUV.",
    image: px(3764958), // person browsing cars at showroom
  },
  {
    n: "02",
    title: "Request",
    copy: "Send your request via form or WhatsApp — we'll get back to you with availability and pricing shortly.",
    image: px(5082579), // person on phone / submitting request
  },
  {
    n: "03",
    title: "Drive Off",
    copy: "Pick up at our showroom or have it delivered to you — keys in hand, no waiting, no more paperwork.",
    image: px(1592384), // car on open road
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="bg-bg">
      {/* Desktop: pinned horizontal scroll carousel */}
      <div className="hidden lg:block">
        <HorizontalScroll />
      </div>

      {/* Mobile: vertical stacked */}
      <MobileLayout />
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   HORIZONTAL SCROLL — desktop only
   
   Strategy:
   - The outer wrapper has height = 100vh + scrollDistance, giving the browser
     enough runway to scroll while the inner sticky div stays pinned.
   - On each scroll tick we read outerRef.current.getBoundingClientRect().top.
     When that goes negative, the user is "inside" the section.
   - progress = |rect.top| / scrollDistance, clamped [0,1].
   - The track translates left by -(progress * scrollDistance).
   
   Key fixes vs previous version:
   - HeadingBlock no longer uses useInView (it would never fire inside
     overflow:hidden). The heading is always rendered and fades in once
     the sticky container enters the viewport for the first time.
   - computeOverflow is a local function that reads the live DOM ref at
     call time — no stale closure.
   - sectionHeight is recomputed after images have loaded (ResizeObserver
     on the track), not just on window resize.
─────────────────────────────────────────────────────────────────────────────── */
// Matches the `max-w-7xl mx-auto px-10` container every other section uses
// (Hero, Fleet, Experience, Reviews, Contact, Footer) — the track needs to
// start at the same left inset so it lines up with the heading above it.
const CONTENT_MAX = 1280; // max-w-7xl
const EDGE_PAD = 40; // px-10
const contentLeftInset = () =>
  Math.max(EDGE_PAD, (window.innerWidth - CONTENT_MAX) / 2 + EDGE_PAD);

function HorizontalScroll() {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const [scrollDist, setScrollDist] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  // heading starts invisible, animates in once section is reached
  const [headingVisible, setHeadingVisible] = useState(false);

  // ── Measure: how many px does the track overflow the viewport ──────────
  const measure = () => {
    const track = trackRef.current;
    if (!track) return 0;
    // Account for the track's left inset (aligned with the heading) plus
    // extra right padding so the last card never hugs the edge.
    return Math.max(
      0,
      contentLeftInset() + track.scrollWidth - window.innerWidth + 64
    );
  };

  // ── Update section height whenever the track changes size ──────────────
  useEffect(() => {
    const update = () => {
      const d = measure();
      setScrollDist(d);
    };

    update();

    // ResizeObserver keeps height correct even after images load
    const ro = new ResizeObserver(update);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // ── Scroll → translateX ────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const outer = outerRef.current;
        if (!outer) return;

        const dist = measure();
        if (dist <= 0) return;

        const rect = outer.getBoundingClientRect();

        // Reveal heading as soon as the section starts entering the viewport
        if (rect.top < window.innerHeight * 0.8) setHeadingVisible(true);

        const scrolled = Math.max(0, -rect.top);
        const progress = Math.min(scrolled / dist, 1);
        setTranslateX(-(progress * dist));
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // seed on mount

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []); // intentionally empty — measure() reads live refs

  // active dot index
  const progress = scrollDist > 0 ? Math.abs(translateX) / scrollDist : 0;
  const activeDot = Math.min(
    Math.round(progress * (STEPS.length - 1)),
    STEPS.length - 1
  );

  return (
    <div
      ref={outerRef}
      // height drives how long the sticky panel stays pinned
      style={{ height: scrollDist > 0 ? `calc(100vh + ${scrollDist}px)` : "100vh" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center py-16">
        {/* Heading — fades in once; no IntersectionObserver (broken inside overflow:hidden) */}
        <div className="max-w-7xl mx-auto w-full px-10 shrink-0">
          <div
            className="transition-all duration-700 ease-out"
            style={{
              opacity: headingVisible ? 1 : 0,
              transform: headingVisible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <p className="eyebrow mb-3">How it works</p>
            <h2 className="font-display max-w-lg text-3xl font-medium sm:text-4xl">
              Three steps to your car.
            </h2>
          </div>
        </div>

        {/* Scrolling track — same max-w-7xl inset as the heading, allowed to
            overflow past the container's right edge for the scroll effect */}
        <div className="mt-10 max-w-7xl mx-auto w-full shrink-0">
          <div
            ref={trackRef}
            className="flex gap-8 pl-10 will-change-transform"
            style={{
              transform: `translateX(${translateX}px)`,
              // Very short transition keeps it glued to scroll without lag
              transition: "transform 0.06s linear",
            }}
          >
            {STEPS.map((s) => (
              <DesktopCard key={s.n} step={s} />
            ))}
            {/* Trailing spacer */}
            <div className="shrink-0 w-16" aria-hidden="true" />
          </div>
        </div>

        {/* Progress dots */}
        <div
          className="flex justify-center gap-2 mt-6 shrink-0"
          aria-hidden="true"
        >
          {STEPS.map((_, i) => (
            <span
              key={i}
              className="block h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === activeDot ? 24 : 6,
                background:
                  i === activeDot
                    ? "var(--color-accent)"
                    : "var(--color-line-strong)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Desktop card — fixed width so the overflow calc is predictable ── */
function DesktopCard({ step: s }: { step: (typeof STEPS)[number] }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="shrink-0 w-[420px]">
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-surface">
        {!loaded && (
          <div className="absolute inset-0 skeleton-shimmer" aria-hidden="true" />
        )}
        <img
          src={s.image}
          alt={s.title}
          loading="lazy"
          decoding="async"
          width={800}
          height={600}
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
          className={`h-full w-full object-cover transition-all duration-700 hover:scale-105 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
      <p className="spec mt-6 text-sm text-accent">{s.n}</p>
      <h3 className="font-display mt-2 text-xl">{s.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted max-w-xs">{s.copy}</p>
    </div>
  );
}

/* ── Mobile layout — plain vertical stack with fade-up ── */
function MobileLayout() {
  const { ref: headingRef, inView: headingVisible } = useInView({ threshold: 0.3 });

  return (
    <div className="lg:hidden py-24 px-6">
      <div
        ref={headingRef}
        className="mb-14 transition-all duration-700 ease-out"
        style={{
          opacity: headingVisible ? 1 : 0,
          transform: headingVisible ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <p className="eyebrow mb-3">How it works</p>
        <h2 className="font-display max-w-lg text-3xl font-medium">
          Three steps to your car.
        </h2>
      </div>

      <div className="flex flex-col gap-10">
        {STEPS.map((s, i) => (
          <MobileCard key={s.n} step={s} index={i} />
        ))}
      </div>
    </div>
  );
}

function MobileCard({
  step: s,
  index,
}: {
  step: (typeof STEPS)[number];
  index: number;
}) {
  const { ref, inView } = useInView({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transitionDelay: `${index * 120}ms`,
      }}
    >
      <div className="aspect-4/3 overflow-hidden rounded-2xl bg-surface">
        <img
          src={s.image}
          alt={s.title}
          loading="lazy"
          decoding="async"
          width={800}
          height={600}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      <p className="spec mt-6 text-sm text-accent">{s.n}</p>
      <h3 className="font-display mt-2 text-xl">{s.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{s.copy}</p>
    </div>
  );
}
