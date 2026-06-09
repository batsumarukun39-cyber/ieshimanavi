"use client";

import { useEffect, useState } from "react";
import { nextDepartures, lastBoatCountdown } from "@/lib/ferry";
import { IconShip } from "@tabler/icons-react";
import type { FerryScheduleData } from "@/types";

type Props = {
  schedules: FerryScheduleData[];
  locale: string;
};

export default function LastBoatBanner({ schedules, locale }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const ja = locale === "ja";
  const dow = now.getDay();

  const returnSchedules = schedules.filter(
    (s) => s.fromPort.includes("家島") || s.toPort.includes("姫路")
  );
  const { last } = nextDepartures(
    returnSchedules.length > 0 ? returnSchedules : schedules,
    now,
    dow
  );
  const { minutesLeft, isUrgent } = lastBoatCountdown(last, now);

  if (minutesLeft === null && !last) return null;

  const rightColor = isUrgent ? "#A8835A" : "#4F6E78"; // clay if urgent, sea otherwise

  return (
    <div className="flex items-center justify-between py-2.5 border-t border-b border-line">
      <div className="flex items-center gap-2 text-[13.5px] text-ink">
        <IconShip size={16} strokeWidth={1.5} color="#4F6E78" />
        {minutesLeft === null ? (
          <span>{ja ? "本日の最終便は終了しました" : "Last ferry has departed"}</span>
        ) : (
          <span>
            {ja
              ? `最終便 ${last!.schedule.departHm} 発`
              : `Last ferry at ${last!.schedule.departHm}`}
          </span>
        )}
      </div>

      {minutesLeft !== null && (
        <span
          className="text-[13.5px] font-medium"
          style={{ color: rightColor, fontWeight: isUrgent ? 600 : 400 }}
        >
          {ja ? `あと ${minutesLeft} 分` : `${minutesLeft} min left`}
        </span>
      )}
    </div>
  );
}
