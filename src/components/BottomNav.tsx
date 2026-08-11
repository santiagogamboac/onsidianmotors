import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Car, BadgeEuro, Star, MessageCircle } from "lucide-react";

const TABS = [
  { href: "#fleet", label: "Fleet", icon: Car },
  { href: "#pricing", label: "Pricing", icon: BadgeEuro },
  { href: "#reviews", label: "Reviews", icon: Star },
  { href: "#contact", label: "Contact", icon: MessageCircle },
];

export default function BottomNav() {
  const [active, setActive] = useState<string | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset on every navigation: BottomNav lives in the shared Layout and never
    // unmounts, so without this the tab that was active on Home stays visually
    // active (and aria-current) on routes with no matching sections.
    setActive(null);

    const sections = TABS.map((t) =>
      document.getElementById(t.href.slice(1))
    ).filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-stretch justify-around border-t border-line bg-bg/90 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.href;
        const className = "flex flex-1 flex-col items-center justify-center gap-1";
        const content = (
          <>
            <Icon
              size={22}
              strokeWidth={1.75}
              className={isActive ? "text-accent" : "text-muted"}
            />
            <span
              className={`h-1 w-1 rounded-full bg-accent transition-opacity ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        );
        return pathname === "/" ? (
          <a
            key={t.href}
            href={t.href}
            aria-label={t.label}
            aria-current={isActive ? "true" : undefined}
            className={className}
          >
            {content}
          </a>
        ) : (
          <Link
            key={t.href}
            to={`/${t.href}`}
            aria-label={t.label}
            aria-current={isActive ? "true" : undefined}
            className={className}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
