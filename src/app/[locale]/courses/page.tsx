import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toModelCourseData } from "@/lib/db";

type Props = { params: Promise<{ locale: string }> };

export default async function CoursesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ja = locale === "ja";

  const raw = await prisma.modelCourse.findMany({ orderBy: { titleJa: "asc" } });
  const courses = raw.map(toModelCourseData);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] text-ink-faint tracking-[3px] mb-1">
          {ja ? "おすすめの歩き方" : "Suggested Walks"}
        </p>
        <h1 className="font-serif text-[22px] text-ink tracking-[0.5px]">
          {ja ? "モデルコース" : "Model Courses"}
        </h1>
      </div>

      <div className="flex flex-col gap-3">
        {courses.map((course) => {
          const title = (locale === "en" && course.titleEn) ? course.titleEn : course.titleJa;
          const desc = (locale === "en" && course.descriptionEn) ? course.descriptionEn : course.descriptionJa;
          return (
            <Link
              key={course.id}
              href={`/${locale}/courses/${course.slug}`}
              className="block bg-surface rounded-[6px] border border-line p-4 hover:bg-[#F7F4EE] transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] border border-line-strong text-ink-faint rounded-[4px] px-2 py-0.5">
                  {course.theme}
                </span>
                <span className="text-[11px] text-ink-faint">
                  {ja ? `${course.durationMin} 分` : `${course.durationMin} min`}
                </span>
                <span className="text-[11px] text-ink-faint">
                  {course.stops.length} {ja ? "スポット" : "stops"}
                </span>
              </div>
              <h2 className="font-serif text-[16px] text-ink leading-snug">{title}</h2>
              {desc && (
                <p className="text-[12.5px] text-ink-soft mt-1.5 line-clamp-2 leading-relaxed">
                  {desc}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
