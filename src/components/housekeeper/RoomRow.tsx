import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import type { Room } from "@/lib/hotel-types";
import { useHkT, timeAgo } from "@/lib/housekeeper-i18n";
import { statusDot, statusLabelKey, statusTextTone } from "@/lib/housekeeper-room";

/** One room card — shared by Home, the Wing view and the Needs Attention
 * screen. Photo-led like a booking app listing: thumbnail, big room number
 * with its type beside it, then a chip line carrying the status pill and any
 * flags, so the wide status label never crowds the number. */
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
      className="flex w-full items-center gap-3 rounded-[22px] bg-surface-container-lowest p-2 pr-3 text-left shadow-soft transition-transform active:scale-[0.98]"
    >
      <span className="relative size-[72px] shrink-0 overflow-hidden rounded-2xl bg-surface-container">
        {room.photo ? (
          <img src={room.photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <Icon name="bed" size={28} className="m-auto mt-5 block text-on-surface-subtle" />
        )}
        <span className={cn("absolute left-1.5 top-1.5 size-2.5 rounded-full ring-2 ring-white", statusDot[room.status])} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="text-lg font-semibold leading-tight tracking-tight text-on-surface">
            {room.number}
          </p>
          <p className="truncate text-label-sm text-on-surface-subtle">{room.type}</p>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <span
            className={cn(
              "text-label-sm inline-flex shrink-0 items-center rounded-full px-2 py-0.5 font-semibold",
              statusTextTone[room.status],
            )}
            style={{ backgroundColor: "color-mix(in oklab, currentColor 10%, transparent)" }}
          >
            {t.t(statusLabelKey[room.status])}
          </span>
          {room.view === "gulf" && (
            <span className="text-label-sm inline-flex items-center gap-1 rounded-full border border-outline-variant px-2 py-0.5 text-on-surface-variant">
              <Icon name="waves" size={12} />
              {t.t("gulfView")}
            </span>
          )}
          {room.flags.includes("dnd") && (
            <span className="text-label-sm inline-flex items-center gap-1 rounded-full border border-outline-variant px-2 py-0.5 text-on-surface-variant">
              <Icon name="do_not_disturb_on" size={12} />
              DND
            </span>
          )}
          {room.flags.includes("ooo") && (
            <span className="text-label-sm rounded-full bg-on-surface px-2 py-0.5 text-on-primary">
              Out of Order
            </span>
          )}
          <span className="text-label-sm text-on-surface-subtle">{timeAgo(room.lastUpdated, t)}</span>
        </div>
      </div>
      <Icon name="chevron_right" size={18} className="shrink-0 text-on-surface-subtle" />
    </button>
  );
}
