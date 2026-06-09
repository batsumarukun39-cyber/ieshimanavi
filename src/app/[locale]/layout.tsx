import type { Metadata } from "next";
import { Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import BottomTabBar from "@/components/BottomTabBar";
import Link from "next/link";
import "../globals.css";

const shippori = Shippori_Mincho({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-shippori",
  display: "swap",
  preload: false,
});

const zenKaku = Zen_Kaku_Gothic_New({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-zen-kaku",
  display: "swap",
  preload: false,
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return {
    title: {
      default: t("appName"),
      template: `%s — ${t("appName")}`,
    },
    description:
      locale === "ja"
        ? "家島諸島の観光情報・営業状況・船時刻をスマホで確認"
        : "Ieshima Islands tourist guide with live store status and ferry schedules",
    manifest: "/manifest.webmanifest",
    icons: {
      apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
      icon: [
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: t("appName"),
    },
    formatDetection: { telephone: false },
    openGraph: {
      type: "website",
      locale: locale === "ja" ? "ja_JP" : "en_US",
      siteName: t("appName"),
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "ja" | "en")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages({ locale } as { locale: "ja" | "en" });

  return (
    <html
      lang={locale}
      className={`${shippori.variable} ${zenKaku.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <NextIntlClientProvider messages={messages}>
          {/* ── 最小ヘッダー ─────────────────────────── */}
          <header className="sticky top-0 z-50 bg-surface border-b border-line">
            <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
              <Link
                href={`/${locale}`}
                className="font-serif text-[15px] tracking-[1px] text-ink leading-none"
              >
                家島ナビ
              </Link>
              <LocaleSwitcher />
            </div>
          </header>

          {/* ── メインコンテンツ ──────────────────────── */}
          <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-5 pb-20">
            {children}
          </main>

          {/* ── フッター ─────────────────────────────── */}
          <footer className="bg-surface-alt border-t border-line text-ink-faint text-[11px] text-center py-3 px-4 pb-[calc(0.75rem+60px)]">
            <p>
              {locale === "ja"
                ? "※ 掲載情報はサンプルです。公開前に実データへ差し替えてください。"
                : "※ All data is sample. Replace with real data before publishing."}
            </p>
          </footer>

          {/* ── ボトムタブバー ───────────────────────── */}
          <BottomTabBar locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
