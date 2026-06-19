import { getCaseStudyBySlug } from "../../data/caseStudies";
import { profile } from "../../data/profile";
import { targetHash } from "../../lib/portfolioNavigation";
import { usePortfolioNavigation } from "./PortfolioNavigationContext";

const crosswalkStudy = getCaseStudyBySlug("crosswalk");
const caralyst = profile.projects.find((project) => project.id === "caralyst");

const showcaseLinks = [
  {
    id: "lingoleaf-showcase",
    method: "GET" as const,
    path: "/lingoleaf/#showcase",
    summary: "LingoLeaf product showcase — video, engineering story, guided demo",
    href: "/lingoleaf/#showcase",
    external: false,
  },
  {
    id: "trellis-showcase",
    method: "GET" as const,
    path: "/trellis#showcase",
    summary: "Trellis desktop app showcase — chat, notes, knowledge graph",
    href: "/trellis#showcase",
    external: false,
  },
];

const deepLinks = [
  crosswalkStudy && {
    id: "crosswalk",
    method: "GET" as const,
    path: `/case-studies/${crosswalkStudy.slug}`,
    summary: crosswalkStudy.subtitle,
    href: `/case-studies/${crosswalkStudy.slug}`,
    external: false,
  },
  caralyst && {
    id: "caralyst",
    method: "GET" as const,
    path: "/api/v1/projects/caralyst",
    summary: `${caralyst.tagline} — scroll to project`,
    href: targetHash({ section: "projects", itemId: "caralyst" }),
    external: false,
    onNavigate: { section: "projects" as const, itemId: "caralyst" },
  },
  {
    id: "contact",
    method: "POST" as const,
    path: "/api/contact",
    summary: "Send a message for FTE or contract opportunities",
    href: "#contact",
    external: false,
    onNavigate: { section: "contact" as const },
  },
].filter((item): item is NonNullable<typeof item> => Boolean(item));

function MethodBadge({ method }: { method: "GET" | "POST" }) {
  return (
    <span className={`method-badge shrink-0 ${method === "GET" ? "bg-swagger-get" : "bg-swagger-post"}`}>
      {method}
    </span>
  );
}

function QuickLinkRow({
  method,
  path,
  summary,
  href,
  external,
  onClick,
}: {
  method: "GET" | "POST";
  path: string;
  summary: string;
  href: string;
  external?: boolean;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={onClick}
      className="group flex items-start gap-3 px-4 py-3 transition-colors duration-200 hover:bg-swagger-bg/50"
    >
      <MethodBadge method={method} />
      <div className="min-w-0 flex-1">
        <code className="font-mono text-xs text-swagger-text group-hover:text-swagger-get">{path}</code>
        <p className="mt-0.5 text-xs text-swagger-muted">{summary}</p>
      </div>
      <span className="shrink-0 font-mono text-xs text-swagger-muted group-hover:text-swagger-get">→</span>
    </a>
  );
}

export function ApiQuickLinks() {
  const { scrollToTarget } = usePortfolioNavigation();

  return (
    <section className="swagger-panel mb-4 overflow-hidden" aria-label="Related operations">
      <div className="border-b border-swagger-border px-4 py-2.5">
        <span className="font-mono text-xs uppercase tracking-wide text-swagger-muted">
          related operations
        </span>
      </div>
      <div className="divide-y divide-swagger-border/60">
        {showcaseLinks.map((link) => (
          <QuickLinkRow key={link.id} {...link} />
        ))}
      </div>
      <div className="border-t border-swagger-border">
        <p className="border-b border-swagger-border/60 px-4 py-2 font-mono text-[10px] uppercase tracking-wide text-swagger-muted">
          deep links
        </p>
        <div className="divide-y divide-swagger-border/60">
          {deepLinks.map((link) => (
            <QuickLinkRow
              key={link.id}
              method={link.method}
              path={link.path}
              summary={link.summary}
              href={link.href}
              external={link.external}
              onClick={
                link.onNavigate
                  ? (event) => {
                      event.preventDefault();
                      scrollToTarget(link.onNavigate!);
                    }
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
