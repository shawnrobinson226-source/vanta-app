type Entry = {
  count: number;
  expires: number;
};

const store = new Map<string, Entry>();

export function rateLimit(key: string, limit = 60, windowMs = 60000) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.expires < now) {
    store.set(key, {
      count: 1,
      expires: now + windowMs,
    });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    return { allowed: false };
  }

  entry.count++;
  return { allowed: true };
}
