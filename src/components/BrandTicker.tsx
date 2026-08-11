/**
 * Infinite marquee ticker — shows brand names scrolling left continuously.
 * Pure CSS animation, no JS, respects prefers-reduced-motion via the
 * global rule in index.css.
 */

const BRANDS = ["BMW", "Mercedes-Benz", "Audi", "Porsche", "Range Rover"];

// Duplicate the list so the loop feels seamless
const ITEMS = [...BRANDS, ...BRANDS, ...BRANDS];

export default function BrandTicker() {
  return (
    <div className="bg-surface border-y border-line overflow-hidden py-4">
      <div
        className="flex gap-16 ticker-track"
        aria-hidden="true"
        style={{ width: "max-content" }}
      >
        {ITEMS.map((b, i) => (
          <span
            key={i}
            className="font-display text-sm tracking-[0.25em] text-muted/60 uppercase shrink-0"
          >
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}
