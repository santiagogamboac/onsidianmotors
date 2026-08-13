import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { fleet, brandCounts, type Brand, type VehicleType } from "../data/fleet";
import { useInView } from "../hooks/useInView";
import VehicleCard from "./VehicleCard";

type SortKey = "featured" | "price-asc" | "price-desc";

const TYPES: VehicleType[] = ["Sedan", "SUV"];
const BRANDS: Brand[] = ["BMW", "Mercedes-Benz", "Audi", "Porsche", "Range Rover"];
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export default function Fleet() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<VehicleType | "All">("All");
  const [brands, setBrands] = useState<Set<Brand>>(() => new Set());
  const [sort, setSort] = useState<SortKey>("featured");

  const { ref: headingRef, inView: headingVisible } = useInView({ threshold: 0.2 });

  const toggleBrand = (b: Brand) => {
    setBrands((prev) => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b);
      else next.add(b);
      return next;
    });
  };

  const results = useMemo(() => {
    let list = fleet.filter((v) => {
      const matchesQuery = v.name.toLowerCase().includes(query.toLowerCase());
      const matchesType = type === "All" || v.type === type;
      const matchesBrand = brands.size === 0 || brands.has(v.brand);
      return matchesQuery && matchesType && matchesBrand;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.pricePerDay - b.pricePerDay);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.pricePerDay - a.pricePerDay);
    return list;
  }, [query, type, brands, sort]);

  return (
    <section id="fleet" className="bg-bg py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:max-w-none lg:px-10 2xl:px-16">
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
          <Dropdown
            label={SORT_OPTIONS.find((o) => o.value === sort)?.label}
            panelClassName="w-56 left-0 sm:left-auto sm:right-0"
          >
            {(close) => (
              <div className="py-2">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      setSort(o.value);
                      close();
                    }}
                    className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left text-sm transition-colors ${
                      sort === o.value
                        ? "text-accent"
                        : "text-muted hover:bg-bg hover:text-text"
                    }`}
                  >
                    {o.label}
                    <Check
                      size={14}
                      className="shrink-0 transition-all duration-150"
                      style={{
                        opacity: sort === o.value ? 1 : 0,
                        transform: sort === o.value ? "scale(1)" : "scale(0.6)",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </Dropdown>
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
                className="w-full rounded-full border border-line bg-surface py-2.5 pl-9 pr-9 text-sm outline-none transition-all duration-200 focus:border-accent focus:ring-4 focus:ring-accent-soft"
              />
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                tabIndex={query ? 0 : -1}
                className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-all duration-150 hover:text-text"
                style={{
                  opacity: query ? 1 : 0,
                  transform: query ? "translateY(-50%) scale(1)" : "translateY(-50%) scale(0.7)",
                  pointerEvents: query ? "auto" : "none",
                }}
              >
                <X size={13} />
              </button>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-xs tracking-widest text-muted">TYPE</p>
              <div className="flex flex-wrap gap-2 lg:flex-col">
                <FilterPill active={type === "All"} onClick={() => setType("All")}>
                  All
                </FilterPill>
                {TYPES.map((t) => (
                  <FilterPill key={t} active={type === t} onClick={() => setType(t)}>
                    {t}
                  </FilterPill>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs tracking-widest text-muted">BRAND</p>
              <Dropdown
                label={
                  brands.size === 0
                    ? "All brands"
                    : `${brands.size} brand${brands.size > 1 ? "s" : ""} selected`
                }
                wrapperClassName="w-full"
                buttonClassName="w-full"
                panelClassName="w-full left-0"
              >
                {() => (
                  <div className="py-2">
                    <BrandRow
                      label="All brands"
                      checked={brands.size === 0}
                      onClick={() => setBrands(new Set())}
                    />
                    <div className="mx-4 my-1 border-t border-line" />
                    {BRANDS.map((b) => (
                      <BrandRow
                        key={b}
                        label={b}
                        count={brandCounts[b] ?? 0}
                        checked={brands.has(b)}
                        onClick={() => toggleBrand(b)}
                      />
                    ))}
                  </div>
                )}
              </Dropdown>
            </div>
          </aside>

          {/* Vehicle grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
      className={`flex shrink-0 items-center justify-between gap-2 rounded-full border px-4 py-2 text-left text-sm transition-colors ${
        active
          ? "border-accent bg-accent-soft text-accent"
          : "border-line text-muted hover:border-line-strong hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Small animated trigger + panel dropdown. The panel is always mounted
 * (opacity/scale/pointer-events toggle) so the open/close transition can
 * animate instead of popping in and out of the DOM.
 */
function Dropdown({
  label,
  wrapperClassName = "w-fit",
  buttonClassName = "w-fit",
  panelClassName = "left-0",
  children,
}: {
  label: React.ReactNode;
  wrapperClassName?: string;
  buttonClassName?: string;
  panelClassName?: string;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState({ openUpward: false, maxHeight: 400 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Keep the panel inside the viewport: flip it above the trigger when there
  // isn't room below, and always cap its height so every option stays
  // reachable by scrolling the panel instead of the page.
  useLayoutEffect(() => {
    if (!open) return;
    const updatePlacement = () => {
      if (!ref.current) return;
      const margin = 16;
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - margin;
      const spaceAbove = rect.top - margin;
      const openUpward = spaceBelow < 200 && spaceAbove > spaceBelow;
      const maxHeight = Math.max(160, Math.min(400, openUpward ? spaceAbove : spaceBelow));
      setPlacement({ openUpward, maxHeight });
    };
    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);
    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${wrapperClassName}`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center justify-between gap-2 rounded-full border bg-surface px-4 py-2.5 text-left text-sm text-text transition-colors ${
          open ? "border-accent" : "border-line hover:border-line-strong"
        } ${buttonClassName}`}
      >
        <span className="truncate">{label}</span>
        <ChevronDown
          size={15}
          className="shrink-0 text-muted transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      <div
        role="listbox"
        aria-hidden={!open}
        inert={!open}
        className={`absolute z-20 overflow-y-auto rounded-2xl border border-line bg-surface shadow-xl transition-all duration-150 ease-out ${
          placement.openUpward ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top"
        } ${panelClassName}`}
        style={{
          opacity: open ? 1 : 0,
          transform: open
            ? "scale(1) translateY(0)"
            : `scale(0.97) translateY(${placement.openUpward ? "6px" : "-6px"})`,
          pointerEvents: open ? "auto" : "none",
          maxHeight: placement.maxHeight,
        }}
      >
        {children(() => setOpen(false))}
      </div>
    </div>
  );
}

function BrandRow({
  label,
  count,
  checked,
  onClick,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
        checked ? "text-text" : "text-muted hover:bg-bg hover:text-text"
      }`}
    >
      <span className="flex items-center gap-3">
        <Checkbox checked={checked} />
        {label}
      </span>
      {count !== undefined && <span className="text-xs text-muted">{count}</span>}
    </button>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-150 ${
        checked ? "border-accent bg-accent" : "border-line-strong"
      }`}
    >
      <Check
        size={11}
        strokeWidth={3}
        className="text-bg transition-all duration-150"
        style={{
          opacity: checked ? 1 : 0,
          transform: checked ? "scale(1)" : "scale(0.5)",
        }}
      />
    </span>
  );
}
