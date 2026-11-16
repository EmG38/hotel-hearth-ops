import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useHotel } from "@/lib/hotel-store";
import { MobileFrame, MobileScreenHeader } from "@/components/MobileFrame";
import { RoomRow } from "@/components/housekeeper/RoomRow";
import { sortByPriority } from "@/lib/housekeeper-room";
import { useHkT } from "@/lib/housekeeper-i18n";

/** Opened by tapping a floor header on Home — the full room list for that
 * floor (Home only ever previews the top few, sorted by what needs doing). */
export const Route = createFileRoute("/housekeeper/floor/$floor")({
  component: FloorView,
});

function FloorView() {
  const { floor } = Route.useParams();
  const { rooms, currentStaffId } = useHotel();
  const navigate = useNavigate();
  const t = useHkT();
  const floorNum = Number(floor);

  const floorRooms = useMemo(
    () =>
      sortByPriority(rooms.filter((r) => r.attendantId === currentStaffId && r.floor === floorNum)),
    [rooms, currentStaffId, floorNum],
  );

  return (
    <MobileFrame>
      <MobileScreenHeader
        title={`${t.t("floor")} ${floorNum}`}
        subtitle={`${floorRooms.length} ${t.t("roomsWord")}`}
        onBack={() => navigate({ to: "/housekeeper" })}
      />
      <div className="flex-1 overflow-y-auto p-4">
        {floorRooms.length === 0 ? (
          <p className="text-body mt-6 text-center text-on-surface-subtle">
            {t.t("noRoomsOnFloor")}
          </p>
        ) : (
          <div className="overflow-hidden hk-card border border-outline-variant">
            {floorRooms.map((r, i) => (
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
