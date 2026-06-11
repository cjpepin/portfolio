export const profile = {
  info: {
    title: "Connor Pepin API Docs",
    version: "1.1.2",
    description:
      "Full-stack software engineer — Spring Boot microservices, React/React Native products, and local-first systems.",
    profileImage: "/ME_NEWER.JPG",
    contact: {
      name: "Connor Pepin",
      email: "cjpepin@wustl.edu",
      phone: "314-707-9026",
      location: "St. Louis, MO",
      github: "https://github.com/cjpepin",
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
      summary: "Spring Boot API features and continuous delivery platform work in a 10-person Agile team.",
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
      summary: "Full-stack lead building a greenfield application on AWS.",
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
      summary: "Legal document management with real-time hybrid sync.",
      responsibilities: [
        "Built a legal document and client management system with a real-time sync engine.",
        "Designed hybrid local + cloud architecture using PostgreSQL, Express, and webhooks.",
        "Shipped a feature-heavy MVP in under 4 weeks with the company CTO.",
      ],
      stack: ["PostgreSQL", "Express", "Webhooks", "TypeScript"],
    },
  ],
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
      description: "Millisecond-level document sync between local clients and cloud Postgres.",
      operations: [
        {
          id: "webhook-sync",
          summary: "Webhook-driven bidirectional sync",
          stack: ["Express", "PostgreSQL", "Webhooks"],
        },
        {
          id: "hybrid-arch",
          summary: "Hybrid local + cloud architecture",
          stack: ["Local storage", "Cloud Postgres"],
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
        "iOS-first language learning app combining EPUB reading, translation, vocabulary, and spaced repetition.",
      features: [
        "EPUB reader with highlights and resume",
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
    { id: "systems", label: "Contributions", tag: "operations" },
    { id: "projects", label: "Projects", tag: "gallery" },
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
