// /lib/engine/recompute/math.ts

export function mean(xs: number[]): number {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function variance(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return xs.reduce((acc, x) => acc + (x - m) * (x - m), 0) / (xs.length - 1);
}

export function isoNow(): string {
  return new Date().toISOString();
}

export function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

// Average days between sorted ISO timestamps
export function avgDaysBetween(isoTimes: string[]): number | null {
  if (isoTimes.length < 2) return null;
  const ts = isoTimes
    .map((s) => Date.parse(s))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
  if (ts.length < 2) return null;

  let total = 0;
  for (let i = 1; i < ts.length; i++) total += (ts[i] - ts[i - 1]);
  const avgMs = total / (ts.length - 1);
  return avgMs / (1000 * 60 * 60 * 24);
}