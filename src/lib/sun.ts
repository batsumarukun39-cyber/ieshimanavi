// suncalc ラッパー — クライアント側で家島本島の日の出/日の入りを計算
// サーバー側でも使えるが、フォーマットはクライアントの timezone に依存するため
// SunTideStrip はクライアントコンポーネントとして実装する。

export type SunInfo = {
  sunrise: Date;
  sunset: Date;
  goldenHourStart: Date; // 日の入り1時間前（夕景ベスト）
  goldenHourEnd: Date;   // 日の入り
};

const ISLAND_LAT = parseFloat(process.env.NEXT_PUBLIC_ISLAND_LAT ?? "34.683");
const ISLAND_LNG = parseFloat(process.env.NEXT_PUBLIC_ISLAND_LNG ?? "134.530");

export async function getSunInfo(date: Date): Promise<SunInfo> {
  const SunCalc = (await import("suncalc")).default;
  const times = SunCalc.getTimes(date, ISLAND_LAT, ISLAND_LNG);
  return {
    sunrise: times.sunrise,
    sunset: times.sunset,
    goldenHourStart: times.goldenHour,      // 日の出後の黄金時間開始
    goldenHourEnd: times.goldenHourEnd,     // 黄金時間終了 ≒ 日の入りの少し後
  };
}

export function formatHHMM(date: Date): string {
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
