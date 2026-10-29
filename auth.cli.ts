// CLI-only Better Auth config used by `auth generate` (npm run auth:schema).
// It must not import env, secrets, or "server-only" modules. The
// --adapter/--dialect flags let the CLI generate the schema offline
// without a database connection.
import { betterAuth } from "better-auth";
import { authSchemaOptions } from "./lib/auth-schema-options";

export const auth = betterAuth({
  ...authSchemaOptions,
  telemetry: { enabled: false },
  experimental: { instrumentation: { enabled: false } },
});
