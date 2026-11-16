import type { Room } from "@/lib/hotel-types";
import type { HkDictKey } from "@/lib/housekeeper-i18n";

export const badgeTone: Record<Room["status"], string> = {
  dirty: "bg-error/10 text-error",
  in_progress: "bg-warning/10 text-warning",
  clean: "bg-info/10 text-info",
  inspected: "bg-success/10 text-success",
};

export const statusDot: Record<Room["status"], string> = {
  dirty: "bg-error",
  in_progress: "bg-warning",
  clean: "bg-info",
  inspected: "bg-success",
};

export const statusTextTone: Record<Room["status"], string> = {
  dirty: "text-error",
  in_progress: "text-warning",
  clean: "text-info",
  inspected: "text-success",
};

export const statusLabelKey: Record<Room["status"], HkDictKey> = {
  dirty: "statusDirty",
  in_progress: "statusInProgress",
  clean: "statusAwaiting",
  inspected: "statusInspected",
};

/** Lower sorts first — most urgent (needs a housekeeper's attention) first,
 * ready-to-sell rooms last. Used so a floor with many rooms shows what
 * actually needs doing instead of truncating arbitrarily by room number. */
export const statusPriority: Record<Room["status"], number> = {
  dirty: 0,
  in_progress: 1,
  clean: 2,
  inspected: 3,
};

export function sortByPriority(rooms: Room[]): Room[] {
  return [...rooms].sort(
    (a, b) =>
      statusPriority[a.status] - statusPriority[b.status] || Number(a.number) - Number(b.number),
  );
}
