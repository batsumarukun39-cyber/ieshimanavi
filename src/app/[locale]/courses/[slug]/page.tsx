import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toModelCourseData, toPlaceWithStatus } from "@/lib/db";
import { openNow as calcOpenNow } from "@/lib/openNow";
import { parseOpeningHours } from "@/lib/json";
import StatusBadge from "@/components/StatusBadge";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const courses = await prisma.modelCourse.findMany({ select: { slug: true } });
  return courses.flatMap((c) => [
    { locale: "ja", slug: c.slug },
    { locale: "en", slug: c.slug },
  ]);
}

export default async function CourseDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const ja = locale === "ja";

  const raw = await prisma.modelCourse.findUnique({ where: { slug } });
  if (!raw) notFound();
  const course = toModelCourseData(raw);

  const title = (locale === "en" && course.titleEn) ? course.titleEn : course.titleJa;
  const desc = (locale === "en" && course.descriptionEn) ? course.descriptionEn : course.descriptionJa;

  const slugs = course.stops.map((s) => s.placeSlug);
  const rawPlaces = await prisma.place.findMany({
    where: { slug: { in: slugs } },
    include: { status: true },
  });
  const now = new Date();
  const placeMap = Object.fromEntries(
    rawPlaces.map((p) => [
      p.slug,
      toPlaceWithStatus(p, calcOpenNow(parseOpeningHours(p.openingHours), p.status, now)),
    ])
  );

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] border border-line-strong text-ink-faint rounded-[4px] px-2 py-0.5">
            {course.theme}
          </span>
          <span className="text-[11px] text-ink-faint">
            {ja ? `${course.durationMin} 分` : `${course.durationMin} min`}
          </span>
        </div>
        <h1 className="font-serif text-[22px] text-ink leading-snug tracking-[0.5px]">{title}</h1>
        {desc && (
          <p className="text-[13px] text-ink-soft mt-2 leading-relaxed">{desc}</p>
        )}
      </div>

      {/* ストップ一覧 */}
      <div className="space-y-0">
        {course.stops
          .sort((a, b) => a.order - b.order)
          .map((stop, i) => {
            const place = placeMap[stop.placeSlug];
            const placeName = place
              ? (locale === "en" && place.nameEn ? place.nameEn : place.nameJa)
              : stop.placeSlug;
            const note = (locale === "en" && stop.noteEn) ? stop.noteEn : stop.noteJa;
            const isLast = i === course.stops.length - 1;

            return (
              <div key={stop.placeSlug} className="flex gap-4">
                {/* ステップ番号 + 縦線 */}
                <div className="flex flex-col items-center pt-1">
                  <div
                    className="w-6 h-6 rounded-full border border-line-strong flex items-center justify-center text-[11px] text-ink-soft flex-shrink-0"
                    style={{ backgroundColor: "#F5F2EB" }}
                  >
                    {i + 1}
                  </div>
                  {!isLast && (
                    <div className="w-px flex-1 bg-line my-1.5" />
                  )}
                </div>

                {/* コンテンツ */}
                <div className={`flex-1 ${isLast ? "pb-0" : "pb-5"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {place ? (
                        <Link
                          href={`/${locale}/places/${place.slug}`}
                          className="font-serif text-[15px] text-sea hover:text-sea-deep"
                        >
                          {placeName}
                        </Link>
                      ) : (
                        <span className="font-serif text-[15px] text-ink">{placeName}</span>
                      )}
                      {note && (
                        <p className="text-[12px] text-ink-faint mt-0.5 leading-relaxed">{note}</p>
                      )}
                    </div>
                    {place?.hasStatus && (
                      <StatusBadge
                        state={place.status?.state ?? "CLOSED"}
                        locale={locale}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* 戻るリンク */}
      <Link
        href={`/${locale}/courses`}
        className="block text-[12px] text-ink-faint hover:text-ink text-center"
      >
        ← {ja ? "コース一覧へ" : "Back to Courses"}
      </Link>
    </div>
  );
}
