import type { profile } from "../../data/profile";

export type DeveloperContact = {
  name: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  website: string;
};

export type DeveloperData = {
  title: string;
  version: string;
  description: string;
  profileImage?: string;
  contact?: DeveloperContact | Pick<DeveloperContact, "name" | "location">;
  skills?: (typeof profile.skills);
  education?: (typeof profile.education);
};

export function extractDeveloperData(response: unknown): DeveloperData | null {
  if (!response || typeof response !== "object") return null;
  const record = response as Record<string, unknown>;
  if (record.status !== 200 || !record.data || typeof record.data !== "object") return null;
  return record.data as DeveloperData;
}
