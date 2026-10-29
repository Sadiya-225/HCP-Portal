import { describe, expect, it } from "vitest";
import { serverEnvSchema } from "@/lib/env";

const base = {
  DATABASE_URL: "postgresql://app:pass@localhost:5432/hcp_portal",
  BETTER_AUTH_SECRET: "a-secret-that-is-at-least-32-characters-long",
  BETTER_AUTH_URL: "https://portal.example.com",
};

describe("serverEnvSchema", () => {
  it("accepts empty SMTP values when password reset is disabled", () => {
    const parsed = serverEnvSchema.parse({
      ...base,
      PASSWORD_RESET_ENABLED: "false",
      SMTP_HOST: "",
      SMTP_USER: "",
      SMTP_PASSWORD: "",
      SMTP_FROM: "",
    });
    expect(parsed.PASSWORD_RESET_ENABLED).toBe(false);
    expect(parsed.SMTP_HOST).toBeUndefined();
    expect(parsed.SMTP_USER).toBeUndefined();
    expect(parsed.SMTP_PASSWORD).toBeUndefined();
    expect(parsed.SMTP_FROM).toBeUndefined();
  });

  it("rejects empty SMTP values when password reset is enabled", () => {
    const result = serverEnvSchema.safeParse({
      ...base,
      PASSWORD_RESET_ENABLED: "true",
      SMTP_HOST: "",
      SMTP_USER: "",
      SMTP_PASSWORD: "",
      SMTP_FROM: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path[0]);
      expect(paths).toEqual(
        expect.arrayContaining(["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM"]),
      );
    }
  });

  it("accepts a fully configured SMTP block when reset is enabled", () => {
    const parsed = serverEnvSchema.parse({
      ...base,
      PASSWORD_RESET_ENABLED: "true",
      SMTP_HOST: "smtp.example.com",
      SMTP_USER: "mailer@example.com",
      SMTP_PASSWORD: "secret",
      SMTP_FROM: "no-reply@example.com",
    });
    expect(parsed.PASSWORD_RESET_ENABLED).toBe(true);
  });
});
