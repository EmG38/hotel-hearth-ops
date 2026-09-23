import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type {
  Issue,
  IssueStatus,
  Reservation,
  Role,
  Room,
  RoomFlag,
  RoomStatus,
  Staff,
} from "./hotel-types";
import {
  buildRooms,
  issues as seedIssues,
  reservations as seedReservations,
  staff as seedStaff,
} from "./mock-data";

interface HotelState {
  role: Role;
  setRole: (r: Role) => void;
  rooms: Room[];
  staff: Staff[];
  issues: Issue[];
  reservations: Reservation[];
  roomById: (id: string | null) => Room | undefined;
  staffById: (id: string | null) => Staff | undefined;
  workload: (staffId: string) => number;
  assignRoom: (roomId: string, staffId: string | null) => void;
  setRoomStatus: (roomId: string, status: RoomStatus, note?: string) => void;
  toggleRush: (roomId: string) => void;
  toggleFlag: (roomId: string, flag: RoomFlag) => void;
  setIssueStatus: (issueId: string, status: IssueStatus) => void;
  checkIn: (reservationId: string, roomId: string) => void;
  updateReservationTimes: (
    reservationId: string,
    times: { expectedCheckIn?: string; expectedCheckOut?: string },
  ) => void;
}

const HotelContext = createContext<HotelState | null>(null);

export function HotelProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("supervisor");
  const [rooms, setRooms] = useState<Room[]>(() => buildRooms());
  const [staff] = useState<Staff[]>(seedStaff);
  const [issues, setIssues] = useState<Issue[]>(seedIssues);
  const [reservations, setReservations] = useState<Reservation[]>(seedReservations);

  const patchRoom = useCallback((roomId: string, patch: (r: Room) => Room) => {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? patch(r) : r)));
  }, []);

  const value = useMemo<HotelState>(() => {
    return {
      role,
      setRole,
      rooms,
      staff,
      issues,
      reservations,
      roomById: (id) => (id ? rooms.find((r) => r.id === id) : undefined),
      staffById: (id) => (id ? staff.find((s) => s.id === id) : undefined),
      workload: (staffId) =>
        rooms.filter(
          (r) => r.attendantId === staffId && (r.status === "dirty" || r.status === "in_progress"),
        ).length,
      assignRoom: (roomId, staffId) => patchRoom(roomId, (r) => ({ ...r, attendantId: staffId })),
      setRoomStatus: (roomId, status, note) =>
        patchRoom(roomId, (r) => ({
          ...r,
          status,
          notes: note ? [note, ...r.notes] : r.notes,
          rush: status === "inspected" ? false : r.rush,
        })),
      toggleRush: (roomId) => patchRoom(roomId, (r) => ({ ...r, rush: !r.rush })),
      toggleFlag: (roomId, flag) =>
        patchRoom(roomId, (r) => ({
          ...r,
          flags: r.flags.includes(flag) ? r.flags.filter((f) => f !== flag) : [...r.flags, flag],
        })),
      setIssueStatus: (issueId, status) =>
        setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, status } : i))),
      checkIn: (reservationId, roomId) => {
        setReservations((prev) =>
          prev.map((b) =>
            b.id === reservationId ? { ...b, status: "checked_in" as const, roomId } : b,
          ),
        );
      },
      updateReservationTimes: (reservationId, times) =>
        setReservations((prev) =>
          prev.map((b) => (b.id === reservationId ? { ...b, ...times } : b)),
        ),
    };
  }, [role, rooms, staff, issues, reservations, patchRoom]);

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>;
}

export function useHotel() {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error("useHotel must be used inside HotelProvider");
  return ctx;
}
