import { Check } from "lucide-react";
import { fleet, type VehicleType } from "../data/fleet";
import { useInView } from "../hooks/useInView";

// Derived from the fleet rather than hand-maintained, so TYPES can never
// contain a type with zero vehicles (which would make rangeFor return
// Infinity/-Infinity) or miss a type newly added to the fleet.
const TYPES = [...new Set(fleet.map((v) => v.type))];

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
