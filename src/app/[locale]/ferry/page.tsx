import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { toFerryScheduleData } from "@/lib/db";
import { nextDepartures, lastBoatCountdown, planByDeadline, todaySchedules, dayOfWeekJST } from "@/lib/ferry";
import type { FerryScheduleData } from "@/types";

type Props = { params: Promise<{ locale: string }> };

const DAY_JA = ["日", "月", "火", "水", "木", "金", "土"];
const DAY_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function FerryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ja = locale === "ja";

  const raw = await prisma.ferrySchedule.findMany({
    orderBy: [{ fromPort: "asc" }, { departHm: "asc" }],
  });
  const schedules: FerryScheduleData[] = raw.map(toFerryScheduleData);

  const now = new Date();
  const dow = dayOfWeekJST(now);
  const dayLabel = ja ? DAY_JA[dow] : DAY_EN[dow];

  const toIsland = schedules.filter((s) => s.toPort.includes("家島") || s.fromPort.includes("姫路"));
  const toHimeji = schedules.filter((s) => s.toPort.includes("姫路") || s.fromPort.includes("家島"));

  const { next: nextOut, last: lastOut } = nextDepartures(toIsland, now, dow);
  const { next: nextReturn, last: lastReturn } = nextDepartures(toHimeji, now, dow);
  const { minutesLeft, isUrgent } = lastBoatCountdown(lastReturn, now);

  const planCandidates = lastReturn
    ? planByDeadline(toHimeji, dow, lastReturn.schedule.departHm, now)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] text-ink-faint tracking-[3px] mb-1">
          {ja ? "瀬戸内汽船" : "Ferry Schedule"}
        </p>
        <h1 className="font-serif text-[22px] text-ink tracking-[0.5px]">
          {ja ? "船の時刻表" : "Departures"}
        </h1>
        <p className="text-[12.5px] text-ink-soft mt-1">
          {ja ? `本日（${dayLabel}曜日）` : `Today (${dayLabel})`}
        </p>
      </div>

      {/* 最終便アラート */}
      {minutesLeft !== null && (
        <div className="flex items-center justify-between py-2.5 border-t border-b border-line">
          <span className="text-[13.5px] text-ink">
            {ja ? `最終便 ${lastReturn!.schedule.departHm} 発` : `Last ferry at ${lastReturn!.schedule.departHm}`}
          </span>
          <span
            className="text-[13.5px] font-medium"
            style={{ color: isUrgent ? "#A8835A" : "#4F6E78", fontWeight: isUrgent ? 600 : 400 }}
          >
            {ja ? `あと ${minutesLeft} 分` : `${minutesLeft} min`}
          </span>
        </div>
      )}
      {minutesLeft === null && lastReturn && (
        <p className="text-[13px] text-ink-faint border-t border-line pt-2.5">
          {ja ? "本日の最終便は終了しました" : "Last ferry has departed"}
        </p>
      )}

      {/* 姫路→家島 */}
      <ScheduleTable
        title={ja ? "姫路港 → 家島（真浦）" : "Himeji → Ieshima (Maura)"}
        schedules={toIsland}
        now={now}
        dow={dow}
        nextDep={nextOut}
        lastDep={lastOut}
        locale={locale}
      />

      {/* 家島→姫路 */}
      <ScheduleTable
        title={ja ? "家島（真浦）→ 姫路港" : "Ieshima (Maura) → Himeji"}
        schedules={toHimeji}
        now={now}
        dow={dow}
        nextDep={nextReturn}
        lastDep={lastReturn}
        locale={locale}
      />

      {/* 逆算プラン */}
      {planCandidates.length > 0 && lastReturn && (
        <section className="border border-line rounded-[6px] p-4 space-y-2">
          <h2 className="font-serif text-[14px] text-ink">
            {ja
              ? `最終便（${lastReturn.schedule.departHm} 発）に乗るには`
              : `To catch the last ferry at ${lastReturn.schedule.departHm}`}
          </h2>
          <p className="text-[11px] text-ink-faint">
            {ja ? "候補の出発便:" : "Candidate ferries from Ieshima:"}
          </p>
          {planCandidates.slice(-3).map((d) => (
            <div key={d.schedule.id} className="flex justify-between text-[13.5px]">
              <span className="text-ink font-medium">
                {d.schedule.departHm} {ja ? "発" : "dep"}
              </span>
              <span className="text-ink-soft">
                → {d.schedule.arriveHm} {ja ? "着" : "arr"}
                <span className="text-ink-faint ml-1">({d.schedule.operator})</span>
              </span>
            </div>
          ))}
        </section>
      )}

      <p className="text-[11px] text-ink-faint text-center pb-2">
        {ja
          ? "※ サンプル時刻です。実際の時刻は運航会社へご確認ください。"
          : "※ Sample schedule. Please confirm with the ferry operator."}
      </p>
    </div>
  );
}

function ScheduleTable({
  title,
  schedules,
  now,
  dow,
  nextDep,
  lastDep,
  locale,
}: {
  title: string;
  schedules: FerryScheduleData[];
  now: Date;
  dow: number;
  nextDep: ReturnType<typeof nextDepartures>["next"];
  lastDep: ReturnType<typeof nextDepartures>["last"];
  locale: string;
}) {
  const ja = locale === "ja";
  const todays = todaySchedules(schedules, dow, now);

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-3">
        <h2 className="font-serif text-[14px] text-ink-soft whitespace-nowrap">{title}</h2>
        <div className="flex-1 border-b border-line" />
      </div>
      {todays.length === 0 ? (
        <p className="text-ink-faint text-[13px]">
          {ja ? "本日の便はありません" : "No ferries today"}
        </p>
      ) : (
        <div className="border border-line rounded-[6px] overflow-hidden divide-y divide-line">
          {todays.map((dep) => {
            const isNext = dep.schedule.id === nextDep?.schedule.id;
            const isLast = dep.schedule.id === lastDep?.schedule.id;
            const isPast = dep.departureDate < now;
            return (
              <div
                key={dep.schedule.id}
                className={`flex items-center justify-between px-4 py-3 text-[13.5px] ${
                  isNext ? "bg-[#F0EDE5]" : isPast ? "opacity-35" : "bg-surface"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-medium text-ink tabular-nums">
                    {dep.schedule.departHm}
                  </span>
                  <span className="text-ink-faint text-[12px]">→ {dep.schedule.arriveHm}</span>
                  {isNext && (
                    <span className="text-[11px] border border-sea text-sea rounded-[4px] px-1.5 py-0.5">
                      {ja ? "次の便" : "Next"}
                    </span>
                  )}
                  {isLast && !isNext && (
                    <span className="text-[11px] border border-line-strong text-ink-faint rounded-[4px] px-1.5 py-0.5">
                      {ja ? "最終" : "Last"}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-ink-faint">{dep.schedule.operator}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
