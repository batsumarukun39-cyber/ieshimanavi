// Vercel は UTC で動作するため、日本時間（JST = UTC+9）を明示的に扱うユーティリティ

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** JST での曜日 (0=日 〜 6=土) */
export function dayOfWeekJST(date: Date = new Date()): number {
  return new Date(date.getTime() + JST_OFFSET_MS).getUTCDay();
}

/** "HH:MM" を JST 当日のその時刻を表す UTC Date に変換 */
export function hmToDateJST(hm: string, baseDate: Date = new Date()): Date {
  const [h, m] = hm.split(":").map(Number);
  const jstMs = baseDate.getTime() + JST_OFFSET_MS;
  const jstDayStartUTC = Math.floor(jstMs / 86400000) * 86400000 - JST_OFFSET_MS;
  return new Date(jstDayStartUTC + (h * 60 + m) * 60 * 1000);
}

/** 現在の JST での "HH:MM" 文字列 */
export function nowHHMMJST(date: Date = new Date()): string {
  const jst = new Date(date.getTime() + JST_OFFSET_MS);
  const h = jst.getUTCHours().toString().padStart(2, "0");
  const m = jst.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}
