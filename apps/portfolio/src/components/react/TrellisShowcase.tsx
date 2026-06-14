import { useState } from "react";

const VIDEO_SRC = "/trellis/showcase/trellis-recruiter.mp4";
const POSTER_SRC = "/trellis/showcase/trellis-recruiter-poster.jpg";

const engineeringCards = [
  {
    title: "Markdown vault",
    description:
      "Chats persist as structured markdown notes with YAML frontmatter in a user-owned vault on disk.",
  },
  {
    title: "Electron + SQLite",
    description:
      "Desktop shell with SQLite storage and IPC boundaries between renderer, main process, and local vault files.",
  },
  {
    title: "Hybrid AI",
    description:
      "Supabase Edge Functions for cloud chat and extraction while keeping vault data local-first by default.",
  },
];

export function TrellisShowcase() {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <section id="showcase" className="scroll-mt-8 border-t border-swagger-border pt-12">
      <div className="space-y-10">
        <div className="space-y-3 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-swagger-text md:text-3xl">
            What I built
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-swagger-muted">
            Local-first AI knowledge app — chats become structured notes in a vault you own, with hybrid
            local and cloud AI.
          </p>
        </div>

        <div className="swagger-panel overflow-hidden">
          {!videoFailed ? (
            <video
              className="aspect-video w-full bg-swagger-code object-cover"
              src={VIDEO_SRC}
              poster={POSTER_SRC}
              autoPlay
              muted
              loop
              playsInline
              onError={() => setVideoFailed(true)}
            />
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-swagger-code/40 px-6 text-center">
              <p className="text-sm font-medium text-swagger-text">Showcase video coming soon</p>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {engineeringCards.map(({ title, description }) => (
            <article key={title} className="swagger-panel p-5">
              <h3 className="font-semibold text-swagger-text">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-swagger-muted">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
