export type RoomStatus = "dirty" | "in_progress" | "clean" | "inspected";
export type RoomFlag = "ooo" | "oos" | "dnd";
export type RoomType = "Standard" | "Deluxe" | "Suite";

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  flags: RoomFlag[];
  attendantId: string | null;
  rush: boolean;
  /** Estimated ready time, e.g. "14:20" */
  eta: string | null;
  lastUpdated: string;
  notes: string[];
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
