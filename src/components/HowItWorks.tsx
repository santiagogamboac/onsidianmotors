import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
    title: "Confirm & Pay",
    copy: "Confirm your dates and secure your booking with a fully refundable deposit. Quick, safe, and done in minutes.",
    image: px(6801648), // signing a contract / confirmation
  },
  {
    n: "04",
    title: "Drive Off",
    copy: "Pick up at our showroom or have it delivered to you — keys in hand, no waiting, no more paperwork.",
    image: px(1592384), // car on open road
  },
];

const HEADING = "Four steps to your car.";

export default function HowItWorks() {
  const reduced = useReducedMotion();

  return (
    <section id="how" className="bg-bg">
      {/* Desktop: pinned horizontal scroll carousel, or a plain snap track
          when the user has asked for reduced motion. */}
      <div className="hidden lg:block">
        {reduced ? <SnapTrack /> : <PinnedCarousel />}
      </div>

      {/* Mobile: vertical stacked */}
      <MobileLayout />
    </section>
  );
}

/** Live-follows the OS reduced-motion preference. */
function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/* ─────────────────────────────────────────────────────────────────────────────
   PINNED CAROUSEL — desktop only

   The outer wrapper is 100vh + scrollDistance tall, giving the browser runway
   to scroll while the inner sticky panel stays pinned. Vertical scroll progress
   drives horizontal travel.

   Two deliberate choices:
   - No scroll listener. A rAF loop reads getBoundingClientRect() and is gated
     by an IntersectionObserver, so nothing runs while the section is offscreen.
   - No React state in the hot path. Per-frame transforms are written straight
     to the DOM through refs; state is only touched when the discrete active
     index changes, so the tree doesn't re-render 60 times a second.

   Travel is eased toward its target each frame (lerp), which gives the track
   weight instead of gluing it 1:1 to the scrollbar.
─────────────────────────────────────────────────────────────────────────────── */

// Matches the `max-w-7xl mx-auto px-10` container every other section uses, so
// the track starts at the same left inset as the heading above it.
const CONTENT_MAX = 1280; // max-w-7xl
const EDGE_PAD = 40; // px-10
const TRAIL_PAD = 64;
const LERP = 0.11;
const contentLeftInset = () =>
  Math.max(EDGE_PAD, (window.innerWidth - CONTENT_MAX) / 2 + EDGE_PAD);

