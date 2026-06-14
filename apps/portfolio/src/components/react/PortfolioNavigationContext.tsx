import { createContext, useContext, type ReactNode } from "react";
import type { ScrollTarget, SectionId } from "../../lib/portfolioNavigation";

type PortfolioNavigationContextValue = {
  scrollToTarget: (target: ScrollTarget | SectionId, behavior?: ScrollBehavior) => void;
};

const PortfolioNavigationContext = createContext<PortfolioNavigationContextValue | null>(null);

export function PortfolioNavigationProvider({
  scrollToTarget,
  children,
}: {
  scrollToTarget: PortfolioNavigationContextValue["scrollToTarget"];
  children: ReactNode;
}) {
  return (
    <PortfolioNavigationContext.Provider value={{ scrollToTarget }}>
      {children}
    </PortfolioNavigationContext.Provider>
  );
}

export function usePortfolioNavigation(): PortfolioNavigationContextValue {
  const value = useContext(PortfolioNavigationContext);
  if (!value) {
    throw new Error("usePortfolioNavigation must be used within PortfolioNavigationProvider");
  }
  return value;
}
