import type { ReactNode } from "react";
import { profile } from "../../data/profile";
import { SocialLinks } from "./SocialLinks";

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-swagger-border/60 px-4 py-3 last:border-b-0 sm:grid-cols-[7rem_1fr] sm:gap-4">
      <span className="font-mono text-xs uppercase tracking-wide text-swagger-muted">{label}</span>
      <div className="min-w-0 text-sm text-swagger-text">{children}</div>
    </div>
  );
}

export function ApiInfoPanel() {
  const { info, positioning } = profile;

  return (
    <section className="swagger-panel mb-4 overflow-hidden" aria-label="API information">
      <div className="border-b border-swagger-border px-4 py-2.5">
        <span className="font-mono text-xs uppercase tracking-wide text-swagger-muted">info</span>
      </div>
      <div>
        <InfoRow label="title">
          <span className="font-semibold">{info.apiDocsTitle}</span>
        </InfoRow>
        <InfoRow label="version">
          <span className="rounded bg-swagger-code px-1.5 py-0.5 font-mono text-xs">{info.version}</span>
        </InfoRow>
        <InfoRow label="description">
          <div className="space-y-2">
            <p className="leading-relaxed text-swagger-text">{info.description}</p>
            <p className="text-sm text-swagger-muted">{positioning.subheadline}</p>
          </div>
        </InfoRow>
        <InfoRow label="contact">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
              <span>
                <span className="text-swagger-muted">name · </span>
                {info.contact.name}
              </span>
              <span>
                <span className="text-swagger-muted">email · </span>
                {info.contact.email}
              </span>
              <span>
                <span className="text-swagger-muted">location · </span>
                {info.contact.location}
              </span>
            </div>
            <SocialLinks />
          </div>
        </InfoRow>
      </div>
    </section>
  );
}
