/**
 * Fetch Project Gutenberg book metadata from Gutendex for demo seed fixtures.
 *
 * Usage:
 *   node scripts/lib/demo-seed/fetch-gutendex-books.mjs --ids 2000,17489,1342
 *   node scripts/lib/demo-seed/fetch-gutendex-books.mjs --lang es --limit 3
 */

function argValue(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) return null;
  return value;
}

function pickBestEpubUrl(formats) {
  if (!formats || typeof formats !== "object") return null;
  const direct = formats["application/epub+zip"];
  if (typeof direct === "string") return direct;
  for (const [key, value] of Object.entries(formats)) {
    if (typeof value === "string" && key.toLowerCase().includes("epub")) return value;
  }
  return null;
}

function pickCoverUrl(formats) {
  if (!formats || typeof formats !== "object") return null;
  const jpg = formats["image/jpeg"];
  return typeof jpg === "string" ? jpg : null;
}

function toSubjectsText(subjects, bookshelves) {
  const merged = [...(subjects ?? []), ...(bookshelves ?? [])].filter(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
  return merged.length > 0 ? merged.join(", ") : null;
}

function mapGutendexBook(book, index) {
  const gutenbergId = book?.id;
  if (typeof gutenbergId !== "number") return null;

  const title = typeof book?.title === "string" ? book.title.trim() : "";
  if (!title) return null;

  const authors = Array.isArray(book?.authors) ? book.authors : [];
  const author =
    authors.find((entry) => typeof entry?.name === "string" && entry.name.trim().length > 0)?.name ??
    null;

  const languages = Array.isArray(book?.languages)
    ? book.languages.filter((value) => typeof value === "string")
    : [];
  const sourceLang = languages[0] ?? null;

  const subjects = Array.isArray(book?.subjects)
    ? book.subjects.filter((value) => typeof value === "string")
    : null;
  const bookshelves = Array.isArray(book?.bookshelves)
    ? book.bookshelves.filter((value) => typeof value === "string")
    : null;

  const summaries = Array.isArray(book?.summaries)
    ? book.summaries.filter((value) => typeof value === "string")
    : [];
  const description = summaries[0] ?? null;

  const slot = index + 1;
  const demoId = `11111111-1111-4111-8111-11111111110${slot}`;

  return {
    id: demoId,
    title,
    author,
    storage_path: null,
    cover_path: null,
    cover_url: pickCoverUrl(book?.formats),
    source_lang: sourceLang,
    epub_url: pickBestEpubUrl(book?.formats),
    source: "gutenberg",
    source_id: String(gutenbergId),
    is_general: true,
    description,
    subjects_text: toSubjectsText(subjects, bookshelves),
    created_at: "2025-01-01T00:00:00.000Z",
  };
}

async function fetchByIds(ids) {
  const url = `https://gutendex.com/books/?ids=${ids.join(",")}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Gutendex fetch failed: ${response.status}`);
  }
  const json = await response.json();
  const results = Array.isArray(json?.results) ? json.results : [];
  const byId = new Map(results.map((book) => [book.id, book]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

async function fetchByLanguage(lang, limit) {
  const url = `https://gutendex.com/books/?languages=${encodeURIComponent(lang)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Gutendex fetch failed: ${response.status}`);
  }
  const json = await response.json();
  const results = Array.isArray(json?.results) ? json.results : [];
  return results.slice(0, limit);
}

async function main() {
  const idsArg = argValue("--ids");
  const lang = argValue("--lang");
  const limit = Number(argValue("--limit") ?? "3");

  let rawBooks;
  if (idsArg) {
    const ids = idsArg
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value));
    rawBooks = await fetchByIds(ids);
  } else if (lang) {
    rawBooks = await fetchByLanguage(lang, limit);
  } else {
    rawBooks = await fetchByIds([2000, 17489, 1342]);
  }

  const books = rawBooks
    .map((book, index) => mapGutendexBook(book, index))
    .filter(Boolean);

  process.stdout.write(`${JSON.stringify(books, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
