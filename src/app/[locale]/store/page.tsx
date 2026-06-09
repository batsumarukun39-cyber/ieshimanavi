"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

type Place = { id: string; nameJa: string; nameEn: string | null };

export default function StoreLoginPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const ja = locale === "ja";

  const [places, setPlaces] = useState<Place[]>([]);
  const [placeId, setPlaceId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/places")
      .then((r) => r.json())
      .then((data: Place[]) => {
        const hasStatus = data.filter((p: any) => p.hasStatus);
        setPlaces(hasStatus);
        if (hasStatus.length > 0) setPlaceId(hasStatus[0].id);
      });
  }, []);

  function appendPin(d: string) {
    if (pin.length < 6) setPin((p) => p + d);
  }
  function deletePin() {
    setPin((p) => p.slice(0, -1));
  }

  async function handleLogin() {
    if (!placeId || pin.length < 4) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/store/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId, pin }),
    });
    setLoading(false);
    if (res.status === 429) {
      setError(ja ? "しばらく時間をおいて再試行してください" : "Too many attempts. Try again later.");
      return;
    }
    if (!res.ok) {
      setPin("");
      setError(ja ? "PINが違います" : "Incorrect PIN");
      return;
    }
    router.push(`/${locale}/store/dashboard`);
  }

  const keyClass =
    "py-4 text-[20px] font-serif text-ink bg-surface rounded-[6px] border border-line hover:bg-[#F0EDE5] active:bg-[#E8E3D8] transition-colors min-h-[56px]";

  return (
    <div className="max-w-sm mx-auto space-y-6 py-4">
      <div>
        <p className="text-[11px] text-ink-faint tracking-[3px] mb-1">
          {ja ? "店舗管理" : "Store"}
        </p>
        <h1 className="font-serif text-[22px] text-ink tracking-[0.5px]">
          {ja ? "ログイン" : "Login"}
        </h1>
      </div>

      {/* 店舗選択 */}
      <div>
        <label className="block text-[12px] text-ink-faint mb-1.5">
          {ja ? "お店を選んでください" : "Select your store"}
        </label>
        <select
          value={placeId}
          onChange={(e) => setPlaceId(e.target.value)}
          className="w-full border border-line rounded-[6px] px-3 py-2.5 text-[15px] text-ink bg-surface focus:outline-none focus:border-sea transition-colors min-h-[44px]"
        >
          {places.map((p) => (
            <option key={p.id} value={p.id}>
              {locale === "en" && p.nameEn ? p.nameEn : p.nameJa}
            </option>
          ))}
        </select>
      </div>

      {/* PIN 表示 */}
      <div className="text-center">
        <p className="text-[12px] text-ink-faint mb-3">
          {ja ? "PIN（数字のみ）" : "PIN (numbers only)"}
        </p>
        <div className="flex justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-9 h-11 flex items-center justify-center text-[20px] rounded-[6px] border ${
                i < pin.length ? "border-sea bg-[#EEF2F3]" : "border-line bg-surface"
              }`}
            >
              {i < pin.length ? (
                <span className="w-2 h-2 rounded-full bg-sea inline-block" />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* テンキー */}
      <div className="grid grid-cols-3 gap-2">
        {["1","2","3","4","5","6","7","8","9"].map((d) => (
          <button key={d} onClick={() => appendPin(d)} className={keyClass}>{d}</button>
        ))}
        <button onClick={deletePin} className={`${keyClass} text-ink-faint text-[16px]`}>⌫</button>
        <button onClick={() => appendPin("0")} className={keyClass}>0</button>
        <button
          onClick={handleLogin}
          disabled={loading || pin.length < 4}
          className="py-4 text-[15px] font-serif text-surface bg-sea rounded-[6px] border border-sea hover:bg-sea-deep transition-colors disabled:opacity-50 min-h-[56px]"
        >
          {loading ? "…" : ja ? "入室" : "Enter"}
        </button>
      </div>

      {error && (
        <p className="text-clay text-[13px] text-center">{error}</p>
      )}
    </div>
  );
}
