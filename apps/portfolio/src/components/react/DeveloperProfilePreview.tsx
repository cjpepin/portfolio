import { CopyTooltip } from "./CopyTooltip";
import { GitHubIcon, GlobeIcon, LinkedInIcon, MailIcon, PhoneIcon } from "./icons";
import type { DeveloperData } from "./developerResponse";
import { useCopyToClipboard } from "./useCopyToClipboard";

type Contact = NonNullable<DeveloperData["contact"]>;

function hasFullContact(contact: Contact): contact is {
  name: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  website: string;
} {
  return "email" in contact && "github" in contact;
}

const contactRowClassName =
  "flex w-full items-center gap-3 rounded border border-swagger-border bg-swagger-bg/60 p-3 text-left transition-colors duration-200 hover:border-swagger-get/40";

function ContactRow({
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
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-swagger-code text-swagger-get">
        <Icon size={16} />
      </span>
      <span className="min-w-0">
        <span className="block font-mono text-[10px] uppercase tracking-wide text-swagger-muted">{label}</span>
        <span className="block truncate text-sm text-swagger-text">{value}</span>
      </span>
    </>
  );

  if (copyValue) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => copy(copyValue)}
          className={contactRowClassName}
          aria-label={`Copy ${label}`}
        >
          {content}
        </button>
        <CopyTooltip visible={copied} />
      </div>
    );
  }

  if (href) {
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={contactRowClassName}>
        {content}
      </a>
    );
  }

  return <div className={contactRowClassName}>{content}</div>;
}

const skillLabels: Record<string, string> = {
  languages: "Languages",
  frameworks: "Frameworks",
  data: "Data",
  platform: "Platform",
  practices: "Practices",
  other: "Other",
};

export function DeveloperProfilePreview({ data }: { data: DeveloperData }) {
  const contact = data.contact;
  const fullContact = contact && hasFullContact(contact) ? contact : null;

  return (
    <div className="animate-fade-in space-y-5 p-4">
      <header className="rounded-lg border border-swagger-border bg-gradient-to-br from-swagger-get/10 to-swagger-post/5 p-5">
        <div className="flex items-start gap-4">
          {data.profileImage && (
            <img
              src={data.profileImage}
              alt={contact?.name ? `${contact.name} profile photo` : "Profile photo"}
              width={80}
              height={80}
              className="h-20 w-20 shrink-0 rounded-full border-2 border-swagger-border object-cover shadow-sm"
              loading="lazy"
              decoding="async"
            />
          )}
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-swagger-text">
              {contact?.name ?? "Developer Profile"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-swagger-muted">{data.description}</p>
          </div>
        </div>
      </header>

      {contact && (
        <section>
          <h3 className="mb-3 font-mono text-xs uppercase tracking-wide text-swagger-get">Contact</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {fullContact ? (
              <>
                <ContactRow icon={MailIcon} label="email" value={fullContact.email} copyValue={fullContact.email} />
                <ContactRow icon={PhoneIcon} label="phone" value={fullContact.phone} copyValue={fullContact.phone} />
                <ContactRow icon={GlobeIcon} label="location" value={fullContact.location} />
                <ContactRow icon={GitHubIcon} label="github" value="cjpepin" href={fullContact.github} />
                <ContactRow
                  icon={LinkedInIcon}
                  label="linkedin"
                  value="connor-pepin"
                  href={fullContact.linkedin}
                />
                <ContactRow icon={GlobeIcon} label="website" value="connorjpepin.com" href={fullContact.website} />
              </>
            ) : (
              <>
                <ContactRow icon={GlobeIcon} label="name" value={contact.name} />
                {"location" in contact && (
                  <ContactRow icon={GlobeIcon} label="location" value={contact.location} />
                )}
              </>
            )}
          </div>
        </section>
      )}

      {data.education && data.education.length > 0 && (
        <section>
          <h3 className="mb-3 font-mono text-xs uppercase tracking-wide text-swagger-get">Education</h3>
          <div className="space-y-2">
            {data.education.map((edu) => (
              <article
                key={edu.institution}
                className="rounded border border-swagger-border bg-swagger-bg/60 p-4 transition-shadow duration-200 hover:shadow-sm"
              >
                <p className="font-medium text-swagger-text">{edu.institution}</p>
                <p className="mt-1 text-sm text-swagger-muted">{edu.degree}</p>
                <p className="mt-2 font-mono text-xs text-swagger-post">{edu.graduated}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {data.skills && (
        <section>
          <h3 className="mb-3 font-mono text-xs uppercase tracking-wide text-swagger-get">Skills</h3>
          <div className="space-y-4">
            {Object.entries(data.skills).map(([key, items]) => (
              <div key={key}>
                <p className="mb-2 font-mono text-xs text-swagger-muted">{skillLabels[key] ?? key}</p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-swagger-border bg-swagger-code px-2.5 py-1 font-mono text-xs text-swagger-text transition-colors duration-200 hover:border-swagger-get hover:text-swagger-get"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
