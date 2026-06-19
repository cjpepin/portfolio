type ShowcaseProjectId = "lingoleaf" | "trellis";

const showcaseConfig: Record<
  ShowcaseProjectId,
  { href: string; label: string; images: { id: string; label: string; src: string }[] }
> = {
  lingoleaf: {
    href: "/lingoleaf/#showcase",
    label: "Open LingoLeaf showcase",
    images: [
      { id: "read", label: "Read", src: "/lingoleaf/showcase/read_translate.png" },
      { id: "save", label: "Save", src: "/lingoleaf/showcase/save.png" },
      { id: "study", label: "Study", src: "/lingoleaf/showcase/study.png" },
    ],
  },
  trellis: {
    href: "/trellis#showcase",
    label: "Open Trellis showcase",
    images: [
      { id: "chat", label: "Chat", src: "/trellis/showcase/tab-chat.png" },
      { id: "notes", label: "Notes", src: "/trellis/showcase/tab-notes.png" },
      { id: "graph", label: "Graph", src: "/trellis/showcase/tab-graph.png" },
    ],
  },
};

type Props = {
  projectId: ShowcaseProjectId;
};

export function ProjectShowcaseStrip({ projectId }: Props) {
  const config = showcaseConfig[projectId];

  return (
    <div className="border-b border-swagger-border bg-swagger-bg/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wide text-swagger-muted">
          showcase preview
        </span>
        <a href={config.href} className="font-mono text-xs text-swagger-get hover:underline">
          {config.label} →
        </a>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {config.images.map((image) => (
          <a
            key={image.id}
            href={config.href}
            className="group overflow-hidden rounded border border-swagger-border transition-colors hover:border-swagger-get/50"
          >
            <img
              src={image.src}
              alt={`${image.label} — ${projectId} showcase`}
              className="aspect-[9/16] w-full object-cover object-top transition-transform duration-200 group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
            />
            <span className="block px-2 py-1 font-mono text-[10px] uppercase text-swagger-muted group-hover:text-swagger-get">
              {image.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
