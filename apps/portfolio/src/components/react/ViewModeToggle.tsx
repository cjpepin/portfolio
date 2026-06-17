import { useViewMode } from "./ViewModeContext";

export function ViewModeToggle() {
  const { mode, toggleMode, canUseInteractive } = useViewMode();

  if (!canUseInteractive) return null;

  return (
    <button
      type="button"
      onClick={toggleMode}
      className="inline-flex items-center gap-1.5 rounded border border-swagger-border bg-swagger-panel px-2.5 py-1.5 font-mono text-xs text-swagger-muted transition-all duration-200 hover:border-swagger-get hover:text-swagger-get"
      aria-pressed={mode === "readable"}
      aria-label={mode === "readable" ? "Switch to interactive API mode" : "Switch to readable mode"}
      title={mode === "readable" ? "Interactive mode" : "Readable mode"}
    >
      <span className="text-[10px] uppercase tracking-wide text-swagger-muted">View</span>
      <span className="text-swagger-text">{mode === "readable" ? "Readable" : "Interactive"}</span>
    </button>
  );
}
