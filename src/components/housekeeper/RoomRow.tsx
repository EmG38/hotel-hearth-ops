import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import type { Room } from "@/lib/hotel-types";
import { useHkT, timeAgo } from "@/lib/housekeeper-i18n";
import { badgeTone, statusDot, statusLabelKey, statusTextTone } from "@/lib/housekeeper-room";

/** One room list row — shared by Home, the Wing view and the Needs
 * Attention "See All" screen so the three stay visually identical. */
export function RoomRow({
  room,
  onClick,
  divider,
}: {
  room: Room;
  onClick: () => void;
  divider?: boolean;
}) {
  const t = useHkT();
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
          {room.view === "gulf" && (
            <span className="text-label-sm inline-flex items-center gap-1 rounded-full bg-info/10 px-1.5 py-0.5 text-info">
              <Icon name="waves" size={12} filled />
              {t.t("gulfView")}
            </span>
          )}
          {room.flags.includes("dnd") && (
            <span className="text-label-sm inline-flex items-center gap-1 rounded-full bg-surface-container px-1.5 py-0.5 text-on-surface-variant">
              <Icon name="do_not_disturb_on" size={12} />
              DND
            </span>
          )}
          {room.flags.includes("ooo") && (
            <span className="text-label-sm rounded-full bg-on-surface px-1.5 py-0.5 text-on-primary">
              Out of Order
            </span>
          )}
        </div>
        <p className="text-label-sm text-on-surface-subtle">{timeAgo(room.lastUpdated, t)}</p>
      </div>
      <span
        className={cn(
          "text-label-sm inline-flex items-center gap-1.5 shrink-0",
          statusTextTone[room.status],
        )}
      >
        <span className={cn("size-1.5 rounded-full", statusDot[room.status])} />
        {t.t(statusLabelKey[room.status])}
      </span>
    </button>
  );
}
