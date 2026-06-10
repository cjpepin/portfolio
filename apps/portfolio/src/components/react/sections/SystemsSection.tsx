import { profile } from "../../../data/profile";
import { fetchContributionsResponse } from "../../../lib/api/handlers";
import { ApiTryItPanel } from "../ApiTryItPanel";
import { ContributionsPreview } from "../ContributionsPreview";
import { extractContributionsPreview } from "../contributionsResponse";
import { SectionHeader } from "../SectionHeader";

const contributionOptions = [
  { value: "all", label: "all contributions" },
  ...profile.systems.map((item) => ({
    value: item.id,
    label: `${item.title} — ${item.subtitle}`,
  })),
];

export function SystemsSection() {
  return (
    <div className="stagger-children">
      <SectionHeader
        title="Contributions"
        description="Retrieve one contribution or the full list via a single path operation."
      />

      <ApiTryItPanel
        method="GET"
        path="/api/v1/contributions/{contribution_id}"
        pathParams={["contribution_id"]}
        summary="Retrieve contributions by identifier"
        description="Pass all to list every contribution, or a specific contribution_id to fetch a single record. Optional query flags shape the response payload."
        contentType="parameters"
        autoExecuteOnMount
        fields={[
          {
            name: "contribution_id",
            type: "string",
            description: "Contribution record identifier, or all for the complete list",
            required: true,
            defaultValue: "all",
            in: "path",
            options: contributionOptions,
          },
          {
            name: "include_operations",
            type: "boolean",
            description: "Include operation details in the response",
            required: false,
            in: "query",
            options: [
              { value: "true", label: "true" },
              { value: "false", label: "false" },
            ],
          },
          {
            name: "verbose",
            type: "boolean",
            description: "Include stack tags per operation",
            required: false,
            in: "query",
            options: [
              { value: "true", label: "true" },
              { value: "false", label: "false" },
            ],
          },
        ]}
        onExecute={fetchContributionsResponse}
        renderPreview={(response) => {
          const data = extractContributionsPreview(response);
          if (!data) {
            return (
              <div className="flex min-h-[12rem] items-center justify-center p-6 text-center text-sm text-swagger-muted">
                No preview available for this response.
              </div>
            );
          }

          if (Array.isArray(data)) {
            return (
              <div className="space-y-4 p-4">
                {data.map((item) => (
                  <ContributionsPreview key={item.id} data={item} />
                ))}
              </div>
            );
          }

          return (
            <div className="p-4">
              <ContributionsPreview data={data} />
            </div>
          );
        }}
      />
    </div>
  );
}
