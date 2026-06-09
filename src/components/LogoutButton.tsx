"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function LogoutButton({ locale }: { locale: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleLogout() {
    await fetch("/api/store/logout", { method: "POST" });
    startTransition(() => router.push(`/${locale}/store`));
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="w-full py-3 text-[13px] text-ink-faint hover:text-ink border border-line rounded-[6px] hover:border-line-strong transition-colors disabled:opacity-50 min-h-[44px]"
    >
      {locale === "ja" ? "ログアウト" : "Logout"}
    </button>
  );
}
