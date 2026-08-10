import { forFunProjects, getGlobalDebtAppUrl } from "../../data/forFunProjects";
import { portfolioItemId, scrollAnchorClass } from "../../lib/portfolioNavigation";

function projectOpenUrl(projectId: string, fallback: string): string {
  if (projectId === "global-debt") {
    return getGlobalDebtAppUrl();
  }
  return fallback;
}

export function ForFunProjectsBlock() {
  return (
    <div className="space-y-3 pt-6">
      <div className="border-t border-swagger-border/60 pt-6">
        <h3 className="font-mono text-xs uppercase tracking-wide text-swagger-muted">For fun</h3>
        <p className="mt-1 text-sm text-swagger-muted">
          Side experiments — less polish, still playable.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {forFunProjects.map((project) => (
          <article
            key={project.id}
            id={portfolioItemId("projects", project.id)}
            className={`swagger-panel overflow-hidden bg-gradient-to-br ${project.accent} ${scrollAnchorClass}`}
          >
            <div className="border-b border-swagger-border px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-base font-semibold">{project.name}</h4>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="rounded bg-swagger-post/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-swagger-muted">
                    for fun
                  </span>
                  <span className="rounded bg-swagger-code px-2 py-0.5 font-mono text-xs uppercase text-swagger-muted">
                    {project.type}
                  </span>
                </div>
              </div>
              <p className="text-sm text-swagger-get">{project.tagline}</p>
            </div>
            <div className="space-y-3 px-4 py-3">
              <p className="text-sm leading-relaxed text-swagger-muted">{project.description}</p>
              {project.stack.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.map((item) => (
                    <span key={item} className="rounded bg-swagger-code px-2 py-0.5 font-mono text-[10px]">
                      {item}
                    </span>
                  ))}
                </div>
              )}
              <a
                href={projectOpenUrl(project.id, project.links.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="api-execute-btn inline-flex bg-swagger-post text-sm"
              >
                Open app
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
