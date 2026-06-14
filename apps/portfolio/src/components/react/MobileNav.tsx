import { useState } from "react";
import { profile } from "../../data/profile";

interface Props {
  currentSection?: string;
}

export function MobileNav({ currentSection = "overview" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-swagger-post px-4 py-3 font-mono text-sm font-semibold text-white shadow-lg transition-transform duration-200 hover:scale-105"
        aria-expanded={open}
        aria-label="Toggle navigation"
      >
        {open ? "Close" : "Menu"}
      </button>
      {open && (
        <nav
          className="absolute bottom-14 right-0 w-56 rounded border border-swagger-border bg-swagger-panel p-2 shadow-xl animate-fade-in"
          aria-label="Mobile navigation"
        >
          <ul className="space-y-0.5">
            {profile.navigation.map((item) => {
              const active = currentSection === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`/#${item.id}`}
                    onClick={() => setOpen(false)}
                    className={`block rounded px-3 py-2 text-sm transition-colors duration-200 ${
                      active ? "bg-swagger-code text-swagger-get" : "text-swagger-muted hover:text-swagger-text"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
