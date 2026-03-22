import LogsClient from "@/components/vanta/LogsClient";

export const metadata = {
  title: "VANTA Logs",
  description: "Session log view for the locked V1 kernel.",
};

export default function LogsPage() {
  return <LogsClient />;
}