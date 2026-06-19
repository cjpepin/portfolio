export type CaseStudyArchitectureStep = {
  label: string;
  detail: string;
};

export type CaseStudy = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  period: string;
  role: string;
  problem: string;
  constraints: readonly string[];
  approach: readonly string[];
  architecture: {
    summary: string;
    steps: readonly CaseStudyArchitectureStep[];
    diagram: string;
  };
  outcomes: readonly string[];
  stack: readonly string[];
  links: {
    demo?: string;
    github?: string;
    live?: string;
    portfolio?: string;
  };
  relatedExperienceId?: string;
  relatedProjectId?: string;
  relatedSystemId?: string;
};

export const caseStudies: readonly CaseStudy[] = [
  {
    id: "crosswalk",
    slug: "crosswalk",
    title: "Crosswalk Legal",
    subtitle: "Hybrid document sync MVP",
    period: "May 2025 – January 2026",
    role: "Engineering Consultant, full-stack",
    problem:
      "Crosswalk Legal needed a client and document management system where attorneys could work offline locally while staying in sync with a shared cloud database, without losing edits, sacrificing security, or blocking on network latency.",
    constraints: [
      "Ship a feature-heavy MVP in under four weeks with the company CTO",
      "Support bidirectional updates between local clients and cloud Postgres",
      "Keep conflict resolution predictable for legal document workflows",
      "Minimize infrastructure cost for an early-stage product",
    ],
    approach: [
      "Used PGLite as the local Postgres-compatible store so offline writes capture full CRUD context and ACL metadata before anything leaves the device",
      "Queued outbound changes in a local sync table and flushed them to the Express API when connectivity returned",
      "Persisted validated writes to cloud Postgres as the authoritative source of truth",
      "Used database triggers to detect row changes and route notifications by ACL — private, public, or user-specific shared data",
      "Delivered inbound updates to subscribed clients via webhooks so each device converged without manual refresh",
      "Built the full stack — data model, API, sync engine, and client integration — as sole engineer alongside the CTO",
    ],
    architecture: {
      summary:
        "Every edit lands in local PGLite first with enough metadata to replay offline. A sync table batches outbound work to the cloud API when online; Postgres triggers on the server detect changes, filter by ACL, and webhooks push updates back to the right clients.",
      steps: [
        {
          label: "1. Local edit",
          detail: "User makes a change in the desktop app — document, client record, or other entity.",
        },
        {
          label: "2. PGLite write",
          detail:
            "Change is saved to the local PGLite database with CRUD operation type, payload, and ACL scope so offline work is captured completely.",
        },
        {
          label: "3. Sync table upload",
          detail:
            "When connected, pending rows are read from the local sync table and sent to the cloud Express API.",
        },
        {
          label: "4. API → cloud DB",
          detail: "API validates the payload and inserts or updates the authoritative cloud Postgres database.",
        },
        {
          label: "5. Trigger + ACL routing",
          detail:
            "Postgres triggers detect the change and determine which clients should receive it based on ACL rules — private, public, or user-specific shared data.",
        },
        {
          label: "6. Webhook delivery",
          detail:
            "Eligible clients receive the update via webhook and apply it locally in PGLite, keeping every device in sync.",
        },
      ],
      diagram: `flowchart TB
  Client[Local client]
  Client -->|edit| PG[PGLite + sync queue]
  PG -->|when online| API[Express API]
  API --> DB[(Cloud Postgres)]
  DB --> ACL[Triggers + ACL filter]
  ACL --> WH[Webhook delivery]
  WH -->|apply update| Client`,
    },
    outcomes: [
      "Shipped a feature-heavy MVP in under four weeks",
      "Millisecond-level sync between local clients and cloud Postgres",
      "End-to-end ownership of API, data model, and sync engine",
      "Production-ready foundation for legal document and client management",
    ],
    stack: ["TypeScript", "Express", "PGLite", "PostgreSQL", "Webhooks", "Node.js"],
    links: {
      portfolio: "/#resume",
    },
    relatedExperienceId: "crosswalk",
    relatedSystemId: "crosswalk-sync",
  },
  {
    id: "lingoleaf",
    slug: "lingoleaf",
    title: "LingoLeaf",
    subtitle: "iOS language learning app",
    period: "December 2025 – Present",
    role: "Solo builder — mobile, backend, and product",
    problem:
      "Language learners lose context when they leave a book to look up words in another app. LingoLeaf needed to combine EPUB reading, in-context translation, vocabulary capture, and spaced repetition in one cohesive mobile experience.",
    constraints: [
      "Ship to the App Store as a solo developer with production-grade auth and data isolation",
      "Keep translation responsive with offline-friendly caching and rate limits",
      "Support premium entitlements and analytics without compromising guest/demo flows",
      "Maintain a demo mode embeddable in the portfolio for recruiters and clients",
    ],
    approach: [
      "Built the iOS app with Expo and React Native — EPUB reader, highlights, vocab lists, and flashcards",
      "Designed a cache-first translation pipeline backed by Supabase Postgres with Row Level Security",
      "Implemented auth, premium entitlements, and offline analytics on a single Supabase project",
      "Exported a web demo build for portfolio embedding with guided showcase and explore modes",
    ],
    architecture: {
      summary:
        "Mobile client reads EPUBs locally, requests translations through a cache-first pipeline, and persists study progress to Supabase with RLS-enforced user isolation.",
      steps: [
        {
          label: "EPUB reader",
          detail: "Text selection, highlights, resume position, and offline book downloads",
        },
        {
          label: "Translation pipeline",
          detail: "Cache-first lookups with rate-limited demo API and authenticated persistence",
        },
        {
          label: "Supabase backend",
          detail: "Auth, Postgres, RLS policies, and premium entitlements",
        },
        {
          label: "Study loop",
          detail: "Vocab lists and spaced repetition flashcards tied to reading context",
        },
      ],
      diagram: `flowchart LR
Reader[EPUB Reader] --> Translate[Translation Pipeline]
Translate --> Cache[Local Cache]
Translate --> API[Supabase API]
API --> DB[(Postgres RLS)]
Reader --> Vocab[Vocab Lists]
Vocab --> Study[Spaced Repetition]`,
    },
    outcomes: [
      "Live on the App Store with EPUB reading, translation, and spaced repetition",
      "Full-stack ownership from mobile UI through Supabase schema and RLS",
      "Portfolio-embeddable web demo with recruiter showcase mode",
      "Cache-first translation keeps reading flow uninterrupted",
    ],
    stack: ["Expo", "React Native", "TypeScript", "Supabase", "PostgreSQL", "Zustand"],
    links: {
      demo: "/lingoleaf/#try-demo",
      live: "https://apps.apple.com/us/app/lingoleaf/id6758588394",
      github: "https://github.com/cjpepin/lingoleaf",
      portfolio: "/lingoleaf/#showcase",
    },
    relatedProjectId: "lingoleaf",
  },
] as const;

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}
