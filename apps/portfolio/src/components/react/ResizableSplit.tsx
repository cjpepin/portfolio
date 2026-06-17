import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useMediaQuery, WIDE_PREVIEW_LAYOUT_QUERY } from "../../lib/useMediaQuery";

const STORAGE_KEY = "portfolio-preview-width-pct";
const DEFAULT_RIGHT_PCT = 38;
const MIN_RIGHT_PCT = 22;
const MAX_RIGHT_PCT = 58;

function readStoredWidth(): number {
  if (typeof window === "undefined") return DEFAULT_RIGHT_PCT;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? Number.parseFloat(raw) : Number.NaN;
  if (Number.isNaN(parsed)) return DEFAULT_RIGHT_PCT;
  return Math.min(MAX_RIGHT_PCT, Math.max(MIN_RIGHT_PCT, parsed));
}

type Props = {
  left: ReactNode;
  right: ReactNode;
};

export function ResizableSplit({ left, right }: Props) {
  const [rightPct, setRightPct] = useState(readStoredWidth);
  const rightPctRef = useRef(rightPct);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const isWide = useMediaQuery(WIDE_PREVIEW_LAYOUT_QUERY);

  rightPctRef.current = rightPct;

  const persistWidth = useCallback((pct: number) => {
    window.localStorage.setItem(STORAGE_KEY, String(pct));
  }, []);

  const updateFromPointer = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const nextRight = ((rect.right - clientX) / rect.width) * 100;
    const clamped = Math.min(MAX_RIGHT_PCT, Math.max(MIN_RIGHT_PCT, nextRight));
    setRightPct(clamped);
  }, []);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (!draggingRef.current) return;
      event.preventDefault();
      updateFromPointer(event.clientX);
    };

    const onPointerUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.classList.remove("is-resizing");
      persistWidth(rightPctRef.current);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [persistWidth, updateFromPointer]);

  const onHandlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isWide) return;
    event.preventDefault();
    draggingRef.current = true;
    document.body.classList.add("is-resizing");
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onHandleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isWide) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setRightPct((pct) => {
        const next = Math.max(MIN_RIGHT_PCT, pct - 2);
        persistWidth(next);
        return next;
      });
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setRightPct((pct) => {
        const next = Math.min(MAX_RIGHT_PCT, pct + 2);
        persistWidth(next);
        return next;
      });
    }
  };

  if (!isWide) {
    return <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{left}</div>;
  }

  return (
    <div ref={containerRef} className="flex min-h-0 min-w-0 flex-1">
      <div className="min-h-0 min-w-0 shrink-0 overflow-y-auto" style={{ width: `${100 - rightPct}%` }}>
        {left}
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={Math.round(rightPct)}
        aria-valuemin={MIN_RIGHT_PCT}
        aria-valuemax={MAX_RIGHT_PCT}
        aria-label="Resize preview panel"
        tabIndex={0}
        onPointerDown={onHandlePointerDown}
        onKeyDown={onHandleKeyDown}
        className="group relative z-10 w-2 shrink-0 cursor-col-resize touch-none bg-swagger-border/40 transition-colors duration-200 hover:bg-swagger-get/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-swagger-get"
      >
        <span className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-swagger-border group-hover:bg-swagger-get/70" />
      </div>

      <div className="shrink-0" style={{ width: `${rightPct}%` }}>
        <div className="sticky top-14 h-[calc(100vh-3.5rem)]">{right}</div>
      </div>
    </div>
  );
}
