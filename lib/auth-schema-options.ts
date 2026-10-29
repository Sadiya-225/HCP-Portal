// Schema-affecting Better Auth options shared by the runtime config
// (lib/auth.ts) and the CLI-only config (auth.cli.ts). Keep this file
// free of secrets, env reads, and "server-only" imports so the
// `auth generate` CLI can load it.
export const authSchemaOptions = {
  emailAndPassword: { enabled: true },
  rateLimit: { enabled: true, storage: "database" as const },
};
