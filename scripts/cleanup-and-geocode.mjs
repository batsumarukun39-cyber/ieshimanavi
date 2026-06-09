// 1. サンプルデータ削除
// 2. 住所から座標を取得（国土地理院API）
// 3. DB の座標を更新

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function geocode(address) {
  const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(address)}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.length > 0) {
      const [lng, lat] = json[0].geometry.coordinates;
      return { lat, lng };
    }
  } catch (e) {
    console.warn(`  ⚠ geocode failed for: ${address}`, e.message);
  }
  return null;
}

async function main() {
  // --- 1. サンプルデータ削除 ---
  const deleted = await prisma.place.deleteMany({
    where: { slug: { startsWith: "sample-" } },
  });
  console.log(`🗑  Deleted ${deleted.count} sample places`);

  const deletedCourses = await prisma.modelCourse.deleteMany({
    where: { slug: { in: ["course-manyou", "course-gourmet"] } },
  });
  console.log(`🗑  Deleted ${deletedCourses.count} old sample courses`);

  // --- 2. 座標ジオコーディング & 更新 ---
  const places = await prisma.place.findMany();
  console.log(`\n📍 Geocoding ${places.length} places...`);

  for (const place of places) {
    if (!place.address) {
      console.log(`  ⏭  ${place.nameJa} (住所なし、スキップ)`);
      continue;
    }
    const coords = await geocode(place.address);
    if (coords) {
      await prisma.place.update({
        where: { id: place.id },
        data: { lat: coords.lat, lng: coords.lng },
      });
      console.log(
        `  ✓ ${place.nameJa}: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
      );
    } else {
      console.log(`  ✗ ${place.nameJa}: 座標取得失敗（現在値を維持）`);
    }
    // APIレート制限を避けるため少し待つ
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log("\n✅ Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
