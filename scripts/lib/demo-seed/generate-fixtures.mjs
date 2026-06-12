import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEMO_USER_IDS } from "./constants.mjs";
import { sqlArray, sqlJson, sqlString, sqlUuid } from "./sql.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const fixturesDir = path.join(repoRoot, "fixtures/demo-seed");

function readFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(fixturesDir, `${name}.json`), "utf8"));
}

function writeFile(relativePath, content) {
  const target = path.join(repoRoot, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
  return target;
}

function toIdbStore(rows, idSelector) {
  return rows.map((row) => ({
    id: idSelector(row),
    value: row
  }));
}

function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(day, deltaDays) {
  const [year, month, date] = day.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, date + deltaDays));
  return next.toISOString().slice(0, 10);
}

function shiftIsoDays(iso, deltaDays) {
  const base = new Date(iso);
  if (Number.isNaN(base.getTime())) return iso;
  base.setUTCDate(base.getUTCDate() + deltaDays);
  return base.toISOString();
}

function gutenbergCacheEpubUrl(sourceId) {
  return `https://www.gutenberg.org/cache/epub/${sourceId}/pg${sourceId}-images-3.epub`;
}

function prepareLingoleafDemoData(data) {
  const today = localDateKey();
  const yesterday = addDays(today, -1);
  const twoDaysAgo = addDays(today, -2);
  const anchorDay = "2025-06-09";
  const dayOffset = Math.round(
    (Date.parse(`${today}T12:00:00.000Z`) - Date.parse(`${anchorDay}T12:00:00.000Z`)) /
      (24 * 60 * 60 * 1000),
  );

  const shiftDay = (day) => addDays(day, dayOffset);

  return {
    ...data,
    version: "lingoleaf-demo-v5",
    books: data.books.map((book) => ({
      ...book,
      epub_url: book.source_id ? gutenbergCacheEpubUrl(book.source_id) : book.epub_url,
      created_at: shiftIsoDays(book.created_at, dayOffset),
    })),
    userBooks: data.userBooks.map((row) => ({
      ...row,
      last_read_at: row.last_read_at ? shiftIsoDays(row.last_read_at, dayOffset) : null,
      created_at: shiftIsoDays(row.created_at, dayOffset),
      updated_at: shiftIsoDays(row.updated_at, dayOffset),
      highlights: (row.highlights ?? []).map((highlight) => ({
        ...highlight,
        created_at: shiftIsoDays(highlight.created_at, dayOffset),
      })),
    })),
    readingSessions: data.readingSessions.map((session) => ({
      ...session,
      started_at: shiftIsoDays(session.started_at, dayOffset),
      ended_at: shiftIsoDays(session.ended_at, dayOffset),
    })),
    studyWords: data.studyWords.map((word) => ({
      ...word,
      created_at: shiftIsoDays(word.created_at, dayOffset),
    })),
    studyWordReviews: (data.studyWordReviews ?? []).map((review) => ({
      ...review,
      next_review_at: shiftIsoDays(review.next_review_at, dayOffset),
    })),
    userSettings: {
      ...data.userSettings,
      created_at: shiftIsoDays(data.userSettings.created_at, dayOffset),
      updated_at: shiftIsoDays(data.userSettings.updated_at, dayOffset),
    },
    gardenState: {
      ...data.gardenState,
      total_gp: 320,
      stage: "young_tree",
      freshness: "fresh",
      streak_days: 6,
      last_goal_completed_on: yesterday,
      last_activity_on: today,
      created_at: shiftIsoDays(data.gardenState.created_at, dayOffset),
      updated_at: shiftIsoDays(data.gardenState.updated_at, dayOffset),
    },
    gardenDailyProgress: (data.gardenDailyProgress ?? []).map((row, index) => ({
      ...row,
      day: index === 0 ? today : yesterday,
      reading_minutes: index === 0 ? 30 : 25,
      goal_completed: true,
      created_at: shiftIsoDays(row.created_at, dayOffset),
      updated_at: shiftIsoDays(row.updated_at, dayOffset),
    })),
    vocabLists: data.vocabLists.map((list) => ({
      ...list,
      created_at: shiftIsoDays(list.created_at, dayOffset),
      updated_at: shiftIsoDays(list.updated_at, dayOffset),
      last_used_at: shiftIsoDays(list.last_used_at, dayOffset),
    })),
  };
}

