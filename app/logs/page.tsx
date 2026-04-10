import LogsClient from "@/components/vanta/LogsClient";
import { getRecentSessions } from "@/app/session/actions";

export const metadata = {
  title: "VANTA Logs",
  description: "Session log view for the locked V1 kernel.",
};

export default async function LogsPage() {
  const initialRows = await getRecentSessions("op_legacy", 50);
  return (
    <LogsClient
      initialRows={initialRows}
      operatorId="op_legacy"
      initialLimit={50}
    />
  );
}
