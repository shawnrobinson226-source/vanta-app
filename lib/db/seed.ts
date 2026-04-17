import type { Client } from "@libsql/client";

export async function seedDb(_db: Client) {
  void _db;
  // Intentionally no-op: operator continuity rows are created only through
  // operator-scoped runtime flows, not from a shared seeded identity.
}
