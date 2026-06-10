import type { profile } from "../../data/profile";

export type ProjectData = {
  id: string;
  name: string;
  type: (typeof profile.projects)[number]["type"];
  tagline: string;
  period: string;
  description: string;
  features?: readonly string[];
  stack?: readonly string[];
  links?: (typeof profile.projects)[number]["links"];
};

export function extractProjectData(response: unknown): ProjectData | null {
  if (!response || typeof response !== "object") return null;
  const record = response as Record<string, unknown>;
  if (record.status !== 200 || !record.data || typeof record.data !== "object") return null;
  return record.data as ProjectData;
}
