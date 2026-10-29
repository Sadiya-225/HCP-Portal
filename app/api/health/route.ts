import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

const NO_STORE = { "Cache-Control": "private, no-store" };

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ status: "ok" }, { status: 200, headers: NO_STORE });
  } catch {
    return NextResponse.json(
      { status: "unavailable" },
      { status: 503, headers: NO_STORE },
    );
  }
}