function PinnedCarousel() {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const rafRef = useRef<number | null>(null);
  const currentX = useRef(0);
  const scrollDistRef = useRef(0);

  const [scrollDist, setScrollDist] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [headingVisible, setHeadingVisible] = useState(false);

  // ── Measure how far the track overflows the viewport ───────────────────
  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    return Math.max(
      0,
      contentLeftInset() + track.scrollWidth - window.innerWidth + TRAIL_PAD
    );
  }, []);

  useEffect(() => {
    const update = () => {
      const d = measure();
      scrollDistRef.current = d;
      setScrollDist(d);
    };

    update();

    // Keeps the height correct after images load and on resize
    const ro = new ResizeObserver(update);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [measure]);

  // ── Animation loop, gated by visibility ────────────────────────────────
  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    const frame = () => {
      const dist = scrollDistRef.current;
      const rect = outer.getBoundingClientRect();

      if (rect.top < window.innerHeight * 0.8) setHeadingVisible(true);

      if (dist > 0) {
        const progress = Math.min(Math.max(-rect.top, 0) / dist, 1);
        const target = progress * dist;

        // Ease toward the target so the track carries a little weight
        currentX.current += (target - currentX.current) * LERP;
        if (Math.abs(target - currentX.current) < 0.1) currentX.current = target;

        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${-currentX.current}px,0,0)`;
        }
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${currentX.current / dist})`;
        }

        // Depth focus: the card nearest the viewport centre stays full
        // strength, its neighbours recede. Distance is recomputed from live
        // layout so it stays correct at any width.
        const viewportCentre = window.innerWidth / 2;

        cardRefs.current.forEach((card) => {
          if (!card) return;
          const r = card.getBoundingClientRect();
          const offset = (r.left + r.width / 2 - viewportCentre) / window.innerWidth;
          const abs = Math.abs(offset);

          const focus = 1 - Math.min(abs * 1.5, 1);
          card.style.transform = `scale(${(0.94 + focus * 0.06).toFixed(4)})`;
          card.style.opacity = (0.45 + focus * 0.55).toFixed(3);

          // Counter-parallax on the photo adds depth against the card motion
          const img = card.querySelector<HTMLElement>("[data-parallax]");
          if (img) img.style.transform = `translate3d(${offset * -26}px,0,0)`;
        });

        // Active step comes from scroll progress, not from whichever card sits
        // closest to centre: the track's left inset and trailing pad mean the
        // last card never reaches the centre, so a nearest-card index could
        // never select the final step. Progress maps onto the same 0..n-1
        // scale goTo() uses, keeping the dots and arrows consistent with it.
        const nearest = Math.round(progress * (STEPS.length - 1));
        setActiveIndex((prev) => (prev === nearest ? prev : nearest));
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && rafRef.current === null) {
          rafRef.current = requestAnimationFrame(frame);
        } else if (!entry.isIntersecting && rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      },
      { rootMargin: "100px" }
    );
    io.observe(outer);

    return () => {
      io.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  // ── Jump to a step ─────────────────────────────────────────────────────
  const goTo = useCallback(
    (index: number) => {
      const outer = outerRef.current;
      const dist = scrollDistRef.current;
      if (!outer || dist <= 0) return;

      const clamped = Math.min(Math.max(index, 0), STEPS.length - 1);
      const ratio = clamped / (STEPS.length - 1);
      const top = window.scrollY + outer.getBoundingClientRect().top + ratio * dist;
      window.scrollTo({ top, behavior: "smooth" });
    },
    []
  );

  return (
    <div
      ref={outerRef}
      style={{ height: scrollDist > 0 ? `calc(100vh + ${scrollDist}px)` : "100vh" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center py-10">
        {/* Heading — fades in once. No IntersectionObserver here: it would
            never fire inside overflow:hidden. */}
        <div className="max-w-7xl mx-auto w-full px-10 shrink-0">
          <div
            className="flex items-end justify-between gap-8 transition-all duration-700 ease-out"
            style={{
              opacity: headingVisible ? 1 : 0,
              transform: headingVisible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <div>
              <p className="eyebrow mb-3">How it works</p>
              <h2 className="font-display max-w-lg text-3xl font-medium sm:text-4xl">
                {HEADING}
              </h2>
            </div>

            <div className="flex shrink-0 gap-2">
              <StepButton
                label="Previous step"
                disabled={activeIndex === 0}
                onClick={() => goTo(activeIndex - 1)}
              >
                <ArrowLeft size={16} strokeWidth={1.75} />
              </StepButton>
              <StepButton
                label="Next step"
                disabled={activeIndex === STEPS.length - 1}
                onClick={() => goTo(activeIndex + 1)}
              >
                <ArrowRight size={16} strokeWidth={1.75} />
              </StepButton>
            </div>
          </div>
        </div>

        {/* Track — same max-w-7xl inset as the heading, allowed to overflow
            past the container's right edge for the scroll effect. */}
        <div className="mt-12 max-w-7xl mx-auto w-full shrink-0">
          <div ref={trackRef} className="flex gap-10 pl-10 will-change-transform">
            {STEPS.map((s, i) => (
              <DesktopCard
                key={s.n}
                step={s}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
              />
            ))}
            <div className="shrink-0 w-16" aria-hidden="true" />
          </div>
        </div>

        {/* Scrub bar + step controls */}
        <div className="mt-10 max-w-7xl mx-auto w-full px-10 shrink-0">
          <div className="flex items-center gap-6">
            <div className="h-px flex-1 bg-line-strong/40">
              <div
                ref={barRef}
                className="h-px origin-left bg-accent will-change-transform"
                style={{ transform: "scaleX(0)" }}
                aria-hidden="true"
              />
            </div>

            <div className="flex shrink-0 gap-2">
              {STEPS.map((s, i) => (
                <button
                  key={s.n}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to step ${s.n}: ${s.title}`}
                  aria-current={i === activeIndex}
                  className="group py-2"
                >
                  <span
                    className="block h-1.5 rounded-full transition-all duration-300 group-hover:bg-accent"
                    style={{
                      width: i === activeIndex ? 28 : 8,
                      background:
                        i === activeIndex
                          ? "var(--color-accent)"
                          : "var(--color-line-strong)",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition-all duration-300 hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}

/* ── Desktop card — fixed width so the overflow calc stays predictable.
     Same bordered bg-surface treatment as VehicleCard and the Experience
     grid so the whole site reads as one card language.

     The outer element's transform is owned by the animation loop (depth
     focus), so the hover lift lives on an inner element instead of fighting
     it for the same property. ── */
function DesktopCard({
  step: s,
  ref,
}: {
  step: (typeof STEPS)[number];
  ref: (el: HTMLDivElement | null) => void;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div ref={ref} className="shrink-0 w-120 will-change-transform">
      <div className="group h-full overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,box-shadow,translate] duration-500 ease-out hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_8px_40px_rgba(198,161,91,0.10)]">
        <div className="relative aspect-4/3 overflow-hidden bg-surface-2">
          {!loaded && (
            <div className="absolute inset-0 skeleton-shimmer" aria-hidden="true" />
          )}
          <div data-parallax className="h-full w-full will-change-transform">
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
              className={`h-full w-full scale-110 object-cover transition-[opacity,scale] duration-700 group-hover:scale-115 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        </div>
        <div className="p-8">
          <p className="spec text-sm text-accent">{s.n}</p>
          <h3 className="font-display mt-2 text-2xl">{s.title}</h3>
          <p className="mt-2 text-base leading-relaxed text-muted">{s.copy}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Reduced-motion desktop fallback: a native scroll-snap track. Same cards,
     same reading order, no pinning and no scroll hijack. ── */
function SnapTrack() {
  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto w-full px-10">
        <p className="eyebrow mb-3">How it works</p>
        <h2 className="font-display max-w-lg text-3xl font-medium sm:text-4xl">
          {HEADING}
        </h2>
      </div>

      <div className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-10 overflow-x-auto px-10 pb-4">
        {STEPS.map((s) => (
          <div key={s.n} className="snap-start">
            <DesktopCard step={s} ref={() => {}} />
          </div>
        ))}
      </div>
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
        <h2 className="font-display max-w-lg text-3xl font-medium">{HEADING}</h2>
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
      // Reveal transform lives in the className, not inline style, so the
      // hover:-translate-y-1 utility can still win the cascade — an inline
      // style.transform would always beat it.
      className={`group overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-700 ease-out hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_8px_40px_rgba(198,161,91,0.08)] ${
        inView ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div className="aspect-4/3 overflow-hidden bg-surface-2">
        <img
          src={s.image}
          alt={s.title}
          loading="lazy"
          decoding="async"
          width={800}
          height={600}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      <div className="p-6">
        <p className="spec text-sm text-accent">{s.n}</p>
        <h3 className="font-display mt-2 text-xl">{s.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{s.copy}</p>
      </div>
    </div>
  );
}
