import { describe, expect, it, vi, beforeEach } from "vitest";

const getSession = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: {
    api: { getSession },
  },
}));

// Prevent the real DB/env modules from loading via transitive imports.
vi.mock("@/db", () => ({ db: {}, schema: {} }));
vi.mock("@/lib/env", () => ({ getServerEnv: () => ({}) }));

const { GET } = await import("@/app/api/me/route");

const session = {
  user: {
    id: "user-1",
    name: "Ananya Sharma",
    email: "ananya@example.com",
    emailVerified: true,
    image: null,
  },
  session: {
    id: "session-1",
    token: "secret-token",
    expiresAt: new Date(),
    userId: "user-1",
  },
};

describe("GET /api/me", () => {
  beforeEach(() => {
    getSession.mockReset();
  });

  it("returns 401 when there is no session", async () => {
    getSession.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/me"));
    expect(res.status).toBe(401);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
  });

  it("returns only the safe own-session DTO even when the URL carries another user's id", async () => {
    getSession.mockResolvedValue(session);
    const res = await GET(
      new Request("http://localhost/api/me?id=another-user"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      id: "user-1",
      name: "Ananya Sharma",
      email: "ananya@example.com",
      emailVerified: true,
      image: null,
    });
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("secret-token");
    expect(serialized).not.toContain("session-1");
  });
});
