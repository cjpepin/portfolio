import { methodColor, type HttpMethod } from "../../data/profile";
import { usePreviewPanel } from "./PreviewPanelContext";

function MethodBadge({ method }: { method: HttpMethod }) {
  return <span className={`method-badge ${methodColor(method)}`}>{method}</span>;
}

const emptyState = (
  <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
    <div className="rounded-full border border-swagger-border bg-swagger-code px-4 py-2 font-mono text-xs text-swagger-muted">
      awaiting response
    </div>
    <p className="max-w-xs text-sm text-swagger-muted">
      Execute an endpoint to render the visual preview here. The panel updates with whichever request you run last.
    </p>
  </div>
);

export function ApiPreviewPanel() {
  const { preview } = usePreviewPanel();

  return (
    <aside
      className="flex h-full min-h-0 flex-col border-l border-swagger-border bg-swagger-panel"
      aria-label="Response preview"
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-swagger-border px-4 py-3">
        <span className="font-mono text-xs uppercase tracking-wider text-swagger-muted">Preview</span>
        {preview && (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <MethodBadge method={preview.method} />
            <code className="truncate font-mono text-xs text-swagger-text">{preview.path}</code>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {preview ? (
          <div key={`${preview.method}-${preview.path}`} className="animate-fade-in">
            {preview.content}
          </div>
        ) : (
          emptyState
        )}
      </div>
    </aside>
  );
}
