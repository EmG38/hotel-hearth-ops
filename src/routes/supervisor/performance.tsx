import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useHotel } from "@/lib/hotel-store";
import { wings } from "@/lib/mock-data";
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
  const { rooms, staff, workload } = useHotel();
  const [shift, setShift] = useState<"Morning" | "Evening">("Morning");
  const [wing, setWing] = useState<string>("all");
  const shiftStaff = staff.filter((s) => s.shift === shift);

  const scopedRooms = wing === "all" ? rooms : rooms.filter((r) => r.wing === Number(wing));

  const liveStats = useMemo(() => {
    const perStaff = new Map<
      string,
      { completedToday: number; passed: number; inspected: number; flagged: number }
    >();
    staff.forEach((s) =>
      perStaff.set(s.id, { completedToday: 0, passed: 0, inspected: 0, flagged: 0 }),
    );
    scopedRooms.forEach((r) => {
      if (!r.attendantId) return;
      const entry = perStaff.get(r.attendantId);
      if (!entry) return;
      if (r.status === "clean" || r.status === "inspected") entry.completedToday += 1;
      if (r.anomalies.length > 0) entry.flagged += 1;
      r.inspections.forEach((insp) => {
        entry.inspected += 1;
        if (insp.result === "passed") entry.passed += 1;
      });
    });
    return perStaff;
  }, [scopedRooms, staff]);

  const totals = useMemo(() => {
    let completed = 0;
    let passed = 0;
    let inspected = 0;
    shiftStaff.forEach((s) => {
      const st = liveStats.get(s.id);
      if (!st) return;
      completed += st.completedToday;
      passed += st.passed;
      inspected += st.inspected;
    });
    return {
      completed,
      passRate: inspected ? Math.round((passed / inspected) * 100) : 0,
    };
  }, [shiftStaff, liveStats]);

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

      <div className="px-4 pt-3">
        <select
          value={wing}
          onChange={(e) => setWing(e.target.value)}
          className="text-label-sm rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1.5 font-medium text-on-surface-variant"
        >
          <option value="all">All wings</option>
          {([1, 2, 3, 4, 5] as const).map((w) => (
            <option key={w} value={w}>
              {wings[w].name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="hk-card bg-surface-container-lowest shadow-soft p-3">
            <p className="text-label-sm text-on-surface-subtle">Rooms completed today</p>
            <p className="text-title-lg font-bold text-on-surface">{totals.completed}</p>
          </div>
          <div className="hk-card bg-surface-container-lowest shadow-soft p-3">
            <p className="text-label-sm text-on-surface-subtle">Pass rate (live)</p>
            <p className="text-title-lg font-bold text-on-surface">{totals.passRate}%</p>
          </div>
        </div>

        <p className="text-label-sm mt-5 uppercase text-on-surface-subtle">
          Per-attendant · {shift} shift
          {wing !== "all" ? ` · ${wings[Number(wing) as 1 | 2 | 3 | 4 | 5].name}` : ""}
        </p>
        <div className="mt-1.5 space-y-2">
          {shiftStaff.map((s) => {
            const st = liveStats.get(s.id)!;
            const passRate = st.inspected ? Math.round((st.passed / st.inspected) * 100) : 0;
            return (
              <div
                key={s.id}
                className="hk-card bg-surface-container-lowest shadow-soft p-3.5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-label font-semibold text-on-primary">
                    {s.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-body block font-medium text-on-surface">{s.name}</span>
                    <span className="text-label-sm block text-on-surface-subtle">
                      {st.completedToday} completed today · {workload(s.id)} active
                      {st.flagged > 0 && (
                        <span className="text-warning"> · {st.flagged} flagged</span>
                      )}
                    </span>
                  </span>
                </div>
                <div className="mt-2.5 space-y-1.5">
                  {st.inspected > 0 ? (
                    <Bar value={passRate} tone="bg-tertiary" />
                  ) : (
                    <p className="text-label-sm text-on-surface-subtle">No inspections yet</p>
                  )}
                  <p className="text-label-sm -mt-0.5 text-on-surface-subtle">
                    Pass rate (live) · {st.inspected} inspected
                  </p>
                  <Bar value={s.onTimePct} tone="bg-primary" />
                  <p className="text-label-sm -mt-0.5 text-on-surface-subtle">
                    On-time · historical baseline, avg {s.avgMinutes} min/room
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-label-sm mt-4 flex items-start gap-2 hk-card bg-surface-container px-3 py-2.5 text-on-surface-variant">
          <Icon name="lock" size={16} className="mt-0.5 shrink-0" />
          Reference only — never shown to housekeepers, never a ranked leaderboard. Completed/pass
          rate/flags are live from today's rooms; on-time and avg time are a historical baseline (no
          per-room duration log yet).
        </p>
      </div>
      <SupervisorNav />
    </MobileFrame>
  );
}
