import { useInView } from "../hooks/useInView";

const BRANDS = ["BMW", "Mercedes-Benz", "Audi", "Porsche", "Range Rover"];

export default function Footer() {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <footer
      ref={ref}
      className="border-t border-line bg-bg py-16 pb-[calc(4rem+env(safe-area-inset-bottom)+2rem)] lg:pb-16"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Brand */}
          <div
            className="transition-all duration-700 ease-out"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(20px)",
              transitionDelay: "0ms",
            }}
          >
            <p className="font-display text-lg tracking-[0.08em]">
              OBSIDIAN <span className="text-accent">MOTORS</span>
            </p>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Premium vehicles by the day — transparent, flexible, no fine print.
            </p>
          </div>

          {/* Address + contact */}
          <div
            className="transition-all duration-700 ease-out"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(20px)",
              transitionDelay: "100ms",
            }}
          >
            <p className="mb-3 text-xs tracking-widest text-muted">VISIT US</p>
            <p className="text-sm text-text">123 Example Street</p>
            <p className="text-sm text-text">00000 Example City</p>

            <p className="mb-3 mt-6 text-xs tracking-widest text-muted">CONTACT</p>
            <p className="text-sm text-text">+00 000 000 000</p>
            <p className="text-sm text-text">info@yourcompany.com</p>
            <a href="#fleet" className="mt-2 inline-block text-sm text-accent hover:underline">
              All Vehicles
            </a>
          </div>

          {/* Brands */}
          <div
            className="transition-all duration-700 ease-out"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(20px)",
              transitionDelay: "200ms",
            }}
          >
            <p className="mb-3 text-xs tracking-widest text-muted">BRANDS</p>
            <ul className="flex flex-col gap-1.5">
              {BRANDS.map((b) => (
                <li key={b} className="text-sm text-muted">
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between transition-all duration-700 ease-out"
          style={{
            opacity: inView ? 1 : 0,
            transitionDelay: "300ms",
          }}
        >
          <p>© 2026 OBSIDIAN MOTORS</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-text">Legal Notice</a>
            <a href="#" className="hover:text-text">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
