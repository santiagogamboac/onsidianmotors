import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useInView } from "../hooks/useInView";

const REVIEWS = [
  {
    quote:
      "The S-Class arrived at my hotel that evening, spotless and full — exactly the experience I'd expect at this price point.",
    initials: "MF",
    name: "M. Fischer",
    meta: "S-Class · Munich",
  },
  {
    quote:
      "We booked three cars for a company event. Pickup at the showroom was quick and the billing was completely transparent.",
    initials: "LB",
    name: "L. Bauer",
    meta: "3× fleet booking · Company event",
  },
  {
    quote:
      "Had a last-minute question about returning the car — messaged on WhatsApp late at night and got a reply within minutes.",
    initials: "KW",
    name: "K. Weiss",
    meta: "Mercedes-AMG · Support",
  },
];

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD = 40; // px needed to register a swipe

export default function Reviews() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Touch tracking
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const { ref: sectionRef, inView: sectionVisible } = useInView({ threshold: 0.15 });
  const { ref: headingRef, inView: headingVisible } = useInView({ threshold: 0.3 });

  const total = REVIEWS.length;

  const go = useCallback(
    (dir: 1 | -1) => {
      setActive((prev) => (prev + dir + total) % total);
    },
    [total]
  );

  // Auto-play
  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => go(1), AUTOPLAY_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, paused, go]);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setPaused(true);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only register horizontal swipes (dy < dx avoids triggering on page scroll)
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
    setPaused(false);
  };

  return (
    <section id="reviews" className="bg-bg py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Heading */}
        <div
          ref={headingRef}
          className="transition-all duration-700 ease-out"
          style={{
            opacity: headingVisible ? 1 : 0,
            transform: headingVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <p className="eyebrow mb-3">Reviews</p>
          <h2 className="font-display text-3xl font-medium sm:text-4xl">
            4.9 out of 5 stars.
          </h2>
        </div>

        {/* ── Desktop: 3 cards in a row ── */}
        <div
          ref={sectionRef}
          className="mt-14 hidden md:grid md:grid-cols-3 gap-6"
        >
          {REVIEWS.map((r, i) => (
            <ReviewCard
              key={r.name}
              review={r}
              visible={sectionVisible}
              delay={i * 120}
            />
          ))}
        </div>

        {/* ── Mobile: swipeable carousel ── */}
        <div
          className="mt-14 md:hidden select-none"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${active * 100}%)` }}
              aria-live="polite"
              aria-atomic="true"
            >
              {REVIEWS.map((r) => (
                <div key={r.name} className="min-w-full">
                  <ReviewCard review={r} visible delay={0} />
                </div>
              ))}
            </div>
          </div>

          {/* Controls row */}
          <div className="mt-5 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => go(-1)}
                aria-label="Previous review"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next review"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex gap-2" role="tablist" aria-label="Review slides">
              {REVIEWS.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Review ${i + 1} of ${total}`}
                  onClick={() => setActive(i)}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === active ? 24 : 6,
                    background:
                      i === active
                        ? "var(--color-accent)"
                        : "var(--color-line-strong)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ReviewCardProps {
  review: (typeof REVIEWS)[number];
  visible: boolean;
  delay: number;
}

function ReviewCard({ review: r, visible, delay }: ReviewCardProps) {
  return (
    <div
      className="flex h-full flex-col justify-between rounded-2xl border border-line bg-surface p-7 transition-all duration-700 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div>
        <p className="text-accent tracking-wide">★★★★★</p>
        <p className="mt-4 text-sm leading-relaxed text-text">"{r.quote}"</p>
      </div>
      <div className="mt-8 flex items-center gap-3">
        <span className="font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs text-muted">
          {r.initials}
        </span>
        <div>
          <p className="text-sm text-text">{r.name}</p>
          <p className="text-xs text-muted">{r.meta}</p>
        </div>
      </div>
    </div>
  );
}
