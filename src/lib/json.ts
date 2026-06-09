import type { OpeningHours, CourseStop } from "@/types";

// SQLite は JSON 型を持たないため、配列・オブジェクトは JSON 文字列で保存する。
// これらのヘルパで DB の文字列 ↔ TypeScript 型を変換する。

export function parsePhotos(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function serializePhotos(photos: string[]): string {
  return JSON.stringify(photos);
}

export function parseOpeningHours(raw: string): OpeningHours {
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function serializeOpeningHours(hours: OpeningHours): string {
  return JSON.stringify(hours);
}

export function parseCourseStops(raw: string): CourseStop[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function serializeCourseStops(stops: CourseStop[]): string {
  return JSON.stringify(stops);
}

export function parseFerryDays(raw: string): boolean[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : Array(7).fill(true);
  } catch {
    return Array(7).fill(true);
  }
}

export function serializeFerryDays(days: boolean[]): string {
  return JSON.stringify(days);
}
