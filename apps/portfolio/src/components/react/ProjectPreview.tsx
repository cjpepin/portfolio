import { useState } from "react";
import { profile } from "../../data/profile";
import { LingoLeafDemoEmbed } from "./LingoLeafDemoEmbed";
import { TrellisDemoEmbed } from "./TrellisDemoEmbed";
import { LingoLeafWebShowcase } from "./LingoLeafWebShowcase";
import type { ProjectData } from "./projectResponse";

type Project = (typeof profile.projects)[number];

function projectLinks(links: Project["links"]) {
  return links as { demo?: boolean; appStore?: string; github?: string; website?: string };
}

function accentForProject(id: string): string {
  const match = profile.projects.find((p) => p.id === id);
  return match?.accent ?? "from-swagger-get/10 to-swagger-post/5";
}

type Props = {
  data: ProjectData;
  demoBuilt?: boolean;
  trellisDemoBuilt?: boolean;
};

export function ProjectPreview({ data, demoBuilt = false, trellisDemoBuilt = false }: Props) {
  const [demoOpen, setDemoOpen] = useState(false);
  const links = data.links ? projectLinks(data.links) : {};
  const hasInlineDemo = !!links.demo && (data.id === "lingoleaf" || data.id === "trellis");

  return (
    <article
      className={`swagger-panel m-4 overflow-hidden bg-gradient-to-br ${accentForProject(data.id)} animate-fade-in`}
    >
      <div className="border-b border-swagger-border px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{data.name}</h2>
          <span className="rounded bg-swagger-code px-2 py-0.5 font-mono text-xs uppercase text-swagger-muted">
            {data.type}
          </span>
        </div>
        <p className="text-sm text-swagger-get">{data.tagline}</p>
        <p className="mt-1 font-mono text-xs text-swagger-muted">{data.period}</p>
      </div>
      <div className="space-y-4 px-4 py-4">
        <p className="text-sm text-swagger-muted">{data.description}</p>
        {data.features && data.features.length > 0 && (
          <ul className="space-y-1 text-sm">
            {data.features.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
        )}
        {data.stack && data.stack.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.stack.map((s) => (
              <span key={s} className="rounded bg-swagger-code px-2 py-0.5 font-mono text-xs">
                {s}
              </span>
            ))}
          </div>
        )}
        {(links.demo || links.appStore || links.github || links.website) && (
          <div className="flex flex-wrap gap-3 pt-2">
            {hasInlineDemo && (
              <button
                type="button"
                onClick={() => setDemoOpen((open) => !open)}
                className="api-execute-btn bg-swagger-get"
                aria-expanded={demoOpen}
              >
                {demoOpen ? "Hide demo" : "Live demo"}
              </button>
            )}
            {links.appStore && (
              <a
                href={links.appStore}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-swagger-border px-3 py-1.5 font-mono text-sm transition-colors duration-200 hover:border-swagger-get hover:text-swagger-get"
              >
                App Store
              </a>
            )}
            {links.github && (
              <a
                href={links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-swagger-border px-3 py-1.5 font-mono text-sm transition-colors duration-200 hover:border-swagger-get hover:text-swagger-get"
              >
                GitHub
              </a>
            )}
            {links.website && (
              <a
                href={links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-swagger-border px-3 py-1.5 font-mono text-sm transition-colors duration-200 hover:border-swagger-get hover:text-swagger-get"
              >
                Website
              </a>
            )}
          </div>
        )}
      </div>
      {data.id === "lingoleaf" && <LingoLeafWebShowcase />}
      {hasInlineDemo && demoOpen && (
        <div className="animate-fade-in-up">
          {data.id === "lingoleaf" ? (
            <LingoLeafDemoEmbed demoBuilt={demoBuilt} />
          ) : (
            <TrellisDemoEmbed demoBuilt={trellisDemoBuilt} />
          )}
        </div>
      )}
    </article>
  );
}
