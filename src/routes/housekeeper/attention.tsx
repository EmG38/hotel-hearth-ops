import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useHotel } from "@/lib/hotel-store";
import { MobileFrame, MobileScreenHeader } from "@/components/MobileFrame";
import { RoomRow } from "@/components/housekeeper/RoomRow";
import { Icon } from "@/components/Icon";
import { useHkT } from "@/lib/housekeeper-i18n";

/** "See All" from the Home screen's Needs Attention carousel. */
export const Route = createFileRoute("/housekeeper/attention")({
  component: Attention,
});

function Attention() {
  const { rooms, currentStaffId } = useHotel();
  const navigate = useNavigate();
  const t = useHkT();

  const needsAttention = useMemo(
    () =>
      rooms
        .filter((r) => r.attendantId === currentStaffId && r.status === "dirty")
        .sort((a, b) => a.wing - b.wing || Number(a.number) - Number(b.number)),
    [rooms, currentStaffId],
  );

  return (
    <MobileFrame>
      <MobileScreenHeader
        title={t.t("needsAttention")}
        subtitle={`${needsAttention.length} ${t.t("roomsWord")}`}
        onBack={() => navigate({ to: "/housekeeper" })}
      />
      <div className="flex-1 overflow-y-auto p-4">
        {needsAttention.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-2 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-success/10 text-success">
              <Icon name="task_alt" size={28} filled />
            </span>
            <p className="text-body text-on-surface-subtle">{t.t("allClear")}</p>
          </div>
        ) : (
          <div className="overflow-hidden hk-card border border-outline-variant">
            {needsAttention.map((r, i) => (
              <RoomRow
                key={r.id}
                room={r}
                divider={i > 0}
                onClick={() =>
                  navigate({ to: "/housekeeper/room/$roomId", params: { roomId: r.id } })
                }
              />
            ))}
          </div>
        )}
      </div>
    </MobileFrame>
  );
}
