export const runtime = "nodejs";

import Link from "next/link";
import { getDashboardStats } from "@/app/session/actions";

type DashboardStats = {
  total: number;
  uniqueFractures: number;
  mostCommonFracture: string | null;
  lastRedirectUsed: string | null;
};

function Tile({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7 }}>{title}</div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginTop: 6,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
      {subtitle ? (
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7, lineHeight: 1.4 }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <h2 style={{ margin: 0, fontSize: 16 }}>{title}</h2>
      <div style={{ marginTop: 10 }}>{children}</div>
    </section>
  );
}

export default async function DashboardPage() {
  let stats: DashboardStats = {
    total: 0,
    uniqueFractures: 0,
    mostCommonFracture: null,
    lastRedirectUsed: null,
  };

  try {
    const data = await getDashboardStats();

    stats = {
      total: Number(data?.total ?? 0),
      uniqueFractures: Number(data?.uniqueFractures ?? 0),
      mostCommonFracture:
        typeof data?.mostCommonFracture === "string"
          ? data.mostCommonFracture
          : null,
      lastRedirectUsed:
        typeof data?.lastRedirectUsed === "string"
          ? data.lastRedirectUsed
          : null,
    };
  } catch (err) {
    console.error("Dashboard stats failed:", err);
  }

  const densityBand =
    stats.total >= 50 ? "high" : stats.total >= 15 ? "medium" : "low";

  return (
    <main style={{ padding: 24, maxWidth: 980 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>Dashboard</h1>
          <p style={{ marginTop: 0, opacity: 0.8 }}>
            V1 metrics: activity, pattern variety, most common pattern, last suggested move.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Link
            href="/session"
            style={{
              display: "inline-flex",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            New Session
          </Link>

          <Link
            href="/logs"
            style={{
              display: "inline-flex",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.03)",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Logs
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginTop: 16,
        }}
      >
        <Tile
          title="Total Entries"
          value={String(stats.total)}
          subtitle="How many times you ran the loop and saved."
        />
        <Tile
          title="Unique Patterns Seen"
          value={String(stats.uniqueFractures)}
          subtitle="Higher means more pattern variety; lower means repetition."
        />
        <Tile
          title="Most Common Pattern"
          value={stats.mostCommonFracture ?? "—"}
          subtitle="Your primary repeat pattern (if any)."
        />
        <Tile
          title="Last Suggested Move"
          value={stats.lastRedirectUsed ?? "—"}
          subtitle="The last chosen action-path."
        />
      </div>

      <Card title="How to read this">
        <div style={{ opacity: 0.9, lineHeight: 1.55 }}>
          <div>
            <b>Density:</b> {densityBand}.{" "}
            <span style={{ opacity: 0.75 }}>
              Low = early data. Medium = useful. High = strong signal.
            </span>
          </div>
          <div style={{ marginTop: 8 }}>
            <b>Most common pattern</b> is your current leverage point. If it’s repeating, VANTA is doing its job:
            it’s surfacing the pattern you keep stepping into.
          </div>
        </div>
      </Card>

      <Card title="Next action (V1)">
        <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.55, opacity: 0.9 }}>
          <li>
            If <b>Most Common Pattern</b> exists: run a Session on that pattern again and compare suggested moves.
          </li>
          <li>
            If <b>Unique Patterns</b> is low: you’re looping the same distortion — treat redirects as practice reps.
          </li>
          <li>
            If <b>Total Entries</b> is low: the system is under-fed. More logs = more pattern clarity.
          </li>
        </ol>
        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
          V1 doesn’t predict you. It trains you by repetition + structure.
        </div>
      </Card>
    </main>
  );
}