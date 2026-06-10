import { useState } from "react";
import { profile, methodColor, type HttpMethod } from "../../data/profile";

function MethodBadge({ method }: { method: HttpMethod }) {
  return <span className={`method-badge ${methodColor(method)}`}>{method}</span>;
}

type OperationItem = {
  id: string;
  method: HttpMethod;
  path: string;
  title: string;
  company: string;
  period: string;
  summary: string;
  responsibilities: readonly string[];
  stack: readonly string[];
};

export function ExperienceOperations({ items }: { items: readonly OperationItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id} className="swagger-panel overflow-hidden">
            <button
              type="button"
              className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-swagger-code/40"
              onClick={() => setOpenId(open ? null : item.id)}
              aria-expanded={open}
            >
              <MethodBadge method={item.method} />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm text-swagger-muted">{item.path}</p>
                <p className="font-medium text-swagger-text">
                  {item.title} · {item.company}
                </p>
                <p className="text-sm text-swagger-muted">{item.period}</p>
              </div>
              <span className="font-mono text-xs text-swagger-muted">{open ? "▼" : "▶"}</span>
            </button>
            {open && (
              <div className="border-t border-swagger-border px-4 py-4">
                <p className="mb-4 text-sm text-swagger-muted">{item.summary}</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 font-mono text-xs uppercase text-swagger-get">Response body</h3>
                    <ul className="space-y-2 text-sm">
                      {item.responsibilities.map((r) => (
                        <li key={r} className="text-swagger-text">
                          • {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 font-mono text-xs uppercase text-swagger-post">Stack tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {item.stack.map((tag) => (
                        <span key={tag} className="rounded bg-swagger-code px-2 py-0.5 font-mono text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

type SystemItem = (typeof profile.systems)[number];

export function SystemsOperations({ items }: { items: readonly SystemItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [tryItId, setTryItId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {items.map((system) => {
        const open = openId === system.id;
        const trying = tryItId === system.id;
        return (
          <div key={system.id} className="swagger-panel overflow-hidden">
            <button
              type="button"
              className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-swagger-code/40"
              onClick={() => setOpenId(open ? null : system.id)}
              aria-expanded={open}
            >
              <MethodBadge method={system.method} />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm text-swagger-muted">{system.path}</p>
                <p className="font-medium text-swagger-text">{system.title}</p>
                <p className="text-sm text-swagger-muted">
                  {system.subtitle} · {system.period}
                </p>
              </div>
              <span className="rounded bg-swagger-code px-2 py-0.5 font-mono text-xs uppercase text-swagger-muted">
                {system.tag}
              </span>
            </button>
            {open && (
              <div className="border-t border-swagger-border px-4 py-4">
                <p className="mb-4 text-sm text-swagger-muted">{system.description}</p>
                <div className="mb-4 space-y-2">
                  {system.operations.map((op) => (
                    <div key={op.id} className="rounded border border-swagger-border bg-swagger-bg p-3">
                      <p className="text-sm font-medium">{op.summary}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {op.stack.map((s) => (
                          <span key={s} className="font-mono text-xs text-swagger-get">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="rounded bg-swagger-post px-4 py-2 font-mono text-sm font-semibold text-black hover:opacity-90"
                  onClick={() => setTryItId(trying ? null : system.id)}
                >
                  {trying ? "Hide response" : "Try it out"}
                </button>
                {trying && (
                  <pre className="mt-4 overflow-x-auto rounded bg-swagger-code p-4 font-mono text-sm">
                    {JSON.stringify(
                      {
                        status: 200,
                        system: system.title,
                        operations: system.operations.map((o) => o.summary),
                      },
                      null,
                      2,
                    )}
                  </pre>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
