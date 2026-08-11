import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { fleet, brandCounts, type Brand, type VehicleType } from "../data/fleet";
import { useInView } from "../hooks/useInView";
import VehicleCard from "./VehicleCard";

type SortKey = "featured" | "price-asc" | "price-desc";

const TYPES: VehicleType[] = ["Sedan", "SUV"];
const BRANDS: Brand[] = ["BMW", "Mercedes-Benz", "Audi", "Porsche", "Range Rover"];

export default function Fleet() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<VehicleType | "All">("All");
  const [brand, setBrand] = useState<Brand | "All">("All");
  const [sort, setSort] = useState<SortKey>("featured");

  const { ref: headingRef, inView: headingVisible } = useInView({ threshold: 0.2 });

  const results = useMemo(() => {
    let list = fleet.filter((v) => {
      const matchesQuery = v.name.toLowerCase().includes(query.toLowerCase());
      const matchesType = type === "All" || v.type === type;
      const matchesBrand = brand === "All" || v.brand === brand;
      return matchesQuery && matchesType && matchesBrand;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.pricePerDay - b.pricePerDay);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.pricePerDay - a.pricePerDay);
    return list;
  }, [query, type, brand, sort]);

  return (
    <section id="fleet" className="bg-bg py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Header */}
        <div
          ref={headingRef}
          className="flex flex-col justify-between gap-6 border-b border-line pb-8 sm:flex-row sm:items-end transition-all duration-700 ease-out"
          style={{
            opacity: headingVisible ? 1 : 0,
            transform: headingVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <div>
            <p className="eyebrow mb-3">Our Fleet</p>
            <h2 className="font-display text-3xl font-medium sm:text-4xl">
              {results.length} Vehicles{" "}
              <span className="text-muted">· of {fleet.length} in the fleet</span>
            </h2>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-fit rounded-full border border-line bg-surface px-4 py-2 text-sm text-text outline-none focus:border-accent"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
          {/* Sidebar filters */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <h3 className="font-display mb-4 text-sm tracking-[0.2em] text-muted">
              FILTER
            </h3>

            <div className="relative mb-8">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-full rounded-full border border-line bg-surface py-2.5 pl-9 pr-4 text-sm outline-none focus:border-accent"
              />
            </div>

            <div className="mb-8">
              <p className="mb-3 text-xs tracking-widest text-muted">TYPE</p>
              <div className="relative">
                <div className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                  <FilterPill active={type === "All"} onClick={() => setType("All")}>
                    All
                  </FilterPill>
                  {TYPES.map((t) => (
                    <FilterPill key={t} active={type === t} onClick={() => setType(t)}>
                      {t}
                    </FilterPill>
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-bg to-transparent lg:hidden" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-bg to-transparent lg:hidden" />
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs tracking-widest text-muted">BRAND</p>
              <div className="relative">
                <div className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                  <FilterPill active={brand === "All"} onClick={() => setBrand("All")}>
                    All
                  </FilterPill>
                  {BRANDS.map((b) => (
                    <FilterPill key={b} active={brand === b} onClick={() => setBrand(b)}>
                      {b}
                      <span className="text-muted">{brandCounts[b] ?? 0}</span>
                    </FilterPill>
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-bg to-transparent lg:hidden" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-bg to-transparent lg:hidden" />
              </div>
            </div>
          </aside>

          {/* Vehicle grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((v, i) => (
              <VehicleCard key={v.id} vehicle={v} index={i} />
            ))}
            {results.length === 0 && (
              <p className="col-span-full py-16 text-center text-muted">
                No vehicles match your filters.
              </p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <StatsRow />
      </div>
    </section>
  );
}

/** Individual stat with fade-up on scroll */
function StatsRow() {
  const { ref, inView } = useInView({ threshold: 0.3 });
  return (
    <div
      ref={ref}
      className="mt-16 grid grid-cols-2 gap-6 border-t border-line pt-10 sm:grid-cols-4"
    >
      {[
        { value: `${fleet.length}`, label: "Vehicles in the fleet" },
        { value: "24/7", label: "Support" },
        { value: "4.9★", label: "Customer rating" },
        { value: "Included", label: "Delivery" },
      ].map((s, i) => (
        <div
          key={s.label}
          className="transition-all duration-600 ease-out"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(16px)",
            transitionDelay: `${i * 80}ms`,
          }}
        >
          <p className="font-display text-2xl text-text">{s.value}</p>
          <p className="mt-1 text-xs text-muted">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 snap-center items-center justify-between gap-2 rounded-full border px-4 py-2 text-left text-sm transition-colors ${
        active
          ? "border-accent bg-accent-soft text-accent"
          : "border-line text-muted hover:border-line-strong hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}
