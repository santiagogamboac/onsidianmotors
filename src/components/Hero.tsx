import { useEffect, useState } from "react";

const BRANDS = ["BMW", "Mercedes-Benz", "Audi", "Porsche", "Range Rover"];

// Pexels CDN — luxury car at night (verified reachable)
const HERO_IMAGE =
  "https://images.pexels.com/photos/1035108/pexels-photo-1035108.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80";

export default function Hero() {
  const [visible, setVisible] = useState(false);

  // Trigger entrance animation after first paint
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className="relative flex min-h-screen items-end overflow-hidden bg-bg">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,11,0.55)_0%,rgba(10,10,11,0.3)_40%,rgba(10,10,11,0.85)_75%,#0a0a0b_100%)]" />
        {/* Subtle gold radial from top */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(198,161,91,0.12),transparent_60%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-24 pt-40 lg:px-10">
        {/* Eyebrow */}
        <p
          className="eyebrow mb-6 transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transitionDelay: "100ms",
            color: "#c6a15b",
          }}
        >
          Premium fleet · Delivered to your door
        </p>

        {/* Headline */}
        <h1
          className="font-display max-w-3xl text-5xl font-medium leading-[1.05] tracking-tight text-[#edeceb] sm:text-6xl lg:text-7xl transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transitionDelay: "220ms",
          }}
        >
          Drive what moves you.
          <br />
          <span className="text-[#9a9a9f]">No strings attached.</span>
        </h1>

        {/* Body */}
        <p
          className="mt-6 max-w-xl text-base text-[#9a9a9f] lg:text-lg transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transitionDelay: "340ms",
          }}
        >
          OBSIDIAN MOTORS rents premium vehicles for every occasion — from the
          executive sedan to the performance-driven SUV. Transparent daily
          rates, no fine print, delivery available straight to your door.
        </p>

        {/* CTAs */}
        <div
          className="mt-9 flex flex-wrap items-center gap-4 transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transitionDelay: "460ms",
          }}
        >
          <a
            href="#fleet"
            className="rounded-full bg-accent px-7 py-3 text-sm font-medium text-bg transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            View Fleet
          </a>
          <a
            href="#contact"
            className="rounded-full border border-[rgba(255,255,255,0.14)] px-7 py-3 text-sm font-medium text-[#edeceb] backdrop-blur-sm transition-colors hover:border-[#c6a15b]/60 hover:text-[#c6a15b]"
          >
            Get in Touch
          </a>
        </div>

        {/* Brand strip */}
        <div
          className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-[rgba(255,255,255,0.08)] pt-8 transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transitionDelay: "580ms",
          }}
        >
          {BRANDS.map((b, i) => (
            <span
              key={b}
              className="font-display text-sm tracking-wide text-[#9a9a9f]/70 transition-all duration-500 ease-out"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(8px)",
                transitionDelay: `${620 + i * 60}ms`,
              }}
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
