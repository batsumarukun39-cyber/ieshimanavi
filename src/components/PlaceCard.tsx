import Link from "next/link";
import Image from "next/image";
import type { PlaceWithStatus } from "@/types";
import StatusBadge from "./StatusBadge";
import { IconChevronRight } from "@tabler/icons-react";

const CATEGORY_LABEL: Record<string, { ja: string; en: string }> = {
  RESTAURANT: { ja: "食事",   en: "Dining" },
  CAFE:       { ja: "喫茶",   en: "Café" },
  SHOP:       { ja: "買物",   en: "Shopping" },
  SIGHT:      { ja: "景色",   en: "Scenery" },
  LODGING:    { ja: "泊まる", en: "Stay" },
  ONSEN:      { ja: "湯",     en: "Onsen" },
  TOILET:     { ja: "トイレ", en: "Restroom" },
  PORT:       { ja: "港",     en: "Port" },
  OTHER:      { ja: "その他", en: "Other" },
};

// プレースホルダー背景を交互に分ける
const PLACEHOLDER_BG: Record<string, string> = {
  RESTAURANT: "#6E8A92",
  CAFE:       "#B0937E",
  SHOP:       "#B0937E",
  SIGHT:      "#6E8A92",
  LODGING:    "#B0937E",
  ONSEN:      "#6E8A92",
  TOILET:     "#8A8276",
  PORT:       "#6E8A92",
  OTHER:      "#8A8276",
};

type Props = {
  place: PlaceWithStatus;
  locale: string;
};

export default function PlaceCard({ place, locale }: Props) {
  const name = (locale === "en" && place.nameEn) ? place.nameEn : place.nameJa;
  const cat = CATEGORY_LABEL[place.category] ?? CATEGORY_LABEL.OTHER;
  const catLabel = locale === "en" ? cat.en : cat.ja;
  const photo = place.photos[0];
  const placeholderBg = PLACEHOLDER_BG[place.category] ?? "#8A8276";

  return (
    <Link
      href={`/${locale}/places/${place.slug}`}
      className="flex gap-3 bg-surface rounded-[6px] border border-line p-[11px] items-center min-h-[88px] hover:bg-[#F7F4EE] transition-colors"
    >
      {/* サムネイル */}
      <div
        className="w-[68px] h-[68px] flex-shrink-0 rounded-[4px] overflow-hidden relative"
        style={{ backgroundColor: placeholderBg }}
      >
        {photo ? (
          <Image
            src={photo}
            alt={name}
            fill
            className="object-cover"
            sizes="68px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="text-[28px] opacity-60"
              style={{ filter: "brightness(2.5) saturate(0)" }}
            >
              🏝
            </span>
          </div>
        )}
      </div>

      {/* テキスト */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <p className="text-[11px] text-ink-faint leading-none">{catLabel}</p>
        <p className="font-serif text-[15.5px] text-ink leading-snug line-clamp-2">
          {name}
        </p>
        {place.hasStatus && (
          <StatusBadge state={place.status?.state ?? "CLOSED"} locale={locale} />
        )}
      </div>

      {/* シェブロン */}
      <IconChevronRight size={16} color="#B7AE9F" strokeWidth={1.5} className="flex-shrink-0" />
    </Link>
  );
}
