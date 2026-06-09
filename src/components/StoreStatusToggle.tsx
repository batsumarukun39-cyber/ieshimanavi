"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { StatusState } from "@prisma/client";

type Props = {
  placeId: string;
  currentState: StatusState;
  currentMessage: string | null;
  autoCloseAt: string | null;
  locale: string;
};

export default function StoreStatusToggle({
  placeId,
  currentState,
  currentMessage,
  autoCloseAt,
  locale,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(currentMessage ?? "");
  const [error, setError] = useState("");

  const ja = locale === "ja";

  async function updateStatus(state: StatusState, breakMinutes?: number) {
    setError("");
    const res = await fetch("/api/store/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state, message: message || undefined, breakMinutes }),
    });
    if (!res.ok) {
      setError(ja ? "更新に失敗しました" : "Update failed");
      return;
    }
    startTransition(() => router.refresh());
  }

  const autoCloseLabel = autoCloseAt
    ? new Date(autoCloseAt).toLocaleTimeString(ja ? "ja-JP" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const stateLabel =
    currentState === "OPEN"
      ? ja ? "営業中" : "Open"
      : currentState === "BREAK"
      ? ja ? "休憩中" : "On Break"
      : ja ? "休業" : "Closed";

  const stateColor =
    currentState === "OPEN" ? "#5E7E63" : currentState === "BREAK" ? "#A8835A" : "#8A8276";

  return (
    <div className="space-y-5">
      {/* 現在のステータス */}
      <div className="text-center py-4 border-t border-b border-line">
        <p className="text-[11px] text-ink-faint mb-1.5 tracking-wide uppercase">
          {ja ? "現在の状態" : "Current Status"}
        </p>
        <p className="font-serif text-[28px] tracking-wide" style={{ color: stateColor }}>
          {stateLabel}
        </p>
        {autoCloseLabel && currentState === "OPEN" && (
          <p className="text-[12px] text-ink-faint mt-1">
            {ja ? `自動閉店 ${autoCloseLabel}` : `Auto-close at ${autoCloseLabel}`}
          </p>
        )}
      </div>

      {/* 一言メッセージ */}
      <div>
        <label className="block text-[12px] text-ink-faint mb-1.5">
          {ja ? "一言メッセージ（任意）" : "Optional message"}
        </label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={ja ? "例：本日売り切れ" : "e.g. Sold out today"}
          className="w-full border border-line rounded-[6px] px-3 py-2.5 text-[15px] text-ink bg-surface focus:outline-none focus:border-sea transition-colors"
          maxLength={60}
        />
      </div>

      {/* アクションボタン */}
      {currentState === "CLOSED" ? (
        <button
          onClick={() => updateStatus("OPEN")}
          disabled={isPending}
          className="w-full py-5 text-[18px] font-serif tracking-wide rounded-[6px] border-2 border-sage text-sage hover:bg-sage hover:text-surface transition-colors disabled:opacity-50 min-h-[64px]"
        >
          {ja ? "営業を開始する" : "Open for Business"}
        </button>
      ) : (
        <div className="space-y-2.5">
          <button
            onClick={() => updateStatus("CLOSED")}
            disabled={isPending}
            className="w-full py-4 text-[16px] font-serif tracking-wide rounded-[6px] border border-line text-ink-soft hover:border-ink hover:text-ink transition-colors disabled:opacity-50 min-h-[56px]"
          >
            {ja ? "今日は閉める" : "Close for Today"}
          </button>
          {currentState === "OPEN" && (
            <button
              onClick={() => updateStatus("BREAK", 30)}
              disabled={isPending}
              className="w-full py-4 text-[16px] font-serif tracking-wide rounded-[6px] border border-line-strong text-clay hover:bg-[#F5EDE1] transition-colors disabled:opacity-50 min-h-[56px]"
            >
              {ja ? "休憩中（30分）" : "Break (30 min)"}
            </button>
          )}
          {currentState === "BREAK" && (
            <button
              onClick={() => updateStatus("OPEN")}
              disabled={isPending}
              className="w-full py-4 text-[16px] font-serif tracking-wide rounded-[6px] border border-sage text-sage hover:bg-sage hover:text-surface transition-colors disabled:opacity-50 min-h-[56px]"
            >
              {ja ? "営業を再開する" : "Resume"}
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-clay text-[13px] text-center">{error}</p>
      )}

      {isPending && (
        <p className="text-ink-faint text-[13px] text-center animate-pulse">
          {ja ? "更新中..." : "Updating..."}
        </p>
      )}
    </div>
  );
}
