import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useHotel } from "@/lib/hotel-store";
import { shiftTotals } from "@/lib/mock-data";
import { MobileFrame, MobileScreenHeader } from "@/components/MobileFrame";
import { Icon } from "@/components/Icon";
import { SupervisorNav } from "@/components/supervisor/SupervisorNav";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/supervisor/performance")({
  head: () => ({ meta: [{ title: "Performance — Golden Sands Hotel" }] }),
  component: Performance,
});

function Bar({ value, tone }: { value: number; tone: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-high">
        <span
          className={cn("block h-full rounded-full", tone)}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </span>
      <span className="text-label-sm w-9 shrink-0 text-right tabular-nums text-on-surface-variant">
        {value}%
      </span>
    </span>
  );
}

function Performance() {
  const { staff, workload } = useHotel();
  const [shift, setShift] = useState<"Morning" | "Evening">("Morning");
  const totals = shift === "Morning" ? shiftTotals.morning : shiftTotals.evening;
  const shiftStaff = staff.filter((s) => s.shift === shift);

  return (
    <MobileFrame>
      <MobileScreenHeader
        title="Performance"
        subtitle="No public ranking — supervisor-only"
        actions={
          <div className="flex gap-1.5">
            {(["Morning", "Evening"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setShift(s)}
                className={cn(
                  "text-label-sm inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium",
                  shift === s
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant text-on-surface-variant",
                )}
              >
                <Icon name={s === "Morning" ? "wb_sunny" : "nights_stay"} size={13} filled />
                {s}
              </button>
            ))}
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="hk-card border border-outline-variant bg-surface-container-lowest p-3">
            <p className="text-label-sm text-on-surface-subtle">Rooms completed</p>
            <p className="text-title-lg font-bold text-on-surface">
              {totals.completed}
              <span className="text-label-sm font-normal text-on-surface-subtle">
                {" "}
                / {totals.assigned}
              </span>
            </p>
          </div>
          <div className="hk-card border border-outline-variant bg-surface-container-lowest p-3">
            <p className="text-label-sm text-on-surface-subtle">Avg time / room</p>
            <p className="text-title-lg font-bold text-on-surface">{totals.avgMinutes} min</p>
          </div>
          <div className="hk-card border border-outline-variant bg-surface-container-lowest p-3">
            <p className="text-label-sm text-on-surface-subtle">On-time</p>
            <p className="text-title-lg font-bold text-on-surface">{totals.onTimePct}%</p>
          </div>
          <div className="hk-card border border-outline-variant bg-surface-container-lowest p-3">
            <p className="text-label-sm text-on-surface-subtle">Pass rate</p>
            <p className="text-title-lg font-bold text-on-surface">{totals.passRate}%</p>
          </div>
        </div>

        <p className="text-label-sm mt-5 uppercase text-on-surface-subtle">
          Per-attendant · {shift} shift
        </p>
        <div className="mt-1.5 space-y-2">
          {shiftStaff.map((s) => (
            <div
              key={s.id}
              className="hk-card border border-outline-variant bg-surface-container-lowest p-3.5"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-label font-semibold text-on-primary">
                  {s.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-body block font-medium text-on-surface">{s.name}</span>
                  <span className="text-label-sm block text-on-surface-subtle">
                    {s.roomsCompleted} rooms · {s.avgMinutes} min avg · {workload(s.id)} active
                  </span>
                </span>
              </div>
              <div className="mt-2.5 space-y-1.5">
                <Bar value={s.onTimePct} tone="bg-primary" />
                <Bar value={s.passRate} tone="bg-secondary" />
              </div>
            </div>
          ))}
        </div>

        <p className="text-label-sm mt-4 flex items-start gap-2 hk-card bg-surface-container px-3 py-2.5 text-on-surface-variant">
          <Icon name="lock" size={16} className="mt-0.5 shrink-0" />
          Reference only — never shown to housekeepers, never a ranked leaderboard.
        </p>
      </div>
      <SupervisorNav />
    </MobileFrame>
  );
}
