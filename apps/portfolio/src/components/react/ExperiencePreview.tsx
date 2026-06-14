import type { ExperienceData } from "./experienceResponse";
import { portfolioItemId, scrollAnchorClass } from "../../lib/portfolioNavigation";

export function ExperiencePreview({ data }: { data: ExperienceData }) {
  return (
    <article
      id={portfolioItemId("experience", data.id)}
      className={`swagger-panel overflow-hidden bg-gradient-to-br from-swagger-get/10 to-swagger-post/5 animate-fade-in ${scrollAnchorClass}`}
    >
      <div className="border-b border-swagger-border px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-swagger-text">{data.title}</h2>
            <p className="text-sm text-swagger-get">{data.company}</p>
          </div>
          <span className="rounded bg-swagger-code px-2 py-0.5 font-mono text-xs text-swagger-muted">
            {data.location}
          </span>
        </div>
        <p className="mt-1 font-mono text-xs text-swagger-muted">{data.period}</p>
      </div>
      <div className="space-y-4 px-4 py-4">
        <p className="text-sm text-swagger-muted">{data.summary}</p>
        {data.responsibilities && data.responsibilities.length > 0 && (
          <ul className="space-y-1 text-sm">
            {data.responsibilities.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        )}
        {data.stack && data.stack.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.stack.map((tag) => (
              <span key={tag} className="rounded bg-swagger-code px-2 py-0.5 font-mono text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