function generateLingoleafIdbSeed(data) {
  const userId = data.demoUserId;

  return {
    version: data.version,
    stores: {
      books: toIdbStore(
        data.books.map((book) => ({ ...book, cover_path: book.cover_path ?? null })),
        (book) => book.id
      ),
      user_books: toIdbStore(
        data.userBooks.map((row) => ({
          user_id: userId,
          book_id: row.book_id,
          last_cfi: row.last_cfi ?? null,
          highlights: row.highlights ?? [],
          last_read_at: row.last_read_at,
          status: row.status,
          created_at: row.created_at,
          updated_at: row.updated_at
        })),
        (row) => row.book_id
      ),
      vocab_lists: toIdbStore(
        data.vocabLists.map((list) => ({
          ...list,
          user_id: userId
        })),
        (list) => list.id
      ),
      study_words: toIdbStore(
        data.studyWords.map((word) => ({
          ...word,
          user_id: userId
        })),
        (word) => word.id
      ),
      reading_sessions: toIdbStore(
        data.readingSessions.map((session) => ({
          id: session.id,
          user_id: userId,
          book_id: session.book_id,
          started_at: session.started_at,
          ended_at: session.ended_at,
          minutes: session.minutes,
          book_title: data.books.find((book) => book.id === session.book_id)?.title ?? null,
          created_at: session.started_at
        })),
        (session) => session.id
      ),
      user_settings: toIdbStore(
        [
          {
            user_id: userId,
            ...data.userSettings
          }
        ],
        (row) => row.user_id
      ),
      user_garden_state: toIdbStore(
        [
          {
            user_id: userId,
            ...data.gardenState
          }
        ],
        (row) => row.user_id
      ),
      user_garden_daily_progress: toIdbStore(
        (data.gardenDailyProgress ?? []).map((row) => ({
          user_id: userId,
          ...row
        })),
        (row) => `${row.user_id}:${row.day}`
      ),
      study_word_reviews: toIdbStore(
        (data.studyWordReviews ?? []).map((row) => ({
          ...row,
          created_at: row.created_at ?? new Date().toISOString(),
          updated_at: row.updated_at ?? new Date().toISOString(),
        })),
        (row) => row.study_word_id
      ),
    }
  };
}

