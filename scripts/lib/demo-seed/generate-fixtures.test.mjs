import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { generateAllFixtures } from "./generate-fixtures.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

test("generateAllFixtures writes expanded demo seeds", () => {
  const outputs = generateAllFixtures();
  assert.equal(outputs.length, 7);

  const lingoleafSeed = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "projects/lingoleaf/src/demo/seed.json"), "utf8"),
  );
  assert.equal(lingoleafSeed.version, "lingoleaf-demo-v2");
  assert.ok(lingoleafSeed.stores.user_books.length >= 3);
  assert.ok(lingoleafSeed.stores.study_words.length >= 5);
  assert.ok(lingoleafSeed.stores.vocab_lists.length >= 2);

  const forumSeed = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "projects/lingoleaf-web/src/lib/demo/forum-seed.json"), "utf8"),
  );
  assert.ok(forumSeed.stores.feature_requests.length >= 5);

  const lingoleafWebSql = fs.readFileSync(
    path.join(repoRoot, "projects/lingoleaf-web/supabase/demo/seed.sql"),
    "utf8",
  );
  assert.match(lingoleafWebSql, /SET LOCAL session_replication_role = replica;/);

  const trellisSql = fs.readFileSync(
    path.join(repoRoot, "projects/trellis/supabase/demo/seed.sql"),
    "utf8",
  );
  assert.match(trellisSql, /trellis\.notes/);
  assert.match(trellisSql, /trellis\.chat_sessions/);
});
