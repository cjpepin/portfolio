import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { MOBILE_VIEWPORT_QUERY, matchesMediaQuery, useMediaQuery } from "../../lib/useMediaQuery";

export type ViewMode = "interactive" | "readable";

const STORAGE_KEY = "portfolio-view-mode";

function resolveViewMode(stored: string | null): ViewMode {
  if (matchesMediaQuery(MOBILE_VIEWPORT_QUERY)) return "readable";
  if (stored === "readable" || stored === "interactive") return stored;
  return "interactive";
}

function readStoredMode(): ViewMode {
  if (typeof window === "undefined") return "interactive";
  return resolveViewMode(window.localStorage.getItem(STORAGE_KEY));
}

type ViewModeContextValue = {
  mode: ViewMode;
  isReadable: boolean;
  isMobile: boolean;
  canUseInteractive: boolean;
  setMode: (mode: ViewMode) => void;
  toggleMode: () => void;
};

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const isMobile = useMediaQuery(MOBILE_VIEWPORT_QUERY);
  const [mode, setModeState] = useState<ViewMode>(readStoredMode);

  const setMode = useCallback((next: ViewMode) => {
    if (matchesMediaQuery(MOBILE_VIEWPORT_QUERY) && next === "interactive") return;
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleMode = useCallback(() => {
    if (matchesMediaQuery(MOBILE_VIEWPORT_QUERY)) return;
    setModeState((current) => {
      const next = current === "readable" ? "interactive" : "readable";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setModeState(resolveViewMode(event.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({
      mode: isMobile ? "readable" : mode,
      isReadable: isMobile || mode === "readable",
      isMobile,
      canUseInteractive: !isMobile,
      setMode,
      toggleMode,
    }),
    [isMobile, mode, setMode, toggleMode],
  );

  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
}

export function useViewMode(): ViewModeContextValue {
  const ctx = useContext(ViewModeContext);
  if (!ctx) {
    throw new Error("useViewMode must be used within ViewModeProvider");
  }
  return ctx;
}
