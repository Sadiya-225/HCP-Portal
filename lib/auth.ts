import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db, schema } from "@/db";
import { getServerEnv } from "@/lib/env";
import { sendPasswordResetEmail } from "@/lib/email";
import { authSchemaOptions } from "@/lib/auth-schema-options";

const env = getServerEnv();

export const auth = betterAuth({
  appName: "HCP Portal",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  trustedOrigins: [
    ...new Set([new URL(env.BETTER_AUTH_URL).origin, ...env.TRUSTED_ORIGINS]),
  ],
  emailAndPassword: {
    ...authSchemaOptions.emailAndPassword,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      void sendPasswordResetEmail({ to: user.email, url }).catch(() => {
        console.error("Password reset email delivery failed");
      });
    },
  },
  telemetry: {
    enabled: false,
  },
  experimental: {
    instrumentation: {
      enabled: false,
    },
  },
  rateLimit: {
    ...authSchemaOptions.rateLimit,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 300, max: 3 },
      "/reset-password": { window: 300, max: 5 },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    trustedProxyHeaders: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  },
});
