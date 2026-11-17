import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/ui-kit";
import { cn } from "@/lib/utils";
import type { Room, Staff } from "@/lib/hotel-types";
import { statusMeta, flagMeta } from "@/lib/room-status";
import { wings } from "@/lib/mock-data";

/** Supervisor room card — photo-led like the Housekeeper card, but carries
 * the attendant and rush flag a supervisor needs at a glance. */
export function RoomRow({
  room,
  attendant,
  onClick,
  showWing = false,
}: {
  room: Room;
  attendant: Staff | undefined;
  onClick: () => void;
  divider?: boolean;
  showWing?: boolean;
}) {
  const meta = statusMeta[room.status];
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[22px] bg-surface-container-lowest p-2 pr-3 text-left shadow-soft transition-transform active:scale-[0.98]"
    >
      <span className="relative size-[72px] shrink-0 overflow-hidden rounded-2xl bg-surface-container">
        {room.photo && <img src={room.photo} alt="" className="h-full w-full object-cover" />}
        <span className={cn("absolute left-1.5 top-1.5 size-2.5 rounded-full ring-2 ring-white", meta.dot)} />
        {room.rush && (
          <span className="absolute bottom-1 right-1 grid size-5 place-items-center rounded-full bg-warning text-on-primary">
            <Icon name="star" size={12} filled />
          </span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="text-lg font-semibold leading-tight tracking-tight text-on-surface">
            {room.number}
          </p>
          <p className="truncate text-label-sm text-on-surface-subtle">
            {room.type}
            {showWing && ` · ${wings[room.wing].name}`}
          </p>
        </div>
        <p className="text-label-sm mt-1 flex items-center gap-1.5 text-on-surface-variant">
          {attendant ? (
            <>
              <Avatar staff={attendant} size={18} />
              <span className="truncate">{attendant.name}</span>
            </>
          ) : (
            <span className="text-on-surface-subtle">Unassigned</span>
          )}
          <Icon
            name={room.occupancy === "occupied" ? "person" : "person_off"}
            size={13}
            className="text-on-surface-subtle"
          />
        </p>
        {room.flags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {room.flags.map((f) => (
              <span
                key={f}
                className="text-label-sm inline-flex items-center gap-1 rounded-full border border-outline-variant px-2 py-0.5 text-on-surface-variant"
              >
                <Icon name={flagMeta[f].icon} size={11} />
                {flagMeta[f].label}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", meta.text)} style={{ backgroundColor: "color-mix(in oklab, currentColor 10%, transparent)" }}>{meta.short}</span>
        <Icon name="chevron_right" size={18} className="text-on-surface-subtle" />
      </div>
    </button>
  );
}
