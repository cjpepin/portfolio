import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ViewMode = "interactive" | "readable";

const STORAGE_KEY = "portfolio-view-mode";

function readStoredMode(): ViewMode {
  if (typeof window === "undefined") return "interactive";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "readable" ? "readable" : "interactive";
}

type ViewModeContextValue = {
  mode: ViewMode;
  isReadable: boolean;
  setMode: (mode: ViewMode) => void;
  toggleMode: () => void;
};

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>(readStoredMode);

  const setMode = useCallback((next: ViewMode) => {
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "readable" ? "interactive" : "readable");
  }, [mode, setMode]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setModeState(event.newValue === "readable" ? "readable" : "interactive");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      isReadable: mode === "readable",
      setMode,
      toggleMode,
    }),
    [mode, setMode, toggleMode],
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
