import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useInView } from "../hooks/useInView";

// Pexels CDN — verified reachable
const px = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop`;

/* ─────────────────────────────────────────────────────────────────────────────
   One section, two chapters.

   Chapter 1 is a sequence: four ordered steps, each carrying its numeral.
   Chapter 2 is a set: four services with no order between them. They share one
   visual language but stay legibly different, so merging the two sections
   doesn't quietly turn a process into a list.
─────────────────────────────────────────────────────────────────────────────── */

type Card =
  | { kind: "step"; n: string; title: string; copy: string; image: string }
  | { kind: "feature"; title: string; copy: string; image: string }
  | { kind: "chapter"; eyebrow: string; title: string };

type StepCard = Extract<Card, { kind: "step" }>;
type FeatureCard = Extract<Card, { kind: "feature" }>;
type ContentCardData = StepCard | FeatureCard;

const STEPS: StepCard[] = [
  {
    kind: "step",
    n: "01",
    title: "Choose",
    copy: "Browse our fleet and choose your vehicle — from the executive sedan to the performance-driven SUV.",
    image: px(3764958),
  },
  {
    kind: "step",
    n: "02",
    title: "Request",
    copy: "Send your request via form or WhatsApp — we'll get back to you with availability and pricing shortly.",
    image: px(5082579),
  },
  {
    kind: "step",
    n: "03",
    title: "Confirm & Pay",
    copy: "Confirm your dates and secure your booking with a fully refundable deposit. Quick, safe, and done in minutes.",
    image: px(6801648),
  },
  {
    kind: "step",
    n: "04",
    title: "Drive Off",
    copy: "Pick up at our showroom or have it delivered to you — keys in hand, no waiting, no more paperwork.",
    image: px(1592384),
  },
];

const FEATURES: FeatureCard[] = [
  {
    kind: "feature",
    title: "Personal Handover",
    copy: "Your vehicle is ready and waiting at our showroom. Keys, registration, a quick walkthrough — you're behind the wheel in minutes.",
    image: px(3807517),
  },
  {
    kind: "feature",
    title: "Delivery on Request",
    copy: "No showroom visit needed: we bring the vehicle straight to you — home, office, or the airport.",
    image: px(1181772),
  },
  {
    kind: "feature",
    title: "Checked Before Every Drive",
    copy: "Every vehicle is hand-polished and technically inspected before handover. No compromise on cleanliness or condition.",
    image: px(3807386),
  },
  {
    kind: "feature",
    title: "Available 24/7",
    copy: "Questions on the road? Our team is here for you around the clock — by phone or WhatsApp.",
    image: px(6894528),
  },
];

// Deliberately does not repeat the chapter heading: by the time this panel is
// on screen the sticky heading above has already swapped to it, and printing
// the same words twice reads as a bug.
const CHAPTER_BREAK: Card = {
  kind: "chapter",
  eyebrow: "Next",
  title: "That's the process.",
};

const CARDS: Card[] = [...STEPS, CHAPTER_BREAK, ...FEATURES];

// Where chapter two begins: drives the heading swap and the #experience anchor.
const BREAK_INDEX = STEPS.length;

const CHAPTERS = [
  { eyebrow: "How it works", title: "Four steps to your car." },
  { eyebrow: "The Experience", title: "More than just a key." },
];

export default function Journey() {
  const reduced = useReducedMotion();

  return (
    <section className="bg-bg">
      <div className="hidden lg:block">
        {reduced ? <SnapTrack /> : <PinnedJourney />}
      </div>
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
   PINNED JOURNEY — desktop

   The outer wrapper is 100vh + scrollDistance tall so the inner panel stays
   pinned while vertical scroll drives horizontal travel.

   No scroll listener: a rAF loop reads getBoundingClientRect and is gated by an
   IntersectionObserver, so nothing runs offscreen. Per-frame transforms are
   written straight to the DOM through refs, so the tree never re-renders from
   the animation. Only the discrete chapter and active index touch state.

   The 3D is real browser perspective, not a library: each card rotates on Y and
   recedes on Z in proportion to its distance from the viewport centre, giving a
   cylinder that turns as you scroll.
─────────────────────────────────────────────────────────────────────────────── */

const CONTENT_MAX = 1280; // max-w-7xl
const EDGE_PAD = 40; // px-10
const TRAIL_PAD = 64;
const LERP = 0.11;

// 3D tuning. Kept modest on purpose: this is a luxury brand, not a carousel demo.
const MAX_ROTATE = 26; // deg at the edge of the viewport
const MAX_DEPTH = 220; // px pushed away from the viewer
const MIN_OPACITY = 0.35;

const contentLeftInset = () =>
  Math.max(EDGE_PAD, (window.innerWidth - CONTENT_MAX) / 2 + EDGE_PAD);

function PinnedJourney() {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const rafRef = useRef<number | null>(null);
  const currentX = useRef(0);
  const scrollDistRef = useRef(0);

  const [scrollDist, setScrollDist] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [chapter, setChapter] = useState(0);
  const [headingVisible, setHeadingVisible] = useState(false);

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

    const ro = new ResizeObserver(update);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [measure]);

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

        currentX.current += (target - currentX.current) * LERP;
        if (Math.abs(target - currentX.current) < 0.1) currentX.current = target;

        const track = trackRef.current;
        if (track) {
          track.style.transform = `translate3d(${-currentX.current}px,0,0)`;
        }
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${currentX.current / dist})`;
        }

        if (track) {
          // Card positions come from layout (offsetLeft / offsetWidth), never
          // from getBoundingClientRect: the rect already includes the rotateY
          // and translateZ written below, so measuring it would feed the
          // transform back into its own input and oscillate.
          const trackLeft = track.getBoundingClientRect().left + currentX.current;
          const centre = window.innerWidth / 2;

          cardRefs.current.forEach((card) => {
            if (!card) return;
            const cardCentre =
              trackLeft + card.offsetLeft + card.offsetWidth / 2;
            // Signed, so cards left of centre turn the opposite way to those
            // on the right and the whole track reads as one cylinder.
            const raw = (cardCentre - centre) / window.innerWidth;
            // Clamped on both signs: without this, a card several viewports
            // away keeps rotating past 60deg and shows up as an edge-on sliver
            // at the track edge, while depth and opacity have already topped out.
            const offset = Math.max(-1, Math.min(1, raw));
            const abs = Math.abs(offset);

            const rotate = -offset * MAX_ROTATE;
            const depth = -abs * MAX_DEPTH;
            card.style.transform = `rotateY(${rotate.toFixed(2)}deg) translateZ(${depth.toFixed(1)}px)`;
            card.style.opacity = (1 - abs * (1 - MIN_OPACITY)).toFixed(3);
          });
        }

        // Active index and chapter come from scroll progress, not from whichever
        // card is nearest the centre: the track's left inset and trailing pad
        // keep the last card off centre, so a nearest-card index could never
        // select the final item.
        const idx = Math.round(progress * (CARDS.length - 1));
        setActiveIndex((prev) => (prev === idx ? prev : idx));
        setChapter((prev) => {
          const next = idx >= BREAK_INDEX ? 1 : 0;
          return prev === next ? prev : next;
        });
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

  const goTo = useCallback((index: number) => {
    const outer = outerRef.current;
    const dist = scrollDistRef.current;
    if (!outer || dist <= 0) return;

    const clamped = Math.min(Math.max(index, 0), CARDS.length - 1);
    const ratio = clamped / (CARDS.length - 1);
    const top = window.scrollY + outer.getBoundingClientRect().top + ratio * dist;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  return (
    <div
      id="how"
      ref={outerRef}
      className="relative scroll-mt-24"
      style={{ height: scrollDist > 0 ? `calc(100vh + ${scrollDist}px)` : "100vh" }}
    >
      {/* Keeps the Experience nav link real: an anchor parked at the scroll
          offset where chapter two begins, so jumping to it lands with the track
          already panned to the services. */}
      <div
        id="experience"
        className="pointer-events-none absolute left-0 w-px scroll-mt-24"
        style={{
          top: scrollDist > 0 ? (BREAK_INDEX / (CARDS.length - 1)) * scrollDist : 0,
          height: 1,
        }}
        aria-hidden="true"
      />

      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center py-10">
        <div className="max-w-7xl mx-auto w-full px-10 shrink-0">
          <div
            className="flex items-end justify-between gap-8 transition-all duration-700 ease-out"
            style={{
              opacity: headingVisible ? 1 : 0,
              transform: headingVisible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            {/* The section retitles itself on crossing into chapter two. Both
                headings share one grid cell so the swap can't shift the layout
                under the cards. */}
            <div className="grid">
              {CHAPTERS.map((c, i) => (
                <div
                  key={c.title}
                  className={`col-start-1 row-start-1 transition-all duration-500 ease-out ${
                    chapter === i
                      ? "translate-y-0 opacity-100"
                      : i === 0
                        ? "-translate-y-3 opacity-0"
                        : "translate-y-3 opacity-0"
                  }`}
                  aria-hidden={chapter !== i}
                >
                  <p className="eyebrow mb-3">{c.eyebrow}</p>
                  <h2 className="font-display max-w-lg text-3xl font-medium sm:text-4xl">
                    {c.title}
                  </h2>
                </div>
              ))}
            </div>

            <div className="flex shrink-0 gap-2">
              <NavButton
                label="Previous"
                disabled={activeIndex === 0}
                onClick={() => goTo(activeIndex - 1)}
              >
                <ArrowLeft size={16} strokeWidth={1.75} />
              </NavButton>
              <NavButton
                label="Next"
                disabled={activeIndex === CARDS.length - 1}
                onClick={() => goTo(activeIndex + 1)}
              >
                <ArrowRight size={16} strokeWidth={1.75} />
              </NavButton>
            </div>
          </div>
        </div>

        {/* perspective lives on the wrapper and preserve-3d on the track, so all
            cards share one vanishing point instead of each getting its own. */}
        <div
          className="mt-12 max-w-7xl mx-auto w-full shrink-0"
          style={{ perspective: "1600px" }}
        >
          <div
            ref={trackRef}
            className="flex items-stretch gap-10 pl-10 will-change-transform"
            style={{ transformStyle: "preserve-3d" }}
          >
            {CARDS.map((card, i) => (
              <div
                key={card.kind === "chapter" ? "break" : card.title}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="shrink-0 will-change-transform"
              >
                <JourneyCard card={card} />
              </div>
            ))}
            <div className="shrink-0 w-16" aria-hidden="true" />
          </div>
        </div>

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

            {/* Steps read as a numbered sequence, services as a set. The
                indicators mirror that difference. */}
            <div className="flex shrink-0 items-center gap-2">
              {CARDS.map((card, i) => {
                if (card.kind === "chapter") {
                  return (
                    <span
                      key="sep"
                      className="mx-1 h-3 w-px bg-line-strong"
                      aria-hidden="true"
                    />
                  );
                }
                const isStep = card.kind === "step";
                const on = i === activeIndex;
                return (
                  <button
                    key={card.title}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Go to ${card.title}`}
                    aria-current={on}
                    className="group py-2"
                  >
                    <span
                      className="block h-1.5 rounded-full transition-all duration-300 group-hover:bg-accent"
                      style={{
                        width: isStep ? (on ? 28 : 8) : 6,
                        background: on
                          ? "var(--color-accent)"
                          : "var(--color-line-strong)",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavButton({
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

/* ── Cards ─────────────────────────────────────────────────────────────── */

function JourneyCard({ card }: { card: Card }) {
  if (card.kind === "chapter") return <ChapterPanel card={card} />;
  return <ContentCard card={card} />;
}

/** The beat between the two chapters. Type only, no photo, so the eye reads it
 *  as a divider rather than as one more item in the set. */
function ChapterPanel({ card }: { card: Extract<Card, { kind: "chapter" }> }) {
  return (
    <div className="flex h-full w-80 flex-col justify-center border-l border-line pl-10">
      <p className="eyebrow mb-3">{card.eyebrow}</p>
      <h3 className="font-display text-3xl leading-tight">{card.title}</h3>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Now here is what surrounds it, from handover to the road.
      </p>
    </div>
  );
}

function ContentCard({ card }: { card: ContentCardData }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // The spotlight is two CSS custom properties written straight to the node.
  // No state, no library: pointer tracking costs zero re-renders, and the fade
  // in and out is a plain CSS group-hover transition.
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
  };

  const isStep = card.kind === "step";

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className="group relative h-full w-120 overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,box-shadow] duration-500 ease-out hover:border-accent/50 hover:shadow-[0_8px_40px_rgba(198,161,91,0.10)]"
    >
      {/* Accent wash that follows the cursor. Above the surface, below the
          content, and never eats pointer events. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(320px circle at var(--spot-x, 50%) var(--spot-y, 50%), var(--color-accent-soft), transparent 70%)",
        }}
      />

      <div className="relative aspect-4/3 overflow-hidden bg-surface-2">
        {!loaded && (
          <div className="absolute inset-0 skeleton-shimmer" aria-hidden="true" />
        )}
        <img
          src={card.image}
          alt={card.title}
          loading="lazy"
          decoding="async"
          width={800}
          height={600}
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
          className={`h-full w-full object-cover transition-[opacity,scale] duration-700 group-hover:scale-105 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <div className="p-8">
        {isStep ? (
          <p className="spec text-sm text-accent">{card.n}</p>
        ) : (
          <span className="block h-px w-8 bg-accent" aria-hidden="true" />
        )}
        <h3 className={`font-display text-2xl ${isStep ? "mt-2" : "mt-4"}`}>
          {card.title}
        </h3>
        <p className="mt-2 text-base leading-relaxed text-muted">{card.copy}</p>
      </div>
    </div>
  );
}

/* ── Reduced-motion desktop fallback: a native scroll-snap track, no 3D ── */
function SnapTrack() {
  return (
    <div id="how" className="scroll-mt-24 py-24">
      <div className="max-w-7xl mx-auto w-full px-10">
        <p className="eyebrow mb-3">{CHAPTERS[0].eyebrow}</p>
        <h2 className="font-display max-w-lg text-3xl font-medium sm:text-4xl">
          {CHAPTERS[0].title}
        </h2>
      </div>

      <div className="no-scrollbar mt-12 flex snap-x snap-mandatory items-stretch gap-10 overflow-x-auto px-10 pb-4">
        {CARDS.map((card) => (
          <div
            key={card.kind === "chapter" ? "break" : card.title}
            id={card.kind === "chapter" ? "experience" : undefined}
            className="shrink-0 snap-start"
          >
            <JourneyCard card={card} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Mobile: a plain vertical stack, both chapters, no hijack ── */
function MobileLayout() {
  return (
    <div className="lg:hidden px-6 py-24">
      <ChapterHeading
        eyebrow={CHAPTERS[0].eyebrow}
        title={CHAPTERS[0].title}
        id="how"
      />
      <div className="mt-12 flex flex-col gap-10">
        {STEPS.map((c, i) => (
          <MobileCard key={c.title} card={c} index={i} />
        ))}
      </div>

      <ChapterHeading
        eyebrow={CHAPTERS[1].eyebrow}
        title={CHAPTERS[1].title}
        id="experience"
        className="mt-24"
      />
      <div className="mt-12 flex flex-col gap-10">
        {FEATURES.map((c, i) => (
          <MobileCard key={c.title} card={c} index={i} />
        ))}
      </div>
    </div>
  );
}

function ChapterHeading({
  eyebrow,
  title,
  id,
  className = "",
}: {
  eyebrow: string;
  title: string;
  id: string;
  className?: string;
}) {
  const { ref, inView } = useInView({ threshold: 0.3 });
  return (
    <div
      id={id}
      ref={ref}
      className={`scroll-mt-24 transition-all duration-700 ease-out ${className} ${
        inView ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      }`}
    >
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="font-display max-w-lg text-3xl font-medium">{title}</h2>
    </div>
  );
}

function MobileCard({ card, index }: { card: ContentCardData; index: number }) {
  const { ref, inView } = useInView({ threshold: 0.2 });
  const isStep = card.kind === "step";

  return (
    <div
      ref={ref}
      // The reveal transform lives in the className rather than an inline style:
      // an inline style.transform always beats the hover translate utility for
      // the same property, which would kill the lift.
      className={`group overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-700 ease-out hover:-translate-y-1 hover:border-accent/50 ${
        inView ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="aspect-4/3 overflow-hidden bg-surface-2">
        <img
          src={card.image}
          alt={card.title}
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
        {isStep ? (
          <p className="spec text-sm text-accent">{card.n}</p>
        ) : (
          <span className="block h-px w-8 bg-accent" aria-hidden="true" />
        )}
        <h3 className={`font-display text-xl ${isStep ? "mt-2" : "mt-4"}`}>
          {card.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{card.copy}</p>
      </div>
    </div>
  );
}
