import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionValue, SESSION_COOKIE } from "@/lib/auth";
import { parseOpeningHours } from "@/lib/json";
import { dayOfWeekJST, hmToDateJST } from "@/lib/jst";
import type { StatusState } from "@prisma/client";

export async function POST(req: NextRequest) {
  // セッション検証
  const cookieVal = req.cookies.get(SESSION_COOKIE)?.value;
  if (!cookieVal) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const placeId = await verifySessionValue(cookieVal);
  if (!placeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.state) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { state, message, breakMinutes } = body as {
    state: StatusState;
    message?: string;
    breakMinutes?: number;
  };

  const now = new Date();
  let autoCloseAt: Date | null = null;
  let breakUntil: Date | null = null;

  if (state === "OPEN") {
    // 当日の閉店時刻を openingHours から算出、なければ 19:00
    const place = await prisma.place.findUnique({ where: { id: placeId } });
    if (place) {
      const hours = parseOpeningHours(place.openingHours);
      const day = dayOfWeekJST(now).toString();
      const slots = hours[day] ?? [];
      const closeHm = slots[0]?.close ?? "19:00";
      autoCloseAt = hmToDateJST(closeHm, now);
      if (autoCloseAt <= now) {
        autoCloseAt = new Date(autoCloseAt.getTime() + 86400000);
      }
    }
  }

  if (state === "BREAK") {
    const mins = breakMinutes ?? 30;
    breakUntil = new Date(now.getTime() + mins * 60 * 1000);
  }

  const status = await prisma.storeStatus.upsert({
    where: { placeId },
    update: {
      state,
      message: message ?? null,
      autoCloseAt: state === "OPEN" ? autoCloseAt : null,
      breakUntil: state === "BREAK" ? breakUntil : null,
    },
    create: {
      placeId,
      state,
      message: message ?? null,
      autoCloseAt: state === "OPEN" ? autoCloseAt : null,
      breakUntil: state === "BREAK" ? breakUntil : null,
    },
  });

  return NextResponse.json({ status });
}
