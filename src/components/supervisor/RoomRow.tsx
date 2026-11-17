import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/ui-kit";
import { cn } from "@/lib/utils";
import type { Room, RoomStatus, Staff } from "@/lib/hotel-types";
import { statusMeta, flagMeta } from "@/lib/room-status";
import { wings } from "@/lib/mock-data";

const badgeTone: Record<RoomStatus, string> = {
  dirty: "bg-error/10 text-error",
  in_progress: "bg-warning/10 text-warning",
  clean: "bg-info/10 text-info",
  inspected: "bg-success/10 text-success",
};

/** A room row for the Supervisor app — denser than the Housekeeper RoomRow:
 * a supervisor needs to see who it's assigned to and whether it's rushed,
 * not just the status. */
export function RoomRow({
  room,
  attendant,
  onClick,
  divider,
  showWing = false,
}: {
  room: Room;
  attendant: Staff | undefined;
  onClick: () => void;
  divider?: boolean;
  /** Board is now flat across wings, so each row needs its own wing tag. */
  showWing?: boolean;
}) {
  const meta = statusMeta[room.status];
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 bg-surface-container-lowest px-3 py-3 text-left transition-colors active:bg-surface-container",
        divider && "border-t border-outline-variant",
      )}
    >
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-xl text-title font-semibold",
          badgeTone[room.status],
        )}
      >
        {room.number}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-label text-on-surface">{room.type}</p>
          {room.rush && <Icon name="star" size={14} filled className="text-warning" />}
          {showWing && (
            <span className="text-label-sm rounded-full bg-surface-container px-1.5 py-0.5 text-on-surface-variant">
              {wings[room.wing].name}
            </span>
          )}
          <span
            className={cn(
              "text-label-sm inline-flex items-center gap-0.5",
              room.occupancy === "occupied" ? "text-on-surface-variant" : "text-on-surface-subtle",
            )}
            title={room.occupancy === "occupied" ? "Guest in room" : "Vacant"}
          >
            <Icon name={room.occupancy === "occupied" ? "person" : "person_off"} size={12} />
          </span>
          {room.flags.map((f) => (
            <span
              key={f}
              className="text-label-sm inline-flex items-center gap-1 rounded-full bg-surface-container px-1.5 py-0.5 text-on-surface-variant"
            >
              <Icon name={flagMeta[f].icon} size={12} />
              {flagMeta[f].label}
            </span>
          ))}
        </div>
        <p className="text-label-sm flex items-center gap-1 text-on-surface-subtle">
          {attendant ? (
            <>
              <Avatar staff={attendant} size={16} />
              {attendant.name}
            </>
          ) : (
            "Unassigned"
          )}
        </p>
      </div>
      <span className={cn("text-label-sm inline-flex items-center gap-1.5 shrink-0", meta.text)}>
        <span className={cn("size-1.5 rounded-full", meta.dot)} />
        {meta.short}
      </span>
    </button>
  );
}
