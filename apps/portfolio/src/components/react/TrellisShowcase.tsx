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
  return (
    <section id="showcase" className="scroll-mt-14 border-t border-swagger-border pt-12">
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
