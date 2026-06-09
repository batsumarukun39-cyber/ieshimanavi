import type { Place, StoreStatus } from "@prisma/client";
import type { PlaceWithStatus, FerryScheduleData, ModelCourseData } from "@/types";
import type { FerrySchedule, ModelCourse } from "@prisma/client";
import {
  parsePhotos,
  parseOpeningHours,
  parseFerryDays,
  parseCourseStops,
} from "./json";

type PlaceWithStatusRaw = Place & { status: StoreStatus | null };

/** Prisma の Place レコードを、JSON フィールドをパースした PlaceWithStatus に変換する */
export function toPlaceWithStatus(
  raw: PlaceWithStatusRaw,
  openNow: boolean
): PlaceWithStatus {
  return {
    id: raw.id,
    slug: raw.slug,
    category: raw.category,
    nameJa: raw.nameJa,
    nameEn: raw.nameEn,
    descriptionJa: raw.descriptionJa,
    descriptionEn: raw.descriptionEn,
    lat: raw.lat,
    lng: raw.lng,
    address: raw.address,
    phone: raw.phone,
    photos: parsePhotos(raw.photos),
    openingHours: parseOpeningHours(raw.openingHours),
    hasStatus: raw.hasStatus,
    island: raw.island,
    status: raw.status
      ? {
          state: raw.status.state,
          message: raw.status.message,
          breakUntil: raw.status.breakUntil,
          autoCloseAt: raw.status.autoCloseAt,
          updatedAt: raw.status.updatedAt,
        }
      : null,
    openNow,
  };
}

/** Prisma の FerrySchedule を FerryScheduleData に変換する */
export function toFerryScheduleData(raw: FerrySchedule): FerryScheduleData {
  return {
    id: raw.id,
    operator: raw.operator,
    fromPort: raw.fromPort,
    toPort: raw.toPort,
    departHm: raw.departHm,
    arriveHm: raw.arriveHm,
    days: parseFerryDays(raw.days),
    note: raw.note,
  };
}

/** Prisma の ModelCourse を ModelCourseData に変換する */
export function toModelCourseData(raw: ModelCourse): ModelCourseData {
  return {
    id: raw.id,
    slug: raw.slug,
    theme: raw.theme,
    titleJa: raw.titleJa,
    titleEn: raw.titleEn,
    descriptionJa: raw.descriptionJa,
    descriptionEn: raw.descriptionEn,
    durationMin: raw.durationMin,
    stops: parseCourseStops(raw.stops),
  };
}
