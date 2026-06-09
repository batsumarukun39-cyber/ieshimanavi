"use client";

import { useEffect, useState } from "react";
import { getSunInfo, formatHHMM } from "@/lib/sun";
import { IconSunset2 } from "@tabler/icons-react";

type Props = { locale: string };

export default function SunTideStrip({ locale }: Props) {
  const [sunsetHm, setSunsetHm] = useState<string | null>(null);
  const [goldenHm, setGoldenHm] = useState<string | null>(null);

  useEffect(() => {
    getSunInfo(new Date()).then((info) => {
      setSunsetHm(formatHHMM(info.sunset));
      setGoldenHm(formatHHMM(info.goldenHourEnd));
    });
  }, []);

  if (!sunsetHm) return null;

  const ja = locale === "ja";

  return (
    <div className="flex items-center justify-between py-2.5 border-t border-line">
      <div className="flex items-center gap-2 text-[13.5px] text-ink-soft">
        <IconSunset2 size={16} strokeWidth={1.5} color="#A8835A" />
        <span>{ja ? `日の入 ${sunsetHm}` : `Sunset ${sunsetHm}`}</span>
      </div>
      {goldenHm && (
        <span className="text-[12px]" style={{ color: "#A8835A" }}>
          {ja ? "夕景の頃" : "Golden hour"}
        </span>
      )}
    </div>
  );
}
