import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { verifySessionValue, SESSION_COOKIE } from "@/lib/auth";
import StoreStatusToggle from "@/components/StoreStatusToggle";
import LogoutButton from "@/components/LogoutButton";

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const sessionVal = cookieStore.get(SESSION_COOKIE)?.value;
  const placeId = sessionVal ? await verifySessionValue(sessionVal) : null;
  if (!placeId) redirect(`/${locale}/store`);

  const place = await prisma.place.findUnique({
    where: { id: placeId },
    include: { status: true },
  });
  if (!place) redirect(`/${locale}/store`);

  const ja = locale === "ja";
  const name = (locale === "en" && place.nameEn) ? place.nameEn : place.nameJa;

  return (
    <div className="max-w-sm mx-auto space-y-6 py-4">
      {/* 店名 */}
      <div className="text-center border-b border-line pb-4">
        <p className="text-[11px] text-ink-faint mb-1 tracking-wide">
          {ja ? "ログイン中" : "Logged in as"}
        </p>
        <h1 className="font-serif text-[20px] text-ink">{name}</h1>
      </div>

      {/* ステータストグル */}
      <StoreStatusToggle
        placeId={placeId}
        currentState={place.status?.state ?? "CLOSED"}
        currentMessage={place.status?.message ?? null}
        autoCloseAt={place.status?.autoCloseAt?.toISOString() ?? null}
        locale={locale}
      />

      {/* ログアウト */}
      <LogoutButton locale={locale} />
    </div>
  );
}
