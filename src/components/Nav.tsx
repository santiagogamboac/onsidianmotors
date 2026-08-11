import { useEffect, useRef, useState } from "react";
import { Menu, Phone, X } from "lucide-react";

const LINKS = [
  { href: "#fleet", label: "Fleet" },
  { href: "#how", label: "How it works" },
  { href: "#experience", label: "Experience" },
  { href: "#reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || open
            ? "bg-bg/90 backdrop-blur-md border-b border-line"
            : "bg-linear-to-b from-black/60 to-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          {/* Logo */}
          <a href="#" className="font-display text-lg tracking-[0.08em]">
            OBSIDIAN <span className="text-accent">MOTORS</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-muted transition-colors hover:text-text"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <a
              href="tel:+000000000"
              className="flex items-center gap-2 text-sm text-muted hover:text-text"
            >
              <Phone size={15} strokeWidth={1.75} />
              +00 000 000 000
            </a>
            <a
              href="#contact"
              className="rounded-full border border-accent/60 px-5 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-bg"
            >
              Get in Touch
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-drawer"
            className="lg:hidden flex h-9 w-9 items-center justify-center text-text"
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
        <nav className="flex flex-col px-6 py-8 gap-1">
          {LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={close}
              className="flex items-center rounded-xl px-4 py-3.5 text-base text-muted transition-colors hover:bg-surface hover:text-text"
              style={{
                transitionDelay: open ? `${i * 40}ms` : "0ms",
                opacity: open ? 1 : 0,
                transform: open ? "translateX(0)" : "translateX(-12px)",
                transition: "opacity 0.3s ease, transform 0.3s ease, background-color 0.15s",
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="px-6 pb-8 pt-2 border-t border-line flex flex-col gap-3">
          <a
            href="tel:+000000000"
            className="flex items-center gap-2 text-sm text-muted hover:text-text"
            onClick={close}
          >
            <Phone size={15} strokeWidth={1.75} />
            +00 000 000 000
          </a>
          <a
            href="#contact"
            onClick={close}
            className="rounded-full bg-accent px-5 py-3 text-center text-sm font-medium text-bg"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </>
  );
}
