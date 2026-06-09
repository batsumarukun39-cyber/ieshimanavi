import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { createSessionValue, SESSION_COOKIE } from "@/lib/auth";
import { isLocked, recordFailure, clearRecord } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.placeId || !body?.pin) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { placeId, pin } = body as { placeId: string; pin: string };

  if (isLocked(placeId)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  const credential = await prisma.storeCredential.findUnique({
    where: { placeId },
  });
  if (!credential) {
    recordFailure(placeId);
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  const ok = await bcrypt.compare(pin, credential.pinHash);
  if (!ok) {
    recordFailure(placeId);
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  clearRecord(placeId);
  const sessionValue = await createSessionValue(placeId);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 12 * 60 * 60,
    path: "/",
  });
  return res;
}
