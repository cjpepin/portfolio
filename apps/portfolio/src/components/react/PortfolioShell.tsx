import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { profile } from "../../data/profile";
import { ensureBrowserDbReady } from "../../lib/browserDb";
import {
  parsePortfolioHash,
  portfolioItemId,
  type ScrollTarget,
  type SectionId,
} from "../../lib/portfolioNavigation";
import { ApiPreviewPanel } from "./ApiPreviewPanel";
import { PreviewPanelProvider } from "./PreviewPanelContext";
import { ResizableSplit } from "./ResizableSplit";
import { SectionReveal } from "./SectionReveal";
import { SocialLinks } from "./SocialLinks";
import { ThemeToggle } from "./ThemeToggle";
import { ViewModeProvider, useViewMode } from "./ViewModeContext";
import { ViewModeToggle } from "./ViewModeToggle";
import { CompactNavRail } from "./CompactNavRail";
import { PortfolioNavigationProvider } from "./PortfolioNavigationContext";
import { ContactSection } from "./sections/ContactSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { OverviewSection } from "./sections/OverviewSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { SystemsSection } from "./sections/SystemsSection";

const sections: { id: SectionId; content: () => ReactNode }[] = [
  { id: "overview", content: () => <OverviewSection /> },
  { id: "experience", content: () => <ExperienceSection /> },
  { id: "projects", content: () => <ProjectsSection /> },
  { id: "systems", content: () => <SystemsSection /> },
  { id: "contact", content: () => <ContactSection /> },
];

function PortfolioShellContent() {
  const [activeId, setActiveId] = useState<SectionId>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { isReadable } = useViewMode();
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToTarget = useCallback(
    (target: ScrollTarget | SectionId, behavior: ScrollBehavior = "smooth") => {
      const resolved: ScrollTarget =
        typeof target === "string" ? { section: target } : target;
      const sectionEl = document.getElementById(resolved.section);
      if (!sectionEl) return;

      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      setActiveId(resolved.section);
      setMobileNavOpen(false);

      const hash = resolved.itemId
        ? portfolioItemId(resolved.section, resolved.itemId)
        : resolved.section;
      window.history.replaceState(null, "", `#${hash}`);

      const itemEl = resolved.itemId
        ? document.getElementById(portfolioItemId(resolved.section, resolved.itemId))
        : null;
      (itemEl ?? sectionEl).scrollIntoView({ behavior, block: "start" });

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, behavior === "smooth" ? 800 : 50);
    },
    [],
  );

  useEffect(() => {
    void ensureBrowserDbReady();
  }, []);

  useEffect(() => {
    const target = parsePortfolioHash(window.location.hash);
    if (target.section !== "overview" || target.itemId) {
      requestAnimationFrame(() => scrollToTarget(target, "auto"));
    }
  }, [scrollToTarget]);

  useEffect(() => {
    const onHashChange = () => {
      scrollToTarget(parsePortfolioHash(window.location.hash));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [scrollToTarget]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const top = visible[0];
        if (top?.target.id) {
          const id = top.target.id as SectionId;
          setActiveId(id);
          if (window.location.hash !== `#${id}`) {
            window.history.replaceState(null, "", `#${id}`);
          }
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return (
    <PortfolioNavigationProvider scrollToTarget={scrollToTarget}>
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 shrink-0 border-b border-swagger-border bg-swagger-bg/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6">
          <button
            type="button"
            onClick={() => scrollToTarget("overview")}
            className="flex items-center gap-2 font-mono text-sm font-semibold text-swagger-text transition-colors duration-200 hover:text-swagger-get"
          >
            <span className="text-swagger-get">{profile.info.title}</span>
            <span className="rounded bg-swagger-code px-1.5 py-0.5 text-xs text-swagger-muted">
              v{profile.info.version}
            </span>
          </button>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:flex">
              <SocialLinks />
            </div>
            <ViewModeToggle />
            <ThemeToggle />
            <button
              type="button"
              className="rounded border border-swagger-border px-3 py-1.5 font-mono text-xs text-swagger-muted transition-colors duration-200 hover:text-swagger-text md:hidden"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-expanded={mobileNavOpen}
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <CompactNavRail activeId={activeId} onNavigate={scrollToTarget} />

        {isReadable ? (
          <div className="relative min-w-0 flex-1 overflow-y-auto">
            {mobileNavOpen && (
              <nav
                className="sticky top-14 z-30 border-b border-swagger-border bg-swagger-panel p-3 shadow-lg animate-fade-in md:hidden"
                aria-label="Mobile navigation"
              >
                <ul className="space-y-0.5">
                  {profile.navigation.map((item) => {
                    const active = activeId === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => scrollToTarget(item.id)}
                          className={`block w-full rounded px-3 py-2 text-left text-sm transition-colors duration-200 ${
                            active ? "nav-link-active" : "text-swagger-muted hover:text-swagger-text"
                          }`}
                        >
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-3 flex justify-center border-t border-swagger-border pt-3 sm:hidden">
                  <SocialLinks />
                </div>
                <div className="mt-3 flex justify-center border-t border-swagger-border pt-3 sm:hidden">
                  <ViewModeToggle />
                </div>
              </nav>
            )}

            <main className="px-4 py-6 md:px-8 lg:px-10">
              {sections.map((section) => (
                <SectionReveal key={section.id} id={section.id}>
                  <div className="mx-auto max-w-4xl">{section.content()}</div>
                </SectionReveal>
              ))}
            </main>
          </div>
        ) : (
          <ResizableSplit
            left={
              <div className="relative min-w-0">
                {mobileNavOpen && (
                  <nav
                    className="sticky top-14 z-30 border-b border-swagger-border bg-swagger-panel p-3 shadow-lg animate-fade-in md:hidden"
                    aria-label="Mobile navigation"
                  >
                    <ul className="space-y-0.5">
                      {profile.navigation.map((item) => {
                        const active = activeId === item.id;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => scrollToTarget(item.id)}
                              className={`block w-full rounded px-3 py-2 text-left text-sm transition-colors duration-200 ${
                                active ? "nav-link-active" : "text-swagger-muted hover:text-swagger-text"
                              }`}
                            >
                              {item.label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-3 flex justify-center border-t border-swagger-border pt-3 sm:hidden">
                      <SocialLinks />
                    </div>
                    <div className="mt-3 flex justify-center border-t border-swagger-border pt-3 sm:hidden">
                      <ViewModeToggle />
                    </div>
                  </nav>
                )}

                <main className="px-4 py-6 md:px-8 lg:px-10">
                  {sections.map((section) => (
                    <SectionReveal key={section.id} id={section.id}>
                      <div className="mx-auto max-w-4xl">{section.content()}</div>
                    </SectionReveal>
                  ))}
                </main>
              </div>
            }
            right={<ApiPreviewPanel />}
          />
        )}
      </div>
    </div>
    </PortfolioNavigationProvider>
  );
}

export function PortfolioShell() {
  return (
    <ViewModeProvider>
      <PreviewPanelProvider>
        <PortfolioShellContent />
      </PreviewPanelProvider>
    </ViewModeProvider>
  );
}
