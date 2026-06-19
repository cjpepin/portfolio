import { profile } from "../../data/profile";
import { targetHash } from "../../lib/portfolioNavigation";
import { usePortfolioNavigation } from "./PortfolioNavigationContext";

export function ApiServerStats() {
  const { scrollToTarget } = usePortfolioNavigation();

  return (
    <section className="swagger-panel mb-4 overflow-hidden" aria-label="Server metrics">
      <div className="flex items-center justify-between gap-2 border-b border-swagger-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="method-badge bg-swagger-get">GET</span>
          <code className="font-mono text-xs text-swagger-text">/api/v1/metrics</code>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wide text-swagger-muted">
          read-only
        </span>
      </div>
      <div className="divide-y divide-swagger-border/60">
        {profile.metrics.map((metric) => {
          const content = (
            <>
              <span className="font-mono text-xl font-semibold text-swagger-get">{metric.value}</span>
              <span className="text-sm text-swagger-text">{metric.label}</span>
              <span className="font-mono text-[10px] uppercase tracking-wide text-swagger-muted group-hover:text-swagger-text">
                {metric.context}
              </span>
            </>
          );

          if (!("target" in metric)) {
            return (
              <div
                key={metric.id}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3"
              >
                {content}
              </div>
            );
          }

          return (
            <a
              key={metric.id}
              href={targetHash(metric.target)}
              onClick={(event) => {
                event.preventDefault();
                scrollToTarget(metric.target);
              }}
              className="group flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3 transition-colors duration-200 hover:bg-swagger-bg/50"
            >
              {content}
            </a>
          );
        })}
      </div>
    </section>
  );
}
