import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const NO_STORE = { "Cache-Control": "private, no-store" };

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  const { id, name, email, emailVerified, image } = session.user;
  return NextResponse.json(
    { id, name, email, emailVerified, image: image ?? null },
    { status: 200, headers: NO_STORE },
  );
}
