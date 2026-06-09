"use client";

import { useEffect, useRef, useState } from "react";
import type { PlaceWithStatus } from "@/types";

const CATEGORY_EMOJI: Record<string, string> = {
  RESTAURANT: "🍽",
  CAFE: "☕",
  SHOP: "🛍",
  SIGHT: "🏔",
  LODGING: "🏠",
  ONSEN: "♨",
  TOILET: "🚻",
  PORT: "⛴",
  OTHER: "📍",
};

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

// シックな固定色パレット（sea ベース）
const CATEGORY_COLOR: Record<string, string> = {
  RESTAURANT: "#A8835A", // clay
  CAFE:       "#A8835A",
  SHOP:       "#7A746B",
  SIGHT:      "#4F6E78", // sea
  LODGING:    "#5E7E63", // sage
  ONSEN:      "#36525B", // sea-deep
  TOILET:     "#8A8276",
  PORT:       "#4F6E78",
  OTHER:      "#8A8276",
};

type Props = {
  places: PlaceWithStatus[];
  locale: string;
  highlightSlug?: string;
};

export default function MapView({ places, locale, highlightSlug }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<import("leaflet").Map | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [popup, setPopup] = useState<PlaceWithStatus | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      const islandLat = parseFloat(process.env.NEXT_PUBLIC_ISLAND_LAT ?? "34.683");
      const islandLng = parseFloat(process.env.NEXT_PUBLIC_ISLAND_LNG ?? "134.530");

      const map = L.map(mapRef.current!, { center: [islandLat, islandLng], zoom: 15 });
      leafletMap.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      places.forEach((place) => {
        const emoji = CATEGORY_EMOJI[place.category] ?? "📍";
        const color = CATEGORY_COLOR[place.category] ?? "#8A8276";

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            background:${color};border:1.5px solid rgba(255,255,255,0.7);
            border-radius:50%;width:32px;height:32px;
            display:flex;align-items:center;justify-content:center;
            font-size:15px;cursor:pointer;
          ">${emoji}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18],
        });

        const marker = L.marker([place.lat, place.lng], { icon }).addTo(map);
        marker.on("click", () => setPopup(place));

        if (place.slug === highlightSlug) {
          map.setView([place.lat, place.lng], 17);
          setPopup(place);
        }
      });
    });

    return () => {
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allCategories = Array.from(new Set(places.map((p) => p.category)));
  const filtered =
    selectedCategories.size === 0
      ? places
      : places.filter((p) => selectedCategories.has(p.category));

  useEffect(() => {
    if (!leafletMap.current) return;
    import("leaflet").then((L) => {
      leafletMap.current!.eachLayer((layer) => {
        if (layer instanceof L.Marker) leafletMap.current!.removeLayer(layer);
      });
      filtered.forEach((place) => {
        const emoji = CATEGORY_EMOJI[place.category] ?? "📍";
        const color = CATEGORY_COLOR[place.category] ?? "#8A8276";
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            background:${color};border:1.5px solid rgba(255,255,255,0.7);
            border-radius:50%;width:32px;height:32px;
            display:flex;align-items:center;justify-content:center;
            font-size:15px;cursor:pointer;
          ">${emoji}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        const marker = L.marker([place.lat, place.lng], { icon }).addTo(leafletMap.current!);
        marker.on("click", () => setPopup(place));
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories]);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  function locateMe() {
    if (!navigator.geolocation || !leafletMap.current) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => leafletMap.current!.setView([coords.latitude, coords.longitude], 17),
      () => alert(locale === "ja" ? "位置情報を取得できませんでした" : "Could not get location")
    );
  }

  const name = (p: PlaceWithStatus) => (locale === "en" && p.nameEn ? p.nameEn : p.nameJa);
  const cat = (p: PlaceWithStatus) => {
    const c = CATEGORY_LABEL[p.category] ?? CATEGORY_LABEL.OTHER;
    return locale === "en" ? c.en : c.ja;
  };

  return (
    <div className="relative w-full" style={{ height: "calc(100dvh - 48px - 60px)" }}>
      {/* カテゴリフィルタ */}
      <div className="absolute top-2 left-2 right-2 z-[1000] flex flex-wrap gap-1.5">
        {allCategories.map((c) => {
          const active = selectedCategories.has(c);
          return (
            <button
              key={c}
              onClick={() => toggleCategory(c)}
              aria-pressed={active}
              className="text-[11px] px-2.5 py-1.5 rounded-[4px] border transition-colors min-h-[36px]"
              style={{
                backgroundColor: active ? "#FCFAF6" : "rgba(252,250,246,0.92)",
                borderColor: active ? "#262320" : "#DDD5C6",
                color: "#262320",
              }}
            >
              {CATEGORY_EMOJI[c]} {cat({ category: c } as PlaceWithStatus)}
            </button>
          );
        })}
      </div>

      {/* 地図本体 */}
      <div ref={mapRef} className="w-full h-full" />

      {/* 現在地ボタン */}
      <button
        onClick={locateMe}
        className="absolute bottom-4 right-4 z-[1000] bg-surface border border-line rounded-full p-3 hover:bg-[#F0EDE5] transition-colors min-h-[44px] min-w-[44px]"
        aria-label={locale === "ja" ? "現在地を表示" : "Show my location"}
      >
        📍
      </button>

      {/* ポップアップカード */}
      {popup && (
        <div className="absolute bottom-6 left-3 right-3 z-[1000] bg-surface rounded-[6px] border border-line p-4">
          <button
            onClick={() => setPopup(null)}
            className="absolute top-2 right-3 text-ink-faint hover:text-ink text-lg leading-none min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            ×
          </button>
          <p className="text-[11px] text-ink-faint mb-1">{cat(popup)}</p>
          <p className="font-serif text-[16px] text-ink">{name(popup)}</p>
          {popup.hasStatus && (
            <div className="mt-1">
              <span
                className="text-[12px]"
                style={{
                  color:
                    popup.status?.state === "OPEN"
                      ? "#5E7E63"
                      : popup.status?.state === "BREAK"
                      ? "#A8835A"
                      : "#8A8276",
                }}
              >
                {popup.status?.state === "OPEN"
                  ? locale === "ja" ? "営業中" : "Open"
                  : popup.status?.state === "BREAK"
                  ? locale === "ja" ? "休憩中" : "On Break"
                  : locale === "ja" ? "休業" : "Closed"}
              </span>
            </div>
          )}
          <a
            href={`/${locale}/places/${popup.slug}`}
            className="block mt-2 text-[13px] text-sea hover:text-sea-deep"
          >
            {locale === "ja" ? "詳細を見る →" : "View details →"}
          </a>
        </div>
      )}
    </div>
  );
}
