import { profile } from "../../data/profile";
import { CopyTooltip } from "./CopyTooltip";
import { GitHubIcon, LinkedInIcon, MailIcon, PhoneIcon } from "./icons";
import { useCopyToClipboard } from "./useCopyToClipboard";

const iconButtonClassName =
  "flex h-9 w-9 items-center justify-center rounded border border-transparent text-swagger-muted transition-all duration-200 hover:border-swagger-border hover:bg-swagger-panel hover:text-swagger-get hover:shadow-sm";

function CopyIconButton({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof MailIcon;
}) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => copy(value)}
        className={iconButtonClassName}
        aria-label={`Copy ${label}`}
      >
        <Icon size={18} />
      </button>
      <CopyTooltip visible={copied} />
    </div>
  );
}

export function SocialLinks() {
  const { contact } = profile.info;

  return (
    <div className="flex items-center gap-2">
      <a
        href={contact.github}
        target="_blank"
        rel="noopener noreferrer"
        className={iconButtonClassName}
        aria-label="GitHub"
        title="GitHub"
      >
        <GitHubIcon size={18} />
      </a>
      <a
        href={contact.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className={iconButtonClassName}
        aria-label="LinkedIn"
        title="LinkedIn"
      >
        <LinkedInIcon size={18} />
      </a>
      <CopyIconButton label="Email" value={contact.email} icon={MailIcon} />
      <CopyIconButton label="Phone" value={contact.phone} icon={PhoneIcon} />
    </div>
  );
}
