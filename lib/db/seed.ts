import type { Client } from "@libsql/client";

export async function seedDb(db: Client) {
  await db.execute({
    sql: `
      INSERT OR IGNORE INTO continuity_states (
        operator_id,
        perception_alignment,
        identity_alignment,
        intention_alignment,
        action_alignment,
        continuity_score,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `,
    args: ["op_legacy", 50, 50, 50, 50, 50],
  });
}