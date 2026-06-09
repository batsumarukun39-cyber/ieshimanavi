import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toPlaceWithStatus } from "@/lib/db";
import { openNow } from "@/lib/openNow";
import { parseOpeningHours } from "@/lib/json";
import type { Category } from "@prisma/client";

/**
 * GET /api/places?category=CAFE,RESTAURANT&openNow=true&island=家島本島
 *
 * 全スポットを返す。クエリパラメータで絞り込み可。
 * status を含む PlaceWithStatus[] を JSON で返す。
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const categoryParam = searchParams.get("category");
  const onlyOpenNow = searchParams.get("openNow") === "true";
  const islandParam = searchParams.get("island");

  const categories = categoryParam
    ? (categoryParam.split(",") as Category[])
    : undefined;

  const rawPlaces = await prisma.place.findMany({
    where: {
      ...(categories ? { category: { in: categories } } : {}),
      ...(islandParam ? { island: islandParam } : {}),
    },
    include: { status: true },
    orderBy: { nameJa: "asc" },
  });

  const now = new Date();
  const places = rawPlaces
    .map((p) => {
      const hours = parseOpeningHours(p.openingHours);
      const isOpen = openNow(hours, p.status, now);
      return toPlaceWithStatus(p, isOpen);
    })
    .filter((p) => !onlyOpenNow || p.openNow);

  return NextResponse.json(places);
}
