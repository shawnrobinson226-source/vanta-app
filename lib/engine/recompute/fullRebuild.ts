// /lib/engine/recompute/fullRebuild.ts

import { isoNow } from "@/lib/engine/recompute/math";
import {
  deleteDerivedForOperator,
  listClosedSessionIds,
} from "@/lib/engine/recompute/queries";
import { recomputeIncremental } from "@/lib/engine/recompute/incremental";

/**
 * fullRebuild(operator_id)
 * Deletes all derived rows and rebuilds from immutable events.
 * Use for: bug fixes, migrations, integrity checks.
 */
export async function fullRebuild(operator_id: string): Promise<void> {
  // 1) Clear derived cache
  await deleteDerivedForOperator(operator_id);

  // 2) Get all closed sessions (ledger truth)
  const sessionIds = await listClosedSessionIds(operator_id);

  // 3) Recompute each session index incrementally (safe + deterministic)
  // NOTE: For big data later, you batch; for V1 this is fine.
  for (const session_id of sessionIds) {
    await recomputeIncremental(operator_id, session_id);
  }

  // (Optional) Write an audit log event later; do NOT add it now unless you want it.
  void isoNow();
}