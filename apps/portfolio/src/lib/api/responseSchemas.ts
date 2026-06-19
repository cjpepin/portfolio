export type ResponseSchema = {
  $ref: string;
  type: string;
  description?: string;
  properties?: Record<string, unknown>;
};

export const developerResponseSchema: ResponseSchema = {
  $ref: "#/components/schemas/DeveloperData",
  type: "object",
  description: "Developer profile payload",
  properties: {
    title: { type: "string" },
    version: { type: "string" },
    description: { type: "string" },
    profileImage: { type: "string" },
    contact: { $ref: "#/components/schemas/Contact" },
    skills: { $ref: "#/components/schemas/Skills" },
    education: { type: "array", items: { $ref: "#/components/schemas/Education" } },
  },
};

export const experienceResponseSchema: ResponseSchema = {
  $ref: "#/components/schemas/ExperienceData",
  type: "object",
  description: "Employment record or array of records",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    company: { type: "string" },
    location: { type: "string" },
    period: { type: "string" },
    summary: { type: "string" },
    responsibilities: { type: "array", items: { type: "string" } },
    stack: { type: "array", items: { type: "string" } },
  },
};

export const projectResponseSchema: ResponseSchema = {
  $ref: "#/components/schemas/ProjectData",
  type: "object",
  description: "Shipped product record",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    type: { type: "string" },
    tagline: { type: "string" },
    period: { type: "string" },
    description: { type: "string" },
    features: { type: "array", items: { type: "string" } },
    stack: { type: "array", items: { type: "string" } },
    links: { type: "object" },
  },
};

export const contributionResponseSchema: ResponseSchema = {
  $ref: "#/components/schemas/ContributionData",
  type: "object",
  description: "Platform contribution record",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    subtitle: { type: "string" },
    tag: { type: "string" },
    period: { type: "string" },
    description: { type: "string" },
    operations: { type: "array", items: { type: "object" } },
  },
};

export const contactResponseSchema: ResponseSchema = {
  $ref: "#/components/schemas/ContactResponse",
  type: "object",
  description: "Contact submission result",
  properties: {
    success: { type: "boolean" },
    message: { type: "string" },
    error: { type: "string" },
  },
};

export const schemaExplorerResponseSchema: ResponseSchema = {
  $ref: "#/components/schemas/SchemaExample",
  type: "object",
  description: "Typed schema with example values",
  properties: {
    $ref: { type: "string" },
    type: { type: "string" },
    description: { type: "string" },
    example: { type: "array" },
  },
};

export const metricsResponseSchema: ResponseSchema = {
  $ref: "#/components/schemas/Metrics",
  type: "array",
  description: "Server metrics and highlights",
  properties: {
    id: { type: "string" },
    value: { type: "string" },
    label: { type: "string" },
    context: { type: "string" },
  },
};
