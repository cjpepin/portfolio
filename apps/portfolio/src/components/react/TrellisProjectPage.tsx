import { profile } from "../../data/profile";
import { TrellisDemoEmbed } from "./TrellisDemoEmbed";
import { TrellisShowcase } from "./TrellisShowcase";
import { TrellisShowcaseStoryTabs } from "./TrellisShowcaseStoryTabs";

type Props = {
  demoBuilt: boolean;
};

const trellis = profile.projects.find((project) => project.id === "trellis");

export function TrellisProjectPage({ demoBuilt }: Props) {
  if (!trellis) {
    return null;
  }

  const github = "github" in trellis.links ? trellis.links.github : undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 md:px-6">
      <header
        className={`swagger-panel overflow-hidden bg-gradient-to-br ${trellis.accent} animate-fade-in`}
      >
        <div className="border-b border-swagger-border px-6 py-8 md:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="method-badge bg-swagger-get">GET</span>
            <span className="font-mono text-sm text-swagger-muted">{trellis.path}</span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{trellis.name}</h1>
          <p className="mt-2 text-lg text-swagger-get">{trellis.tagline}</p>
          <p className="mt-1 font-mono text-xs text-swagger-muted">{trellis.period}</p>
        </div>

        <div className="space-y-6 px-6 py-8 md:px-8">
          <p className="max-w-2xl text-sm leading-relaxed text-swagger-muted">{trellis.description}</p>

          {trellis.stack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {trellis.stack.map((item) => (
                <span key={item} className="rounded bg-swagger-code px-2 py-0.5 font-mono text-xs">
                  {item}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <a href="#showcase" className="api-execute-btn bg-swagger-get">
              View showcase
            </a>
            <a
              href="#try-demo"
              className="rounded border border-swagger-border px-4 py-2 font-mono text-sm transition-colors duration-200 hover:border-swagger-get hover:text-swagger-get"
            >
              Try desktop preview
            </a>
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-swagger-border px-4 py-2 font-mono text-sm transition-colors duration-200 hover:border-swagger-get hover:text-swagger-get"
              >
                GitHub
              </a>
            )}
          </div>
        </div>
      </header>

      <TrellisShowcase />
      <TrellisShowcaseStoryTabs />

      <section id="try-demo" className="scroll-mt-14 border-t border-swagger-border pt-12">
        <div className="mb-6 space-y-2 text-center">
          <h2 className="text-xl font-semibold md:text-2xl">Desktop app preview</h2>
          <p className="mx-auto max-w-2xl text-sm text-swagger-muted">
            The same Electron UI running in your browser — preview workspace with seeded chats, notes,
            and graph data. No install or Supabase account required.
          </p>
        </div>

        <div className="swagger-panel overflow-hidden">
          <TrellisDemoEmbed demoBuilt={demoBuilt} variant="featured" />
        </div>
      </section>

      {trellis.features.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wide text-swagger-muted">
            Highlights
          </h2>
          <ul className="swagger-panel space-y-3 px-6 py-5 text-sm text-swagger-muted">
            {trellis.features.map((feature) => (
              <li key={feature}>• {feature}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