function generateLingoleafSql(data) {
  const userId = data.demoUserId;
  const lines = [
    "-- LingoLeaf demo seed data (generated from fixtures/demo-seed/lingoleaf.json)",
    "-- Run after migrations and demo auth users exist.",
    ""
  ];

  lines.push("INSERT INTO lingoleaf.books (id, title, author, storage_path, source_lang, epub_url, is_general, description, subjects_text)");
  lines.push("VALUES");
  lines.push(
    data.books
      .map(
        (book) =>
          `  (${sqlUuid(book.id)}, ${sqlString(book.title)}, ${sqlString(book.author)}, ${sqlString(book.storage_path)}, ${sqlString(book.source_lang)}, ${sqlString(book.epub_url)}, ${book.is_general ? "true" : "false"}, ${sqlString(book.description)}, ${sqlString(book.subjects_text)})`
      )
      .join(",\n")
  );
  lines.push(
    "ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, author = EXCLUDED.author, storage_path = EXCLUDED.storage_path, source_lang = EXCLUDED.source_lang, epub_url = EXCLUDED.epub_url, is_general = EXCLUDED.is_general, description = EXCLUDED.description, subjects_text = EXCLUDED.subjects_text;",
    ""
  );

  lines.push("INSERT INTO lingoleaf.translation_cache (source_lang, target_lang, term_normalized, translation)");
  lines.push("VALUES");
  lines.push(
    data.translationCache
      .map(
        (row) =>
          `  (${sqlString(row.source_lang)}, ${sqlString(row.target_lang)}, ${sqlString(row.term_normalized)}, ${sqlString(row.translation)})`
      )
      .join(",\n")
  );
  lines.push("ON CONFLICT (source_lang, target_lang, term_normalized) DO NOTHING;", "");

  lines.push("INSERT INTO lingoleaf.vocab_lists (id, user_id, name, created_at, updated_at, last_used_at)");
  lines.push("VALUES");
  lines.push(
    data.vocabLists
      .map(
        (list) =>
          `  (${sqlUuid(list.id)}, ${sqlUuid(userId)}, ${sqlString(list.name)}, ${sqlString(list.created_at)}, ${sqlString(list.updated_at)}, ${sqlString(list.last_used_at)})`
      )
      .join(",\n")
  );
  lines.push(
    "ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, updated_at = EXCLUDED.updated_at, last_used_at = EXCLUDED.last_used_at;",
    ""
  );

  lines.push("INSERT INTO lingoleaf.user_books (user_id, book_id, last_cfi, highlights, last_read_at, status, created_at, updated_at)");
  lines.push("VALUES");
  lines.push(
    data.userBooks
      .map(
        (row) =>
          `  (${sqlUuid(userId)}, ${sqlUuid(row.book_id)}, ${sqlString(row.last_cfi)}, ${sqlJson(row.highlights)}, ${sqlString(row.last_read_at)}, ${sqlString(row.status)}, ${sqlString(row.created_at)}, ${sqlString(row.updated_at)})`
      )
      .join(",\n")
  );
  lines.push(
    "ON CONFLICT (user_id, book_id) DO UPDATE SET last_cfi = EXCLUDED.last_cfi, highlights = EXCLUDED.highlights, last_read_at = EXCLUDED.last_read_at, status = EXCLUDED.status, updated_at = EXCLUDED.updated_at;",
    ""
  );

  lines.push(
    "INSERT INTO lingoleaf.study_words (id, user_id, book_id, list_id, source_lang, target_lang, term, term_normalized, translation, context_snippet, starred, created_at)"
  );
  lines.push("VALUES");
  lines.push(
    data.studyWords
      .map(
        (word) =>
          `  (${sqlUuid(word.id)}, ${sqlUuid(userId)}, ${sqlUuid(word.book_id)}, ${word.list_id ? sqlUuid(word.list_id) : "null"}, ${sqlString(word.source_lang)}, ${sqlString(word.target_lang)}, ${sqlString(word.term)}, ${sqlString(word.term_normalized)}, ${sqlString(word.translation)}, ${sqlString(word.context_snippet)}, ${word.starred ? "true" : "false"}, ${sqlString(word.created_at)})`
      )
      .join(",\n")
  );
  lines.push(
    "ON CONFLICT (id) DO UPDATE SET list_id = EXCLUDED.list_id, translation = EXCLUDED.translation, context_snippet = EXCLUDED.context_snippet, starred = EXCLUDED.starred;",
    ""
  );

  if (data.studyWordReviews?.length) {
    lines.push(
      "INSERT INTO lingoleaf.study_word_reviews (study_word_id, next_review_at, interval_minutes, last_rating, review_count)"
    );
    lines.push("VALUES");
    lines.push(
      data.studyWordReviews
        .map(
          (review) =>
            `  (${sqlUuid(review.study_word_id)}, ${sqlString(review.next_review_at)}, ${review.interval_minutes}, ${sqlString(review.last_rating)}, ${review.review_count})`
        )
        .join(",\n")
    );
    lines.push(
      "ON CONFLICT (study_word_id) DO UPDATE SET next_review_at = EXCLUDED.next_review_at, interval_minutes = EXCLUDED.interval_minutes, last_rating = EXCLUDED.last_rating, review_count = EXCLUDED.review_count;",
      ""
    );
  }

  const readingSessionRows = data.readingSessions
    .map(
      (session) =>
        `  (${sqlUuid(session.id)}, ${sqlUuid(userId)}, ${sqlString(session.started_at)}, ${sqlString(session.ended_at)}, ${session.minutes * 60}, ${sqlUuid(session.book_id)})`
    )
    .join(",\n");

  lines.push(
    "-- reading_sessions: 046+ uses duration_seconds; older migrations used minutes",
    "DO $$",
    "BEGIN",
    "  IF EXISTS (",
    "    SELECT 1 FROM information_schema.columns",
    "    WHERE table_schema = 'lingoleaf'",
    "      AND table_name = 'reading_sessions'",
    "      AND column_name = 'duration_seconds'",
    "  ) THEN",
    "    INSERT INTO lingoleaf.reading_sessions (id, user_id, started_at, ended_at, duration_seconds, book_id)",
    "    VALUES",
    readingSessionRows,
    "    ON CONFLICT (id) DO NOTHING;",
    "  ELSIF EXISTS (",
    "    SELECT 1 FROM information_schema.columns",
    "    WHERE table_schema = 'lingoleaf'",
    "      AND table_name = 'reading_sessions'",
    "      AND column_name = 'minutes'",
    "  ) THEN",
    "    INSERT INTO lingoleaf.reading_sessions (id, user_id, started_at, ended_at, minutes, book_id)",
    "    VALUES",
    data.readingSessions
      .map(
        (session) =>
          `      (${sqlUuid(session.id)}, ${sqlUuid(userId)}, ${sqlString(session.started_at)}, ${sqlString(session.ended_at)}, ${session.minutes}, ${sqlUuid(session.book_id)})`
      )
      .join(",\n"),
    "    ON CONFLICT (id) DO NOTHING;",
    "  END IF;",
    "END $$;",
    ""
  );

  return `${lines.join("\n")}\n`;
}

