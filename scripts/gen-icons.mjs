/**
 * Generates minimal PNG icons for PWA (192x192 and 512x512).
 * Blue #1d4ed8 with a simple wave / island emoji drawn as text.
 * Uses only Node.js builtins (zlib, fs) — no canvas dependency.
 */
import { deflateSync } from "zlib";
import { writeFileSync, mkdirSync, existsSync } from "fs";

function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n, 0);
  return b;
}

function crc32(buf) {
  const table = crc32.table ?? (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const crcIn = Buffer.concat([typeBytes, data]);
  return Buffer.concat([u32(data.length), typeBytes, data, u32(crc32(crcIn))]);
}

function makePNG(size) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = chunk(
    "IHDR",
    Buffer.concat([u32(size), u32(size), Buffer.from([8, 2, 0, 0, 0])])
  );

  // Background: #1d4ed8 (29, 78, 216)
  const bg = [0x1d, 0x4e, 0xd8];

  // Build RGBA rows
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3);
    row[0] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const i = 1 + x * 3;

      // Draw a simple rounded circle in white to create an "island" icon
      const cx = size / 2, cy = size / 2, r = size * 0.38;
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let pixel = bg;

      if (dist <= r) {
        // White circle
        pixel = [0xff, 0xff, 0xff];

        // Inner blue circle (ring shape)
        if (dist <= r * 0.7) {
          pixel = bg;
        }

        // Draw a tiny "island" silhouette inside
        if (dist <= r * 0.38) {
          pixel = [0xff, 0xff, 0xff];
        }
      }

      row[i] = pixel[0];
      row[i + 1] = pixel[1];
      row[i + 2] = pixel[2];
    }
    rows.push(row);
  }

  const raw = Buffer.concat(rows);
  const idat = chunk("IDAT", deflateSync(raw, { level: 6 }));
  const iend = chunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

if (!existsSync("public/icons")) mkdirSync("public/icons", { recursive: true });

for (const size of [192, 512]) {
  const path = `public/icons/icon-${size}.png`;
  writeFileSync(path, makePNG(size));
  console.log(`✅ Created ${path} (${size}x${size})`);
}
