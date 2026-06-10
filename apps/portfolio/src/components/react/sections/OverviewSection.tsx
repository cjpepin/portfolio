import { fetchDeveloperResponse } from "../../../lib/api/handlers";
import { extractDeveloperData } from "../developerResponse";
import { DeveloperProfilePreview } from "../DeveloperProfilePreview";
import { ApiTryItPanel } from "../ApiTryItPanel";
import { SectionHeader } from "../SectionHeader";

export function OverviewSection() {
  return (
    <div className="stagger-children">
      <SectionHeader
        title="Overview"
      />
      <ApiTryItPanel
        method="GET"
        path="/api/v1/developer"
        summary="Retrieve developer profile and contact metadata"
        description="Query optional includes to shape the response payload. No authentication required."
        contentType="query parameters"
        autoExecuteOnMount
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
