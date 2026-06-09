"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

export default function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale() {
    const nextLocale = locale === "ja" ? "en" : "ja";
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    startTransition(() => {
      router.replace(segments.join("/"));
    });
  }

  return (
    <button
      onClick={switchLocale}
      disabled={isPending}
      className="text-[12px] text-ink-faint hover:text-ink transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center tracking-wide"
      aria-label={`Switch to ${locale === "ja" ? "English" : "日本語"}`}
    >
      {t("switchLang")}
    </button>
  );
}
