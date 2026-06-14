import { profile } from "../../data/profile";

type Project = (typeof profile.projects)[number];

function projectLinks(links: Project["links"]) {
  return links as { demo?: string | boolean; appStore?: string; github?: string; website?: string };
}

export function ProjectGallery({ projects }: { projects: readonly Project[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {projects.map((project) => {
        const links = projectLinks(project.links);
        return (
        <article
          key={project.id}
          className={`swagger-panel overflow-hidden bg-gradient-to-br ${project.accent}`}
        >
          <div className="border-b border-swagger-border px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{project.name}</h2>
              <span className="rounded bg-swagger-code px-2 py-0.5 font-mono text-xs uppercase text-swagger-muted">
                {project.type}
              </span>
            </div>
            <p className="text-sm text-swagger-get">{project.tagline}</p>
            <p className="mt-1 font-mono text-xs text-swagger-muted">{project.period}</p>
          </div>
          <div className="space-y-4 px-4 py-4">
            <p className="text-sm text-swagger-muted">{project.description}</p>
            <ul className="space-y-1 text-sm">
              {project.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <span key={s} className="rounded bg-swagger-code px-2 py-0.5 font-mono text-xs">
                  {s}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              {typeof links.demo === "string" && links.demo && (
                <a
                  href={links.demo}
                  className="rounded bg-swagger-get px-3 py-1.5 font-mono text-sm font-semibold text-white hover:opacity-90"
                >
                  Live demo
                </a>
              )}
              {links.appStore && (
                <a
                  href={links.appStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-swagger-border px-3 py-1.5 font-mono text-sm hover:border-swagger-get hover:text-swagger-get"
                >
                  App Store
                </a>
              )}
              {links.github && (
                <a
                  href={links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-swagger-border px-3 py-1.5 font-mono text-sm hover:border-swagger-get hover:text-swagger-get"
                >
                  GitHub
                </a>
              )}
              {links.website && (
                <a
                  href={links.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-swagger-border px-3 py-1.5 font-mono text-sm hover:border-swagger-get hover:text-swagger-get"
                >
                  Website
                </a>
              )}
            </div>
          </div>
        </article>
        );
      })}
    </div>
  );
}
