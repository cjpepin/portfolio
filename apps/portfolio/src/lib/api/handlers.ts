import {
  getAllExperience,
  getAllSystems,
  getDeveloperEducation,
  getDeveloperInfo,
  getDeveloperSkills,
  getExperienceById,
  getProjectById,
  getSystemById,
} from "../browserDb";
import type { DeveloperData } from "../../components/react/developerResponse";
import type { profile } from "../../data/profile";

const schemaMeta = {
  languages: { type: "string[]", description: "Primary programming languages" },
  frameworks: { type: "string[]", description: "Frameworks and UI stacks" },
  data: { type: "string[]", description: "Databases and data platforms" },
  platform: { type: "string[]", description: "Cloud and delivery tooling" },
  practices: { type: "string[]", description: "Engineering practices" },
  education: { type: "Education[]", description: "Academic credentials" },
} as const;

type SchemaKey = keyof typeof schemaMeta;

export async function fetchDeveloperResponse(
  values: Record<string, string>,
): Promise<{ data: DeveloperData }> {
  const include = values.include || "all";
  const format = values.format || "full";
  const info = await getDeveloperInfo();

  const base = {
    title: info.title,
    version: info.version,
    description: info.description,
    profileImage: info.profileImage,
  };

  if (format === "summary") {
    return {
      data: {
        ...base,
        contact: {
          name: info.contact.name,
          location: info.contact.location,
        },
      },
    };
  }

  const data: DeveloperData = { ...base };

  if (include === "all" || include === "contact") {
    data.contact = info.contact;
  }
  if (include === "all" || include === "skills") {
    data.skills = await getDeveloperSkills();
  }
  if (include === "all" || include === "education") {
    data.education = await getDeveloperEducation();
  }

  return { data };
}

export async function fetchSchemaResponse(values: Record<string, string>) {
  const schema = values.schema as SchemaKey;
  if (!schema) {
    throw new Error("schema is required");
  }

  const meta = schemaMeta[schema];
  const skills = await getDeveloperSkills();
  let items: readonly unknown[] =
    schema === "education" ? await getDeveloperEducation() : skills[schema];

  if (schema !== "education" && values.filter.trim()) {
    const needle = values.filter.trim().toLowerCase();
    items = (items as readonly string[]).filter((item) => item.toLowerCase().includes(needle));
  }

  const limit = parseInt(values.limit, 10);
  if (!Number.isNaN(limit) && limit > 0 && schema !== "education") {
    items = (items as readonly string[]).slice(0, limit);
  }

  return {
    data: {
      $ref: `#/components/schemas/${schema}`,
      type: meta.type,
      description: meta.description,
      example: items,
    },
  };
}

type ExperienceRecord = (typeof profile.experience)[number];

function shapeExperienceRecord(
  role: ExperienceRecord,
  values: Record<string, string>,
): Record<string, unknown> {
  const includeStack = values.include_stack !== "false";
  const includeResp = values.include_responsibilities !== "false";

  const data: Record<string, unknown> = {
    id: role.id,
    title: role.title,
    company: role.company,
    location: role.location,
    period: role.period,
    summary: role.summary,
  };

  if (includeResp) data.responsibilities = role.responsibilities;
  if (includeStack) data.stack = role.stack;

  return data;
}

export async function fetchExperienceResponse(values: Record<string, string>) {
  const roleId = values.role_id || "all";

  if (roleId === "all") {
    const roles = await getAllExperience();
    return { data: roles.map((role) => shapeExperienceRecord(role, values)) };
  }

  const role = await getExperienceById(roleId);
  if (!role) {
    throw new Error(`Unknown role_id: ${roleId}`);
  }

  return { data: shapeExperienceRecord(role, values) };
}

type ContributionRecord = (typeof profile.systems)[number];

function shapeContributionRecord(
  item: ContributionRecord,
  values: Record<string, string>,
): Record<string, unknown> {
  const includeOperations = values.include_operations !== "false";
  const verbose = values.verbose === "true";

  const data: Record<string, unknown> = {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    tag: item.tag,
    period: item.period,
    description: item.description,
  };

  if (includeOperations) {
    data.operations = item.operations.map((op) =>
      verbose ? op : { id: op.id, summary: op.summary },
    );
  }

  return data;
}

export async function fetchContributionsResponse(values: Record<string, string>) {
  const contributionId = values.contribution_id || "all";

  if (contributionId === "all") {
    const items = await getAllSystems();
    return { data: items.map((item) => shapeContributionRecord(item, values)) };
  }

  const item = await getSystemById(contributionId);
  if (!item) {
    throw new Error(`Unknown contribution_id: ${contributionId}`);
  }

  return { data: shapeContributionRecord(item, values) };
}

export async function fetchProjectResponse(projectId: string, values: Record<string, string>) {
  const project = await getProjectById(projectId);
  if (!project) {
    throw new Error(`Unknown project_id: ${values.project_id}`);
  }

  const includeFeatures = values.include_features !== "false";
  const includeStack = values.include_stack !== "false";
  const includeLinks = values.include_links !== "false";

  const data: Record<string, unknown> = {
    id: project.id,
    name: project.name,
    type: project.type,
    tagline: project.tagline,
    period: project.period,
    description: project.description,
  };

  if (includeFeatures) data.features = project.features;
  if (includeStack) data.stack = project.stack;
  if (includeLinks) data.links = project.links;

  return { data };
}