function buildAnalyticsDashboard(data) {
  const now = new Date();
  const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const dailyMap = new Map();
  const failureDaily = new Map();
  const topEvents = new Map();
  const recent = [];

  for (const template of data.analyticsEvents) {
    const createdAt = new Date(now.getTime() - template.days_ago * 24 * 60 * 60 * 1000);
    const day = createdAt.toISOString().slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + template.count);
    topEvents.set(template.event_name, (topEvents.get(template.event_name) ?? 0) + template.count);
    if (template.event_name.includes("fail")) {
      failureDaily.set(day, (failureDaily.get(day) ?? 0) + template.count);
    }

    for (let index = 0; index < Math.min(template.count, 3); index += 1) {
      recent.push({
        id: `evt-${template.event_name}-${template.days_ago}-${index}`,
        created_at: new Date(createdAt.getTime() - index * 60_000).toISOString(),
        user_id: index % 2 === 0 ? DEMO_USER_IDS.forum1 : null,
        event_name: template.event_name,
        event_version: 1,
        install_id: `install-ios-${template.days_ago}${index}`,
        app_version: template.app_version,
        platform: template.platform,
        locale: "en-US",
        ...(template.event_name === "purchase_failed"
          ? {
              severity: "critical",
              error_code: "storekit_timeout",
              error_message: "StoreKit purchase sheet timed out",
              purchase_product_id: "lingoleaf.premium.monthly",
              purchase_price: 4.99,
              purchase_currency: "USD",
              purchase_storefront: "USA"
            }
          : {})
      });
    }
  }

  const totalEvents = [...dailyMap.values()].reduce((sum, count) => sum + count, 0);
  const totalFailures = [...failureDaily.values()].reduce((sum, count) => sum + count, 0);

  return {
    summary: {
      from: from.toISOString(),
      to: now.toISOString(),
      totals: {
        events: totalEvents,
        failures: totalFailures,
        users: 214,
        installs: 178,
        last_event_at: recent[0]?.created_at ?? now.toISOString()
      },
      daily_events: [...dailyMap.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([day, count]) => ({ day, count })),
      daily_failures: [...failureDaily.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([day, count]) => ({ day, count })),
      top_events: [...topEvents.entries()]
        .sort((left, right) => right[1] - left[1])
        .map(([event_name, count]) => ({ event_name, count }))
    },
    recent_events: recent.slice(0, 12)
  };
}

