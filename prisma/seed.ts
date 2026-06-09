// ⚠️ サンプルデータです。実在の店舗情報・座標・船時刻は未確認のため、
//    公開前に必ず家島の関係者（いえしまコンシェルジュ、姫路市、各店舗等）へ
//    確認のうえ実データへ差し替えてください。

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- Places ---
  // ⚠️ 仮の店舗情報・座標・営業時間。要差し替え。
  const placesData = [
    {
      slug: "sample-cafe-umi",
      category: "CAFE" as const,
      nameJa: "（サンプル）海のみえるカフェ",
      nameEn: "(Sample) Seaside Cafe",
      descriptionJa: "港を見渡せる絶景カフェです。コーヒーと地元のお菓子が人気。",
      descriptionEn: "A cafe with a view of the port. Known for coffee and local sweets.",
      lat: 34.6835,
      lng: 134.5305,
      address: "兵庫県姫路市家島町（サンプル）",
      phone: null,
      photos: JSON.stringify(["/images/places/placeholder.jpg"]),
      openingHours: JSON.stringify({
        "1": [{ open: "10:00", close: "16:00" }],
        "2": [{ open: "10:00", close: "16:00" }],
        "3": [{ open: "10:00", close: "16:00" }],
        "4": [{ open: "10:00", close: "16:00" }],
        "5": [{ open: "10:00", close: "16:00" }],
        "6": [{ open: "10:00", close: "16:00" }],
        "0": [],
      }),
      hasStatus: true,
      island: "家島本島",
    },
    {
      slug: "sample-restaurant-gyoko",
      category: "RESTAURANT" as const,
      nameJa: "（サンプル）漁港食堂",
      nameEn: "(Sample) Fishing Port Diner",
      descriptionJa: "地元の漁師が営む食堂。新鮮な魚介料理が自慢。",
      descriptionEn: "A diner run by local fishermen, serving fresh seafood.",
      lat: 34.6830,
      lng: 134.5298,
      address: "兵庫県姫路市家島町（サンプル）",
      phone: null,
      photos: JSON.stringify(["/images/places/placeholder.jpg"]),
      openingHours: JSON.stringify({
        "1": [{ open: "11:00", close: "14:00" }],
        "2": [{ open: "11:00", close: "14:00" }],
        "3": [{ open: "11:00", close: "14:00" }],
        "4": [{ open: "11:00", close: "14:00" }],
        "5": [{ open: "11:00", close: "14:00" }],
        "6": [{ open: "11:00", close: "14:00" }],
        "0": [],
      }),
      hasStatus: true,
      island: "家島本島",
    },
    {
      slug: "sample-shop-miyage",
      category: "SHOP" as const,
      nameJa: "（サンプル）島のみやげ屋",
      nameEn: "(Sample) Island Souvenir Shop",
      descriptionJa: "家島の特産品・干物・加工品などを販売。",
      descriptionEn: "Local specialties, dried fish, and island products.",
      lat: 34.6828,
      lng: 134.5310,
      address: "兵庫県姫路市家島町（サンプル）",
      phone: null,
      photos: JSON.stringify(["/images/places/placeholder.jpg"]),
      openingHours: JSON.stringify({
        "1": [{ open: "09:00", close: "17:00" }],
        "2": [{ open: "09:00", close: "17:00" }],
        "3": [{ open: "09:00", close: "17:00" }],
        "4": [{ open: "09:00", close: "17:00" }],
        "5": [{ open: "09:00", close: "17:00" }],
        "6": [{ open: "09:00", close: "17:00" }],
        "0": [{ open: "09:00", close: "12:00" }],
      }),
      hasStatus: true,
      island: "家島本島",
    },
    {
      slug: "sample-sight-manyou",
      category: "SIGHT" as const,
      nameJa: "（サンプル）万葉の丘",
      nameEn: "(Sample) Manyou Hill",
      descriptionJa: "万葉集にも詠まれた歴史ある丘。島を一望できる絶景スポット。",
      descriptionEn: "A historic hill mentioned in the Manyoshu poetry anthology, with panoramic views.",
      lat: 34.6855,
      lng: 134.5320,
      address: "兵庫県姫路市家島町（サンプル）",
      phone: null,
      photos: JSON.stringify(["/images/places/placeholder.jpg"]),
      openingHours: JSON.stringify({}),
      hasStatus: false,
      island: "家島本島",
    },
    {
      slug: "sample-sight-sunset",
      category: "SIGHT" as const,
      nameJa: "（サンプル）夕日ヶ浜",
      nameEn: "(Sample) Sunset Beach",
      descriptionJa: "夕暮れ時に美しい夕日が見られる浜辺。",
      descriptionEn: "A beach with stunning sunset views in the evening.",
      lat: 34.6820,
      lng: 134.5280,
      address: "兵庫県姫路市家島町（サンプル）",
      phone: null,
      photos: JSON.stringify(["/images/places/placeholder.jpg"]),
      openingHours: JSON.stringify({}),
      hasStatus: false,
      island: "家島本島",
    },
    {
      slug: "sample-toilet-port",
      category: "TOILET" as const,
      nameJa: "（サンプル）真浦港 公衆トイレ",
      nameEn: "(Sample) Maura Port Restroom",
      descriptionJa: "真浦港フェリーターミナル近くの公衆トイレ。",
      descriptionEn: "Public restroom near the Maura Port ferry terminal.",
      lat: 34.6825,
      lng: 134.5295,
      address: "兵庫県姫路市家島町（サンプル）",
      phone: null,
      photos: JSON.stringify([]),
      openingHours: JSON.stringify({}),
      hasStatus: false,
      island: "家島本島",
    },
    {
      slug: "sample-port-maura",
      category: "PORT" as const,
      nameJa: "（サンプル）真浦港",
      nameEn: "(Sample) Maura Port",
      descriptionJa: "家島本島の主要港。姫路港からの高速船が発着する。",
      descriptionEn: "The main port of Ieshima, served by high-speed ferries from Himeji.",
      lat: 34.6823,
      lng: 134.5293,
      address: "兵庫県姫路市家島町（サンプル）",
      phone: null,
      photos: JSON.stringify([]),
      openingHours: JSON.stringify({}),
      hasStatus: false,
      island: "家島本島",
    },
    {
      slug: "sample-lodging-minshuku",
      category: "LODGING" as const,
      nameJa: "（サンプル）民宿 島の宿",
      nameEn: "(Sample) Guesthouse Shima-no-yado",
      descriptionJa: "島の自然に囲まれた民宿。地元料理の夕食が好評。",
      descriptionEn: "A cozy guesthouse surrounded by island nature, with a popular local dinner.",
      lat: 34.6840,
      lng: 134.5315,
      address: "兵庫県姫路市家島町（サンプル）",
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

  // --- StoreStatus & StoreCredential for hasStatus=true places ---
  // ⚠️ サンプルPIN "1234" を使用。公開前に必ず変更してください。
  const samplePin = "1234";
  const pinHash = await bcrypt.hash(samplePin, 10);

  const hasStatusPlaces = places.filter((p) =>
    placesData.find((d) => d.slug === p.slug)?.hasStatus
  );

  for (const place of hasStatusPlaces) {
    await prisma.storeStatus.upsert({
      where: { placeId: place.id },
      update: {},
      create: {
        placeId: place.id,
        state: "CLOSED",
      },
    });
    await prisma.storeCredential.upsert({
      where: { placeId: place.id },
      update: { pinHash },
      create: { placeId: place.id, pinHash },
    });
    console.log(`  ✓ Credential: ${place.nameJa} (PIN: ${samplePin})`);
  }

  // --- FerrySchedule ---
  // ⚠️ 仮の時刻・運航会社名。要差し替え。
  const ferryData = [
    // 姫路→家島(真浦) 往路
    { operator: "（サンプル）高速船", fromPort: "姫路港", toPort: "家島(真浦)", departHm: "07:30", arriveHm: "08:05", days: JSON.stringify([true, true, true, true, true, true, true]) },
    { operator: "（サンプル）高速船", fromPort: "姫路港", toPort: "家島(真浦)", departHm: "10:00", arriveHm: "10:35", days: JSON.stringify([true, true, true, true, true, true, true]) },
    { operator: "（サンプル）高速船", fromPort: "姫路港", toPort: "家島(真浦)", departHm: "14:30", arriveHm: "15:05", days: JSON.stringify([true, true, true, true, true, true, true]) },
    // 家島(真浦)→姫路 復路
    { operator: "（サンプル）高速船", fromPort: "家島(真浦)", toPort: "姫路港", departHm: "09:00", arriveHm: "09:35", days: JSON.stringify([true, true, true, true, true, true, true]) },
    { operator: "（サンプル）高速船", fromPort: "家島(真浦)", toPort: "姫路港", departHm: "13:00", arriveHm: "13:35", days: JSON.stringify([true, true, true, true, true, true, true]) },
    { operator: "（サンプル）高速船", fromPort: "家島(真浦)", toPort: "姫路港", departHm: "17:00", arriveHm: "17:35", days: JSON.stringify([true, true, true, true, true, true, true]) },
  ];

  await prisma.ferrySchedule.deleteMany();
  for (const ferry of ferryData) {
    await prisma.ferrySchedule.create({ data: ferry });
  }
  console.log(`  ✓ Ferry: ${ferryData.length} schedules`);

  // --- ModelCourse ---
  // ⚠️ 仮のコース。要差し替え。
  const coursesData = [
    {
      slug: "course-manyou",
      theme: "万葉",
      titleJa: "（サンプル）万葉の足跡をたどる半日コース",
      titleEn: "(Sample) Half-Day Manyoshu Heritage Walk",
      descriptionJa: "古代の詩歌に詠まれた島の風景を歩きながら体感する約2時間のコース。",
      descriptionEn: "A 2-hour walk through scenery celebrated in ancient Japanese poetry.",
      durationMin: 120,
      stops: JSON.stringify([
        { placeSlug: "sample-port-maura", order: 1, noteJa: "真浦港からスタート", noteEn: "Start at Maura Port" },
        { placeSlug: "sample-sight-manyou", order: 2, noteJa: "万葉の丘へ登る（徒歩20分）", noteEn: "Climb Manyou Hill (20 min walk)" },
        { placeSlug: "sample-cafe-umi", order: 3, noteJa: "カフェで休憩", noteEn: "Coffee break at seaside cafe" },
        { placeSlug: "sample-port-maura", order: 4, noteJa: "港へ戻る", noteEn: "Return to port" },
      ]),
    },
    {
      slug: "course-gourmet",
      theme: "グルメ",
      titleJa: "（サンプル）島のグルメと夕日コース",
      titleEn: "(Sample) Island Gourmet & Sunset Tour",
      descriptionJa: "新鮮な海の幸ランチから夕日の絶景まで、島の魅力を凝縮した半日コース。",
      descriptionEn: "From fresh seafood lunch to breathtaking sunset views.",
      durationMin: 150,
      stops: JSON.stringify([
        { placeSlug: "sample-port-maura", order: 1, noteJa: "真浦港から出発", noteEn: "Depart from Maura Port" },
        { placeSlug: "sample-restaurant-gyoko", order: 2, noteJa: "漁港食堂でランチ", noteEn: "Lunch at the fishing port diner" },
        { placeSlug: "sample-shop-miyage", order: 3, noteJa: "お土産を買う", noteEn: "Pick up souvenirs" },
        { placeSlug: "sample-sight-sunset", order: 4, noteJa: "夕日ヶ浜で夕日を見る", noteEn: "Watch the sunset at Sunset Beach" },
        { placeSlug: "sample-port-maura", order: 5, noteJa: "最終便で帰宅", noteEn: "Catch the last ferry home" },
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
  // ⚠️ サンプルのお知らせ。要差し替え。
  await prisma.notice.deleteMany();
  await prisma.notice.create({
    data: {
      bodyJa: "【サンプル】このサイトはサンプルデータで動作しています。公開前に実データへ差し替えてください。",
      bodyEn: "(Sample) This site is running on sample data. Please replace with real data before publishing.",
      level: "warning",
    },
  });
  console.log("  ✓ Notice: sample warning");

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
