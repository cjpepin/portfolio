import { getCaseStudyBySlug } from "../../data/caseStudies";
import { ArchitectureSection } from "./ArchitectureSection";

type Props = {
  slug: string;
};

function BulletList({ items, title }: { items: readonly string[]; title: string }) {
  return (
    <section className="space-y-3">
      <h2 className="font-mono text-xs uppercase tracking-wide text-swagger-get">{title}</h2>
      <ul className="space-y-2 text-sm text-swagger-muted">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-swagger-get">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CaseStudyPage({ slug }: Props) {
  const study = getCaseStudyBySlug(slug);

  if (!study) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-swagger-text">Case study not found</h1>
        <a href="/" className="mt-4 inline-block font-mono text-sm text-swagger-get hover:underline">
          Back to portfolio
        </a>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 pb-16 pt-8 md:px-6">
      <header className="swagger-panel mb-8 overflow-hidden bg-gradient-to-br from-swagger-get/10 to-swagger-post/5 animate-fade-in">
        <div className="border-b border-swagger-border px-6 py-8 md:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="method-badge bg-swagger-get">GET</span>
            <span className="font-mono text-sm text-swagger-muted">
              /case-studies/{study.slug}
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{study.title}</h1>
          <p className="mt-2 text-lg text-swagger-get">{study.subtitle}</p>
          <p className="mt-1 font-mono text-xs text-swagger-muted">
            {study.period} · {study.role}
          </p>
        </div>
      </header>

      <div className="stagger-children space-y-8">
        <section className="space-y-3">
          <h2 className="font-mono text-xs uppercase tracking-wide text-swagger-get">Problem</h2>
          <p className="text-sm leading-relaxed text-swagger-muted">{study.problem}</p>
        </section>

        <BulletList items={study.constraints} title="Constraints" />
        <BulletList items={study.approach} title="Approach" />

        <ArchitectureSection
          summary={study.architecture.summary}
          steps={study.architecture.steps}
          diagram={study.architecture.diagram}
        />

        <BulletList items={study.outcomes} title="Outcomes" />

        <section className="space-y-3">
          <h2 className="font-mono text-xs uppercase tracking-wide text-swagger-get">Stack</h2>
          <div className="flex flex-wrap gap-2">
            {study.stack.map((item) => (
              <span key={item} className="rounded bg-swagger-code px-2 py-0.5 font-mono text-xs">
                {item}
              </span>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3 border-t border-swagger-border pt-6">
          <a href="/" className="api-execute-btn bg-swagger-get">
            Back to portfolio
          </a>
          {study.links.demo && (
            <a
              href={study.links.demo}
              className="rounded border border-swagger-border px-4 py-2 font-mono text-sm transition-colors duration-200 hover:border-swagger-get hover:text-swagger-get"
            >
              Live demo
            </a>
          )}
          {study.links.portfolio && (
            <a
              href={study.links.portfolio}
              className="rounded border border-swagger-border px-4 py-2 font-mono text-sm transition-colors duration-200 hover:border-swagger-get hover:text-swagger-get"
            >
              Project showcase
            </a>
          )}
          {study.links.live && (
            <a
              href={study.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-swagger-border px-4 py-2 font-mono text-sm transition-colors duration-200 hover:border-swagger-get hover:text-swagger-get"
            >
              App Store
            </a>
          )}
          {study.links.github && (
            <a
              href={study.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-swagger-border px-4 py-2 font-mono text-sm transition-colors duration-200 hover:border-swagger-get hover:text-swagger-get"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
