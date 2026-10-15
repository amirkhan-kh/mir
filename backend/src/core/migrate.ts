import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool, tx } from "./db.js";

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../migrations");

export async function migrate() {
  await pool.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
  );
  const { rows } = await pool.query<{ name: string }>("SELECT name FROM schema_migrations");
  const applied = new Set(rows.map((r) => r.name));
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await fs.readFile(path.join(dir, file), "utf8");
    await tx(async (db) => {
      await db.query(sql);
      await db.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
    });
    console.log(`migration applied: ${file}`);
  }
}
