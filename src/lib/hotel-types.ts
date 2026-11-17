export type RoomStatus = "dirty" | "in_progress" | "clean" | "inspected";
export type RoomFlag = "ooo" | "oos" | "dnd";
export type RoomType = "Standard" | "Deluxe" | "Suite";

/** Which task template the housekeeper's in-room checklist should follow. */
export type TaskType = "departure" | "stayover" | "reclean";

/** The resort runs along the Gulf shoreline as wings, not stacked floors —
 * each wing has its own position relative to the water, which is what
 * determines which of its rooms can be sold with a Gulf view. */
export type WingId = 1 | 2 | 3 | 4 | 5;
export type WingProximity = "beachfront" | "midground" | "garden";

export interface Wing {
  id: WingId;
  name: string;
  proximity: WingProximity;
}

export type RoomView = "gulf" | "garden" | "courtyard";

/** Zones a housekeeper works through, in order, while cleaning a room. */
export type CleaningZone =
  | "entry_waste"
  | "linen"
  | "dusting"
  | "bathroom"
  | "restock"
  | "floor"
  | "final_check";

export interface ChecklistItem {
  id: string;
  zone: CleaningZone;
  label: string;
  /** Must be done (or explicitly skipped with a reason) before the room can be marked clean. */
  mandatory: boolean;
  /** Can't be marked done without attaching a photo. */
  photo: boolean;
}

export interface ChecklistItemResult {
  status: "done" | "skipped";
  at: string;
  photo?: boolean;
  skipReason?: string;
}

/** Quality signals computed when a room is marked clean, surfaced to the
 * supervisor only — never shown to the housekeeper. */
export type CleaningAnomaly = "too_fast" | "bulk_tick" | "no_start";

/** Zones the supervisor inspects — a separate, weighted rubric from the
 * housekeeper's own cleaning checklist above. */
export type InspectionZone = "Bedroom" | "Bathroom" | "Amenities" | "Safety" | "View & Balcony";

export interface InspectionPoint {
  id: string;
  zone: InspectionZone;
  label: string;
  weight: 1 | 2 | 3;
  /** A critical point failing auto-fails the inspection regardless of score. */
  critical: boolean;
}

export interface Inspection {
  by: string;
  at: string;
  score: number;
  result: "passed" | "failed";
  failedPoints: string[];
  note: string | undefined;
  /** Manager approved remotely from the housekeeper's own photos, without walking the room. */
  remote: boolean | undefined;
}

export interface Room {
  id: string;
  number: string;
  wing: WingId;
  /** Each wing is a low-rise block of 2 levels, not a tower of floors. */
  level: 1 | 2;
  view: RoomView;
  type: RoomType;
  status: RoomStatus;
  taskType: TaskType;
  flags: RoomFlag[];
  attendantId: string | null;
  rush: boolean;
  /** Estimated ready time, e.g. "14:20" */
  eta: string | null;
  lastUpdated: string;
  notes: string[];
  /** Real room photo, keyed by room type when available; housekeeper screens
   * fall back to an icon placeholder when this is unset. */
  photo?: string;
  /** This room's in-progress cleaning checklist state, keyed by ChecklistItem id. */
  checklist: Record<string, ChecklistItemResult>;
  cleaningStartedAt: string | undefined;
  anomalies: CleaningAnomaly[];
  inspections: Inspection[];
}

export interface Staff {
  id: string;
  name: string;
  initials: string;
  shift: "Morning" | "Evening";
  roomsCompleted: number;
  avgMinutes: number;
  onTimePct: number;
  passRate: number;
}

export type IssueStatus = "open" | "maintenance" | "resolved";

export interface Issue {
  id: string;
  roomId: string;
  title: string;
  description: string;
  category: string;
  reportedBy: string;
  reportedAt: string;
  severity: "low" | "medium" | "high";
  status: IssueStatus;
  photos: string[];
}

export type ReservationStatus = "expected" | "checked_in" | "departed";

export interface Reservation {
  id: string;
  code: string;
  guestName: string;
  roomType: RoomType;
  nights: number;
  guests: number;
  arrival: string;
  expectedCheckIn: string;
  expectedCheckOut: string;
  status: ReservationStatus;
  roomId: string | null;
  vip: boolean;
}

export type Role = "supervisor" | "reception" | "housekeeper";

/** Minimal identity for the Supervisor mobile app's job→face→PIN login —
 * deliberately lighter than Staff, which carries housekeeper performance
 * metrics that don't apply to a supervisor. */
export interface SupervisorProfile {
  id: string;
  name: string;
  initials: string;
  shift: "Morning" | "Evening";
}

export type GuestRequestType =
  | "towels"
  | "amenities"
  | "late_checkout"
  | "housekeeping"
  | "other";

export type GuestRequestStatus = "pending" | "acknowledged" | "completed";

/** A lightweight guest-services request routed to housekeeping — e.g. extra
 * towels or a late checkout — distinct from an Issue (which is a maintenance
 * defect, not something the guest asked for). */
export interface GuestRequest {
  id: string;
  roomId: string;
  type: GuestRequestType;
  note: string;
  requestedAt: string;
  status: GuestRequestStatus;
  assignedTo: string | null;
}
