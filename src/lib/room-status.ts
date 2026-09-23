import type { RoomFlag, RoomStatus, Room } from "./hotel-types";

interface StatusMeta {
  label: string;
  short: string;
  icon: string;
  dot: string;
  chip: string;
  tile: string;
  text: string;
}

export const STATUS_ORDER: RoomStatus[] = ["dirty", "in_progress", "clean", "inspected"];

export const statusMeta: Record<RoomStatus, StatusMeta> = {
  dirty: {
    label: "Dirty",
    short: "Dirty",
    icon: "cleaning_services",
    dot: "bg-error",
    chip: "bg-error/10 text-error border-error/20",
    tile: "border-error/30 bg-error/5 hover:bg-error/10",
    text: "text-error",
  },
  in_progress: {
    label: "In Progress",
    short: "In Prog.",
    icon: "autorenew",
    dot: "bg-warning",
    chip: "bg-warning/10 text-warning border-warning/20",
    tile: "border-warning/30 bg-warning/5 hover:bg-warning/10",
    text: "text-warning",
  },
  clean: {
    label: "Clean, awaiting inspection",
    short: "Awaiting insp.",
    icon: "search_check",
    dot: "bg-info",
    chip: "bg-info/10 text-info border-info/20",
    tile: "border-info/30 bg-info/5 hover:bg-info/10",
    text: "text-info",
  },
  inspected: {
    label: "Inspected / Ready",
    short: "Ready",
    icon: "verified",
    dot: "bg-success",
    chip: "bg-success/10 text-success border-success/20",
    tile: "border-success/30 bg-success/5 hover:bg-success/10",
    text: "text-success",
  },
};

export const flagMeta: Record<RoomFlag, { label: string; icon: string; chip: string; dot: string }> =
  {
    ooo: {
      label: "Out of Order",
      icon: "build",
      chip: "bg-ooo text-on-primary border-ooo",
      dot: "bg-ooo",
    },
    oos: {
      label: "Out of Service",
      icon: "do_not_disturb_on",
      chip: "bg-oos/20 text-on-surface-variant border-oos/40",
      dot: "bg-oos",
    },
    dnd: {
      label: "Do Not Disturb",
      icon: "bedtime",
      chip: "bg-surface-container-high text-on-surface-variant border-outline-variant",
      dot: "bg-on-surface-subtle",
    },
  };

export function isSellable(room: Room) {
  return room.status === "inspected" && !room.flags.includes("ooo") && !room.flags.includes("oos");
}

export function isBlocked(room: Room) {
  return room.flags.includes("ooo") || room.flags.includes("oos");
}
