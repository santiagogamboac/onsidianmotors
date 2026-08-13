import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarClock, Check, Gauge, MapPin, ShieldCheck } from "lucide-react";
import { fleet } from "../data/fleet";

const FEATURED_IDS = ["bmw-7er", "porsche-cayenne", "mercedes-s-klasse", "audi-q8"];

const FEATURED_IMAGES: Record<string, string> = {
  "bmw-7er": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1800&q=88",
  "porsche-cayenne": "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1800&q=88",
  "mercedes-s-klasse": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1800&q=88",
  "audi-q8": "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1800&q=88",
};

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: "Inspected & detailed" },
  { icon: MapPin, label: "Delivery available" },
  { icon: CalendarClock, label: "Flexible booking" },
];

export default function Journey() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const featured = useMemo(
    () => FEATURED_IDS.map((id) => fleet.find((vehicle) => vehicle.id === id)).filter(Boolean),
    []
  );
  const active = featured[activeIndex] ?? featured[0];

  const goTo = (index: number) => {
    setActiveIndex((index + featured.length) % featured.length);
  };

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % featured.length);
    }, 5600);
    return () => window.clearInterval(timer);
  }, [paused, featured.length]);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    const selected = node.querySelector<HTMLElement>(`[data-slide="${activeIndex}"]`);
    selected?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeIndex]);

  if (!active) return null;

  return (
    <section id="experience" className="relative overflow-hidden bg-surface py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 2xl:px-16">
        <div className="mb-10 flex flex-col gap-8 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">The Obsidian edit</p>
            <h2 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-text sm:text-5xl lg:text-6xl">
              A better way to arrive.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
              Explore a considered selection of vehicles, prepared for the moments that matter.
              Every detail is there to make choosing feel as good as driving.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="mr-2 font-display text-sm tabular-nums text-muted">
              <strong className="text-text">{String(activeIndex + 1).padStart(2, "0")}</strong>
              <span className="mx-2 text-line-strong">/</span>
              {String(featured.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              aria-label="Previous vehicle"
              onClick={() => goTo(activeIndex - 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-muted transition hover:border-accent hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <ArrowLeft size={17} />
            </button>
            <button
              type="button"
              aria-label="Next vehicle"
              onClick={() => goTo(activeIndex + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-muted transition hover:border-accent hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div ref={trackRef} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:gap-6">
            {featured.map((vehicle, index) => {
              if (!vehicle) return null;
              const isActive = index === activeIndex;
              return (
                <article
                  key={vehicle.id}
                  data-slide={index}
                  className={`group relative flex min-w-[86vw] snap-center flex-col overflow-hidden rounded-[1.75rem] border bg-bg transition duration-500 sm:min-w-[72vw] md:min-w-[58vw] lg:min-w-[calc(68%-12px)] xl:min-w-[calc(58%-12px)] ${isActive ? "border-accent/50 shadow-2xl shadow-black/20" : "border-line opacity-70"}`}
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-surface-2 sm:aspect-[1.9/1]">
                    <img
                      src={FEATURED_IMAGES[vehicle.id] ?? vehicle.images[0]}
                      alt={`${vehicle.name} exterior`}
                      loading={index === 0 ? "eager" : "lazy"}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-80" />
                    <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white backdrop-blur-md">
                      {vehicle.brand} <span className="text-accent">/</span> {vehicle.type}
                    </div>
                    <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white sm:bottom-6 sm:left-7 sm:right-7">
                      <div>
                        <p className="mb-1 text-xs uppercase tracking-[0.2em] text-white/60">Featured vehicle</p>
                        <h3 className="font-display text-2xl font-medium sm:text-3xl">{vehicle.name}</h3>
                      </div>
                      <p className="font-display text-xl text-accent sm:text-2xl">
                        ${vehicle.pricePerDay}<span className="ml-1 text-xs text-white/60">/ day</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid flex-1 gap-6 p-5 sm:grid-cols-[1fr_auto] sm:p-7">
                    <div>
                      <p className="max-w-2xl text-sm leading-6 text-muted sm:text-base">{vehicle.description}</p>
                      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
                        <span className="inline-flex items-center gap-1.5"><Gauge size={14} className="text-accent" /> {vehicle.engine}</span>
                        <span>{vehicle.zeroToHundred} 0–100</span>
                        <span>{vehicle.seats} seats</span>
                      </div>
                    </div>
                    <a
                      href={`/fleet/${vehicle.id}`}
                      className="inline-flex h-fit items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-bg transition hover:scale-[1.02] active:scale-[0.98] sm:self-end"
                    >
                      Explore vehicle
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-6 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.13em] text-muted">
                <Icon size={15} className="text-accent" /> {label}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2" aria-label="Carousel slides">
            {featured.map((vehicle, index) => (
              <button
                key={vehicle?.id ?? index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeIndex}
                onClick={() => goTo(index)}
                className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent ${index === activeIndex ? "w-10 bg-accent" : "w-5 bg-line-strong hover:bg-muted"}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-accent/20 bg-accent-soft/30 px-5 py-4 text-sm text-muted sm:px-6">
          <p><Check size={16} className="mr-2 inline text-accent" />Every vehicle is prepared, inspected and ready for its next story.</p>
          <a href="#contact" className="hidden shrink-0 font-medium text-accent underline-offset-4 hover:underline sm:inline">Talk to a specialist</a>
        </div>
      </div>
    </section>
  );
}
