// セッション: HMAC-SHA256(SECRET, placeId|exp) の署名付きトークンを httpOnly Cookie に保存
// 外部ライブラリ不要、Node.js 18+ / Next.js Edge Runtime の Web Crypto API を使用

const SESSION_COOKIE = "ieshima_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 時間

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

async function hmac(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Buffer.from(sig).toString("hex");
}

/** セッション Cookie の値を生成する */
export async function createSessionValue(placeId: string): Promise<string> {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `${placeId}|${exp}`;
  const sig = await hmac(getSecret(), payload);
  return `${payload}|${sig}`;
}

/** Cookie 値を検証して placeId を返す。無効なら null */
export async function verifySessionValue(
  value: string
): Promise<string | null> {
  const parts = value.split("|");
  if (parts.length !== 3) return null;
  const [placeId, expStr, sig] = parts;
  const exp = parseInt(expStr, 10);
  if (isNaN(exp) || Date.now() > exp) return null;
  const expected = await hmac(getSecret(), `${placeId}|${expStr}`);
  if (expected !== sig) return null;
  return placeId;
}

export { SESSION_COOKIE };
