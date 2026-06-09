// ログイン失敗ロック: 5回失敗で15分間ロック（インメモリ、MVP段階）
// 本番はRedis等に移行すること。サーバー再起動でリセットされる点を許容。

type Record = { count: number; lockedUntil: number };
const store = new Map<string, Record>();

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

export function isLocked(key: string): boolean {
  const r = store.get(key);
  if (!r) return false;
  if (r.lockedUntil > Date.now()) return true;
  store.delete(key);
  return false;
}

export function recordFailure(key: string): void {
  const r = store.get(key) ?? { count: 0, lockedUntil: 0 };
  r.count += 1;
  if (r.count >= MAX_ATTEMPTS) r.lockedUntil = Date.now() + LOCK_MS;
  store.set(key, r);
}

export function clearRecord(key: string): void {
  store.delete(key);
}
