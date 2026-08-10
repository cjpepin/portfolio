/** Same-origin path — synced static export, no third-party auth. */
const DEFAULT_GLOBAL_DEBT_APP_PATH = "/global-debt/app/";

export const forFunProjects = [
  {
    id: "global-debt",
    name: "Global//Debt",
    tagline: "Interactive world debt atlas",
    type: "web",
    description:
      "Global debt visualized through a spinning globe. Just for fun.",
    stack: ["Next.js", "vinext", "D3", "Cloudflare Workers"],
    links: {
      website: DEFAULT_GLOBAL_DEBT_APP_PATH,
    },
    accent: "from-violet-500/10 to-fuchsia-600/5",
  },
] as const;

export type ForFunProject = (typeof forFunProjects)[number];
export type ForFunProjectId = ForFunProject["id"];

export function getForFunProjectById(id: string): ForFunProject | undefined {
  return forFunProjects.find((project) => project.id === id);
}

/** Opens the debt atlas directly — no portfolio iframe or ChatGPT Sites login. */
export function getGlobalDebtAppUrl(): string {
  const fromEnv = import.meta.env.PUBLIC_GLOBAL_DEBT_URL;
  if (typeof fromEnv === "string" && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }
  return DEFAULT_GLOBAL_DEBT_APP_PATH;
}
