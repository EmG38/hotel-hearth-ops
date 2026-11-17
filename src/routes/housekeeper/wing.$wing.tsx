import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useHotel } from "@/lib/hotel-store";
import { MobileFrame, MobileScreenHeader } from "@/components/MobileFrame";
import { RoomRow } from "@/components/housekeeper/RoomRow";
import { sortByPriority } from "@/lib/housekeeper-room";
import { useHkT } from "@/lib/housekeeper-i18n";
import { wings } from "@/lib/mock-data";
import type { WingId } from "@/lib/hotel-types";

/** Opened by tapping a wing header on Home — the full room list for that
 * wing (Home only ever previews the top few, sorted by what needs doing). */
export const Route = createFileRoute("/housekeeper/wing/$wing")({
  component: WingView,
});

function WingView() {
  const { wing } = Route.useParams();
  const { rooms, currentStaffId } = useHotel();
  const navigate = useNavigate();
  const t = useHkT();
  const wingNum = Number(wing) as WingId;

  const wingRooms = useMemo(
    () =>
      sortByPriority(rooms.filter((r) => r.attendantId === currentStaffId && r.wing === wingNum)),
    [rooms, currentStaffId, wingNum],
  );

  return (
    <MobileFrame>
      <MobileScreenHeader
        title={wings[wingNum]?.name ?? `${t.t("wing")} ${wingNum}`}
        subtitle={`${wingRooms.length} ${t.t("roomsWord")}`}
        onBack={() => navigate({ to: "/housekeeper" })}
      />
      <div className="flex-1 overflow-y-auto p-4">
        {wingRooms.length === 0 ? (
          <p className="text-body mt-6 text-center text-on-surface-subtle">
            {t.t("noRoomsInWing")}
          </p>
        ) : (
          <div className="overflow-hidden hk-card border border-outline-variant">
            {wingRooms.map((r, i) => (
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
