import type { Category, StatusState } from "@prisma/client";

export type { Category, StatusState };

export type OpeningHourSlot = {
  open: string; // "11:00"
  close: string; // "16:00"
};

// 0=日 1=月 ... 6=土 の曜日インデックス
export type OpeningHours = {
  [day: string]: OpeningHourSlot[];
};

export type CourseStop = {
  placeSlug: string;
  order: number;
  noteJa?: string;
  noteEn?: string;
};

export type PlaceWithStatus = {
  id: string;
  slug: string;
  category: Category;
  nameJa: string;
  nameEn: string | null;
  descriptionJa: string | null;
  descriptionEn: string | null;
  lat: number;
  lng: number;
  address: string | null;
  phone: string | null;
  photos: string[];
  openingHours: OpeningHours;
  hasStatus: boolean;
  island: string;
  status: {
    state: StatusState;
    message: string | null;
    breakUntil: Date | null;
    autoCloseAt: Date | null;
    updatedAt: Date;
  } | null;
  openNow: boolean;
};

export type FerryScheduleData = {
  id: string;
  operator: string;
  fromPort: string;
  toPort: string;
  departHm: string;
  arriveHm: string;
  days: boolean[];
  note: string | null;
};

export type ModelCourseData = {
  id: string;
  slug: string;
  theme: string;
  titleJa: string;
  titleEn: string | null;
  descriptionJa: string | null;
  descriptionEn: string | null;
  durationMin: number;
  stops: CourseStop[];
};
