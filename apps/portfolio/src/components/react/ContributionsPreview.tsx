import type { ContributionData } from "./contributionsResponse";
import { portfolioItemId, scrollAnchorClass } from "../../lib/portfolioNavigation";

const caseStudyLinks: Record<string, string> = {
  "crosswalk-sync": "/case-studies/crosswalk",
};

export function ContributionsPreview({ data }: { data: ContributionData }) {
  const deepDiveHref = caseStudyLinks[data.id];

  return (
    <article
      id={portfolioItemId("systems", data.id)}
      className={`swagger-panel overflow-hidden bg-gradient-to-br from-swagger-put/10 to-swagger-get/5 animate-fade-in ${scrollAnchorClass}`}
    >
      <div className="border-b border-swagger-border px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-swagger-text">{data.title}</h2>
            <p className="text-sm text-swagger-get">{data.subtitle}</p>
          </div>
          <span className="rounded bg-swagger-code px-2 py-0.5 font-mono text-xs uppercase text-swagger-muted">
            {data.tag}
          </span>
        </div>
        <p className="mt-1 font-mono text-xs text-swagger-muted">{data.period}</p>
      </div>
      <div className="space-y-4 px-4 py-4">
        <p className="text-sm text-swagger-muted">{data.description}</p>
        {data.operations && data.operations.length > 0 && (
          <div className="space-y-3">
            {data.operations.map((op) => (
              <div key={op.id} className="rounded border border-swagger-border bg-swagger-bg/60 p-3">
                <p className="text-sm font-medium text-swagger-text">{op.summary}</p>
                {op.stack && op.stack.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {op.stack.map((tag) => (
                      <span key={tag} className="rounded bg-swagger-code px-2 py-0.5 font-mono text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {deepDiveHref && (
          <a
            href={deepDiveHref}
            className="inline-flex rounded border border-swagger-border px-3 py-1.5 font-mono text-sm transition-colors duration-200 hover:border-swagger-get hover:text-swagger-get"
          >
            Deep dive
          </a>
        )}
      </div>
    </article>
  );
}
