export const runtime = "nodejs";

import { getRecentEntries, resetEntries } from "@/app/session/actions";

type SearchParams = Promise<{
  limit?: string;
}>;

function buttonStyle(primary = false) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.2)",
    background: primary ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
    color: "inherit",
    textDecoration: "none",
    cursor: "pointer",
  } as const;
}

function formatTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default async function LogsPage(props: { searchParams?: SearchParams }) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const limit = Math.max(1, Math.min(200, Number(searchParams?.limit) || 50));
  const rows = await getRecentEntries(limit);

  async function resetAction() {
    "use server";
    await resetEntries();
  }

  return (
    <main style={{ padding: 24, maxWidth: 1120 }}>
      <h1 style={{ marginBottom: 8 }}>Logs</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Recent saved sessions (what happened → pattern → next move).
      </p>

      <form
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          marginTop: 16,
        }}
      >
        <label
          htmlFor="limit"
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <span>Show</span>
          <input
            id="limit"
            name="limit"
            type="number"
            min={1}
            max={200}
            defaultValue={limit}
            style={{
              width: 96,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.03)",
              color: "inherit",
            }}
          />
          <span>entries</span>
        </label>

        <button type="submit" style={buttonStyle(true)}>
          Apply
        </button>

        <a href="/logs" style={buttonStyle(false)}>
          Refresh
        </a>
      </form>

      <form action={resetAction} style={{ marginTop: 12 }}>
        <button type="submit" style={buttonStyle(false)}>
          Reset (Delete All)
        </button>
      </form>

      <section
        style={{
          marginTop: 18,
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.02)",
          overflow: "hidden",
        }}
      >
        {rows.length === 0 ? (
          <div style={{ padding: 20 }}>
            <div style={{ fontWeight: 700 }}>No sessions recorded yet.</div>
            <div style={{ marginTop: 8, opacity: 0.78 }}>
              Start a session when something shifts.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 840,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "16px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      fontSize: 13,
                      opacity: 0.8,
                      width: 190,
                    }}
                  >
                    Time
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "16px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      fontSize: 13,
                      opacity: 0.8,
                    }}
                  >
                    What Happened
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "16px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      fontSize: 13,
                      opacity: 0.8,
                      width: 220,
                    }}
                  >
                    Pattern
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "16px 18px",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      fontSize: 13,
                      opacity: 0.8,
                      width: 220,
                    }}
                  >
                    Next Move
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td
                      style={{
                        verticalAlign: "top",
                        padding: "16px 18px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        opacity: 0.9,
                        lineHeight: 1.45,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatTime(row.created_at)}
                    </td>

                    <td
                      style={{
                        verticalAlign: "top",
                        padding: "16px 18px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        lineHeight: 1.55,
                      }}
                    >
                      {row.trigger}
                    </td>

                    <td
                      style={{
                        verticalAlign: "top",
                        padding: "16px 18px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div style={{ fontWeight: 700, lineHeight: 1.4 }}>
                        {row.fracture_label}
                      </div>
                      <div style={{ marginTop: 4, opacity: 0.62, fontSize: 12 }}>
                        {row.fracture_id}
                      </div>
                    </td>

                    <td
                      style={{
                        verticalAlign: "top",
                        padding: "16px 18px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div style={{ fontWeight: 700, lineHeight: 1.4 }}>
                        {row.redirect_label}
                      </div>
                      <div style={{ marginTop: 4, opacity: 0.62, fontSize: 12 }}>
                        {row.redirect_id}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}