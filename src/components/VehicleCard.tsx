import { useState } from "react";
import type { Vehicle } from "../data/fleet";
import { useInView } from "../hooks/useInView";
import VehicleCardSkeleton from "./VehicleCardSkeleton";

interface VehicleCardProps {
  vehicle: Vehicle;
  /** Stagger index — adds a small delay so cards animate in sequence */
  index?: number;
}

export default function VehicleCard({ vehicle: v, index = 0 }: VehicleCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.1 });

  // Clamp stagger so it doesn't get too long for later cards
  const delay = Math.min(index * 60, 300);

  if (!inView) {
    // Reserve the space but show skeleton until card scrolls into view
    return (
      <article ref={ref as React.RefObject<HTMLElement>} style={{ minHeight: 340 }}>
        <VehicleCardSkeleton />
      </article>
    );
  }

  return (
    <article
      ref={ref as React.RefObject<HTMLElement>}
      className="group overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-500 ease-out hover:border-accent/50 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(198,161,91,0.08)]"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {/* Image wrapper — always rendered, skeleton overlaid while loading */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-surface-2 relative">
        {/* Skeleton shimmer shown while image loads */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 skeleton-shimmer" aria-hidden="true" />
        )}

        {!imgError && (
          <img
            src={v.image}
            alt={v.name}
            loading="lazy"
            decoding="async"
            width={800}
            height={600}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Fallback when image fails to load */}
        {imgError && (
          <div className="flex h-full w-full items-center justify-center bg-surface-2">
            <span className="font-display text-xs tracking-widest text-muted/40 uppercase">
              {v.brand}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg">{v.name}</h3>
          <p className="font-display whitespace-nowrap text-lg text-accent">
            €{v.pricePerDay}
            <span className="text-xs text-muted">/day</span>
          </p>
        </div>

        <div className="spec mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span>{v.engine}</span>
          <span>0–100 {v.zeroToHundred}</span>
          <span>{v.doors} doors</span>
          <span>{v.seats} seats</span>
        </div>

        <div className="mt-5 flex gap-3">
          <a
            href="#contact"
            className="flex-1 rounded-full border border-line-strong py-2 text-center text-xs font-medium transition-colors hover:border-accent hover:text-accent"
          >
            View Details
          </a>
          <a
            href="https://wa.me/00000000000"
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-full bg-accent py-2 text-center text-xs font-medium text-bg transition-colors hover:bg-accent/90"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
