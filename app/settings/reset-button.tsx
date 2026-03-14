"use client";

import { useTransition } from "react";
import { resetEntries } from "@/app/session/actions";

export default function ResetButton() {
  const [isPending, startTransition] = useTransition();

  function onReset() {
    const ok = confirm(
      "Reset all entries?\n\nThis will permanently delete all saved triggers/logs."
    );
    if (!ok) return;

    startTransition(async () => {
      try {
        await resetEntries();
        alert("Reset complete.");
        // Optional: force refresh so dashboard/logs reflect immediately
        window.location.reload();
      } catch (e) {
        alert(e instanceof Error ? e.message : "Reset failed.");
      }
    });
  }

  return (
    <button disabled={isPending} onClick={onReset}>
      {isPending ? "Resetting…" : "Reset all entries"}
    </button>
  );
}