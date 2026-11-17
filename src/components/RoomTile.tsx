import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import type { Room } from "@/lib/hotel-types";
import { flagMeta, isBlocked, statusMeta } from "@/lib/room-status";
import { useHotel } from "@/lib/hotel-store";
import { useStatusText, useTypeText } from "@/lib/i18n";

export function RoomTile({
  room,
  onClick,
  selected,
}: {
  room: Room;
  onClick?: () => void;
  selected?: boolean;
}) {
  const { staffById } = useHotel();
  const meta = statusMeta[room.status];
  const statusText = useStatusText();
  const typeText = useTypeText();
  const attendant = staffById(room.attendantId);
  const blocked = isBlocked(room);

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition-all duration-150",
        "hover:-translate-y-0.5 hover:shadow-soft active:scale-[0.97] active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        blocked
          ? room.flags.includes("ooo")
            ? "border-ooo/40 bg-ooo/10 hover:bg-ooo/15"
            : "border-oos/50 bg-oos/10 hover:bg-oos/20"
          : meta.tile,
        selected && "ring-2 ring-primary ring-offset-1",
      )}
    >
      <div className="flex w-full items-center justify-between gap-1">
        <span className="text-title text-on-surface">{room.number}</span>
        <span className="flex items-center gap-0.5">
          {room.flags.includes("dnd") && (
            <Icon name="bedtime" size={14} filled className="text-on-surface-subtle" />
          )}
          {room.rush && <Icon name="star" size={15} filled className="text-warning" />}
        </span>
      </div>

      <span className="text-label-sm uppercase text-on-surface-subtle">{typeText[room.type]}</span>

      <span className={cn("text-label-sm flex items-center gap-1", meta.text)}>
        <Icon name={meta.icon} size={13} filled />
        {statusText[room.status].short}
      </span>

      {blocked && (
        <span className="text-label-sm flex items-center gap-1 text-on-surface-variant">
          <Icon name={flagMeta[room.flags.includes("ooo") ? "ooo" : "oos"].icon} size={13} filled />
          {room.flags.includes("ooo") ? "OOO" : "OOS"}
        </span>
      )}

      {attendant && (
        <span className="text-label-sm truncate text-on-surface-subtle">{attendant.initials}</span>
      )}
    </button>
  );
}
