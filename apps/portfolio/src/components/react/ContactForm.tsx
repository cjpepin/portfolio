import { useState } from "react";
import { profile } from "../../data/profile";

type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type ApiResponse = {
  success?: boolean;
  error?: string;
  status?: number;
  timestamp?: string;
};

const emptyPayload: ContactPayload = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export function ContactForm() {
  const [payload, setPayload] = useState<ContactPayload>(emptyPayload);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof ContactPayload, value: string) => {
    setPayload((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as ApiResponse;
      setResponse({
        ...data,
        status: res.status,
        timestamp: new Date().toISOString(),
      });
      if (res.ok && data.success) {
        setPayload(emptyPayload);
      }
    } catch {
      setResponse({
        error: "Network error. Please try again.",
        status: 0,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="swagger-panel p-4">
        <div className="mb-4 flex items-center gap-2 border-b border-swagger-border pb-3">
          <span className="method-badge bg-swagger-post">POST</span>
          <code className="font-mono text-sm">/api/contact</code>
        </div>
        <p className="mb-4 font-mono text-xs uppercase text-swagger-muted">Request body (application/json)</p>
        <div className="space-y-3">
          {(
            [
              ["name", "string", "Your name", true],
              ["email", "string", "you@example.com", true],
              ["subject", "string", "Project inquiry", false],
              ["message", "string", "Tell me about your project…", true],
            ] as const
          ).map(([key, type, placeholder, required]) => (
            <label key={key} className="block">
              <span className="mb-1 flex items-center gap-2 font-mono text-sm text-swagger-get">
                {key}
                {required && <span className="text-swagger-delete">*</span>}
                <span className="text-xs text-swagger-post">{type}</span>
              </span>
              {key === "message" ? (
                <textarea
                  required={required}
                  rows={5}
                  placeholder={placeholder}
                  value={payload[key]}
                  onChange={(e) => update(key, e.target.value)}
                  className="w-full rounded border border-swagger-border bg-swagger-bg px-3 py-2 font-mono text-sm focus:border-swagger-post focus:outline-none"
                />
              ) : (
                <input
                  required={required}
                  type={key === "email" ? "email" : "text"}
                  placeholder={placeholder}
                  value={payload[key]}
                  onChange={(e) => update(key, e.target.value)}
                  className="w-full rounded border border-swagger-border bg-swagger-bg px-3 py-2 font-mono text-sm focus:border-swagger-post focus:outline-none"
                />
              )}
            </label>
          ))}
        </div>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded bg-swagger-post px-4 py-2 font-mono text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Sending…" : "Execute"}
        </button>
      </form>

      <div className="swagger-panel flex flex-col">
        <div className="border-b border-swagger-border px-4 py-2 font-mono text-xs uppercase text-swagger-muted">
          Response
        </div>
        <pre className="flex-1 overflow-x-auto p-4 font-mono text-sm">
          {response
            ? JSON.stringify(response, null, 2)
            : JSON.stringify(
                {
                  hint: "Submit the form to see the API response",
                  contact: profile.info.contact.email,
                },
                null,
                2,
              )}
        </pre>
      </div>
    </div>
  );
}
