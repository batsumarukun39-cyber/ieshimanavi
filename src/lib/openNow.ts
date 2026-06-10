import type { StoreStatus } from "@prisma/client";
import type { OpeningHours, OpeningHourSlot } from "@/types";
import { dayOfWeekJST, nowHHMMJST } from "@/lib/jst";

type StatusLike = Pick<
  StoreStatus,
  "state" | "breakUntil" | "autoCloseAt"
> | null;

/**
 * 現在時刻 now に対して、店が「いま開いているか」を返す純関数。
 *
 * 判定優先順:
 * 1. 手動状態 OPEN かつ autoCloseAt が未来 → true
 * 2. 手動状態 BREAK かつ breakUntil が未来 → false
 * 3. 手動状態 CLOSED（期限内）→ false
 * 4. 手動状態が無効または未設定 → openingHours（曜日・時刻）で判定
 */
export function openNow(
  openingHours: OpeningHours,
  status: StatusLike,
  now: Date = new Date()
): boolean {
  if (status) {
    if (status.state === "OPEN") {
      if (!status.autoCloseAt || now < status.autoCloseAt) return true;
    }
    if (status.state === "BREAK") {
      if (status.breakUntil && now < status.breakUntil) return false;
      // breakUntil を過ぎたら openingHours にフォールバック
    }
    if (status.state === "CLOSED") {
      if (!status.autoCloseAt || now < status.autoCloseAt) return false;
      // autoCloseAt を過ぎたら openingHours にフォールバック
    }
  }

  // openingHours による判定（JST で曜日・時刻を判定）
  const day = dayOfWeekJST(now).toString();
  const slots: OpeningHourSlot[] = openingHours[day] ?? [];
  if (slots.length === 0) return false;

  const hhmm = nowHHMMJST(now);
  return slots.some((s) => hhmm >= s.open && hhmm < s.close);
}
