"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconList, IconMap2, IconShip } from "@tabler/icons-react";

type Props = { locale: string };

export default function BottomTabBar({ locale: _locale }: Props) {
  const pathname = usePathname();

  // locale は pathname の第1セグメントから取る（SSR でも一致）
  const segments = pathname.split("/");
  const locale = segments[1] ?? _locale;
  const section = segments[2] ?? "";

  const tabs = [
    { key: "",       href: `/${locale}`,        label: locale === "ja" ? "ホーム"   : "Home",   Icon: IconHome },
    { key: "places", href: `/${locale}/places`,  label: locale === "ja" ? "スポット" : "Places", Icon: IconList },
    { key: "map",    href: `/${locale}/map`,     label: locale === "ja" ? "地図"     : "Map",    Icon: IconMap2 },
    { key: "ferry",  href: `/${locale}/ferry`,   label: locale === "ja" ? "船"       : "Ferry",  Icon: IconShip },
  ] as const;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-[2000] bg-surface-alt border-t border-line"
      style={{ height: 60 }}
      aria-label={locale === "ja" ? "メインナビゲーション" : "Main navigation"}
    >
      <div className="max-w-2xl mx-auto h-full flex">
        {tabs.map(({ key, href, label, Icon }) => {
          const active = section === key;
          return (
            <Link
              key={key}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px]"
              aria-current={active ? "page" : undefined}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2 : 1.5}
                color={active ? "#262320" : "#A9A296"}
              />
              <span
                className="text-[11px] leading-none"
                style={{ color: active ? "#262320" : "#A9A296" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
