import { profile } from "../../../data/profile";
import { fetchExperienceResponse } from "../../../lib/api/handlers";
import { ApiTryItPanel } from "../ApiTryItPanel";
import { ExperiencePreview } from "../ExperiencePreview";
import { extractExperiencePreview } from "../experienceResponse";
import { SectionHeader } from "../SectionHeader";

const roleOptions = [
  { value: "all", label: "all roles" },
  ...profile.experience.map((role) => ({
    value: role.id,
    label: `${role.title} at ${role.company}`,
  })),
];

export function ExperienceSection() {
  return (
    <div className="stagger-children">
      <SectionHeader
        title="Experience"
        description="Retrieve one role or the full employment history via a single path operation."
      />

      <ApiTryItPanel
        method="GET"
        path="/api/v1/experience/{role_id}"
        pathParams={["role_id"]}
        summary="Retrieve employment history by role identifier"
        description="Pass all to list every role, or a specific role_id to fetch a single record. Optional query flags shape the response payload."
        contentType="parameters"
        fields={[
          {
            name: "role_id",
            type: "string",
            description: "Experience record identifier, or all for the complete list",
            required: true,
            defaultValue: "all",
            in: "path",
            options: roleOptions,
          },
          {
            name: "include_stack",
            type: "boolean",
            description: "Include stack tags in the response",
            required: false,
            in: "query",
            options: [
              { value: "true", label: "true" },
              { value: "false", label: "false" },
            ],
          },
          {
            name: "include_responsibilities",
            type: "boolean",
            description: "Include responsibility bullets",
            required: false,
            in: "query",
            options: [
              { value: "true", label: "true" },
              { value: "false", label: "false" },
            ],
          },
        ]}
        onExecute={fetchExperienceResponse}
        renderPreview={(response) => {
          const data = extractExperiencePreview(response);
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
                {data.map((role) => (
                  <ExperiencePreview key={role.id} data={role} />
                ))}
              </div>
            );
          }

          return (
            <div className="p-4">
              <ExperiencePreview data={data} />
            </div>
          );
        }}
      />
    </div>
  );
}
