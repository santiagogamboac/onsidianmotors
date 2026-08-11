import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Smooth-scrolls to the element matching the current URL hash. Needed because
 * React Router doesn't auto-scroll to hash targets the way a full page
 * navigation does — used when a Link like "/#pricing" lands on Home.
 */
export function useHashScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, [pathname, hash]);
}
