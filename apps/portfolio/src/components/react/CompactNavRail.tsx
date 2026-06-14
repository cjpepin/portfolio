import { profile } from "../../data/profile";

type NavItem = (typeof profile.navigation)[number];
type SectionId = NavItem["id"];

type Props = {
  activeId: SectionId;
  onNavigate: (id: SectionId) => void;
};

export function CompactNavRail({ activeId, onNavigate }: Props) {
  return (
    <aside className="relative z-[9999] hidden w-11 shrink-0 overflow-visible border-r border-swagger-border md:block">
      <nav
        className="sticky top-14 flex max-h-[calc(100vh-3.5rem)] flex-col items-center gap-1 overflow-visible py-4"
        aria-label="Documentation sections"
      >
        <ul className="flex flex-col items-center gap-1">
          {profile.navigation.map((item) => {
            const active = activeId === item.id;
            return (
              <li key={item.id} className="group relative">
                <button
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex h-9 w-9 items-center justify-center rounded font-mono text-[10px] font-medium uppercase tracking-tight transition-all duration-200 ${
                    active
                      ? "bg-swagger-code text-swagger-get shadow-sm"
                      : "text-swagger-muted hover:bg-swagger-panel hover:text-swagger-text"
                  }`}
                  aria-label={item.label}
                  aria-current={active ? "true" : undefined}
                >
                  {active && (
                    <span
                      className="absolute -left-px top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-swagger-get"
                      aria-hidden
                    />
                  )}
                  {item.id.slice(0, 3)}
                </button>

                <div
                  role="tooltip"
                  className="pointer-events-none absolute left-[calc(100%+0.5rem)] top-1/2 z-[9999] -translate-y-1/2 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100 translate-x-1"
                >
                  <div className="flex items-center gap-2 whitespace-nowrap rounded border border-swagger-border bg-swagger-panel px-2.5 py-1.5 text-sm shadow-lg">
                    <span className="font-mono text-[10px] uppercase text-swagger-muted">{item.tag}</span>
                    <span className="font-medium text-swagger-text">{item.label}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
