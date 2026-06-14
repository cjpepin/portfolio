import { useEffect, useRef, useState } from "react";
import { useTheme } from "./useTheme";

let mermaidModule: typeof import("mermaid").default | null = null;

async function loadMermaid() {
  if (!mermaidModule) {
    const mod = await import("mermaid");
    mermaidModule = mod.default;
  }
  return mermaidModule;
}

function normalizeChart(chart: string): string {
  return chart
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
}

type Props = {
  chart: string;
};

export function MermaidDiagram({ chart }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderCountRef = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    const normalized = normalizeChart(chart);
    const renderId = `mermaid-${renderCountRef.current++}`;

    container.innerHTML = "";

    void (async () => {
      try {
        const mermaid = await loadMermaid();
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === "dark" ? "dark" : "neutral",
          securityLevel: "strict",
          useMaxWidth: true,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          themeVariables: {
            fontSize: "14px",
          },
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: "basis",
            padding: 12,
            nodeSpacing: 36,
            rankSpacing: 40,
          },
        });

        const { svg, bindFunctions } = await mermaid.render(renderId, normalized);
        if (cancelled) return;

        container.innerHTML = svg;
        const svgEl = container.querySelector("svg");
        if (svgEl) {
          svgEl.setAttribute("role", "img");
        }
        bindFunctions?.(container);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to render diagram");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, theme]);

  if (error) {
    return (
      <div className="space-y-2 p-4">
        <p className="text-sm text-swagger-delete">Could not render diagram: {error}</p>
        <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-swagger-muted">
          {normalizeChart(chart)}
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-diagram flex min-h-[10rem] items-center justify-center p-4 [&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-full"
      aria-label="Architecture flow diagram"
    />
  );
}
