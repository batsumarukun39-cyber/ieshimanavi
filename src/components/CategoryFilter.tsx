"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const CATEGORIES = [
  { value: "RESTAURANT", ja: "食事",  en: "Dining" },
  { value: "CAFE",       ja: "喫茶",  en: "Café" },
  { value: "SHOP",       ja: "買物",  en: "Shopping" },
  { value: "SIGHT",      ja: "景色",  en: "Scenery" },
  { value: "LODGING",    ja: "泊まる", en: "Stay" },
  { value: "ONSEN",      ja: "湯",    en: "Onsen" },
  { value: "TOILET",     ja: "トイレ", en: "Restroom" },
  { value: "PORT",       ja: "港",    en: "Port" },
] as const;

type Props = { locale: string };

export default function CategoryFilter({ locale }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const selected = new Set(
    (searchParams.get("category") ?? "").split(",").filter(Boolean)
  );
  const onlyOpen = searchParams.get("openNow") === "true";

  function update(params: URLSearchParams) {
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function toggleCategory(value: string) {
    const next = new Set(selected);
    next.has(value) ? next.delete(value) : next.add(value);
    const params = new URLSearchParams(searchParams.toString());
    if (next.size === 0) {
      params.delete("category");
    } else {
      params.set("category", [...next].join(","));
    }
    update(params);
  }

  function toggleOpenNow() {
    const params = new URLSearchParams(searchParams.toString());
    if (onlyOpen) {
      params.delete("openNow");
    } else {
      params.set("openNow", "true");
    }
    update(params);
  }

  const chipBase =
    "text-[12.5px] px-3 py-1.5 rounded-[4px] border transition-colors min-h-[44px] flex items-center leading-none";
  const chipOff =
    "border-line-strong text-ink bg-transparent hover:bg-[#EDE8DD]";
  const chipOn =
    "border-ink text-ink bg-[#EDE8DD]";

  return (
    <div className="space-y-2">
      {/* いま開いている絞り込み */}
      <button
        onClick={toggleOpenNow}
        aria-pressed={onlyOpen}
        className={`${chipBase} gap-1.5 ${onlyOpen ? chipOn : chipOff}`}
      >
        <span
          className="inline-block rounded-full"
          style={{ width: 6, height: 6, backgroundColor: onlyOpen ? "#5E7E63" : "#8A8276", flexShrink: 0 }}
          aria-hidden="true"
        />
        {locale === "ja" ? "いま開いている" : "Open now"}
      </button>

      {/* カテゴリチップ */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map(({ value, ja, en }) => {
          const active = selected.has(value);
          return (
            <button
              key={value}
              onClick={() => toggleCategory(value)}
              aria-pressed={active}
              className={`${chipBase} ${active ? chipOn : chipOff}`}
            >
              {locale === "ja" ? ja : en}
            </button>
          );
        })}
      </div>
    </div>
  );
}