function generateLingoleafWebIdbSeeds(data) {
  const analytics = buildAnalyticsDashboard(data);

  const forumSeed = {
    version: data.version,
    stores: {
      feature_requests: toIdbStore(data.featureRequests, (row) => row.id),
      feature_votes: toIdbStore(data.featureVotes, (row) => `${row.feature_id}:${row.user_id}`),
      feature_comments: toIdbStore(data.featureComments, (row) => row.id)
    }
  };

  const blogSeed = {
    version: data.version,
    stores: {
      blog_posts: toIdbStore(data.blogPosts, (row) => row.id),
      blog_comments: toIdbStore(data.blogComments, (row) => row.id)
    }
  };

  const analyticsSeed = {
    version: "lingoleaf-web-analytics-v2",
    stores: {
      analytics_dashboard: [{ id: "default", value: analytics }]
    }
  };

  return { forumSeed, blogSeed, analyticsSeed };
}

function generateLingoleafWebSql(data) {
  const lines = [
    "-- LingoLeaf web demo seed (generated from fixtures/demo-seed/lingoleaf-web.json)",
    "-- Bypass auth/rate-limit triggers; vote/comment counts are seeded explicitly.",
    "BEGIN;",
    "SET LOCAL session_replication_role = replica;",
    "",
    `INSERT INTO lingoleaf.forum_admins (user_id) VALUES (${sqlUuid(data.adminUserId)}) ON CONFLICT (user_id) DO NOTHING;`,
    ""
  ];

  lines.push(
    "INSERT INTO lingoleaf.feature_requests (id, created_by, title, body, tags, status, pinned, locked, vote_count, comment_count, created_at, updated_at)"
  );
  lines.push("VALUES");
  lines.push(
    data.featureRequests
      .map(
        (row) =>
          `  (${sqlUuid(row.id)}, ${sqlUuid(row.created_by)}, ${sqlString(row.title)}, ${sqlString(row.body)}, ${sqlArray(row.tags)}, ${sqlString(row.status)}, ${row.pinned ? "true" : "false"}, ${row.locked ? "true" : "false"}, ${row.vote_count}, ${row.comment_count}, ${sqlString(row.created_at)}, ${sqlString(row.updated_at)})`
      )
      .join(",\n")
  );
  lines.push(
    "ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, body = EXCLUDED.body, tags = EXCLUDED.tags, status = EXCLUDED.status, pinned = EXCLUDED.pinned, locked = EXCLUDED.locked, vote_count = EXCLUDED.vote_count, comment_count = EXCLUDED.comment_count, updated_at = EXCLUDED.updated_at;",
    ""
  );

  lines.push("INSERT INTO lingoleaf.feature_votes (feature_id, user_id)");
  lines.push("VALUES");
  lines.push(
    data.featureVotes
      .map((row) => `  (${sqlUuid(row.feature_id)}, ${sqlUuid(row.user_id)})`)
      .join(",\n")
  );
  lines.push("ON CONFLICT (feature_id, user_id) DO NOTHING;", "");

  lines.push(
    "INSERT INTO lingoleaf.feature_comments (id, feature_id, created_by, body, created_at, updated_at)"
  );
  lines.push("VALUES");
  lines.push(
    data.featureComments
      .map(
        (row) =>
          `  (${sqlUuid(row.id)}, ${sqlUuid(row.feature_id)}, ${sqlUuid(row.created_by)}, ${sqlString(row.body)}, ${sqlString(row.created_at)}, ${sqlString(row.updated_at)})`
      )
      .join(",\n")
  );
  lines.push("ON CONFLICT (id) DO NOTHING;", "");

  lines.push(
    "INSERT INTO lingoleaf.blog_posts (id, created_by, title, summary, body, comment_count, created_at, updated_at)"
  );
  lines.push("VALUES");
  lines.push(
    data.blogPosts
      .map(
        (row) =>
          `  (${sqlUuid(row.id)}, ${sqlUuid(row.created_by)}, ${sqlString(row.title)}, ${sqlString(row.summary)}, ${sqlString(row.body)}, ${row.comment_count}, ${sqlString(row.created_at)}, ${sqlString(row.updated_at)})`
      )
      .join(",\n")
  );
  lines.push(
    "ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, body = EXCLUDED.body, comment_count = EXCLUDED.comment_count, updated_at = EXCLUDED.updated_at;",
    ""
  );

  lines.push("INSERT INTO lingoleaf.blog_comments (id, post_id, created_by, body, created_at, updated_at)");
  lines.push("VALUES");
  lines.push(
    data.blogComments
      .map(
        (row) =>
          `  (${sqlUuid(row.id)}, ${sqlUuid(row.post_id)}, ${sqlUuid(row.created_by)}, ${sqlString(row.body)}, ${sqlString(row.created_at)}, ${sqlString(row.updated_at)})`
      )
      .join(",\n")
  );
  lines.push("ON CONFLICT (id) DO NOTHING;", "");

  const analytics = buildAnalyticsDashboard(data);
  lines.push("INSERT INTO lingoleaf.analytics_events (event_name, event_version, user_id, install_id, app_version, platform, locale, metadata, created_at)");
  lines.push("VALUES");
  lines.push(
    analytics.recent_events
      .map(
        (event) =>
          `  (${sqlString(event.event_name)}, ${event.event_version}, ${event.user_id ? sqlUuid(event.user_id) : "null"}, ${sqlString(event.install_id)}, ${sqlString(event.app_version)}, ${sqlString(event.platform)}, ${sqlString(event.locale)}, '{}'::jsonb, ${sqlString(event.created_at)})`
      )
      .join(",\n")
  );
  lines.push(";", "");

  lines.push(
    "SET LOCAL session_replication_role = DEFAULT;",
    "COMMIT;",
    ""
  );

  return `${lines.join("\n")}\n`;
}

