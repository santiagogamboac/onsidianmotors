import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { fleet } from "../data/fleet";
import VehicleCard from "../components/VehicleCard";

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const vehicle = fleet.find((v) => v.id === id);

  if (!vehicle) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-32 text-center lg:px-10">
        <h1 className="font-display text-2xl">Vehicle not found</h1>
        <p className="mt-2 text-sm text-muted">
          It may have left the fleet, or the link is out of date.
        </p>
        <Link
          to="/#fleet"
          className="mt-6 inline-block rounded-full border border-accent/60 px-5 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-bg"
        >
          Back to Fleet
        </Link>
      </div>
    );
  }

  const sameType = fleet.filter((v) => v.id !== vehicle.id && v.type === vehicle.type);
  const related =
    sameType.length >= 3
      ? sameType.slice(0, 3)
      : [
          ...sameType,
          ...fleet.filter(
            (v) => v.id !== vehicle.id && v.brand === vehicle.brand && !sameType.includes(v)
          ),
        ].slice(0, 3);

  return (
    <div className="pt-24 lg:pt-32">
      <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-10 lg:pb-32">
        <Link
          to="/#fleet"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-text"
        >
          <ArrowLeft size={15} strokeWidth={1.75} />
          Back to Fleet
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <Gallery key={vehicle.id} images={vehicle.images} name={vehicle.name} />

          <div>
            <p className="eyebrow mb-2">{vehicle.brand}</p>
            <h1 className="font-display text-3xl font-medium sm:text-4xl">
              {vehicle.name}
            </h1>
            <p className="font-display mt-3 text-2xl text-accent">
              €{vehicle.pricePerDay}
              <span className="text-sm text-muted">/day</span>
            </p>

            <p className="mt-6 text-sm leading-relaxed text-muted">
              {vehicle.description}
            </p>

            <div className="spec mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6 sm:grid-cols-3 lg:grid-cols-5">
              <Spec label="Engine" value={vehicle.engine} />
              <Spec label="0–100" value={vehicle.zeroToHundred} />
              <Spec label="Doors" value={String(vehicle.doors)} />
              <Spec label="Seats" value={String(vehicle.seats)} />
              <Spec label="Type" value={vehicle.type} />
            </div>

            <div className="mt-8 flex gap-3">
              <Link
                to="/#contact"
                className="flex-1 rounded-full border border-line-strong py-3 text-center text-sm font-medium transition-colors hover:border-accent hover:text-accent"
              >
                Contact
              </Link>
              <a
                href="https://wa.me/00000000000"
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded-full bg-accent py-3 text-center text-sm font-medium text-bg transition-colors hover:bg-accent/90"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20 border-t border-line pt-14">
            <p className="eyebrow mb-6">Similar Vehicles</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-text">{value}</p>
    </div>
  );
}

function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});

  return (
    <div>
      <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-surface-2 relative">
        {!loaded[active] && (
          <div className="absolute inset-0 skeleton-shimmer" aria-hidden="true" />
        )}
        <img
          key={images[active]}
          src={images[active]}
          alt={`${name} — view ${active + 1}`}
          loading="eager"
          decoding="async"
          onLoad={() => setLoaded((l) => ({ ...l, [active]: true }))}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            loaded[active] ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-pressed={i === active}
              className={`aspect-[4/3] overflow-hidden rounded-lg border transition-colors ${
                i === active ? "border-accent" : "border-line hover:border-line-strong"
              }`}
            >
              <img
                src={img}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
