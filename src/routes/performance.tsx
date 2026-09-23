import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useHotel } from "@/lib/hotel-store";
import { shiftTotals } from "@/lib/mock-data";
import { Avatar, Card, Chip, PageHeader, StatTile } from "@/components/ui-kit";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "Performance — Hotel App" },
      {
        name: "description",
        content:
          "Aggregate housekeeping throughput per shift plus a supervisor-only per-attendant table.",
      },
      { property: "og:title", content: "Performance — Hotel App" },
      {
        property: "og:description",
        content:
          "Aggregate housekeeping throughput per shift plus a supervisor-only per-attendant table.",
      },
    ],
  }),
  component: Performance,
});

function Bar({ value, tone }: { value: number; tone: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-container-high">
        <span
          className={cn("block h-full rounded-full", tone)}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </span>
      <span className="text-body-sm tabular-nums text-on-surface-variant">{value}%</span>
    </span>
  );
}

function Performance() {
  const { staff, workload } = useHotel();
  const [shift, setShift] = useState<"Morning" | "Evening">("Morning");
  const totals = shift === "Morning" ? shiftTotals.morning : shiftTotals.evening;
  const shiftStaff = staff.filter((s) => s.shift === shift);

  return (
    <>
      <PageHeader
        title="Performance"
        subtitle="Aggregate shift metrics. No public ranking — per-attendant data is supervisor-only."
        actions={
          <div className="flex gap-1.5">
            {(["Morning", "Evening"] as const).map((s) => (
              <Chip key={s} active={shift === s} onClick={() => setShift(s)}>
                <Icon name={s === "Morning" ? "wb_sunny" : "nights_stay"} size={15} filled />
                {s} shift
              </Chip>
            ))}
          </div>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Rooms completed"
          value={totals.completed}
          unit={`/ ${totals.assigned}`}
          icon="cleaning_services"
          tone="tertiary"
          hint={`${Math.round((totals.completed / totals.assigned) * 100)}% of assigned`}
        />
        <StatTile
          label="Avg time per room"
          value={totals.avgMinutes}
          unit="min"
          icon="timer"
          tone="warning"
          hint="Target 28 min"
        />
        <StatTile
          label="On-time completion"
          value={`${totals.onTimePct}%`}
          icon="schedule"
          tone="info"
          hint="Against expected ready time"
        />
        <StatTile
          label="Inspection pass rate"
          value={`${totals.passRate}%`}
          icon="verified"
          tone="success"
          hint="First-pass approvals"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant p-4">
          <div>
            <h2 className="text-title-lg text-on-surface">Per-attendant detail</h2>
            <p className="text-body-sm text-on-surface-variant">
              {shift} shift · reference only, not a leaderboard
            </p>
          </div>
          <span className="text-label-sm ml-auto inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container px-3 py-1.5 uppercase text-on-surface-variant">
            <Icon name="lock" size={14} filled />
            Supervisor only — not shown to housekeepers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-left">
            <thead>
              <tr className="text-label-sm bg-surface-container uppercase text-on-surface-subtle">
                <th className="px-4 py-2.5 font-semibold">Attendant</th>
                <th className="px-4 py-2.5 font-semibold">Rooms completed</th>
                <th className="px-4 py-2.5 font-semibold">Avg time</th>
                <th className="px-4 py-2.5 font-semibold">On-time</th>
                <th className="px-4 py-2.5 font-semibold">Pass rate</th>
                <th className="px-4 py-2.5 font-semibold">Open now</th>
              </tr>
            </thead>
            <tbody>
              {shiftStaff.map((s) => (
                <tr key={s.id} className="border-t border-outline-variant">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5">
                      <Avatar staff={s} size={30} />
                      <span className="text-body font-medium text-on-surface">{s.name}</span>
                    </span>
                  </td>
                  <td className="text-body px-4 py-3 tabular-nums text-on-surface">
                    {s.roomsCompleted}
                  </td>
                  <td className="text-body px-4 py-3 tabular-nums text-on-surface">
                    {s.avgMinutes} min
                  </td>
                  <td className="px-4 py-3">
                    <Bar value={s.onTimePct} tone="bg-info" />
                  </td>
                  <td className="px-4 py-3">
                    <Bar value={s.passRate} tone="bg-success" />
                  </td>
                  <td className="text-body px-4 py-3 tabular-nums text-on-surface-variant">
                    {workload(s.id)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
