import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toPlaceWithStatus } from "@/lib/db";
import { openNow as calcOpenNow } from "@/lib/openNow";
import { parseOpeningHours } from "@/lib/json";
import StatusBadge from "@/components/StatusBadge";
import type { OpeningHours } from "@/types";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const places = await prisma.place.findMany({ select: { slug: true } });
  return places.flatMap((p) => [
    { locale: "ja", slug: p.slug },
    { locale: "en", slug: p.slug },
  ]);
}

export default async function PlaceDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const raw = await prisma.place.findUnique({
    where: { slug },
    include: { status: true },
  });
  if (!raw) notFound();

  const hours = parseOpeningHours(raw.openingHours);
  const isOpen = calcOpenNow(hours, raw.status, new Date());
  const place = toPlaceWithStatus(raw, isOpen);

  const name = (locale === "en" && place.nameEn) ? place.nameEn : place.nameJa;
  const desc = (locale === "en" && place.descriptionEn) ? place.descriptionEn : place.descriptionJa;
  const todaySlots = getTodaySlots(hours);

  return (
    <div className="space-y-6">
      {/* 写真 */}
      {place.photos[0] && (
        <div className="relative w-full h-44 rounded-[6px] overflow-hidden bg-tint-slate">
          <Image
            src={place.photos[0]}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 672px) 100vw, 672px"
            priority
          />
        </div>
      )}

      {/* 名前・ステータス */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-[22px] text-ink leading-snug tracking-[0.5px]">
            {name}
          </h1>
          {locale === "en" && place.nameJa && (
            <p className="text-[12px] text-ink-faint mt-0.5">{place.nameJa}</p>
          )}
        </div>
        {place.hasStatus && (
          <StatusBadge state={place.status?.state ?? "CLOSED"} locale={locale} />
        )}
      </div>

      {/* 説明 */}
      {desc && (
        <p className="text-[14px] text-ink-soft leading-relaxed">{desc}</p>
      )}

      {/* 営業情報 */}
      <div className="border border-line rounded-[6px] divide-y divide-line">
        <div className="px-4 py-3">
          <p className="text-[11px] text-ink-faint mb-1 tracking-wide uppercase">
            {locale === "ja" ? "本日の営業時間" : "Today's Hours"}
          </p>
          {todaySlots.length > 0 ? (
            todaySlots.map((s, i) => (
              <p key={i} className="text-[14px] text-ink font-medium">
                {s.open} – {s.close}
              </p>
            ))
          ) : (
            <p className="text-[14px] text-ink-soft">
              {locale === "ja" ? "本日休業" : "Closed Today"}
            </p>
          )}
        </div>

        {place.status?.message && (
          <div className="px-4 py-2.5">
            <p className="text-[13px] text-clay">{place.status.message}</p>
          </div>
        )}

        {(place.address || place.phone) && (
          <div className="px-4 py-3 space-y-1.5">
            {place.address && (
              <p className="text-[13px] text-ink-soft">{place.address}</p>
            )}
            {place.phone && (
              <a
                href={`tel:${place.phone}`}
                className="block text-[13px] text-sea hover:text-sea-deep"
              >
                {place.phone}
              </a>
            )}
          </div>
        )}
      </div>

      {/* 地図リンク */}
      <Link
        href={`/${locale}/map?highlight=${place.slug}`}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-[6px] border border-line text-[13px] text-ink-soft hover:text-ink hover:border-line-strong transition-colors min-h-[44px]"
      >
        {locale === "ja" ? "地図で見る" : "View on Map"}
      </Link>

      {/* 一覧へ */}
      <Link
        href={`/${locale}/places`}
        className="block text-[12px] text-ink-faint hover:text-ink text-center"
      >
        ← {locale === "ja" ? "スポット一覧へ" : "Back to Places"}
      </Link>
    </div>
  );
}

function getTodaySlots(hours: OpeningHours) {
  const day = new Date().getDay().toString();
  return hours[day] ?? [];
}
