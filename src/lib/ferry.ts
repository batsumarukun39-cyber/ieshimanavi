import type { FerryScheduleData } from "@/types";
import { dayOfWeekJST, hmToDateJST } from "@/lib/jst";

export type FerryDeparture = {
  schedule: FerryScheduleData;
  departureDate: Date;
};

export { dayOfWeekJST };

/** "HH:MM" を JST 当日のその時刻を表す UTC Date に変換 */
export function hmToDate(hm: string, baseDate: Date): Date {
  return hmToDateJST(hm, baseDate);
}

/**
 * 今日 (dayOfWeek) に運航するスケジュールを now より後の順で返す。
 * dayOfWeek: 0=日 〜 6=土
 */
export function todaySchedules(
  schedules: FerryScheduleData[],
  dayOfWeek: number,
  baseDate: Date
): FerryDeparture[] {
  return schedules
    .filter((s) => s.days[dayOfWeek])
    .map((s) => ({ schedule: s, departureDate: hmToDate(s.departHm, baseDate) }))
    .sort((a, b) => a.departureDate.getTime() - b.departureDate.getTime());
}

/**
 * 次の便と最終便を返す。
 * next: now 以降の最初の便（なければ null）
 * last: 今日の最後の便（なければ null）
 */
export function nextDepartures(
  schedules: FerryScheduleData[],
  now: Date,
  dayOfWeek: number
): { next: FerryDeparture | null; last: FerryDeparture | null } {
  const todays = todaySchedules(schedules, dayOfWeek, now);
  const upcoming = todays.filter((d) => d.departureDate >= now);
  return {
    next: upcoming[0] ?? null,
    last: todays[todays.length - 1] ?? null,
  };
}

/**
 * 最終便まであと何分か。urgentは60分以内。
 * last が null（便なし）or 最終便が過去 → minutesLeft: null
 */
export function lastBoatCountdown(
  last: FerryDeparture | null,
  now: Date
): { minutesLeft: number | null; isUrgent: boolean } {
  if (!last) return { minutesLeft: null, isUrgent: false };
  const diff = last.departureDate.getTime() - now.getTime();
  if (diff <= 0) return { minutesLeft: null, isUrgent: false };
  const minutesLeft = Math.floor(diff / 60000);
  return { minutesLeft, isUrgent: minutesLeft <= 60 };
}

/**
 * 「港を出る締め切り時刻」から逆算して乗れる候補便を返す。
 * arriveBy: "HH:MM" 形式で港に戻りたい時刻
 * 実際には departHm <= arriveBy の便を候補とする。
 */
export function planByDeadline(
  schedules: FerryScheduleData[],
  dayOfWeek: number,
  arriveBy: string,
  baseDate: Date
): FerryDeparture[] {
  const deadline = hmToDate(arriveBy, baseDate);
  return todaySchedules(schedules, dayOfWeek, baseDate).filter(
    (d) => d.departureDate <= deadline
  );
}
