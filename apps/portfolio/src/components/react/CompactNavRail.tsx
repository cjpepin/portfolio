import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { profile } from "../../data/profile";

type NavItem = (typeof profile.navigation)[number];
type SectionId = NavItem["id"];

type Props = {
  activeId: SectionId;
  onNavigate: (id: SectionId) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
};

const showcaseLinks = [
  { id: "lingoleaf", href: "/lingoleaf/#showcase", label: "LingoLeaf demo" },
  { id: "trellis", href: "/trellis#showcase", label: "Trellis demo" },
] as const;

function collapsedLabel(label: string): string {
  return label.slice(0, 3);
}

function TooltipContent({ label }: { label: string }) {
  return (
    <div className="whitespace-nowrap rounded border border-swagger-border bg-swagger-panel px-2.5 py-1.5 text-sm font-medium text-swagger-text shadow-lg">
      {label}
    </div>
  );
}

function RailTooltip({
  enabled,
  label,
  children,
}: {
  enabled: boolean;
  label: string;
  children: ReactNode;
}) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const show = useCallback(() => {
    if (!enabled || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPosition({ top: rect.top + rect.height / 2, left: rect.right + 8 });
    setMounted(true);
  }, [enabled]);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [mounted]);

  useEffect(() => {
    if (visible || !mounted) return;
    const timeout = window.setTimeout(() => setMounted(false), 150);
    return () => window.clearTimeout(timeout);
  }, [visible, mounted]);

  useEffect(() => {
    if (!visible) return;
    const onScroll = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({ top: rect.top + rect.height / 2, left: rect.right + 8 });
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [visible]);

  return (
    <>
      <div
        ref={anchorRef}
        className="w-full"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </div>
      {enabled &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="tooltip"
            className={`pointer-events-none fixed z-50 -translate-y-1/2 transition-all duration-150 ease-out ${
              visible ? "translate-x-0 opacity-100" : "translate-x-1 opacity-0"
            }`}
            style={{ top: position.top, left: position.left }}
          >
            <TooltipContent label={label} />
          </div>,
          document.body,
        )}
    </>
  );
}

export function CompactNavRail({ activeId, onNavigate, expanded, onExpandedChange }: Props) {
  return (
    <aside
      className={`fixed bottom-0 left-0 top-14 z-20 hidden overflow-hidden border-r border-swagger-border bg-swagger-bg/95 transition-[width] duration-200 ease-out md:block ${
        expanded ? "w-44" : "w-11"
      }`}
    >
      <nav
        className={`flex h-full min-w-0 flex-col gap-2 overflow-y-auto overflow-x-hidden pt-2 ${
          expanded ? "px-2 pb-2" : "items-center px-1 pb-2"
        }`}
        aria-label="Site sections"
      >
        <button
          type="button"
          onClick={() => onExpandedChange(!expanded)}
          className={`flex shrink-0 items-center rounded border border-swagger-border text-swagger-muted transition-colors duration-200 hover:border-swagger-get/50 hover:text-swagger-get ${
            expanded ? "w-full justify-center gap-2 px-3 py-1.5 text-xs" : "h-8 w-8 justify-center"
          }`}
          aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
          aria-expanded={expanded}
          title={expanded ? "Collapse navigation" : "Expand navigation"}
        >
          <span
            className={`font-mono text-sm leading-none transition-transform duration-200 ease-out ${
              expanded ? "rotate-0" : "rotate-180"
            }`}
            aria-hidden
          >
            ‹
          </span>
          {expanded}
        </button>

        <ul className={`min-w-0 space-y-0.5 ${expanded ? "w-full" : "flex w-full flex-col items-center"}`}>
          {profile.navigation.map((item) => {
            const active = activeId === item.id;
            const button = (
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative shrink-0 ${
                  expanded
                    ? `flex w-full items-center rounded px-3 py-2 text-left text-sm transition-colors duration-200 ${
                        active
                          ? "bg-swagger-code font-medium text-swagger-get"
                          : "text-swagger-muted hover:bg-swagger-panel hover:text-swagger-text"
                      }`
                    : `flex h-9 w-9 items-center justify-center rounded font-mono text-[10px] font-medium uppercase tracking-tight transition-colors duration-200 ${
                        active
                          ? "bg-swagger-code text-swagger-get shadow-sm"
                          : "text-swagger-muted hover:bg-swagger-panel hover:text-swagger-text"
                      }`
                }`}
                aria-current={active ? "true" : undefined}
                aria-label={expanded ? undefined : item.label}
              >
                {active && (
                  <span
                    className="absolute -left-px top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-swagger-get"
                    aria-hidden
                  />
                )}
                {expanded ? item.label : collapsedLabel(item.label)}
              </button>
            );

            return (
              <li key={item.id} className="min-w-0">
                <RailTooltip enabled={!expanded} label={item.label}>
                  {button}
                </RailTooltip>
              </li>
            );
          })}
        </ul>

        <div className="min-w-0 w-full shrink-0 border-t border-swagger-border pt-2">
          {expanded && (
            <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-wide text-swagger-muted">
              Live demos
            </p>
          )}
          <ul className={`space-y-0.5 ${expanded ? "w-full" : "flex w-full flex-col items-center"}`}>
            {showcaseLinks.map((link) => {
              const anchor = (
                <a
                  href={link.href}
                  className={`shrink-0 transition-colors duration-200 hover:bg-swagger-panel hover:text-swagger-get ${
                    expanded
                      ? "block w-full rounded px-3 py-2 text-sm text-swagger-muted"
                      : "flex h-9 w-9 items-center justify-center rounded font-mono text-[10px] font-medium uppercase text-swagger-muted"
                  }`}
                  aria-label={expanded ? undefined : link.label}
                >
                  {expanded ? link.label : collapsedLabel(link.label)}
                </a>
              );

              return (
                <li key={link.id} className="min-w-0">
                  <RailTooltip enabled={!expanded} label={link.label}>
                    {anchor}
                  </RailTooltip>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
