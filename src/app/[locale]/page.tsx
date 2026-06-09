import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toFerryScheduleData, toPlaceWithStatus } from "@/lib/db";
import { openNow as calcOpenNow } from "@/lib/openNow";
import { parseOpeningHours } from "@/lib/json";
import LastBoatBanner from "@/components/LastBoatBanner";
import SunTideStrip from "@/components/SunTideStrip";
import PlaceCard from "@/components/PlaceCard";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "home" });
  const ja = locale === "ja";

  const now = new Date();
  const notices = await prisma.notice.findMany({
    where: {
      startsAt: { lte: now },
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
    orderBy: { startsAt: "desc" },
  });

  const rawFerry = await prisma.ferrySchedule.findMany();
  const ferrySchedules = rawFerry.map(toFerryScheduleData);

  const rawPlaces = await prisma.place.findMany({
    where: { hasStatus: true },
    include: { status: true },
  });
  const openPlaces = rawPlaces
    .map((p) => toPlaceWithStatus(p, calcOpenNow(parseOpeningHours(p.openingHours), p.status, now)))
    .filter((p) => p.openNow);

  return (
    <div className="space-y-6">
      {/* お知らせ */}
      {notices.map((n) => (
        <div
          key={n.id}
          className={`text-[13px] px-3 py-2.5 rounded-[6px] border ${
            n.level === "warning"
              ? "border-clay text-clay bg-[#FBF0E6]"
              : "border-line text-ink-soft bg-surface"
          }`}
        >
          {ja ? n.bodyJa : (n.bodyEn ?? n.bodyJa)}
        </div>
      ))}

      {/* 最終便 */}
      <LastBoatBanner schedules={ferrySchedules} locale={locale} />

      {/* 日の入り */}
      <SunTideStrip locale={locale} />

      {/* ── ヒーロー ─────────────────────────────── */}
      <section className="py-4">
        <p
          className="text-[11px] text-ink-faint tracking-[3px] mb-3"
          aria-hidden="true"
        >
          {ja ? "瀬戸内 ・ 家島" : "Seto Inland Sea · Ieshima"}
        </p>
        <h1 className="font-serif text-[23px] text-ink tracking-[1px] leading-snug mb-2">
          {ja ? "島時間を、ゆっくり。" : "Time flows gently on the island."}
        </h1>
        <p className="text-[12.5px] text-ink-soft leading-relaxed">
          {t("subtitle")}
        </p>
        <div className="mt-4 border-b border-line" />
      </section>

      {/* ── ナビリンク ───────────────────────────── */}
      <section>
        <div className="grid grid-cols-3 divide-x divide-line border border-line rounded-[6px] overflow-hidden">
          {[
            { href: `/${locale}/map`,     label: ja ? "地図" : "Map" },
            { href: `/${locale}/ferry`,   label: ja ? "船の時刻" : "Ferry" },
            { href: `/${locale}/courses`, label: ja ? "コース" : "Courses" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-center py-3 text-[13px] text-ink-soft hover:text-ink hover:bg-[#F0EDE5] transition-colors min-h-[44px]"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── いま開いているお店 ───────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-serif text-[15px] text-ink whitespace-nowrap">
            {t("openPlaces")}
          </h2>
          <div className="flex-1 border-b border-line" />
          <Link href={`/${locale}/places`} className="text-[12px] text-ink-faint hover:text-ink whitespace-nowrap">
            {t("viewAll")} →
          </Link>
        </div>

        {openPlaces.length === 0 ? (
          <p className="text-ink-faint text-[13px] py-6 text-center">
            {ja ? "現在営業中のお店はありません" : "No stores open right now"}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {openPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
