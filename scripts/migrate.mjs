import { existsSync } from "node:fs";
import { z } from "zod";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

// Load local env files without overriding already-set variables.
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) {
    process.loadEnvFile(file);
  }
}

let pool;
console.log("Running database migrations");
try {
  const url = z
    .url({ protocol: /^postgres(ql)?$/ })
    .parse(process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL);
  pool = new pg.Pool({ connectionString: url, max: 1 });
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  console.log("Database migrations completed");
} catch {
  console.error("Database migrations failed");
  process.exitCode = 1;
} finally {
  await pool?.end();
}