function generateTrellisSql(data) {
  const userId = data.demoUserId;
  const workspaceId = data.workspace.id;
  const slugToId = new Map(data.notes.map((note) => [note.slug, note.id]));

  const lines = [
    "-- Trellis cloud demo seed (generated from fixtures/demo-seed/trellis-cloud.json)",
    "",
    `INSERT INTO trellis.profiles (id, email, is_admin) VALUES (${sqlUuid(userId)}, ${sqlString("demo-trellis@trellis.local")}, true) ON CONFLICT (id) DO UPDATE SET is_admin = EXCLUDED.is_admin;`,
    "",
    `INSERT INTO trellis.workspaces (id, owner_user_id, name, slug, migration_status) VALUES (${sqlUuid(workspaceId)}, ${sqlUuid(userId)}, ${sqlString(data.workspace.name)}, ${sqlString(data.workspace.slug)}, 'completed') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;`,
    ""
  ];

  lines.push(
    "INSERT INTO trellis.notes (id, workspace_id, slug, title, markdown_body, frontmatter_json, excerpt, note_type, folder_path, source_count)"
  );
  lines.push("VALUES");
  lines.push(
    data.notes
      .map(
        (note) =>
          `  (${sqlUuid(note.id)}, ${sqlUuid(workspaceId)}, ${sqlString(note.slug)}, ${sqlString(note.title)}, ${sqlString(note.markdown_body)}, ${sqlJson(note.frontmatter_json)}, ${sqlString(note.excerpt)}, ${sqlString(note.note_type)}, ${sqlString(note.folder_path)}, ${note.frontmatter_json.sources ?? 0})`
      )
      .join(",\n")
  );
  lines.push("ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, markdown_body = EXCLUDED.markdown_body, excerpt = EXCLUDED.excerpt;", "");

  if (data.noteLinks?.length) {
    lines.push("INSERT INTO trellis.note_links (workspace_id, source_note_id, target_slug, target_title)");
    lines.push("VALUES");
    lines.push(
      data.noteLinks
        .map(
          (link) =>
            `  (${sqlUuid(workspaceId)}, ${sqlUuid(slugToId.get(link.source_slug))}, ${sqlString(link.target_slug)}, ${sqlString(link.target_title)})`
        )
        .join(",\n")
    );
    lines.push(
      "ON CONFLICT (workspace_id, source_note_id, target_slug) DO UPDATE SET target_title = EXCLUDED.target_title;",
      ""
    );
  }

  lines.push(
    "INSERT INTO trellis.chat_sessions (id, workspace_id, legacy_id, title, model, message_count)"
  );
  lines.push("VALUES");
  lines.push(
    data.chatSessions
      .map(
        (session) =>
          `  (${sqlUuid(session.id)}, ${sqlUuid(workspaceId)}, ${sqlString(session.legacy_id)}, ${sqlString(session.title)}, ${sqlString(session.model)}, ${session.message_count})`
      )
      .join(",\n")
  );
  lines.push("ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, message_count = EXCLUDED.message_count;", "");

  lines.push(
    "INSERT INTO trellis.chat_messages (id, session_id, role, content, created_at)"
  );
  lines.push("VALUES");
  lines.push(
    data.chatMessages
      .map(
        (message) =>
          `  (${sqlUuid(message.id)}, ${sqlUuid(message.session_id)}, ${sqlString(message.role)}, ${sqlString(message.content)}, ${sqlString(message.created_at)})`
      )
      .join(",\n")
  );
  lines.push("ON CONFLICT (id) DO NOTHING;", "");

  return `${lines.join("\n")}\n`;
}

