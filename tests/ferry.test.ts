import { describe, it, expect } from "vitest";
import {
  nextDepartures,
  lastBoatCountdown,
  planByDeadline,
  todaySchedules,
} from "@/lib/ferry";
import type { FerryScheduleData } from "@/types";

// 姫路→家島 3便（毎日）
const sampleSchedules: FerryScheduleData[] = [
  { id: "1", operator: "テスト高速船", fromPort: "姫路港", toPort: "家島(真浦)", departHm: "07:30", arriveHm: "08:05", days: [true,true,true,true,true,true,true], note: null },
  { id: "2", operator: "テスト高速船", fromPort: "姫路港", toPort: "家島(真浦)", departHm: "10:00", arriveHm: "10:35", days: [true,true,true,true,true,true,true], note: null },
  { id: "3", operator: "テスト高速船", fromPort: "姫路港", toPort: "家島(真浦)", departHm: "17:00", arriveHm: "17:35", days: [true,true,true,true,true,true,true], note: null },
];

// 平日のみ運航（1=月〜5=金）
const weekdayOnly: FerryScheduleData[] = [
  { id: "4", operator: "平日便", fromPort: "姫路港", toPort: "家島(真浦)", departHm: "12:00", arriveHm: "12:35", days: [false,true,true,true,true,true,false], note: null },
];

function date(hh: number, mm: number, weekday = 1): Date {
  // 2026-06-01(月) をベースに
  const d = new Date("2026-06-01T00:00:00");
  d.setDate(d.getDate() + ((weekday - 1 + 7) % 7));
  d.setHours(hh, mm, 0, 0);
  return d;
}

describe("todaySchedules — 曜日フィルタ", () => {
  it("毎日便は月曜に3件返す", () => {
    const result = todaySchedules(sampleSchedules, 1, date(0, 0));
    expect(result).toHaveLength(3);
  });

  it("平日のみ便は日曜(0)に0件", () => {
    const result = todaySchedules(weekdayOnly, 0, date(0, 0, 0));
    expect(result).toHaveLength(0);
  });

  it("平日のみ便は月曜(1)に1件", () => {
    const result = todaySchedules(weekdayOnly, 1, date(0, 0));
    expect(result).toHaveLength(1);
  });

  it("出発順にソートされている", () => {
    const result = todaySchedules(sampleSchedules, 1, date(0, 0));
    expect(result[0].schedule.departHm).toBe("07:30");
    expect(result[2].schedule.departHm).toBe("17:00");
  });
});

describe("nextDepartures", () => {
  it("07:00 時点では next=07:30, last=17:00", () => {
    const { next, last } = nextDepartures(sampleSchedules, date(7, 0), 1);
    expect(next?.schedule.departHm).toBe("07:30");
    expect(last?.schedule.departHm).toBe("17:00");
  });

  it("07:30 ちょうど → next=07:30（境界値：当日分を含む）", () => {
    const { next } = nextDepartures(sampleSchedules, date(7, 30), 1);
    expect(next?.schedule.departHm).toBe("07:30");
  });

  it("07:31 → next=10:00（07:30 は過ぎた）", () => {
    const { next } = nextDepartures(sampleSchedules, date(7, 31), 1);
    expect(next?.schedule.departHm).toBe("10:00");
  });

  it("17:01 以降は next=null（便なし）, last=17:00", () => {
    const { next, last } = nextDepartures(sampleSchedules, date(17, 1), 1);
    expect(next).toBeNull();
    expect(last?.schedule.departHm).toBe("17:00");
  });

  it("便のない曜日（日曜の平日のみ便）は next=null, last=null", () => {
    const { next, last } = nextDepartures(weekdayOnly, date(12, 0, 0), 0);
    expect(next).toBeNull();
    expect(last).toBeNull();
  });
});

describe("lastBoatCountdown", () => {
  it("最終便まで90分 → minutesLeft=90, isUrgent=false", () => {
    const { last } = nextDepartures(sampleSchedules, date(15, 30), 1);
    const { minutesLeft, isUrgent } = lastBoatCountdown(last, date(15, 30));
    expect(minutesLeft).toBe(90);
    expect(isUrgent).toBe(false);
  });

  it("最終便まで59分 → isUrgent=true", () => {
    const { last } = nextDepartures(sampleSchedules, date(16, 1), 1);
    const { minutesLeft, isUrgent } = lastBoatCountdown(last, date(16, 1));
    expect(minutesLeft).toBe(59);
    expect(isUrgent).toBe(true);
  });

  it("ちょうど60分 → isUrgent=true（境界値）", () => {
    const { last } = nextDepartures(sampleSchedules, date(16, 0), 1);
    const { minutesLeft, isUrgent } = lastBoatCountdown(last, date(16, 0));
    expect(minutesLeft).toBe(60);
    expect(isUrgent).toBe(true);
  });

  it("最終便が過去 → minutesLeft=null", () => {
    const { last } = nextDepartures(sampleSchedules, date(17, 1), 1);
    const { minutesLeft } = lastBoatCountdown(last, date(17, 1));
    expect(minutesLeft).toBeNull();
  });

  it("便なし → minutesLeft=null", () => {
    const { minutesLeft } = lastBoatCountdown(null, date(12, 0));
    expect(minutesLeft).toBeNull();
  });
});

describe("planByDeadline — 逆算", () => {
  it("17:30 までに出るには3便すべて候補", () => {
    const result = planByDeadline(sampleSchedules, 1, "17:30", date(0, 0));
    expect(result).toHaveLength(3);
  });

  it("10:00 ちょうどまでなら07:30と10:00が候補", () => {
    const result = planByDeadline(sampleSchedules, 1, "10:00", date(0, 0));
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.schedule.departHm)).toContain("10:00");
  });

  it("07:29 までなら候補なし", () => {
    const result = planByDeadline(sampleSchedules, 1, "07:29", date(0, 0));
    expect(result).toHaveLength(0);
  });
});
