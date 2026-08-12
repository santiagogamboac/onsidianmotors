import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Moon, Phone, Sun, X } from "lucide-react";
import { fleet } from "../data/fleet";
import { useTheme } from "../hooks/useTheme";

const LINKS = [
  { href: "#fleet", label: "Fleet" },
  { href: "#pricing", label: "Pricing" },
  { href: "#how", label: "How it works" },
  { href: "#experience", label: "Experience" },
  { href: "#reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const startingPrice = Math.min(...fleet.map((v) => v.pricePerDay));
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const close = () => setOpen(false);

  // While floating over the Hero photo (not scrolled, drawer closed) the nav
  // sits on an image that's pinned to a fixed dark treatment regardless of
  // theme — so its own colors must stay fixed too, or light-theme text/scrim
  // goes dark-on-dark. Once scrolled past the Hero it gets a solid themed
  // background and switches to theme-aware colors.
  const floating = !scrolled && !open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || open
            ? "bg-bg/90 backdrop-blur-md border-b border-line"
            : "bg-linear-to-b from-black/55 via-black/20 to-transparent backdrop-blur-md border-b border-white/5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          {/* Logo */}
          <Link
            to="/"
            className={`font-display text-lg tracking-[0.08em] transition-colors ${
              floating ? "text-[#edeceb]" : "text-text"
            }`}
          >
            OBSIDIAN{" "}
            <span className={floating ? "text-[#c6a15b]" : "text-accent"}>MOTORS</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {LINKS.map((l) => (
              <SectionLink
                key={l.href}
                href={l.href}
                className={`text-sm transition-colors ${
                  floating
                    ? "text-[#c9c9cd] hover:text-white"
                    : "text-muted hover:text-text"
                }`}
              >
                {l.label}
              </SectionLink>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <a
              href="tel:+000000000"
              className={`flex items-center gap-2 text-sm transition-colors ${
                floating ? "text-[#c9c9cd] hover:text-white" : "text-muted hover:text-text"
              }`}
            >
              <Phone size={15} strokeWidth={1.75} />
              +00 000 000 000
            </a>
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className={`flex h-9 w-9 items-center justify-center transition-colors ${
                floating ? "text-[#c9c9cd] hover:text-white" : "text-muted hover:text-text"
              }`}
            >
              {theme === "dark" ? (
                <Moon size={18} strokeWidth={1.75} />
              ) : (
                <Sun size={18} strokeWidth={1.75} />
              )}
            </button>
            <SectionLink
              href="#contact"
              className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                floating
                  ? "border-[#c6a15b]/60 text-[#c6a15b] hover:bg-[#c6a15b] hover:text-[#0a0a0b]"
                  : "border-accent/60 text-accent hover:bg-accent hover:text-bg"
              }`}
            >
              Get in Touch
            </SectionLink>
          </div>

          {/* Mobile hamburger */}
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-drawer"
            className={`lg:hidden flex h-9 w-9 items-center justify-center transition-colors ${
              floating ? "text-[#edeceb]" : "text-text"
            }`}
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className="transition-all duration-200"
              style={{ opacity: open ? 0 : 1, position: open ? "absolute" : "static" }}
            >
              <Menu size={22} />
            </span>
            <span
              className="transition-all duration-200"
              style={{ opacity: open ? 1 : 0, position: open ? "static" : "absolute" }}
            >
              <X size={22} />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      <div
        aria-hidden={!open}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={close}
      />

      {/* Mobile drawer panel */}
      <div
        id="mobile-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed inset-x-0 top-0 z-50 lg:hidden flex flex-col bg-bg border-b border-line transition-transform duration-300 ease-in-out"
        style={{
          transform: open ? "translateY(0)" : "translateY(-100%)",
          paddingTop: "calc(64px + env(safe-area-inset-top))",
        }}
      >
        {/* Pricing summary — links to the Pricing section */}
        <SectionLink
          href="#pricing"
          onClick={close}
          className="mx-6 mt-2 block rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 transition-colors hover:border-accent/60"
        >
          <p className="font-display text-lg text-accent">
            From €{startingPrice}
            <span className="text-xs text-muted">/day</span>
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Insurance & 24/7 support included on every rental.
          </p>
        </SectionLink>

        <nav className="flex flex-col px-6 py-6 gap-1">
          {LINKS.map((l, i) => (
            <SectionLink
              key={l.href}
              href={l.href}
              onClick={close}
              className="flex items-center rounded-xl px-4 py-3.5 text-base text-muted transition-colors hover:bg-surface hover:text-text"
              style={{
                transitionDelay: open ? `${i * 40}ms` : "0ms",
                opacity: open ? 1 : 0,
                transform: open ? "translateX(0)" : "translateX(-12px)",
                // Longhands rather than the `transition` shorthand: mixing the
                // shorthand with a separately-set transitionDelay triggers a
                // React dev-mode warning (the shorthand can clobber the
                // longhand depending on application order).
                transitionProperty: "opacity, transform, background-color",
                transitionDuration: "0.3s, 0.3s, 0.15s",
                transitionTimingFunction: "ease, ease, ease",
              }}
            >
              {l.label}
            </SectionLink>
          ))}
        </nav>

        <div className="px-6 pb-8 pt-2 border-t border-line flex flex-col gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={theme === "light"}
            onClick={toggle}
            className="flex items-center justify-between py-1"
          >
            <span className="text-sm text-muted">
              {theme === "dark" ? "Modo oscuro" : "Modo claro"}
            </span>
            <span
              className={`relative inline-flex h-6 w-11 items-center rounded-full border border-line-strong transition-colors ${
                theme === "light" ? "bg-accent" : "bg-surface-2"
              }`}
            >
              <span
                className="inline-block h-5 w-5 rounded-full bg-surface shadow transition-transform"
                style={{
                  transform: theme === "light" ? "translateX(22px)" : "translateX(2px)",
                }}
              />
            </span>
          </button>
          <a
            href="tel:+000000000"
            className="flex items-center gap-2 text-sm text-muted hover:text-text"
            onClick={close}
          >
            <Phone size={15} strokeWidth={1.75} />
            +00 000 000 000
          </a>
          <SectionLink
            href="#contact"
            onClick={close}
            className="rounded-full bg-accent px-5 py-3 text-center text-sm font-medium text-bg"
          >
            Get in Touch
          </SectionLink>
        </div>
      </div>
    </>
  );
}

/**
 * Renders a plain anchor on Home (unchanged smooth-scroll behavior) or a
 * React Router Link to "/#section" on any other route, so section links keep
 * working from the vehicle detail page.
 */
function SectionLink({
  href,
  className,
  onClick,
  style,
  children,
}: {
  href: string;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();
  return pathname === "/" ? (
    <a href={href} className={className} onClick={onClick} style={style}>
      {children}
    </a>
  ) : (
    <Link to={`/${href}`} className={className} onClick={onClick} style={style}>
      {children}
    </Link>
  );
}
