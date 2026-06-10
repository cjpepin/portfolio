export type ExperienceData = {
  id: string;
  title: string;
  company: string;
  location: string;
  period: string;
  summary: string;
  responsibilities?: readonly string[];
  stack?: readonly string[];
};

export function extractExperiencePreview(response: unknown): ExperienceData | ExperienceData[] | null {
  if (!response || typeof response !== "object") return null;
  const record = response as Record<string, unknown>;
  if (record.status !== 200 || record.data === undefined) return null;

  if (Array.isArray(record.data)) {
    return record.data as ExperienceData[];
  }

  if (typeof record.data === "object" && record.data !== null) {
    return record.data as ExperienceData;
  }

  return null;
}
