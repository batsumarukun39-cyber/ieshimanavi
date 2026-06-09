import { describe, it, expect } from "vitest";
import { openNow } from "@/lib/openNow";
import type { OpeningHours } from "@/types";

// 平日（月=1）10:00〜17:00 のみ営業
const weekdayHours: OpeningHours = {
  "1": [{ open: "10:00", close: "17:00" }],
  "2": [{ open: "10:00", close: "17:00" }],
  "3": [{ open: "10:00", close: "17:00" }],
  "4": [{ open: "10:00", close: "17:00" }],
  "5": [{ open: "10:00", close: "17:00" }],
  "6": [],
  "0": [],
};

function makeDate(weekday: number, hh: number, mm: number): Date {
  // 2026-06-01 は月曜日(1), 06-07は日曜(0)
  const base = new Date("2026-06-01T00:00:00"); // Monday
  const d = new Date(base);
  d.setDate(d.getDate() + ((weekday - 1 + 7) % 7));
  d.setHours(hh, mm, 0, 0);
  return d;
}

describe("openNow — openingHours フォールバック", () => {
  it("平日の開店中は true", () => {
    expect(openNow(weekdayHours, null, makeDate(1, 12, 0))).toBe(true);
  });

  it("開店ちょうど (10:00) は true", () => {
    expect(openNow(weekdayHours, null, makeDate(1, 10, 0))).toBe(true);
  });

  it("閉店ちょうど (17:00) は false", () => {
    expect(openNow(weekdayHours, null, makeDate(1, 17, 0))).toBe(false);
  });

  it("開店前 (09:59) は false", () => {
    expect(openNow(weekdayHours, null, makeDate(1, 9, 59))).toBe(false);
  });

  it("定休日（日曜）は false", () => {
    expect(openNow(weekdayHours, null, makeDate(0, 12, 0))).toBe(false);
  });

  it("定休日（土曜）は false", () => {
    expect(openNow(weekdayHours, null, makeDate(6, 12, 0))).toBe(false);
  });
});

describe("openNow — 手動状態優先", () => {
  const mon12 = makeDate(1, 12, 0);
  const future = new Date(mon12.getTime() + 60 * 60 * 1000); // 1時間後
  const past = new Date(mon12.getTime() - 60 * 60 * 1000);   // 1時間前

  it("OPEN + autoCloseAt が未来 → true", () => {
    expect(openNow(weekdayHours, { state: "OPEN", breakUntil: null, autoCloseAt: future }, mon12)).toBe(true);
  });

  it("OPEN + autoCloseAt が過去 → openingHours フォールバック (true)", () => {
    expect(openNow(weekdayHours, { state: "OPEN", breakUntil: null, autoCloseAt: past }, mon12)).toBe(true);
  });

  it("OPEN + autoCloseAt なし → true", () => {
    expect(openNow(weekdayHours, { state: "OPEN", breakUntil: null, autoCloseAt: null }, mon12)).toBe(true);
  });

  it("CLOSED + autoCloseAt が未来 → false", () => {
    expect(openNow(weekdayHours, { state: "CLOSED", breakUntil: null, autoCloseAt: future }, mon12)).toBe(false);
  });

  it("CLOSED + autoCloseAt が過去 → openingHours フォールバック (true)", () => {
    expect(openNow(weekdayHours, { state: "CLOSED", breakUntil: null, autoCloseAt: past }, mon12)).toBe(true);
  });

  it("BREAK + breakUntil が未来 → false", () => {
    expect(openNow(weekdayHours, { state: "BREAK", breakUntil: future, autoCloseAt: null }, mon12)).toBe(false);
  });

  it("BREAK + breakUntil が過去 → openingHours フォールバック (true)", () => {
    expect(openNow(weekdayHours, { state: "BREAK", breakUntil: past, autoCloseAt: null }, mon12)).toBe(true);
  });

  it("定休日に OPEN が手動設定されていても autoCloseAt が未来なら true", () => {
    const sun12 = makeDate(0, 12, 0);
    const sunFuture = new Date(sun12.getTime() + 60 * 60 * 1000); // 日曜 13:00
    expect(openNow(weekdayHours, { state: "OPEN", breakUntil: null, autoCloseAt: sunFuture }, sun12)).toBe(true);
  });
});
