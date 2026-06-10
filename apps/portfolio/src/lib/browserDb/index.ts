import { profile } from "../../data/profile";

const DB_NAME = "portfolio-api";
const DB_VERSION = 1;

const STORES = {
  meta: "meta",
  developer: "developer",
  experience: "experience",
  systems: "systems",
  projects: "projects",
} as const;

type DeveloperKey = "info" | "skills" | "education";

let dbPromise: Promise<IDBDatabase> | null = null;
let readyPromise: Promise<void> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.meta)) {
        db.createObjectStore(STORES.meta);
      }
      if (!db.objectStoreNames.contains(STORES.developer)) {
        db.createObjectStore(STORES.developer);
      }
      if (!db.objectStoreNames.contains(STORES.experience)) {
        db.createObjectStore(STORES.experience, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.systems)) {
        db.createObjectStore(STORES.systems, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.projects)) {
        db.createObjectStore(STORES.projects, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
  });

  return dbPromise;
}

function transaction<T>(
  storeNames: string | string[],
  mode: IDBTransactionMode,
  run: (tx: IDBTransaction) => IDBRequest<T> | Promise<T>,
): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeNames, mode);
        const result = run(tx);

        const finish = (value: T) => {
          tx.oncomplete = () => resolve(value);
          tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
          tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
        };

        if (result instanceof Promise) {
          void result.then(finish).catch(reject);
          return;
        }

        result.onsuccess = () => finish(result.result as T);
        result.onerror = () => reject(result.error ?? new Error("IndexedDB request failed"));
      }),
  );
}

function getMeta(key: string): Promise<string | undefined> {
  return transaction(STORES.meta, "readonly", (tx) => tx.objectStore(STORES.meta).get(key)).then(
    (value) => (typeof value === "string" ? value : undefined),
  );
}

function setMeta(key: string, value: string): Promise<void> {
  return transaction(STORES.meta, "readwrite", (tx) => {
    tx.objectStore(STORES.meta).put(value, key);
    return Promise.resolve(undefined);
  });
}

function putDeveloper(key: DeveloperKey, value: unknown): Promise<void> {
  return transaction(STORES.developer, "readwrite", (tx) => {
    tx.objectStore(STORES.developer).put(value, key);
    return Promise.resolve(undefined);
  });
}

function putExperience(records: (typeof profile.experience)[number][]): Promise<void> {
  return transaction([STORES.experience], "readwrite", (tx) => {
    const store = tx.objectStore(STORES.experience);
    store.clear();
    for (const record of records) {
      store.put(record);
    }
    return Promise.resolve(undefined);
  });
}

function putSystems(records: (typeof profile.systems)[number][]): Promise<void> {
  return transaction([STORES.systems], "readwrite", (tx) => {
    const store = tx.objectStore(STORES.systems);
    store.clear();
    for (const record of records) {
      store.put(record);
    }
    return Promise.resolve(undefined);
  });
}

function putProjects(records: (typeof profile.projects)[number][]): Promise<void> {
  return transaction([STORES.projects], "readwrite", (tx) => {
    const store = tx.objectStore(STORES.projects);
    store.clear();
    for (const record of records) {
      store.put(record);
    }
    return Promise.resolve(undefined);
  });
}

function profileSeedFingerprint(): string {
  return JSON.stringify({
    version: profile.info.version,
    info: profile.info,
    skills: profile.skills,
    education: profile.education,
    experience: profile.experience,
    systems: profile.systems,
    projects: profile.projects,
  });
}

async function seedFromSource(): Promise<void> {
  await Promise.all([
    setMeta("seedVersion", profileSeedFingerprint()),
    putDeveloper("info", profile.info),
    putDeveloper("skills", profile.skills),
    putDeveloper("education", profile.education),
    putExperience([...profile.experience]),
    putSystems([...profile.systems]),
    putProjects([...profile.projects]),
  ]);
}

async function hydrateIfNeeded(): Promise<void> {
  const db = await openDatabase();
  const storedFingerprint = await getMeta("seedVersion");
  const currentFingerprint = profileSeedFingerprint();

  if (storedFingerprint === currentFingerprint) {
    return;
  }

  await seedFromSource();
  void db;
}

export async function ensureBrowserDbReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = hydrateIfNeeded();
  }
  await readyPromise;
}

export async function getDeveloperInfo(): Promise<typeof profile.info> {
  await ensureBrowserDbReady();
  const value = await transaction(STORES.developer, "readonly", (tx) =>
    tx.objectStore(STORES.developer).get("info"),
  );
  if (!value || typeof value !== "object") {
    throw new Error("Developer info not found in browser database");
  }
  return value as typeof profile.info;
}

export async function getDeveloperSkills(): Promise<typeof profile.skills> {
  await ensureBrowserDbReady();
  const value = await transaction(STORES.developer, "readonly", (tx) =>
    tx.objectStore(STORES.developer).get("skills"),
  );
  if (!value || typeof value !== "object") {
    throw new Error("Developer skills not found in browser database");
  }
  return value as typeof profile.skills;
}

export async function getDeveloperEducation(): Promise<typeof profile.education> {
  await ensureBrowserDbReady();
  const value = await transaction(STORES.developer, "readonly", (tx) =>
    tx.objectStore(STORES.developer).get("education"),
  );
  if (!Array.isArray(value)) {
    throw new Error("Developer education not found in browser database");
  }
  return value as unknown as typeof profile.education;
}

export async function getAllExperience(): Promise<(typeof profile.experience)[number][]> {
  await ensureBrowserDbReady();
  const value = await transaction(STORES.experience, "readonly", (tx) =>
    tx.objectStore(STORES.experience).getAll(),
  );
  return value as (typeof profile.experience)[number][];
}

export async function getExperienceById(
  id: string,
): Promise<(typeof profile.experience)[number] | undefined> {
  await ensureBrowserDbReady();
  const value = await transaction(STORES.experience, "readonly", (tx) =>
    tx.objectStore(STORES.experience).get(id),
  );
  return value as (typeof profile.experience)[number] | undefined;
}

export async function getAllSystems(): Promise<(typeof profile.systems)[number][]> {
  await ensureBrowserDbReady();
  const value = await transaction(STORES.systems, "readonly", (tx) =>
    tx.objectStore(STORES.systems).getAll(),
  );
  return value as (typeof profile.systems)[number][];
}

export async function getSystemById(
  id: string,
): Promise<(typeof profile.systems)[number] | undefined> {
  await ensureBrowserDbReady();
  const value = await transaction(STORES.systems, "readonly", (tx) =>
    tx.objectStore(STORES.systems).get(id),
  );
  return value as (typeof profile.systems)[number] | undefined;
}

export async function getAllProjects(): Promise<(typeof profile.projects)[number][]> {
  await ensureBrowserDbReady();
  const value = await transaction(STORES.projects, "readonly", (tx) =>
    tx.objectStore(STORES.projects).getAll(),
  );
  return value as (typeof profile.projects)[number][];
}

export async function getProjectById(
  id: string,
): Promise<(typeof profile.projects)[number] | undefined> {
  await ensureBrowserDbReady();
  const value = await transaction(STORES.projects, "readonly", (tx) =>
    tx.objectStore(STORES.projects).get(id),
  );
  return value as (typeof profile.projects)[number] | undefined;
}
