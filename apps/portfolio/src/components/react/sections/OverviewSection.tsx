import { useEffect, useState } from "react";
import { fetchDeveloperDefaults, fetchDeveloperResponse } from "../../../lib/api/handlers";
import { extractDeveloperData } from "../developerResponse";
import { DeveloperProfilePreview } from "../DeveloperProfilePreview";
import { ApiTryItPanel } from "../ApiTryItPanel";
import { HeroStrip } from "../HeroStrip";
import { usePreviewPanel } from "../PreviewPanelContext";
import { SectionHeader } from "../SectionHeader";
import { useViewMode } from "../ViewModeContext";

export function OverviewSection() {
  const { isReadable } = useViewMode();
  const { publishPreview } = usePreviewPanel();

  useEffect(() => {
    if (isReadable) return;

    let cancelled = false;

    void (async () => {
      try {
        const result = await fetchDeveloperDefaults();
        if (cancelled) return;
        const data = result.data;
        publishPreview({
          method: "GET",
          path: "/api/v1/developer?include=all&format=full",
          content: <DeveloperProfilePreview data={data} />,
        });
      } catch {
        // Preview panel stays on empty state if seed data is unavailable.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isReadable, publishPreview]);

  if (isReadable) {
    return (
      <ReadableOverview />
    );
  }

  return (
    <div className="stagger-children">
      <HeroStrip />
      <SectionHeader title="Overview" />
      <ApiTryItPanel
        method="GET"
        path="/api/v1/developer"
        summary="Retrieve developer profile and contact metadata"
        description="Query optional includes to shape the response payload. No authentication required."
        contentType="query parameters"
        fields={[
          {
            name: "include",
            type: "string",
            description: "Comma-separated sections to include in the response",
            required: false,
            defaultValue: "all",
            options: [
              { value: "contact", label: "contact" },
              { value: "skills", label: "skills" },
              { value: "education", label: "education" },
              { value: "all", label: "all" },
            ],
          },
          {
            name: "format",
            type: "string",
            description: "Response serialization format",
            required: false,
            defaultValue: "full",
            options: [
              { value: "summary", label: "summary" },
              { value: "full", label: "full" },
            ],
          },
        ]}
        onExecute={fetchDeveloperResponse}
        renderPreview={(response) => {
          const data = extractDeveloperData(response);
          if (!data) {
            return (
              <div className="flex min-h-[12rem] items-center justify-center p-6 text-center text-sm text-swagger-muted">
                No preview available for this response.
              </div>
            );
          }
          return <DeveloperProfilePreview data={data} />;
        }}
      />
    </div>
  );
}

function ReadableOverview() {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchDeveloperDefaults>>["data"] | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    void fetchDeveloperDefaults().then((result) => {
      if (!cancelled) setData(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="stagger-children space-y-6">
      <HeroStrip />
      {data ? (
        <DeveloperProfilePreview data={data} />
      ) : (
        <div className="swagger-panel p-6 text-sm text-swagger-muted">Loading profile…</div>
      )}
    </div>
  );
}
