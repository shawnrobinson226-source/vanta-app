export type V1LogEntry = {
  id: string;
  createdAt: string;
  trigger: string;
  fractureLabel: string;
  reframe: string;
  redirectLabel: string;
  redirectSteps: string[];
};

const KEY = "vanta_v1_logs";

function safeParse(json: string | null): V1LogEntry[] {
  if (!json) return [];
  try {
    const data = JSON.parse(json);
    if (!Array.isArray(data)) return [];
    return data as V1LogEntry[];
  } catch {
    return [];
  }
}

export function getLogs(): V1LogEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(KEY));
}

export function addLog(entry: V1LogEntry): void {
  if (typeof window === "undefined") return;
  const existing = getLogs();
  const next = [entry, ...existing].slice(0, 200); // cap to prevent bloat
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearLogs(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function getDashboardStats(logs: V1LogEntry[]) {
  const total = logs.length;

  const counts = new Map<string, number>();
  for (const l of logs) {
    counts.set(l.fractureLabel, (counts.get(l.fractureLabel) ?? 0) + 1);
  }

  let mostCommonFracture: string | null = null;
  let mostCommonCount = 0;
  for (const [label, count] of counts.entries()) {
    if (count > mostCommonCount) {
      mostCommonCount = count;
      mostCommonFracture = label;
    }
  }

  const lastRedirectUsed = logs[0]?.redirectLabel ?? null;

  return {
    total,
    mostCommonFracture,
    lastRedirectUsed,
  };
}