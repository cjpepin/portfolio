import { getCaseStudyBySlug } from "../../data/caseStudies";
import { profile } from "../../data/profile";
import { targetHash } from "../../lib/portfolioNavigation";
import { usePortfolioNavigation } from "./PortfolioNavigationContext";
import { SocialLinks } from "./SocialLinks";

type Props = {
  onContact?: () => void;
};

const crosswalkStudy = getCaseStudyBySlug("crosswalk");
const caralyst = profile.projects.find((project) => project.id === "caralyst");

const featuredWork = [
  crosswalkStudy && {
    id: "crosswalk",
    title: crosswalkStudy.title,
    teaser: "Contract MVP with hybrid local/cloud sync — architecture write-up",
    href: `/case-studies/${crosswalkStudy.slug}`,
    cta: "Read case study",
  },
  caralyst && {
    id: "caralyst",
    title: caralyst.name,
    teaser: "Greenfield full-stack app that secured a $100K WashU School of Medicine deal",
    href: caralyst.links.website ?? "#projects",
    cta: "See the product",
    external: typeof caralyst.links.website === "string" && caralyst.links.website.startsWith("http"),
  },
].filter((item): item is NonNullable<typeof item> => Boolean(item));

export function HeroStrip({ onContact }: Props) {
  const { scrollToTarget } = usePortfolioNavigation();

  return (
    <section
      className="swagger-panel mb-6 overflow-hidden bg-gradient-to-br from-swagger-get/15 via-swagger-panel to-swagger-post/10 animate-fade-in"
      aria-label="Introduction"
    >
      <div className="space-y-6 px-5 py-6 md:px-8 md:py-8">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold leading-tight text-swagger-text md:text-3xl">
            {profile.positioning.headline}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-swagger-muted md:text-base">
            {profile.positioning.subheadline}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {profile.metrics.map((metric) => (
            <a
              key={metric.id}
              href={targetHash(metric.target)}
              onClick={(event) => {
                event.preventDefault();
                scrollToTarget(metric.target);
              }}
              className="group rounded-lg border border-swagger-border/80 bg-swagger-bg/50 px-4 py-3 transition-colors duration-200 hover:border-swagger-get/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-swagger-get"
            >
              <p className="font-mono text-2xl font-semibold text-swagger-get">{metric.value}</p>
              <p className="mt-1 text-sm text-swagger-text">{metric.label}</p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-swagger-muted group-hover:text-swagger-text">
                {metric.context}
              </p>
            </a>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a href="/lingoleaf/#showcase" className="api-execute-btn bg-swagger-get">
            LingoLeaf showcase
          </a>
          <a href="/trellis#showcase" className="api-execute-btn bg-swagger-get">
            Trellis showcase
          </a>
          {onContact ? (
            <button type="button" onClick={onContact} className="api-execute-btn bg-swagger-post">
              Contact
            </button>
          ) : (
            <a href="#contact" className="api-execute-btn bg-swagger-post">
              Contact
            </a>
          )}
          <SocialLinks />
        </div>

        <div className="border-t border-swagger-border/60 pt-4">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-wide text-swagger-muted">
            Featured work
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {featuredWork.map((item) => (
              <a
                key={item.id}
                href={item.href}
                target={"external" in item && item.external ? "_blank" : undefined}
                rel={"external" in item && item.external ? "noopener noreferrer" : undefined}
                className="group rounded-lg border border-swagger-border bg-swagger-bg/50 p-4 transition-colors duration-200 hover:border-swagger-get/50"
              >
                <h3 className="font-medium text-swagger-text group-hover:text-swagger-get">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-swagger-muted">{item.teaser}</p>
                <span className="mt-3 inline-block font-mono text-xs text-swagger-get">
                  {item.cta} →
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
