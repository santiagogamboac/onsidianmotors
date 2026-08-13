import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarCheck, CarFront, Headphones, ShieldCheck } from "lucide-react";

type Story = {
  number: string;
  eyebrow: string;
  title: string;
  copy: string;
  image: string;
  icon: typeof CarFront;
  detail: string;
};

const STORIES: Story[] = [
  {
    number: "01",
    eyebrow: "Start with your needs",
    title: "Tell us what the moment calls for.",
    copy: "A weekend escape, an executive arrival or a longer stay. We listen first, then shape the right vehicle experience around your plans.",
    image: "https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?auto=compress&cs=tinysrgb&w=1600&h=1100&fit=crop",
    icon: Headphones,
    detail: "Personal guidance, never pressure",
  },
  {
    number: "02",
    eyebrow: "A considered selection",
    title: "We make the choice feel simple.",
    copy: "Our team helps you compare the details that matter: comfort, performance, space, timing and the way you want to arrive.",
    image: "https://images.pexels.com/photos/7144172/pexels-photo-7144172.jpeg?auto=compress&cs=tinysrgb&w=1600&h=1100&fit=crop",
    icon: CarFront,
    detail: "A fleet curated for real occasions",
  },
  {
    number: "03",
    eyebrow: "Prepared before handover",
    title: "Every detail is ready for you.",
    copy: "Before handover, every vehicle is cleaned, checked and presented with the care expected from a premium experience.",
    image: "https://images.pexels.com/photos/6870307/pexels-photo-6870307.jpeg?auto=compress&cs=tinysrgb&w=1600&h=1100&fit=crop",
    icon: ShieldCheck,
    detail: "Clean, inspected and ready to go",
  },
  {
    number: "04",
    eyebrow: "The experience continues",
    title: "Support that stays close.",
    copy: "From showroom pickup to delivery, our team stays available so the experience feels effortless before, during and after your drive.",
    image: "https://images.pexels.com/photos/6894425/pexels-photo-6894425.jpeg?auto=compress&cs=tinysrgb&w=1600&h=1100&fit=crop",
    icon: CalendarCheck,
    detail: "Flexible delivery and human support",
  },
];

export default function Journey() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const active = STORIES[activeIndex];
  const progress = useMemo(() => `${((activeIndex + 1) / STORIES.length) * 100}%`, [activeIndex]);

  const goTo = (index: number) => setActiveIndex((index + STORIES.length) % STORIES.length);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % STORIES.length), 6500);
    return () => window.clearInterval(timer);
  }, [paused]);

  // Centre the active slide by scrolling the track itself. scrollIntoView walks
  // up every scrollable ancestor including the document, so while the autoplay
  // timer ran it dragged the whole page down to this carousel — yanking the
  // viewport away from whatever the user was actually doing (e.g. the fleet
  // filters). Scrolling the container directly can never move the page.
  useEffect(() => {
    const track = trackRef.current;
    const node = track?.querySelector<HTMLElement>(`[data-slide="${activeIndex}"]`);
    if (!track || !node) return;
    const trackBox = track.getBoundingClientRect();
    const nodeBox = node.getBoundingClientRect();
    const offset = nodeBox.left - trackBox.left - (trackBox.width - nodeBox.width) / 2;
    track.scrollTo({ left: track.scrollLeft + offset, behavior: "smooth" });
  }, [activeIndex]);

  return (
    <section id="experience" className="overflow-hidden bg-surface py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 2xl:px-16">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow mb-4">How it works</p>
            <h2 className="font-display max-w-xl text-4xl font-medium leading-[1.05] tracking-tight text-text sm:text-5xl lg:text-6xl">
              Premium service, without the usual friction.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted sm:text-lg">
              The car is only part of the experience. We are here to make every step feel considered, clear and personal.
            </p>
            <div className="mt-8 flex items-center gap-4 text-sm text-muted">
              <span className="font-display text-2xl text-text">{active.number}</span>
              <div className="h-px w-20 bg-line-strong"><div className="h-px bg-accent transition-all duration-500" style={{ width: progress }} /></div>
              <span>{String(STORIES.length).padStart(2, "0")} steps</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 lg:justify-end">
            <p className="hidden max-w-xs text-right text-sm leading-6 text-muted sm:block">A more thoughtful way to move through the city and beyond.</p>
            <div className="flex gap-3">
              <button type="button" aria-label="Previous step" onClick={() => goTo(activeIndex - 1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-muted transition hover:border-accent hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent"><ArrowLeft size={17} /></button>
              <button type="button" aria-label="Next step" onClick={() => goTo(activeIndex + 1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-muted transition hover:border-accent hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent"><ArrowRight size={17} /></button>
            </div>
          </div>
        </div>

        <div ref={trackRef} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:gap-6">
          {STORIES.map((story, index) => {
            const Icon = story.icon;
            const isActive = index === activeIndex;
            return (
              <article key={story.number} data-slide={index} className={`group relative flex min-w-[88vw] snap-center flex-col overflow-hidden rounded-[1.75rem] border bg-bg transition duration-500 sm:min-w-[74vw] md:min-w-[58vw] lg:min-w-[calc(72%-12px)] xl:min-w-[calc(64%-12px)] ${isActive ? "border-accent/50 shadow-2xl shadow-black/20" : "border-line opacity-70"}`}>
                <div className="grid flex-1 md:grid-cols-[0.95fr_1.05fr]">
                  <div className="relative min-h-[260px] overflow-hidden md:min-h-[390px]">
                    <img src={story.image} alt="" aria-hidden="true" loading={index === 0 ? "eager" : "lazy"} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <span className="absolute bottom-5 left-5 font-display text-5xl text-white/80 sm:left-7 sm:text-6xl">{story.number}</span>
                  </div>
                  <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
                    <div>
                      <div className="mb-8 flex items-center justify-between"><span className="eyebrow">{story.eyebrow}</span><Icon size={22} className="text-accent" /></div>
                      <h3 className="font-display max-w-md text-3xl font-medium leading-tight text-text sm:text-4xl">{story.title}</h3>
                      <p className="mt-5 max-w-md text-sm leading-7 text-muted sm:text-base">{story.copy}</p>
                    </div>
                    <div className="mt-10 border-t border-line pt-5 text-xs uppercase tracking-[0.14em] text-accent">{story.detail}</div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
          <p className="text-sm text-muted">Designed around people, not just reservations.</p>
          <div className="flex gap-2" aria-label="How it works steps">
            {STORIES.map((story, index) => <button key={story.number} type="button" aria-label={`Go to step ${index + 1}`} aria-current={index === activeIndex} onClick={() => goTo(index)} className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent ${index === activeIndex ? "w-10 bg-accent" : "w-5 bg-line-strong hover:bg-muted"}`} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
