import { profile } from "../../../data/profile";
import { fetchProjectResponse } from "../../../lib/api/handlers";
import { ApiTryItPanel } from "../ApiTryItPanel";
import { ProjectPreview } from "../ProjectPreview";
import { extractProjectData } from "../projectResponse";
import { SectionHeader } from "../SectionHeader";

type Props = {
  trellisDemoBuilt: boolean;
};

export function ProjectsSection({ trellisDemoBuilt }: Props) {
  return (
    <div className="stagger-children space-y-2">
      <SectionHeader
        title="Projects"
        description="Each product is a documented endpoint. Execute to fetch the JSON payload and render the project preview."
      />

      {profile.projects.map((project) => (
        <ApiTryItPanel
          key={project.id}
          method={project.method}
          path={project.path}
          summary={`${project.name} — ${project.tagline}`}
          description={project.description}
          contentType="path parameter"
          fields={[
            {
              name: "project_id",
              type: "string",
              description: "Project record identifier",
              required: true,
              options: [{ value: project.id, label: project.id }],
            },
            {
              name: "include_features",
              type: "boolean",
              description: "Include feature bullets in the response",
              required: false,
              options: [
                { value: "true", label: "true" },
                { value: "false", label: "false" },
              ],
            },
            {
              name: "include_stack",
              type: "boolean",
              description: "Include stack tags in the response",
              required: false,
              options: [
                { value: "true", label: "true" },
                { value: "false", label: "false" },
              ],
            },
            {
              name: "include_links",
              type: "boolean",
              description: "Include demo, repository, and website links",
              required: false,
              defaultValue: "true",
              options: [
                { value: "true", label: "true" },
                { value: "false", label: "false" },
              ],
            },
          ]}
          onExecute={(values) => fetchProjectResponse(project.id, values)}
          renderPreview={(response) => {
            const data = extractProjectData(response);
            if (!data) {
              return (
                <div className="flex min-h-[12rem] items-center justify-center p-6 text-center text-sm text-swagger-muted">
                  No preview available for this response.
                </div>
              );
            }
            return <ProjectPreview data={data} trellisDemoBuilt={trellisDemoBuilt} />;
          }}
        />
      ))}
    </div>
  );
}
