import { profile } from "../../data/profile";
import { type SectionId } from "../../lib/portfolioNavigation";
import { usePortfolioNavigation } from "./PortfolioNavigationContext";

type HttpMethod = "GET" | "POST";

type CatalogEndpoint = {
  method: HttpMethod;
  path: string;
  summary: string;
  target: { section: SectionId; itemId?: string };
};

const schemaKeys = ["languages", "frameworks", "data", "platform", "practices", "education"] as const;

function buildCatalog(): { tag: string; label: string; endpoints: CatalogEndpoint[] }[] {
  const navById = Object.fromEntries(profile.navigation.map((item) => [item.id, item]));

  return [
    {
      tag: navById.overview?.tag ?? "info",
      label: navById.overview?.label ?? "Overview",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/developer",
          summary: "Retrieve developer profile and contact metadata",
          target: { section: "overview" },
        },
        {
          method: "GET",
          path: "/api/v1/metrics",
          summary: "Read-only server metrics and highlights",
          target: { section: "overview" },
        },
        ...schemaKeys.map((schema) => ({
          method: "GET" as const,
          path: `/components/schemas/${schema}`,
          summary: `Schema definition for ${schema}`,
          target: { section: "overview" as const, itemId: `schema-${schema}` },
        })),
      ],
    },
    {
      tag: navById.experience?.tag ?? "paths",
      label: navById.experience?.label ?? "Experience",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/experience",
          summary: "List all employment records",
          target: { section: "experience" },
        },
        ...profile.experience.map((role) => ({
          method: "GET" as const,
          path: `/api/v1/experience/${role.id}`,
          summary: `${role.title} at ${role.company}`,
          target: { section: "experience" as const, itemId: role.id },
        })),
      ],
    },
    {
      tag: navById.projects?.tag ?? "gallery",
      label: navById.projects?.label ?? "Projects",
      endpoints: profile.projects.map((project) => ({
        method: "GET" as const,
        path: project.path,
        summary: `${project.name} — ${project.tagline}`,
        target: { section: "projects" as const, itemId: project.id },
      })),
    },
    {
      tag: navById.resume?.tag ?? "document",
      label: navById.resume?.label ?? "Resume",
      endpoints: [
        {
          method: "GET",
          path: "/api/v1/resume",
          summary: "Resume PDF metadata",
          target: { section: "resume" },
        },
      ],
    },
    {
      tag: navById.contact?.tag ?? "post",
      label: navById.contact?.label ?? "Contact",
      endpoints: [
        {
          method: "POST",
          path: "/api/contact",
          summary: "Send a message via the contact endpoint",
          target: { section: "contact" },
        },
      ],
    },
  ];
}

const catalogGroups = buildCatalog();

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span className={`method-badge shrink-0 ${method === "GET" ? "bg-swagger-get" : "bg-swagger-post"}`}>
      {method}
    </span>
  );
}

export function ApiEndpointCatalog() {
  const { scrollToTarget } = usePortfolioNavigation();

  return (
    <section className="swagger-panel mb-4 overflow-hidden" aria-label="Endpoint catalog">
      <div className="border-b border-swagger-border px-4 py-2.5">
        <span className="font-mono text-xs uppercase tracking-wide text-swagger-muted">
          endpoint catalog
        </span>
        <p className="mt-1 text-xs text-swagger-muted">
          Start with Projects → LingoLeaf for shipped work, or execute any operation below.
        </p>
      </div>
      <div className="divide-y divide-swagger-border">
        {catalogGroups.map((group) => (
          <div key={group.tag}>
            <div className="flex items-center gap-2 border-b border-swagger-border/60 bg-swagger-bg/30 px-4 py-2">
              <span className="rounded bg-swagger-code px-1.5 py-0.5 font-mono text-[10px] uppercase text-swagger-get">
                {group.tag}
              </span>
              <span className="text-sm font-medium text-swagger-text">{group.label}</span>
              <span className="font-mono text-[10px] text-swagger-muted">
                {group.endpoints.length} operations
              </span>
            </div>
            <ul>
              {group.endpoints.map((endpoint) => (
                <li key={endpoint.path}>
                  <button
                    type="button"
                    onClick={() => scrollToTarget(endpoint.target)}
                    className="group flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors duration-200 hover:bg-swagger-bg/50"
                  >
                    <MethodBadge method={endpoint.method} />
                    <div className="min-w-0 flex-1">
                      <code className="font-mono text-xs text-swagger-text group-hover:text-swagger-get">
                        {endpoint.path}
                      </code>
                      <p className="mt-0.5 text-xs text-swagger-muted">{endpoint.summary}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
