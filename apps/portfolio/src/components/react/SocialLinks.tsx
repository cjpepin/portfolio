import { profile } from "../../data/profile";
import { GitHubIcon, MailIcon, PhoneIcon } from "./icons";

const links = [
  {
    href: profile.info.contact.github,
    label: "GitHub",
    icon: GitHubIcon,
    external: true,
  },
  {
    href: `mailto:${profile.info.contact.email}`,
    label: "Email",
    icon: MailIcon,
    external: false,
  },
  {
    href: `tel:${profile.info.contact.phone.replace(/[^\d+]/g, "")}`,
    label: "Phone",
    icon: PhoneIcon,
    external: false,
  },
] as const;

export function SocialLinks() {
  return (
    <div className="flex items-center gap-2">
      {links.map(({ href, label, icon: Icon, external }) => (
        <a
          key={label}
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="flex h-9 w-9 items-center justify-center rounded border border-transparent text-swagger-muted transition-all duration-200 hover:border-swagger-border hover:bg-swagger-panel hover:text-swagger-get hover:shadow-sm"
          aria-label={label}
          title={label}
        >
          <Icon size={18} />
        </a>
      ))}
    </div>
  );
}
