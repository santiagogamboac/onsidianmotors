import { useInView } from "../hooks/useInView";

// Pexels CDN — verified reachable
const px = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop`;

const FEATURES = [
  {
    title: "Personal Handover",
    copy: "Your vehicle is ready and waiting at our showroom. Keys, registration, a quick walkthrough — you're behind the wheel in minutes.",
    image: px(3807517), // keys handover / showroom
  },
  {
    title: "Delivery on Request",
    copy: "No showroom visit needed: we bring the vehicle straight to you — home, office, or the airport.",
    image: px(1181772), // car delivery / logistics
  },
  {
    title: "Checked Before Every Drive",
    copy: "Every vehicle is hand-polished and technically inspected before handover. No compromise on cleanliness or condition.",
    image: px(3807386), // car detailing / cleaning
  },
  {
    title: "Available 24/7",
    copy: "Questions on the road? Our team is here for you around the clock — by phone or WhatsApp.",
    image: px(6894528), // person on phone / support
  },
];

const BADGES = [
  { value: "21+", label: "Minimum age" },
  { value: "2Y", label: "Licence held for at least 2 years" },
  { value: "€", label: "Deposit & valid credit card" },
];

export default function Experience() {
  const { ref: headingRef, inView: headingVisible } = useInView({ threshold: 0.3 });
  const { ref: gridRef, inView: gridVisible } = useInView({ threshold: 0.1 });
  const { ref: badgesRef, inView: badgesVisible } = useInView({ threshold: 0.3 });

  return (
    <section id="experience" className="bg-bg py-24 lg:py-32">
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
          <p className="eyebrow mb-3">The Experience</p>
          <h2 className="font-display max-w-lg text-3xl font-medium sm:text-4xl">
            More than just a key.
          </h2>
        </div>

        {/* 2×2 feature grid — same bordered bg-surface card language as
            VehicleCard / HowItWorks, with individual gaps instead of a
            seamless hairline grid so each card can lift independently. */}
        <div ref={gridRef} className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              // See HowItWorks MobileCard for why the reveal transform is a
              // class, not inline style: inline style would always beat the
              // hover:-translate-y-1 utility for the same property.
              className={`group overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-500 ease-out hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_8px_40px_rgba(198,161,91,0.08)] ${
                gridVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="aspect-16/10 overflow-hidden bg-surface-2">
                <img
                  src={f.image}
                  alt={f.title}
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={500}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div className="p-8">
                <h3 className="font-display text-xl">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.copy}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Requirements badges */}
        <div
          ref={badgesRef}
          className="mt-14 flex flex-wrap gap-10 border-t border-line pt-10"
        >
          {BADGES.map((b, i) => (
            <div
              key={b.label}
              className="flex items-center gap-3 transition-all duration-500 ease-out"
              style={{
                opacity: badgesVisible ? 1 : 0,
                transform: badgesVisible ? "translateY(0)" : "translateY(12px)",
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <span className="font-display text-2xl text-accent">{b.value}</span>
              <span className="max-w-36 text-xs text-muted">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
