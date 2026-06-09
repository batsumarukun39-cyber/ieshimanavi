import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { toPlaceWithStatus } from "@/lib/db";
import { openNow as calcOpenNow } from "@/lib/openNow";
import { parseOpeningHours } from "@/lib/json";
import MapViewClient from "@/components/MapViewClient";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ highlight?: string }>;
};

export default async function MapPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { highlight } = await searchParams;

  const rawPlaces = await prisma.place.findMany({ include: { status: true } });
  const now = new Date();
  const places = rawPlaces.map((p) => {
    const hours = parseOpeningHours(p.openingHours);
    const isOpen = calcOpenNow(hours, p.status, now);
    return toPlaceWithStatus(p, isOpen);
  });

  return (
    // ヘッダー(48px) + ボトムバー(60px) を差し引いた全画面
    <div className="-mx-4 -mt-5 -mb-20" style={{ height: "calc(100dvh - 48px - 60px)" }}>
      <MapViewClient places={places} locale={locale} highlightSlug={highlight} />
    </div>
  );
}
