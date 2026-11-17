import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import type { Room } from "@/lib/hotel-types";
import { useHkT, timeAgo } from "@/lib/housekeeper-i18n";
import { statusDot, statusLabelKey, statusTextTone } from "@/lib/housekeeper-room";

/** One room card — shared by Home, the Wing view and the Needs Attention
 * screen. Photo-led like a booking app listing: a full-height thumbnail on
 * the left, then a tidy two-line stack — room number + type with the time
 * on the same row, and a status pill with compact flag chips below. */
export function RoomRow({
  room,
  onClick,
}: {
  room: Room;
  onClick: () => void;
  divider?: boolean;
}) {
  const t = useHkT();
  return (
    <button
      onClick={onClick}
      className="flex w-full items-stretch gap-3 rounded-[22px] bg-surface-container-lowest p-2 pr-3 text-left shadow-soft transition-transform active:scale-[0.98]"
    >
      <span className="relative w-[84px] shrink-0 overflow-hidden rounded-2xl bg-surface-container">
        {room.photo ? (
          <img src={room.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <Icon name="bed" size={28} className="absolute inset-0 m-auto block size-7 text-on-surface-subtle" />
        )}
        <span className={cn("absolute left-2 top-2 size-2.5 rounded-full ring-2 ring-white", statusDot[room.status])} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="min-w-0 truncate text-lg font-semibold leading-tight tracking-tight text-on-surface">
            {room.number}
            <span className="ml-2 text-label-sm font-normal text-on-surface-subtle">{room.type}</span>
          </p>
          <span className="inline-flex shrink-0 items-center gap-1 text-label-sm text-on-surface-subtle">
            <Icon name="schedule" size={12} />
            {timeAgo(room.lastUpdated, t)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <span
            className={cn(
              "text-label-sm inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold",
              statusTextTone[room.status],
            )}
            style={{ backgroundColor: "color-mix(in oklab, currentColor 10%, transparent)" }}
          >
            <span className={cn("size-1.5 rounded-full", statusDot[room.status])} />
            {t.t(statusLabelKey[room.status])}
          </span>
          {room.view === "gulf" && (
            <span className="text-label-sm inline-flex items-center gap-1 rounded-full border border-outline-variant px-2 py-1 text-on-surface-variant">
              <Icon name="waves" size={12} />
              {t.t("gulfView")}
            </span>
          )}
          {room.flags.includes("dnd") && (
            <span className="text-label-sm inline-flex items-center gap-1 rounded-full border border-outline-variant px-2 py-1 text-on-surface-variant">
              <Icon name="do_not_disturb_on" size={12} />
              DND
            </span>
          )}
          {room.flags.includes("ooo") && (
            <span className="text-label-sm rounded-full bg-on-surface px-2 py-1 text-on-primary">
              Out of Order
            </span>
          )}
        </div>
      </div>
      <Icon name="chevron_right" size={18} className="shrink-0 self-center text-on-surface-subtle" />
    </button>
  );
}
