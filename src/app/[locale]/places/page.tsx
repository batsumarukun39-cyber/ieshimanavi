import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { toPlaceWithStatus } from "@/lib/db";
import { openNow as calcOpenNow } from "@/lib/openNow";
import { parseOpeningHours } from "@/lib/json";
import PlaceCard from "@/components/PlaceCard";
import CategoryFilter from "@/components/CategoryFilter";
import type { Category } from "@prisma/client";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; openNow?: string }>;
};

export default async function PlacesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { category, openNow: openNowParam } = await searchParams;

  const categories = category ? (category.split(",") as Category[]) : undefined;
  const onlyOpen = openNowParam === "true";

  const rawPlaces = await prisma.place.findMany({
    where: categories ? { category: { in: categories } } : undefined,
    include: { status: true },
    orderBy: { nameJa: "asc" },
  });

  const now = new Date();
  const places = rawPlaces
    .map((p) => {
      const hours = parseOpeningHours(p.openingHours);
      const isOpen = calcOpenNow(hours, p.status, now);
      return toPlaceWithStatus(p, isOpen);
    })
    .filter((p) => !onlyOpen || p.openNow);

  return (
    <div className="space-y-5">
      <h1 className="font-serif text-[22px] text-ink tracking-[0.5px]">
        {locale === "ja" ? "スポット一覧" : "Places"}
      </h1>

      <Suspense>
        <CategoryFilter locale={locale} />
      </Suspense>

      {places.length === 0 ? (
        <p className="text-ink-faint text-[13px] py-8 text-center">
          {locale === "ja" ? "該当するスポットがありません" : "No places found"}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