export function generateAllFixtures() {
  const lingoleaf = prepareLingoleafDemoData(readFixture("lingoleaf"));
  const lingoleafWeb = readFixture("lingoleaf-web");
  const trellisCloud = readFixture("trellis-cloud");

  const lingoleafIdb = generateLingoleafIdbSeed(lingoleaf);
  const lingoleafWebIdb = generateLingoleafWebIdbSeeds(lingoleafWeb);

  const outputs = [
    writeFile(
      "projects/lingoleaf/src/demo/seed.json",
      `${JSON.stringify(lingoleafIdb, null, 2)}\n`
    ),
    writeFile("projects/lingoleaf/supabase/demo/seed.sql", generateLingoleafSql(lingoleaf)),
    writeFile(
      "projects/lingoleaf-web/src/lib/demo/forum-seed.json",
      `${JSON.stringify(lingoleafWebIdb.forumSeed, null, 2)}\n`
    ),
    writeFile(
      "projects/lingoleaf-web/src/lib/demo/blog-seed.json",
      `${JSON.stringify(lingoleafWebIdb.blogSeed, null, 2)}\n`
    ),
    writeFile(
      "projects/lingoleaf-web/src/lib/demo/analytics-seed.json",
      `${JSON.stringify(lingoleafWebIdb.analyticsSeed, null, 2)}\n`
    ),
    writeFile("projects/lingoleaf-web/supabase/demo/seed.sql", generateLingoleafWebSql(lingoleafWeb)),
    writeFile("projects/trellis/supabase/demo/seed.sql", generateTrellisSql(trellisCloud))
  ];

  return outputs;
}
