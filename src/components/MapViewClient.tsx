"use client";

import dynamic from "next/dynamic";
import type { PlaceWithStatus } from "@/types";

// Leaflet は window に依存するため SSR を無効にして動的インポート
// Next.js 16 では ssr:false は Client Component 内でのみ使用可能
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100 rounded-xl text-gray-400 text-sm">
      {typeof window === "undefined" ? "" : "地図を読み込み中..."}
    </div>
  ),
});

type Props = {
  places: PlaceWithStatus[];
  locale: string;
  highlightSlug?: string;
};

export default function MapViewClient(props: Props) {
  return <MapView {...props} />;
}
