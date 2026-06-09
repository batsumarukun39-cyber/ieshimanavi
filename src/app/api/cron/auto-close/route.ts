import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/cron/auto-close
 * Vercel cron または手動で叩く。CRON_SECRET ヘッダーで保護。
 * - autoCloseAt < now の OPEN → CLOSED
 * - breakUntil < now の BREAK → OPEN
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const provided = req.headers.get("x-cron-secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const now = new Date();
  let updated = 0;

  // OPEN → CLOSED（閉店時刻を過ぎた）
  const closedResult = await prisma.storeStatus.updateMany({
    where: {
      state: "OPEN",
      autoCloseAt: { lt: now },
    },
    data: { state: "CLOSED", autoCloseAt: null },
  });
  updated += closedResult.count;

  // BREAK → OPEN（休憩終了時刻を過ぎた）
  const openResult = await prisma.storeStatus.updateMany({
    where: {
      state: "BREAK",
      breakUntil: { lt: now },
    },
    data: { state: "OPEN", breakUntil: null },
  });
  updated += openResult.count;

  return NextResponse.json({ updated, timestamp: now.toISOString() });
}
