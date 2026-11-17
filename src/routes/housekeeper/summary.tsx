import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useHotel } from "@/lib/hotel-store";
import { Icon } from "@/components/Icon";
import { MobileFrame, MobileScreenHeader } from "@/components/MobileFrame";
import { HousekeeperNav } from "@/components/housekeeper/HousekeeperNav";
import { useHkT } from "@/lib/housekeeper-i18n";
import { useOnline } from "@/lib/use-online";

export const Route = createFileRoute("/housekeeper/summary")({
  component: ShiftSummary,
});

const shiftTimes = {
  Morning: { start: "07:00 AM", end: "03:00 PM" },
  Evening: { start: "03:00 PM", end: "11:00 PM" },
} as const;

function StatCard({ icon, label, value, tone }: { icon: string; label: string; value: number; tone: string }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-2 rounded-[22px] bg-surface-container-lowest p-3 shadow-soft">
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-xl ${tone}`}
        style={{ backgroundColor: "color-mix(in oklab, currentColor 12%, transparent)" }}
      >
        <Icon name={icon} size={20} filled />
      </span>
      <div className="min-w-0 w-full">
        <p className="text-xl font-semibold leading-none tracking-tight text-on-surface">{value}</p>
        <p className="text-label-sm mt-1 leading-tight text-on-surface-subtle">{label}</p>
      </div>
    </div>
  );
}

function TimeRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Icon name={icon} size={18} className="text-on-surface-subtle" />
      <span className="text-body flex-1 text-on-surface-variant">{label}</span>
      <span className="text-label font-semibold text-on-surface">{value}</span>
    </div>
  );
}

function ShiftSummary() {
  const { rooms, issues, currentStaffId, setCurrentStaffId, staffById } = useHotel();
  const navigate = useNavigate();
  const t = useHkT();
  const online = useOnline();
  const me = staffById(currentStaffId);

  const myRooms = useMemo(
    () => rooms.filter((r) => r.attendantId === currentStaffId),
    [rooms, currentStaffId],
  );
  const total = myRooms.length;
  const completed = myRooms.filter((r) => r.status === "inspected").length;
  const awaiting = myRooms.filter((r) => r.status === "clean").length;
  const dndSkipped = myRooms.filter((r) => r.flags.includes("dnd")).length;
  const myIssues = issues.filter((i) => i.reportedBy === currentStaffId).length;

  useEffect(() => {
    if (!me) navigate({ to: "/housekeeper" });
  }, [me, navigate]);

  if (!me) return null;

  const times = shiftTimes[me.shift];
  const fastest = Math.max(8, me.avgMinutes - 10);
  const longest = me.avgMinutes + 14;

  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <MobileFrame>
      <div className="flex flex-1 flex-col pb-32">
        <MobileScreenHeader
          title="Shift Summary"
          subtitle={`Today · ${me.shift} shift`}
          onBack={() => navigate({ to: "/housekeeper" })}
        />

        {!online && (
          <div className="mx-4 mb-2 flex items-center gap-2 rounded-2xl bg-warning/15 px-4 py-2.5 text-label text-warning">
            <Icon name="cloud_off" size={18} filled />
            <span>{t.t("offlineBanner")}</span>
          </div>
        )}

        <div className="mx-4 mt-2 shrink-0 rounded-[28px] bg-secondary p-5 text-on-primary shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-label-sm uppercase tracking-wide opacity-75">{t.t("yourPerformanceToday")}</p>
              <p className="mt-2 text-5xl font-semibold leading-none tracking-tight">
                {completed}
                <span className="text-2xl font-normal opacity-60"> / {total}</span>
              </p>
              <p className="text-label mt-1 opacity-80">{t.t("roomsCompleted")}</p>
            </div>
            <span className="rounded-full bg-primary px-3 py-1 text-label font-semibold">{pct}%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/10 px-3 py-2.5">
              <p className="text-lg font-semibold">{me.avgMinutes} min</p>
              <p className="text-label-sm opacity-75">{t.t("avgPerRoomStat")}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2.5">
              <p className="text-lg font-semibold">{me.passRate}%</p>
              <p className="text-label-sm opacity-75">{t.t("passRate")}</p>
            </div>
          </div>
        </div>

        <p className="mx-5 mt-6 text-lg font-semibold tracking-tight text-on-surface">Today's rooms</p>
        <div className="mx-4 mt-3 grid grid-cols-2 gap-2.5">
          <StatCard icon="bed" label={t.t("roomsAssigned")} value={total} tone="text-tertiary" />
          <StatCard icon="verified" label={t.t("completed")} value={completed} tone="text-success" />
          <StatCard icon="hourglass_top" label={t.t("awaitingInspection")} value={awaiting} tone="text-info" />
          <StatCard icon="do_not_disturb_on" label={t.t("dndSkipped")} value={dndSkipped} tone="text-on-surface-variant" />
          <div className="col-span-2">
            <StatCard icon="report" label={t.t("issuesReported")} value={myIssues} tone="text-error" />
          </div>
        </div>

        <p className="mx-5 mt-6 text-lg font-semibold tracking-tight text-on-surface">Your times</p>
        <div className="mx-4 mt-3 divide-y divide-outline-variant/60 rounded-[22px] bg-surface-container-lowest px-4 shadow-soft">
          <TimeRow icon="login" label={t.t("shiftStart")} value={times.start} />
          <TimeRow icon="logout" label={t.t("shiftEnd")} value={times.end} />
          <TimeRow icon="bolt" label={t.t("fastestRoom")} value={`${fastest} min`} />
          <TimeRow icon="timer" label={t.t("longestRoom")} value={`${longest} min`} />
          <TimeRow icon="avg_time" label={t.t("averageTime")} value={`${me.avgMinutes} min`} />
        </div>

        <p className="text-label-sm mx-4 mt-4 flex items-start gap-2 rounded-2xl bg-tertiary-container px-3 py-2.5 text-on-surface-variant">
          <Icon name="lock" size={16} className="mt-0.5 shrink-0 text-tertiary" />
          {t.t("personalStatsNote")} {me.name.split(" ")[0]}.
        </p>

        <div className="mx-4 mt-5">
          <button
            onClick={() => {
              setCurrentStaffId(null);
              navigate({ to: "/housekeeper" });
            }}
            className="w-full rounded-full bg-primary py-3.5 text-label font-semibold text-on-primary shadow-soft active:scale-[0.98]"
          >
            {t.t("doneSignOff")}
          </button>
        </div>
      </div>
      <HousekeeperNav active="summary" />
    </MobileFrame>
  );
}
