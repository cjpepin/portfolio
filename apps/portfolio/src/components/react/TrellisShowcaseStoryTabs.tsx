import { useState } from "react";

type StoryTab = "chat" | "notes" | "graph";

const tabs: { id: StoryTab; label: string; image: string; title: string; body: string }[] = [
  {
    id: "chat",
    label: "Chat",
    image: "/trellis/showcase/tab-chat.png",
    title: "Conversations stay in context",
    body: "Chat with hybrid local and cloud AI while keeping threads tied to your vault workspace.",
  },
  {
    id: "notes",
    label: "Persist as notes",
    image: "/trellis/showcase/tab-notes.png",
    title: "Chats become markdown notes",
    body: "Responses persist as structured markdown with YAML frontmatter — readable, portable, and yours.",
  },
  {
    id: "graph",
    label: "Knowledge graph",
    image: "/trellis/showcase/tab-graph.png",
    title: "Notes connect into a graph",
    body: "Wiki links and graph views surface relationships between ideas without leaving the vault.",
  },
];

function TabImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-swagger-border bg-swagger-code/30 px-4 text-center text-xs text-swagger-muted">
        Screenshot: {alt}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="mx-auto w-full rounded-xl border border-swagger-border object-cover shadow-md"
      onError={() => setFailed(true)}
    />
  );
}

export function TrellisShowcaseStoryTabs() {
  const [active, setActive] = useState<StoryTab>("chat");
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <section className="border-t border-swagger-border pb-4 pt-12">
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-swagger-text md:text-xl">How it works</h3>
          <p className="mt-2 text-sm text-swagger-muted">
            Three beats — chat, persist, connect — in under a minute.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active === tab.id
                  ? "bg-swagger-get text-white"
                  : "border border-swagger-border text-swagger-muted hover:text-swagger-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid items-center gap-8 md:grid-cols-2">
          <TabImage src={current.image} alt={current.label} />
          <div className="space-y-3 text-center md:text-left">
            <h4 className="text-xl font-semibold text-swagger-text">{current.title}</h4>
            <p className="text-sm leading-relaxed text-swagger-muted">{current.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
