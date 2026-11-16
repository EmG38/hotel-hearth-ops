import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useHotel } from "@/lib/hotel-store";
import { StatTile } from "@/components/ui-kit";
import { Icon } from "@/components/Icon";
import { MobileFrame, MobileScreenHeader } from "@/components/MobileFrame";
import { useHkT } from "@/lib/housekeeper-i18n";

export const Route = createFileRoute("/housekeeper/summary")({
  component: ShiftSummary,
});

function ShiftSummary() {
  const { rooms, currentStaffId, staffById } = useHotel();
  const navigate = useNavigate();
  const t = useHkT();
  const me = staffById(currentStaffId);

  const myRooms = useMemo(
    () => rooms.filter((r) => r.attendantId === currentStaffId),
    [rooms, currentStaffId],
  );
  const done = myRooms.filter((r) => r.status === "clean" || r.status === "inspected").length;

  useEffect(() => {
    if (!me) navigate({ to: "/housekeeper" });
  }, [me, navigate]);

  if (!me) return null;

  return (
    <MobileFrame>
      <MobileScreenHeader
        title={t.t("shiftSummary")}
        onBack={() => navigate({ to: "/housekeeper" })}
      />
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="flex flex-col items-center gap-2 py-4">
          <span className="grid size-16 place-items-center rounded-full bg-success/10 text-success">
            <Icon name="verified" size={32} filled />
          </span>
          <p className="text-title text-on-surface">{me.name}</p>
          <p className="text-label-sm text-on-surface-subtle">{me.shift} shift</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <StatTile
            label={t.t("roomsCompleted")}
            value={`${done}/${myRooms.length}`}
            icon="checklist"
            tone="success"
          />
          <StatTile
            label={t.t("avgTime")}
            value={me.avgMinutes}
            unit="min"
            icon="schedule"
            tone="info"
          />
          <StatTile
            label={t.t("onTime")}
            value={me.onTimePct}
            unit="%"
            icon="bolt"
            tone="warning"
          />
        </div>

        <p className="mt-5 flex items-start gap-2 rounded-xl bg-surface-container p-3 text-label-sm text-on-surface-variant">
          <Icon name="lock" size={16} className="mt-0.5 shrink-0" />
          {t.t("personalStatsNote")}
        </p>
      </div>
    </MobileFrame>
  );
}
