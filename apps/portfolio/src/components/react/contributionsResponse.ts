export type ContributionOperation = {
  id: string;
  summary: string;
  stack?: readonly string[];
};

export type ContributionData = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  period: string;
  description: string;
  operations?: readonly ContributionOperation[];
};

export function extractContributionsPreview(
  response: unknown,
): ContributionData | ContributionData[] | null {
  if (!response || typeof response !== "object") return null;
  const record = response as Record<string, unknown>;
  if (record.status !== 200 || record.data === undefined) return null;

  if (Array.isArray(record.data)) {
    return record.data as ContributionData[];
  }

  if (typeof record.data === "object" && record.data !== null) {
    return record.data as ContributionData;
  }

  return null;
}
