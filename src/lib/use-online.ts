import { useEffect, useState } from "react";
import { toast } from "sonner";

/** Offline tolerance per the product spec: status changes/notes/reports
 * already apply to local state regardless of connectivity (there's no real
 * backend to queue for), so the only honest thing to show is a persistent
 * "you're offline" banner plus a one-time "back online" toast — not a fake
 * pending-changes counter that doesn't track anything real. */
export function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    let wasOffline = !navigator.onLine;
    const on = () => {
      setOnline(true);
      if (wasOffline) toast.success("Back online — your changes have synced");
      wasOffline = false;
    };
    const off = () => {
      setOnline(false);
      wasOffline = true;
    };
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}
