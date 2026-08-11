import { useEffect, useRef, useState } from "react";

/**
 * Tracks how far the user has scrolled through a pinned section.
 * Returns a progress value from 0 to 1.
 *
 * The section stays "pinned" (position: sticky) via CSS — this hook
 * computes the normalised progress so the inner track can be translated
 * horizontally by the parent component.
 */
export function useScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Only wire up on desktop (≥ 900 px) — mobile uses a regular layout
    const mq = window.matchMedia("(min-width: 900px)");
    if (!mq.matches) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const sectionHeight = el.offsetHeight - window.innerHeight;
      if (sectionHeight <= 0) return;

      // How far the top of the section has scrolled past the viewport top
      const scrolled = -rect.top;
      const p = Math.min(Math.max(scrolled / sectionHeight, 0), 1);
      setProgress(p);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // seed on mount

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { ref, progress };
}
