/**
 * Skeleton placeholder for a vehicle card while the image loads.
 * Uses a shimmer animation defined via inline keyframes in index.css.
 */
export default function VehicleCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-line bg-surface"
      aria-hidden="true"
    >
      {/* Image placeholder */}
      <div className="aspect-[4/3] w-full skeleton-shimmer" />

      <div className="p-5 space-y-3">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="skeleton-shimmer h-5 w-32 rounded-md" />
          <div className="skeleton-shimmer h-5 w-16 rounded-md" />
        </div>
        {/* Specs row */}
        <div className="flex gap-3 mt-1">
          <div className="skeleton-shimmer h-3.5 w-8 rounded" />
          <div className="skeleton-shimmer h-3.5 w-14 rounded" />
          <div className="skeleton-shimmer h-3.5 w-12 rounded" />
          <div className="skeleton-shimmer h-3.5 w-11 rounded" />
        </div>
        {/* CTA row */}
        <div className="mt-5 flex gap-3">
          <div className="skeleton-shimmer h-8 flex-1 rounded-full" />
          <div className="skeleton-shimmer h-8 flex-1 rounded-full" />
        </div>
      </div>
    </div>
  );
}
