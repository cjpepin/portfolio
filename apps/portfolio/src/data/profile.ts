export const profile = {
  positioning: {
    headline: "Full-stack engineer shipping products across all stacks",
    subheadline:
      "Spring Boot platform work, greenfield web and mobile products, and fast contract MVPs.",
  },
  metrics: [
    {
      id: "cd-lead-time",
      value: "86%",
      label: "deployment lead-time reduction",
      context: "Mastercard CD platform",
    },
    {
      id: "caralyst-deal",
      value: "$100K",
      label: "deal secured with full-stack app",
      context: "WashU School of Medicine x Caralyst",
      target: { section: "experience", itemId: "caralyst" },
    },
    {
      id: "mvp-weeks",
      value: "<4 weeks",
      label: "MVP delivery",
      context: "Crosswalk Legal",
      target: { section: "experience", itemId: "crosswalk" },
    },
    {
      id: "app-store",
      value: "Shipped",
      label: "iOS app live",
      context: "LingoLeaf",
      target: { section: "projects", itemId: "lingoleaf" },
    },
  ],
  info: {
    title: "Connor Pepin",
    apiDocsTitle: "Connor Pepin API",
    version: "1.2.0",
    description:
      "Full-stack engineer owning the stack end to end — Spring Boot APIs and CD platform at Mastercard, greenfield React/Node products, and shipped mobile apps with Supabase backends.",
    profileImage: "/ME_NEWER.JPG",
    contact: {
      name: "Connor Pepin",
      email: "cjpepin@wustl.edu",
      phone: "314-707-9026",
      location: "St. Louis, MO",
      github: "https://github.com/cjpepin",
      linkedin: "https://www.linkedin.com/in/connor-pepin-10954b192/",
      website: "https://connorjpepin.com",
    },
  },
  education: [
    {
      institution: "Washington University in St. Louis",
      degree: "Bachelor of Computer Science and Mathematics",
      graduated: "May 2023",
    },
  ],
  skills: {
    languages: ["JavaScript", "TypeScript", "Java", "Python", "SQL", "C#", "C++"],
    frameworks: [
      "Spring Boot",
      "Node.js",
      "React",
      "React Native",
      "Angular",
      "Vue",
      "Express",
      "Astro",
      "Electron",
    ],
    data: ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Supabase"],
    platform: ["AWS", "Cloudflare", "Jenkins", "CI/CD", "Cloud Foundry"],
    practices: [
      "Unit & Integration Testing",
      "Agile Development",
      "AI-assisted Development",
      "REST & GraphQL",
    ],
    other: ["Spanish Proficiency"],
  },
  experience: [
    {
      id: "mastercard",
      title: "Software Engineer",
      company: "Mastercard",
      location: "O'Fallon, MO",
      period: "August 2023 – Present",
      summary:
        "Full-stack platform engineer delivering Spring Boot APIs and continuous delivery tooling in a 10-person Agile team.",
      responsibilities: [
        "Delivered new Spring Boot API features improving digital redemption capabilities.",
        "Developed features and fixed defects for a continuous delivery platform, reducing deployment lead time by 86%.",
        "Drove innovation with 3 proof-of-concept applications presented to senior leadership.",
        "Expanded integration and unit testing (JUnit, Mockito), reducing production defects.",
      ],
      stack: ["Java", "Spring Boot", "REST", "JUnit", "Mockito", "Jenkins", "Agile"],
    },
    {
      id: "caralyst",
      title: "Lead Engineer",
      company: "Caralyst Health",
      location: "Remote",
      period: "November 2022 – May 2024",
      summary:
        "Full-stack lead owning frontend, API, and data layers for a greenfield healthcare application on AWS.",
      responsibilities: [
        "Designed and built a full-stack application from scratch with React, Angular, Node.js, and MySQL on AWS.",
        "Collaborated with the CTO on cloud architecture for scalability and reliability.",
        "Developed comprehensive server-side integration tests.",
        "Mentored developers on best practices, code reviews, and workflows.",
      ],
      stack: ["React", "Angular", "Node.js", "MySQL", "AWS"],
    },
    {
      id: "crosswalk",
      title: "Engineering Consultant",
      company: "Crosswalk Legal",
      location: "Remote",
      period: "May 2025 – January 2026",
      summary:
        "Contract full-stack engineer shipping a legal document platform with real-time hybrid sync in under four weeks.",
      responsibilities: [
        "Built a legal document and client management system with a real-time sync engine.",
        "Designed hybrid local + cloud architecture with PGLite offline storage, Express APIs, and ACL-aware webhook fan-out.",
        "Shipped a feature-heavy MVP in under 4 weeks with the company CTO.",
      ],
      stack: ["PGLite", "PostgreSQL", "Express", "Webhooks", "TypeScript"],
    },
  ],
  resume: {
    filePath: "/resume.pdf",
    updatedAt: "June 2025",
  },
  systems: [
    {
      id: "repo-magik",
      method: "GET" as const,
      path: "/systems/repo-magik",
      tag: "analytics",
      title: "Repo Magik",
      subtitle: "Mastercard Internal Application",
      period: "December 2023 – Present",
      description:
        "Full-stack analytics platform parsing 250+ repositories to examine story lead times and DevOps trends.",
      operations: [
        {
          id: "parse-repos",
          summary: "Parse repository history for lead time metrics",
          stack: ["React", "TypeScript", "Spring Boot", "PostgreSQL"],
        },
        {
          id: "present-insights",
          summary: "Present trends to engineering leadership and TPMs",
          stack: ["Data visualization", "REST APIs"],
        },
      ],
    },
    {
      id: "crosswalk-sync",
      method: "GET" as const,
      path: "/systems/crosswalk-sync",
      tag: "sync",
      title: "Crosswalk Sync Engine",
      subtitle: "Crosswalk Legal",
      period: "May 2025 – January 2026",
      description:
        "Local-first sync: PGLite offline writes, sync-table upload, and ACL-scoped webhook delivery from cloud Postgres.",
      operations: [
        {
          id: "local-sync",
          summary: "PGLite local store with sync table for offline CRUD + ACL metadata",
          stack: ["PGLite", "TypeScript"],
        },
        {
          id: "webhook-sync",
          summary: "DB triggers route ACL-filtered changes to clients via webhooks",
          stack: ["Express", "PostgreSQL", "Webhooks"],
        },
        {
          id: "hybrid-arch",
          summary: "Express API validates sync payloads and persists to cloud Postgres",
          stack: ["Express", "Node.js", "PostgreSQL"],
        },
      ],
    },
    {
      id: "mastercard-cd",
      method: "GET" as const,
      path: "/systems/mastercard-cd",
      tag: "platform",
      title: "Continuous Delivery Platform",
      subtitle: "Mastercard",
      period: "August 2023 – Present",
      description: "Platform improvements that cut deployment lead time by 86%.",
      operations: [
        {
          id: "pipeline-features",
          summary: "Feature delivery and defect fixes on CD platform",
          stack: ["Jenkins", "Groovy", "Cloud Foundry"],
        },
        {
          id: "api-services",
          summary: "RESTful microservice features with expanded test coverage",
          stack: ["Spring Boot", "JUnit", "Mockito"],
        },
      ],
    },
  ],
  projects: [
    {
      id: "lingoleaf",
      method: "GET" as const,
      path: "/api/v1/projects/lingoleaf",
      name: "LingoLeaf",
      tagline: "Read in any language. Learn as you go.",
      type: "mobile",
      period: "December 2025 – Present",
      description:
        "Shipped iOS language learning app — EPUB reading, in-context translation, vocabulary, and spaced repetition.",
      features: [
        "Live on the App Store (Expo / React Native)",
        "Cache-first translation pipeline",
        "Supabase Auth, Postgres, and Row Level Security",
        "Premium entitlements and offline analytics",
      ],
      stack: ["Expo", "React Native", "TypeScript", "Supabase", "Zustand"],
      links: {
        demo: true,
        appStore: "https://apps.apple.com/us/app/lingoleaf/id6758588394",
        github: "https://github.com/cjpepin/lingoleaf",
        website: "/lingoleaf/",
      },
      accent: "from-emerald-500/20 to-teal-600/10",
    },
    {
      id: "trellis",
      method: "GET" as const,
      path: "/api/v1/projects/trellis",
      name: "Trellis",
      tagline: "Local-first AI knowledge app",
      type: "desktop",
      period: "December 2025 – Present",
      description:
        "Electron desktop app where chats persist as structured markdown notes in a user-owned vault, with hybrid local/cloud AI.",
      features: [
        "Markdown vault with YAML frontmatter",
        "Electron + SQLite + IPC architecture",
        "Supabase Edge Functions for cloud chat and extraction",
        "Full regression and E2E test coverage",
      ],
      stack: ["Electron", "React", "TypeScript", "SQLite", "Supabase"],
      links: {
        demo: true,
        github: "https://github.com/cjpepin/trellis",
        website: "/trellis",
      },
      accent: "from-amber-500/20 to-orange-600/10",
    },
    {
      id: "caralyst",
      method: "GET" as const,
      path: "/api/v1/projects/caralyst",
      name: "Caralyst Health",
      tagline: "Full-stack healthcare platform",
      type: "web",
      period: "November 2022 – May 2024",
      description: "Greenfield full-stack application built as lead engineer with the CTO.",
      features: [
        "React and Angular frontends",
        "Node.js API layer",
        "MySQL on AWS with integration test suite",
      ],
      stack: ["React", "Angular", "Node.js", "MySQL", "AWS"],
      links: {
        website: "https://my.caralyst.io",
      },
      accent: "from-blue-500/20 to-indigo-600/10",
    },
  ],
  navigation: [
    { id: "overview", label: "Overview", tag: "info" },
    { id: "experience", label: "Experience", tag: "paths" },
    { id: "projects", label: "Projects", tag: "gallery" },
    { id: "resume", label: "Resume", tag: "document" },
    { id: "contact", label: "Contact", tag: "post" },
  ],
} as const;

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export function methodColor(method: HttpMethod): string {
  const map: Record<HttpMethod, string> = {
    GET: "bg-swagger-get",
    POST: "bg-swagger-post",
    PUT: "bg-swagger-put",
    DELETE: "bg-swagger-delete",
  };
  return map[method];
}
