import { useEffect, useState } from "react";
import { profile } from "../../../data/profile";
import { portfolioItemId, scrollAnchorClass } from "../../../lib/portfolioNavigation";
import { fetchProjectDefaults, fetchProjectResponse } from "../../../lib/api/handlers";
import { ApiTryItPanel } from "../ApiTryItPanel";
import { ProjectPreview } from "../ProjectPreview";
import { extractProjectData } from "../projectResponse";
import { SectionHeader } from "../SectionHeader";
import { useViewMode } from "../ViewModeContext";
import type { ProjectData } from "../projectResponse";

export function ProjectsSection() {
  const { isReadable } = useViewMode();

  if (isReadable) {
    return <ReadableProjects />;
  }

  return (
    <div className="stagger-children space-y-2">
      <SectionHeader
        title="Projects"
        description="Each product is a documented endpoint. Execute to fetch the JSON payload and render the project preview."
      />

      {profile.projects.map((project) => (
        <div
          key={project.id}
          id={portfolioItemId("projects", project.id)}
          className={scrollAnchorClass}
        >
          <ApiTryItPanel
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
            return <ProjectPreview data={data} />;
          }}
        />
        </div>
      ))}
    </div>
  );
}

function ReadableProjects() {
  const [projects, setProjects] = useState<ProjectData[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all(profile.projects.map((project) => fetchProjectDefaults(project.id))).then(
      (results) => {
        if (cancelled) return;
        setProjects(results.map((result) => result.data as ProjectData));
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="stagger-children space-y-4">
      <SectionHeader
        title="Projects"
        description="Shipped products across mobile, desktop, and web — each with live demos where available."
      />
      {projects ? (
        projects.map((project) => <ProjectPreview key={project.id} data={project} />)
      ) : (
        <div className="swagger-panel p-6 text-sm text-swagger-muted">Loading projects…</div>
      )}
    </div>
  );
}
