import { fleet } from "../data/fleet";
import { useInView } from "../hooks/useInView";

const STATS = [
  { value: `${fleet.length}`, label: "Vehicles in the fleet" },
  { value: "24/7", label: "Support" },
  { value: "4.9★", label: "Customer rating" },
  { value: "Included", label: "Delivery" },
];

/**
 * Proof band sitting between the brand ticker and the fleet. These numbers used
 * to close the Fleet section, where they trailed a grid whose height changes on
 * every filter click; up here they land before the user starts browsing and the
 * fleet section ends cleanly on the last card.
 */
export default function Stats() {
  const { ref, inView } = useInView({ threshold: 0.3 });

  return (
    <section className="border-b border-line bg-surface">
      <div
        ref={ref}
        className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-6 py-10 sm:grid-cols-4 sm:py-12 lg:px-10 2xl:px-16"
      >
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className="transition-all duration-600 ease-out sm:border-l sm:border-line sm:pl-6 sm:first:border-l-0 sm:first:pl-0"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(16px)",
              transitionDelay: `${i * 80}ms`,
            }}
          >
            <p className="font-display text-2xl text-text sm:text-3xl">{s.value}</p>
            <p className="mt-1 text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
