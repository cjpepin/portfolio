import { useEffect, useState } from "react";

/** Matches Tailwind `md` — mobile is below 768px. */
export const MOBILE_VIEWPORT_QUERY = "(max-width: 767px)";

/** Wide enough for side-by-side API docs + preview panel. */
export const WIDE_PREVIEW_LAYOUT_QUERY = "(min-width: 1280px)";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export function matchesMediaQuery(query: string): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(query).matches;
}
