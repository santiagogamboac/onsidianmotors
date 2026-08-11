import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Manages scroll position across React Router navigations.
 *
 * - No hash: jumps to the top of the page. Without this, navigating from a
 *   scrolled-down Home (e.g. the Fleet section) to /fleet/:id would keep the
 *   old scroll offset and land the user mid-page, below the fold.
 * - With a hash: smooth-scrolls to the matching element, since React Router
 *   doesn't auto-scroll to hash targets the way a full page navigation does —
 *   used when a Link like "/#pricing" lands on Home.
 */
export function useScrollBehavior() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, [pathname, hash]);
}
