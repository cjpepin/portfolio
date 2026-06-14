import { profile } from "../data/profile";

export type SectionId = (typeof profile.navigation)[number]["id"];

export type ScrollTarget = {
  section: SectionId;
  itemId?: string;
};

export function portfolioItemId(section: SectionId, itemId: string): string {
  return `${section}-${itemId}`;
}

export function targetHash(target: ScrollTarget): string {
  return target.itemId
    ? `#${portfolioItemId(target.section, target.itemId)}`
    : `#${target.section}`;
}

export function parsePortfolioHash(hash: string): ScrollTarget {
  const normalized = hash.replace(/^#/, "");
  if (!normalized) return { section: "overview" };

  const exact = profile.navigation.find((item) => item.id === normalized);
  if (exact) return { section: exact.id };

  for (const item of profile.navigation) {
    const prefix = `${item.id}-`;
    if (normalized.startsWith(prefix)) {
      return { section: item.id, itemId: normalized.slice(prefix.length) };
    }
  }

  return { section: "overview" };
}

export const scrollAnchorClass = "scroll-mt-16 md:scroll-mt-[4.5rem]";
