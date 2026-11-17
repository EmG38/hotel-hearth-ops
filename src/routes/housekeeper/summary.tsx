import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useHotel } from "@/lib/hotel-store";
import { Icon } from "@/components/Icon";
import { MobileFrame } from "@/components/MobileFrame";
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

function Row({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-body text-on-surface">{label}</span>
      <span className={`text-label font-semibold ${tone ?? "text-on-surface"}`}>{value}</span>
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

  return (
    <MobileFrame>
      <div className="flex flex-1 flex-col overflow-y-auto pb-28">
        <div className="flex items-center gap-3 px-4 pt-4">
          <button
            onClick={() => navigate({ to: "/housekeeper" })}
            className="grid size-10 place-items-center rounded-full bg-surface-container text-on-surface"
          >
            <Icon name="chevron_left" size={22} />
          </button>
          <div>
            <p className="text-title text-on-surface">Shift Summary</p>
            <p className="text-label-sm text-on-surface-subtle">Today · {me.shift} shift</p>
          </div>
        </div>

        {!online && (
          <div className="mt-3 flex items-center gap-2 bg-warning/15 px-4 py-2.5 text-label text-warning">
            <Icon name="cloud_off" size={18} filled />
            <span>{t.t("offlineBanner")}</span>
          </div>
        )}

        <div className="mx-4 mt-4 shrink-0 hk-card bg-gradient-to-br from-primary to-secondary p-5 text-center text-on-primary shadow-soft">
          <p className="text-label font-medium opacity-90">{t.t("yourPerformanceToday")}</p>
          <p className="mt-2 text-4xl font-bold">
            {completed}
            <span className="text-2xl opacity-80">/{total}</span>
          </p>
          <p className="text-label opacity-90">{t.t("roomsCompleted")}</p>
          <div className="mt-4 flex justify-center gap-3">
            <div className="hk-card bg-white/20 px-5 py-2.5 text-center">
              <p className="text-title-lg font-bold">{me.avgMinutes} min</p>
              <p className="text-label-sm opacity-90">{t.t("avgPerRoomStat")}</p>
            </div>
            <div className="hk-card bg-white/20 px-5 py-2.5 text-center">
              <p className="text-title-lg font-bold">{me.passRate}%</p>
              <p className="text-label-sm opacity-90">{t.t("passRate")}</p>
            </div>
          </div>
        </div>

        <div className="mx-4 mt-4 divide-y divide-outline-variant hk-card bg-surface-container-lowest px-4">
          <Row label={t.t("roomsAssigned")} value={total} />
          <Row label={t.t("completed")} value={completed} tone="text-success" />
          <Row label={t.t("awaitingInspection")} value={awaiting} tone="text-info" />
          <Row label={t.t("dndSkipped")} value={dndSkipped} tone="text-on-surface-subtle" />
          <Row label={t.t("issuesReported")} value={myIssues} tone="text-error" />
        </div>

        <div className="mx-4 mt-4 hk-card bg-surface-container-lowest px-4">
          <p className="text-label-sm pt-3 uppercase text-on-surface-subtle">{t.t("yourTimes")}</p>
          <div className="divide-y divide-outline-variant">
            <Row label={t.t("shiftStart")} value={times.start} />
            <Row label={t.t("shiftEnd")} value={times.end} />
            <Row label={t.t("fastestRoom")} value={`${fastest} min`} />
            <Row label={t.t("longestRoom")} value={`${longest} min`} />
            <Row label={t.t("averageTime")} value={`${me.avgMinutes} min`} />
          </div>
        </div>

        <p className="text-label-sm mx-4 mt-4 flex items-start gap-2 hk-card bg-surface-container px-3 py-2.5 text-on-surface-variant">
          <Icon name="info" size={16} className="mt-0.5 shrink-0" />
          {t.t("personalStatsNote")} {me.name.split(" ")[0]}.
        </p>

        <div className="mt-auto p-4">
          <button
            onClick={() => {
              setCurrentStaffId(null);
              navigate({ to: "/housekeeper" });
            }}
            className="w-full hk-card bg-primary py-3.5 text-label font-semibold text-on-primary shadow-soft active:scale-[0.98]"
          >
            {t.t("doneSignOff")}
          </button>
        </div>
      </div>
    <HousekeeperNav active="summary" />
    </MobileFrame>
  );
}
