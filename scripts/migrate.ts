import { createPool } from "@vercel/postgres";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

async function migrate() {
  const db = createPool();

  const migrationsDir = join(process.cwd(), "db", "migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`Running ${files.length} migration(s)...`);

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf-8");
    console.log(`  → ${file}`);
    await db.query(sql);
  }

  console.log("Migrations complete.");
  await db.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
