import { useState } from "react";
import { profile } from "../../data/profile";
import { CopyTooltip } from "./CopyTooltip";
import { GitHubIcon, GlobeIcon, LinkedInIcon, MailIcon, PhoneIcon } from "./icons";
import { useCopyToClipboard } from "./useCopyToClipboard";

type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const emptyPayload: ContactPayload = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const { contact } = profile.info;

const contactLinkClassName =
  "flex w-full items-center gap-3 rounded-lg border border-swagger-border bg-swagger-bg/60 p-4 text-left transition-colors duration-200 hover:border-swagger-get/40";

function ContactLink({
  icon: Icon,
  label,
  value,
  href,
  copyValue,
}: {
  icon: typeof MailIcon;
  label: string;
  value: string;
  href?: string;
  copyValue?: string;
}) {
  const { copied, copy } = useCopyToClipboard();

  const content = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-swagger-code text-swagger-get">
        <Icon size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-swagger-muted">{label}</span>
        <span className="block truncate text-sm font-medium text-swagger-text">{value}</span>
      </span>
    </>
  );

  if (copyValue) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => copy(copyValue)}
          className={contactLinkClassName}
          aria-label={`Copy ${label}`}
        >
          {content}
        </button>
        <CopyTooltip visible={copied} />
      </div>
    );
  }

  return (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className={contactLinkClassName}
    >
      {content}
    </a>
  );
}

export function ReadableContact() {
  const [payload, setPayload] = useState<ContactPayload>(emptyPayload);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const update = (key: keyof ContactPayload, value: string) => {
    setPayload((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, website: honeypot }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok || !data.success) {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setPayload(emptyPayload);
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again or email directly.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <ContactLink icon={MailIcon} label="Email" value={contact.email} copyValue={contact.email} />
        <ContactLink icon={PhoneIcon} label="Phone" value={contact.phone} copyValue={contact.phone} />
        <ContactLink icon={GitHubIcon} label="GitHub" value="cjpepin" href={contact.github} />
        <ContactLink
          icon={LinkedInIcon}
          label="LinkedIn"
          value="connor-pepin"
          href={contact.linkedin}
        />
        <ContactLink icon={GlobeIcon} label="Location" value={contact.location} href={contact.website} />
      </div>

      <form onSubmit={handleSubmit} className="swagger-panel space-y-4 p-5 md:p-6">
        <p className="text-sm text-swagger-muted">
          Open to any opportunities! Send a message below or reach out directly to chat.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-1">
            <span className="mb-1.5 block text-sm font-medium text-swagger-text">Name</span>
            <input
              required
              type="text"
              placeholder="Your name"
              value={payload.name}
              onChange={(e) => update("name", e.target.value)}
              className="api-input"
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="mb-1.5 block text-sm font-medium text-swagger-text">Email</span>
            <input
              required
              type="email"
              placeholder="you@example.com"
              value={payload.email}
              onChange={(e) => update("email", e.target.value)}
              className="api-input"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-swagger-text">Subject</span>
          <input
            type="text"
            placeholder="Project inquiry, role, or collaboration"
            value={payload.subject}
            onChange={(e) => update("subject", e.target.value)}
            className="api-input"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-swagger-text">Message</span>
          <textarea
            required
            rows={5}
            placeholder="Tell me about the role or project…"
            value={payload.message}
            onChange={(e) => update("message", e.target.value)}
            className="api-input resize-y"
          />
        </label>

        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          aria-hidden="true"
        />

        {status === "success" && (
          <p className="rounded-lg border border-swagger-get/30 bg-swagger-get/10 px-4 py-3 text-sm text-swagger-text">
            Message sent. I&apos;ll get back to you soon!
          </p>
        )}
        {status === "error" && errorMessage && (
          <p className="rounded-lg border border-swagger-delete/30 bg-swagger-delete/10 px-4 py-3 text-sm text-swagger-text">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="api-execute-btn w-full bg-swagger-post sm:w-auto"
        >
          {status === "loading" ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}
