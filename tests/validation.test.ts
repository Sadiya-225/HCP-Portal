import { describe, expect, it } from "vitest";
import { registerSchema } from "@/lib/validation";

const validInput = {
  name: "  Ananya Sharma  ",
  email: "  Ananya.Sharma@Example.COM ",
  password: "correct horse battery staple",
  confirmPassword: "correct horse battery staple",
};

describe("registerSchema", () => {
  it("accepts a valid registration and normalizes the email", () => {
    const parsed = registerSchema.parse(validInput);
    expect(parsed.email).toBe("ananya.sharma@example.com");
    expect(parsed.name).toBe("Ananya Sharma");
  });

  it("rejects mismatched password confirmation", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      confirmPassword: "different password value",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
    }
  });

  it("rejects a weak password", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});
