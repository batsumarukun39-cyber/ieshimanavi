// 実データ（家島情報.xlsx より変換）
// ⚠️ 座標は暫定値です。実際の位置を地図で確認の上、修正してください。
// ⚠️ 店舗の PIN はデプロイ後に各店舗ごとに変更してください（初期値: 1234）。

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const ALL_DAYS = JSON.stringify([true, true, true, true, true, true, true]);

// "11:00~14:00　17:00~21:00" + 定休曜日 → openingHours JSON
// closedDays: 0=日, 1=月, ..., 6=土
function buildHours(
  timeStr: string | null,
  closedDays: number[]
): Record<string, Array<{ open: string; close: string }>> {
  const result: Record<string, Array<{ open: string; close: string }>> = {};
  for (let d = 0; d <= 6; d++) {
    if (closedDays.includes(d) || !timeStr) {
      result[String(d)] = [];
    } else {
      const slots = timeStr
        .split(/[\s　]+/)
        .filter((s) => s.includes("~"))
        .map((slot) => {
          const [open, close] = slot.split("~");
          return {
            open: open.trim().padStart(5, "0"),
            close: close.trim().padStart(5, "0"),
          };
        });
      result[String(d)] = slots;
    }
  }
  return result;
}

async function main() {
  console.log("🌱 Seeding database...");

  // --- Places ---
  const placesData = [
    // ── 真浦エリア ──────────────────────────────────────────
    {
      slug: "maura-port",
      category: "PORT" as const,
      nameJa: "真浦港",
      nameEn: "Maura Port",
      descriptionJa: "姫路からの高速船が発着する家島本島のメイン港。",
      descriptionEn: "The main port of Ieshima, served by high-speed ferries from Himeji.",
      lat: 34.6830,
      lng: 134.5295,
      address: "兵庫県姫路市家島町真浦",
      phone: null,
      photos: JSON.stringify([]),
      openingHours: JSON.stringify({}),
      hasStatus: false,
      island: "家島本島",
    },
    {
      slug: "yoraikyo",
      category: "RESTAURANT" as const,
      nameJa: "夜来香",
      nameEn: "Yoraikyo",
      descriptionJa: "家島真浦の中華料理店。昼・夜ともに営業。火曜定休。",
      descriptionEn: "Chinese restaurant in Maura. Open lunch and dinner. Closed Tuesdays.",
      lat: 34.6833,
      lng: 134.5300,
      address: "兵庫県姫路市家島町真浦2186",
      phone: null,
      photos: JSON.stringify(["/images/places/placeholder.jpg"]),
      openingHours: JSON.stringify(buildHours("11:00~14:00　17:00~21:00", [2])),
      hasStatus: true,
      island: "家島本島",
    },
    {
      slug: "okabe",
      category: "LODGING" as const,
      nameJa: "料理旅館おかべ",
      nameEn: "Ryokan Okabe",
      descriptionJa: "家島真浦の料理旅館。新鮮な魚料理が自慢。",
      descriptionEn: "A traditional inn with fresh seafood cuisine in Maura.",
      lat: 34.6836,
      lng: 134.5308,
      address: "兵庫県姫路市家島町真浦2421",
      phone: null,
      photos: JSON.stringify(["/images/places/placeholder.jpg"]),
      openingHours: JSON.stringify({}),
      hasStatus: false,
      island: "家島本島",
    },
    {
      slug: "ange",
      category: "CAFE" as const,
      nameJa: "ANGE",
      nameEn: "ANGE",
      descriptionJa: "家島真浦の軽食カフェ。",
      descriptionEn: "Light food cafe in Maura.",
      lat: 34.6835,
      lng: 134.5306,
      address: "兵庫県姫路市家島町真浦2380",
      phone: null,
      photos: JSON.stringify(["/images/places/placeholder.jpg"]),
      openingHours: JSON.stringify({}),
      hasStatus: false,
      island: "家島本島",
    },
    {
      slug: "porto",
      category: "CAFE" as const,
      nameJa: "海の見えるカフェPORTO",
      nameEn: "Cafe PORTO",
      descriptionJa: "海を一望できる絶景カフェ。コーヒーと魚料理が人気。月曜定休。",
      descriptionEn: "Seaside cafe with ocean views. Known for coffee and seafood. Closed Mondays.",
      lat: 34.6840,
      lng: 134.5290,
      address: "兵庫県姫路市家島町真浦672",
      phone: null,
      photos: JSON.stringify(["/images/places/placeholder.jpg"]),
      openingHours: JSON.stringify(buildHours("9:00~10:30　11:00~14:00", [1])),
      hasStatus: true,
      island: "家島本島",
    },
    {
      slug: "dairitsu",
      category: "LODGING" as const,
      nameJa: "大立旅館",
      nameEn: "Dairitsu Ryokan",
      descriptionJa: "家島真浦の旅館。",
      descriptionEn: "A traditional inn in Maura.",
      lat: 34.6838,
      lng: 134.5288,
      address: "兵庫県姫路市家島町真浦522-34",
      phone: null,
      photos: JSON.stringify(["/images/places/placeholder.jpg"]),
      openingHours: JSON.stringify({}),
      hasStatus: false,
      island: "家島本島",
    },
    {
      slug: "demise",
      category: "RESTAURANT" as const,
      nameJa: "でみせ",
      nameEn: "Demise",
      descriptionJa: "家島真浦の焼肉店。昼・夜ともに営業。月曜定休。",
      descriptionEn: "Yakiniku BBQ restaurant in Maura. Open lunch and dinner. Closed Mondays.",
      lat: 34.6839,
      lng: 134.5289,
      address: "兵庫県姫路市家島町真浦622",
      phone: null,
      photos: JSON.stringify(["/images/places/placeholder.jpg"]),
      openingHours: JSON.stringify(buildHours("12:00~13:30　17:00~22:00", [1])),
      hasStatus: true,
      island: "家島本島",
    },
    // ── 宮エリア ──────────────────────────────────────────
    {
      slug: "miya-port",
      category: "PORT" as const,
      nameJa: "宮港",
      nameEn: "Miya Port",
      descriptionJa: "家島本島の宮地区にある港。家島神社・清水公園へのアクセス拠点。",
      descriptionEn: "Port in the Miya area, gateway to Ieshima Shrine and Shimizu Park.",
      lat: 34.6822,
      lng: 134.5235,
      address: "兵庫県姫路市家島町宮",
      phone: null,
      photos: JSON.stringify([]),
      openingHours: JSON.stringify({}),
      hasStatus: false,
      island: "家島本島",
    },
    {
      slug: "umeusagi",
      category: "SHOP" as const,
      nameJa: "うめうさぎ",
      nameEn: "Umeusagi",
      descriptionJa: "宮の惣菜・お弁当店。島の食材を使った手作り弁当が人気。水・木・金定休。",
      descriptionEn: "Deli and bento shop in Miya. Homemade bentos with island ingredients. Closed Wed-Fri.",
      lat: 34.6815,
      lng: 134.5235,
      address: "兵庫県姫路市家島町宮1069",
      phone: null,
      photos: JSON.stringify(["/images/places/placeholder.jpg"]),
      openingHours: JSON.stringify(buildHours("11:30~17:00", [3, 4, 5])),
      hasStatus: true,
      island: "家島本島",
    },
    {
      slug: "maami",
      category: "CAFE" as const,
      nameJa: "工場カフェ まあみい",
      nameEn: "Kouba Cafe Maami",
      descriptionJa: "宮の工場を改装したカフェ。魚料理も提供。月〜木定休。",
      descriptionEn: "Cafe in a converted factory in Miya. Also serves seafood. Closed Mon-Thu.",
      lat: 34.6820,
      lng: 134.5240,
      address: "兵庫県姫路市家島町宮48-1",
      phone: null,
      photos: JSON.stringify(["/images/places/placeholder.jpg"]),
      openingHours: JSON.stringify({}),
      hasStatus: false,
      island: "家島本島",
    },
    {
      slug: "shimizu-shokudo",
      category: "RESTAURANT" as const,
      nameJa: "志みず",
      nameEn: "Shimizu",
      descriptionJa: "宮の魚料理店。新鮮な地元の魚介を提供。",
      descriptionEn: "Seafood restaurant in Miya, serving fresh local fish.",
      lat: 34.6818,
      lng: 134.5238,
      address: "兵庫県姫路市家島町宮85",
      phone: null,
      photos: JSON.stringify(["/images/places/placeholder.jpg"]),
      openingHours: JSON.stringify({}),
      hasStatus: false,
      island: "家島本島",
    },
    {
      slug: "ieshima-jinja",
      category: "SIGHT" as const,
      nameJa: "家島神社",
      nameEn: "Ieshima Shrine",
      descriptionJa: "家島の鎮守の神社。宮エリアに鎮座し、島民の信仰を集める歴史ある神社。",
      descriptionEn: "The guardian shrine of Ieshima, a historic shrine in the Miya area.",
      lat: 34.6810,
      lng: 134.5225,
      address: "兵庫県姫路市家島町宮1",
      phone: null,
      photos: JSON.stringify(["/images/places/placeholder.jpg"]),
      openingHours: JSON.stringify({}),
      hasStatus: false,
      island: "家島本島",
    },
    {
      slug: "shimizu-park",
      category: "SIGHT" as const,
      nameJa: "清水公園",
      nameEn: "Shimizu Park",
      descriptionJa: "宮エリアにある公園。海を見渡せる景色が楽しめる。",
      descriptionEn: "Park in the Miya area with views of the sea.",
      lat: 34.6822,
      lng: 134.5242,
      address: "兵庫県姫路市家島宮50-6",
      phone: null,
      photos: JSON.stringify(["/images/places/placeholder.jpg"]),
      openingHours: JSON.stringify({}),
      hasStatus: false,
      island: "家島本島",
    },
    {
      slug: "shimizu-beach",
      category: "SIGHT" as const,
      nameJa: "清水の浜海水浴場",
      nameEn: "Shimizu Beach",
      descriptionJa: "宮エリアの海水浴場。夏には多くの海水浴客で賑わう透明度の高い砂浜。",
      descriptionEn: "Clear-water swimming beach in Miya, popular in summer.",
      lat: 34.6808,
      lng: 134.5232,
      address: "兵庫県姫路市家島町宮",
      phone: null,
      photos: JSON.stringify(["/images/places/placeholder.jpg"]),
      openingHours: JSON.stringify({}),
      hasStatus: false,
      island: "家島本島",
    },
  ];

  const places = [];
  for (const data of placesData) {
    const place = await prisma.place.upsert({
      where: { slug: data.slug },
      update: data,
      create: data,
    });
    places.push(place);
    console.log(`  ✓ Place: ${place.nameJa}`);
  }

  // --- StoreStatus & StoreCredential ---
  // ⚠️ 初期 PIN "1234"。公開前に各店舗へ個別 PIN をお知らせし変更してください。
  const samplePin = "1234";
  const pinHash = await bcrypt.hash(samplePin, 10);

  const hasStatusPlaces = places.filter((p) =>
    placesData.find((d) => d.slug === p.slug)?.hasStatus
  );

  for (const place of hasStatusPlaces) {
    await prisma.storeStatus.upsert({
      where: { placeId: place.id },
      update: {},
      create: { placeId: place.id, state: "CLOSED" },
    });
    await prisma.storeCredential.upsert({
      where: { placeId: place.id },
      update: { pinHash },
      create: { placeId: place.id, pinHash },
    });
    console.log(`  ✓ Credential: ${place.nameJa} (PIN: ${samplePin})`);
  }

  // --- FerrySchedule（家島汽船 実時刻）---
  await prisma.ferrySchedule.deleteMany();

  const ferryData = [
    // ── 姫路港 → 真浦港 ──────────────────────────────────
    { operator: "家島汽船", fromPort: "姫路港", toPort: "真浦港", departHm: "06:55", arriveHm: "07:22", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "姫路港", toPort: "真浦港", departHm: "07:10", arriveHm: "07:45", days: ALL_DAYS, note: "中型船" },
    { operator: "家島汽船", fromPort: "姫路港", toPort: "真浦港", departHm: "08:18", arriveHm: "08:45", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "姫路港", toPort: "真浦港", departHm: "09:10", arriveHm: "09:37", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "姫路港", toPort: "真浦港", departHm: "10:00", arriveHm: "10:27", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "姫路港", toPort: "真浦港", departHm: "11:40", arriveHm: "12:15", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "姫路港", toPort: "真浦港", departHm: "13:40", arriveHm: "14:07", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "姫路港", toPort: "真浦港", departHm: "15:30", arriveHm: "15:57", days: ALL_DAYS, note: "中型船" },
    { operator: "家島汽船", fromPort: "姫路港", toPort: "真浦港", departHm: "16:30", arriveHm: "16:57", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "姫路港", toPort: "真浦港", departHm: "17:10", arriveHm: "17:50", days: ALL_DAYS, note: "中型船" },
    { operator: "家島汽船", fromPort: "姫路港", toPort: "真浦港", departHm: "18:15", arriveHm: "18:42", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "姫路港", toPort: "真浦港", departHm: "19:00", arriveHm: "19:27", days: ALL_DAYS, note: "中型船" },
    { operator: "家島汽船", fromPort: "姫路港", toPort: "真浦港", departHm: "19:55", arriveHm: "20:22", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "姫路港", toPort: "真浦港", departHm: "20:35", arriveHm: "21:10", days: ALL_DAYS, note: null },
    // ── 真浦港 → 宮港（真浦に寄港後、宮まで続行する便）──────
    { operator: "家島汽船", fromPort: "真浦港", toPort: "宮港", departHm: "07:25", arriveHm: "07:28", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "宮港", departHm: "08:50", arriveHm: "08:53", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "宮港", departHm: "09:40", arriveHm: "09:45", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "宮港", departHm: "10:32", arriveHm: "10:35", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "宮港", departHm: "14:10", arriveHm: "14:13", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "宮港", departHm: "16:10", arriveHm: "16:15", days: ALL_DAYS, note: "中型船" },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "宮港", departHm: "17:02", arriveHm: "17:05", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "宮港", departHm: "18:47", arriveHm: "18:50", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "宮港", departHm: "19:30", arriveHm: "19:35", days: ALL_DAYS, note: "中型船" },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "宮港", departHm: "20:27", arriveHm: "20:30", days: ALL_DAYS, note: null },
    // ── 宮港 → 真浦港（復路）────────────────────────────
    { operator: "家島汽船", fromPort: "宮港", toPort: "真浦港", departHm: "06:00", arriveHm: "06:03", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "宮港", toPort: "真浦港", departHm: "06:20", arriveHm: "06:25", days: ALL_DAYS, note: "中型船" },
    { operator: "家島汽船", fromPort: "宮港", toPort: "真浦港", departHm: "07:31", arriveHm: "07:34", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "宮港", toPort: "真浦港", departHm: "08:05", arriveHm: "08:10", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "宮港", toPort: "真浦港", departHm: "09:02", arriveHm: "09:05", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "宮港", toPort: "真浦港", departHm: "10:50", arriveHm: "10:55", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "宮港", toPort: "真浦港", departHm: "12:50", arriveHm: "12:53", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "宮港", toPort: "真浦港", departHm: "14:20", arriveHm: "14:25", days: ALL_DAYS, note: "中型船" },
    { operator: "家島汽船", fromPort: "宮港", toPort: "真浦港", departHm: "15:35", arriveHm: "15:38", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "宮港", toPort: "真浦港", departHm: "17:45", arriveHm: "17:50", days: ALL_DAYS, note: "中型船" },
    { operator: "家島汽船", fromPort: "宮港", toPort: "真浦港", departHm: "19:00", arriveHm: "19:03", days: ALL_DAYS, note: null },
    // ── 真浦港 → 姫路港（復路）────────────────────────────
    { operator: "家島汽船", fromPort: "真浦港", toPort: "姫路港", departHm: "06:10", arriveHm: "06:37", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "姫路港", departHm: "06:33", arriveHm: "07:00", days: ALL_DAYS, note: "中型船" },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "姫路港", departHm: "07:37", arriveHm: "08:04", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "姫路港", departHm: "08:18", arriveHm: "08:45", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "姫路港", departHm: "09:10", arriveHm: "09:37", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "姫路港", departHm: "11:00", arriveHm: "11:27", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "姫路港", departHm: "13:00", arriveHm: "13:27", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "姫路港", departHm: "14:33", arriveHm: "15:00", days: ALL_DAYS, note: "中型船" },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "姫路港", departHm: "15:45", arriveHm: "16:12", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "姫路港", departHm: "16:10", arriveHm: "16:52", days: ALL_DAYS, note: "中型船" },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "姫路港", departHm: "17:25", arriveHm: "18:00", days: ALL_DAYS, note: null },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "姫路港", departHm: "18:00", arriveHm: "18:27", days: ALL_DAYS, note: "中型船" },
    { operator: "家島汽船", fromPort: "真浦港", toPort: "姫路港", departHm: "19:10", arriveHm: "19:37", days: ALL_DAYS, note: null },
    // ── 宮港 → 姫路港（真浦未停車）─────────────────────────
    { operator: "家島汽船", fromPort: "宮港", toPort: "姫路港", departHm: "20:00", arriveHm: "20:27", days: ALL_DAYS, note: null },
  ];

  for (const ferry of ferryData) {
    await prisma.ferrySchedule.create({ data: ferry });
  }
  console.log(`  ✓ Ferry: ${ferryData.length} schedules`);

  // --- ModelCourse ---
  const coursesData = [
    {
      slug: "course-maura",
      theme: "散策",
      titleJa: "真浦エリア半日さんぽコース",
      titleEn: "Half-Day Maura Walk",
      descriptionJa: "真浦港から島の路地を歩き、カフェやグルメを楽しむ約3時間のコース。",
      descriptionEn: "A 3-hour stroll through Maura's lanes, ending with cafe and dining.",
      durationMin: 180,
      stops: JSON.stringify([
        { placeSlug: "maura-port", order: 1, noteJa: "真浦港に到着", noteEn: "Arrive at Maura Port" },
        { placeSlug: "porto", order: 2, noteJa: "PORTOで朝のコーヒー（9:00〜）", noteEn: "Morning coffee at PORTO (from 9:00)" },
        { placeSlug: "yoraikyo", order: 3, noteJa: "夜来香でランチ（11:00〜）", noteEn: "Lunch at Yoraikyo (from 11:00)" },
        { placeSlug: "maura-port", order: 4, noteJa: "真浦港から帰路", noteEn: "Return from Maura Port" },
      ]),
    },
    {
      slug: "course-miya",
      theme: "観光",
      titleJa: "宮エリア観光コース",
      titleEn: "Miya Area Sightseeing",
      descriptionJa: "宮港から家島神社・清水の浜を巡り、島グルメで締めくくる約3時間のコース。",
      descriptionEn: "Visit Ieshima Shrine and Shimizu Beach from Miya Port, then enjoy island food.",
      durationMin: 180,
      stops: JSON.stringify([
        { placeSlug: "miya-port", order: 1, noteJa: "宮港に到着", noteEn: "Arrive at Miya Port" },
        { placeSlug: "ieshima-jinja", order: 2, noteJa: "家島神社を参拝", noteEn: "Visit Ieshima Shrine" },
        { placeSlug: "shimizu-beach", order: 3, noteJa: "清水の浜で海を満喫", noteEn: "Enjoy the sea at Shimizu Beach" },
        { placeSlug: "umeusagi", order: 4, noteJa: "うめうさぎでお弁当を購入（〜17:00）", noteEn: "Pick up a bento at Umeusagi (until 17:00)" },
        { placeSlug: "miya-port", order: 5, noteJa: "宮港から帰路", noteEn: "Return from Miya Port" },
      ]),
    },
  ];

  for (const course of coursesData) {
    await prisma.modelCourse.upsert({
      where: { slug: course.slug },
      update: course,
      create: course,
    });
    console.log(`  ✓ Course: ${course.titleJa}`);
  }

  // --- Notice ---
  await prisma.notice.deleteMany();
  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
