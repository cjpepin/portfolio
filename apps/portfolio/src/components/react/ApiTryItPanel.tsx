import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { methodColor, type HttpMethod } from "../../data/profile";
import { usePreviewPanel } from "./PreviewPanelContext";

export type ApiField = {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  options?: readonly { value: string; label: string }[];
  multiline?: boolean;
  hidden?: boolean;
  in?: "path" | "query";
};

function resolvePath(
  template: string,
  values: Record<string, string>,
  pathParams: readonly string[],
): string {
  return pathParams.reduce(
    (resolved, name) => resolved.replace(`{${name}}`, values[name] || `{${name}}`),
    template,
  );
}

type Props = {
  method: HttpMethod;
  path: string;
  summary?: string;
  description?: string;
  fields: readonly ApiField[];
  onExecute: (values: Record<string, string>) => Promise<unknown> | unknown;
  executeLabel?: string;
  contentType?: string;
  initialResponse?: unknown;
  autoExecuteOnMount?: boolean;
  pathParams?: readonly string[];
  renderPreview?: (response: unknown) => ReactNode;
  className?: string;
};

function MethodBadge({ method }: { method: HttpMethod }) {
  return <span className={`method-badge ${methodColor(method)}`}>{method}</span>;
}

export function ApiTryItPanel({
  method,
  path,
  summary,
  description,
  fields,
  onExecute,
  executeLabel = "Execute",
  contentType = "application/json",
  initialResponse,
  autoExecuteOnMount = false,
  pathParams = [],
  renderPreview,
  className = "",
}: Props) {
  const { publishPreview } = usePreviewPanel();
  const visibleFields = fields.filter((f) => !f.hidden);
  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        visibleFields.map((f) => {
          if (f.defaultValue !== undefined) {
            return [f.name, f.defaultValue];
          }
          if (f.options && f.required && f.options.length >= 1) {
            return [f.name, f.options[0].value];
          }
          return [f.name, ""];
        }),
      ) as Record<string, string>,
    [visibleFields],
  );

  const [values, setValues] = useState(initialValues);
  const [response, setResponse] = useState<unknown>(
    initialResponse ?? {
      hint: "Fill parameters and click Execute to see the response",
    },
  );
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const publishResponsePreview = useCallback(
    (nextResponse: unknown, payload: Record<string, string>) => {
      if (!renderPreview) return;
      const previewPath =
        pathParams.length > 0 ? resolvePath(path, payload, pathParams) : path;
      publishPreview({
        method,
        path: previewPath,
        content: renderPreview(nextResponse),
      });
    },
    [method, path, pathParams, publishPreview, renderPreview],
  );

  const runExecute = useCallback(
    async (payload: Record<string, string>) => {
      setLoading(true);
      let nextResponse: unknown;
      try {
        const result = await onExecute(payload);
        nextResponse = {
          status: 200,
          timestamp: new Date().toISOString(),
          ...(typeof result === "object" && result !== null ? result : { data: result }),
        };
      } catch (err) {
        nextResponse = {
          status: 400,
          error: err instanceof Error ? err.message : "Request failed",
          timestamp: new Date().toISOString(),
        };
      } finally {
        setLoading(false);
      }

      setResponse(nextResponse);
      publishResponsePreview(nextResponse, payload);
    },
    [onExecute, publishResponsePreview],
  );

  const hasAutoExecuted = useRef(false);
  useEffect(() => {
    if (autoExecuteOnMount && !hasAutoExecuted.current) {
      hasAutoExecuted.current = true;
      void runExecute(initialValues);
    }
  }, [autoExecuteOnMount, initialValues, runExecute]);

  const update = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await runExecute(values);
  };

  return (
    <div className={`swagger-panel overflow-hidden ${className}`}>
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-swagger-code/40"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <MethodBadge method={method} />
        <div className="min-w-0 flex-1">
          <code className="font-mono text-sm">{path}</code>
          {summary && <p className="mt-0.5 text-sm text-swagger-muted">{summary}</p>}
        </div>
        <span className="font-mono text-xs text-swagger-muted transition-transform duration-200">
          {expanded ? "▼" : "▶"}
        </span>
      </button>

      {expanded && (
        <div className="animate-accordion-open border-t border-swagger-border">
          {description && (
            <p className="border-b border-swagger-border px-4 py-3 text-sm text-swagger-muted">{description}</p>
          )}

          <div className="relative">
            <form
              onSubmit={handleSubmit}
              className="border-b border-swagger-border p-4 lg:w-1/2 lg:border-b-0 lg:border-r"
            >
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded bg-swagger-code px-2 py-0.5 font-mono text-xs text-swagger-muted">
                  {contentType}
                </span>
                <span className="font-mono text-xs uppercase text-swagger-muted">Parameters</span>
              </div>

              <div className="space-y-4">
                {visibleFields.map((field) => (
                  <label key={field.name} className="block animate-fade-in-up">
                    <span className="mb-1.5 flex flex-wrap items-center gap-2 font-mono text-sm">
                      <span className="text-swagger-get">{field.name}</span>
                      {field.required ? (
                        <span className="rounded bg-swagger-delete/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-swagger-delete">
                          required
                        </span>
                      ) : (
                        <span className="rounded bg-swagger-muted/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-swagger-muted">
                          optional
                        </span>
                      )}
                      {field.in && (
                        <span className="rounded bg-swagger-code px-1.5 py-0.5 text-[10px] font-bold uppercase text-swagger-muted">
                          {field.in}
                        </span>
                      )}
                      <span className="text-xs text-swagger-post">{field.type}</span>
                    </span>
                    {field.description && (
                      <span className="mb-1.5 block text-xs text-swagger-muted">{field.description}</span>
                    )}
                    {field.options ? (
                      <select
                        required={field.required}
                        value={values[field.name]}
                        onChange={(e) => update(field.name, e.target.value)}
                        className="api-input"
                      >
                        {!field.required && <option value="">—</option>}
                        {field.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : field.multiline ? (
                      <textarea
                        required={field.required}
                        rows={4}
                        placeholder={field.placeholder}
                        value={values[field.name]}
                        onChange={(e) => update(field.name, e.target.value)}
                        className="api-input resize-y"
                      />
                    ) : (
                      <input
                        required={field.required}
                        type="text"
                        placeholder={field.placeholder}
                        value={values[field.name]}
                        onChange={(e) => update(field.name, e.target.value)}
                        className="api-input"
                      />
                    )}
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`api-execute-btn mt-5 w-full ${methodColor(method)}`}
              >
                {loading ? "Executing…" : executeLabel}
              </button>
            </form>

            <div className="flex min-h-0 flex-col overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-swagger-border px-4 py-2">
                <span className="font-mono text-xs uppercase text-swagger-muted">Response · 200 application/json</span>
              </div>

              <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed animate-fade-in">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
