import { useState } from "react";
import { profile } from "../../data/profile";

type WebPage = { label: string; path: string };

const lingoleafProject = profile.projects.find((p) => p.id === "lingoleaf");
const webPages = (lingoleafProject?.links as { webPages?: readonly WebPage[] } | undefined)
  ?.webPages;

const PREVIEW_HEIGHT = 640;

export function LingoLeafWebShowcase() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPath, setPreviewPath] = useState(webPages?.[0]?.path ?? "/lingoleaf/");

  if (!webPages || webPages.length === 0) {
    return null;
  }

  const openPreview = (path: string) => {
    setPreviewPath(path);
    setPreviewOpen(true);
  };

  return (
    <div className="border-t border-swagger-border">
      <div className="space-y-3 p-4">
        <div>
          <h3 className="font-mono text-xs uppercase tracking-wide text-swagger-muted">
            Companion website
          </h3>
          <p className="mt-1 text-sm text-swagger-muted">
            Marketing site, feature forum, and admin dashboard at{" "}
            <code className="swagger-code">/lingoleaf</code>. Run{" "}
            <code className="swagger-code">npm run dev:all</code> in{" "}
            <code className="swagger-code">apps/portfolio</code> to proxy{" "}
            <code className="swagger-code">projects/lingoleaf-web</code> locally.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {webPages.map(({ label, path }) => (
            <div key={path} className="flex overflow-hidden rounded border border-swagger-border">
              <a
                href={path}
                target="_blank"
                rel="noopener noreferrer"
                className="border-r border-swagger-border px-3 py-1.5 font-mono text-sm transition-colors duration-200 hover:bg-swagger-code hover:text-swagger-get"
              >
                {label}
              </a>
              <button
                type="button"
                onClick={() => openPreview(path)}
                className="px-2 py-1.5 font-mono text-xs text-swagger-muted transition-colors duration-200 hover:bg-swagger-code hover:text-swagger-get"
                aria-label={`Preview ${label}`}
              >
                Preview
              </button>
            </div>
          ))}
        </div>
        {previewOpen && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-mono text-xs text-swagger-muted">{previewPath}</p>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="shrink-0 font-mono text-xs text-swagger-muted transition-colors hover:text-swagger-get"
              >
                Hide preview
              </button>
            </div>
            <div
              className="overflow-hidden rounded border border-swagger-border bg-white"
              style={{ height: PREVIEW_HEIGHT }}
            >
              <iframe
                title={`LingoLeaf web — ${previewPath}`}
                src={previewPath}
                className="h-full w-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
