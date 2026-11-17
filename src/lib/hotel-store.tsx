import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type {
  GuestRequest,
  GuestRequestStatus,
  Issue,
  IssueStatus,
  Reservation,
  Role,
  Room,
  RoomFlag,
  RoomStatus,
  Staff,
  SupervisorProfile,
} from "./hotel-types";
import {
  PASS_SCORE,
  buildRooms,
  guestRequests as seedGuestRequests,
  issues as seedIssues,
  reservations as seedReservations,
  staff as seedStaff,
  supervisors as seedSupervisors,
} from "./mock-data";
import { detectAnomalies, scoreInspection } from "./checklist";

function nowClock() {
  return new Date().toTimeString().slice(0, 5);
}

/** Minutes between two "HH:MM" clock strings — good enough for this demo's
 * mock clock, same simplification Riwaq's own demo clock uses. */
function minutesBetween(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, eh! * 60 + em! - (sh! * 60 + sm!));
}

interface HotelState {
  role: Role;
  setRole: (r: Role) => void;
  rooms: Room[];
  staff: Staff[];
  issues: Issue[];
  reservations: Reservation[];
  guestRequests: GuestRequest[];
  /** Set by global search to ask the Property Board to open a room's panel on next render. */
  focusRoomId: string | null;
  setFocusRoomId: (id: string | null) => void;
  /** Set by global search to ask Check-In to pre-select a reservation on next render. */
  focusReservationId: string | null;
  setFocusReservationId: (id: string | null) => void;
  /** Which housekeeper is "signed in" on the mobile app preview (shared-device style, no password). */
  currentStaffId: string | null;
  setCurrentStaffId: (id: string | null) => void;
  /** Which supervisor is "signed in" on the Supervisor mobile app — same shared-device pattern. */
  currentSupervisorId: string | null;
  setCurrentSupervisorId: (id: string | null) => void;
  supervisors: SupervisorProfile[];
  roomById: (id: string | null) => Room | undefined;
  staffById: (id: string | null) => Staff | undefined;
  workload: (staffId: string) => number;
  assignRoom: (roomId: string, staffId: string | null) => void;
  setRoomStatus: (roomId: string, status: RoomStatus, note?: string) => void;
  toggleRush: (roomId: string) => void;
  toggleFlag: (roomId: string, flag: RoomFlag) => void;
  /** Replaces the room's single free-text note without changing its status. */
  setRoomNote: (roomId: string, note: string) => void;
  setIssueStatus: (issueId: string, status: IssueStatus) => void;
  reportIssue: (input: {
    roomId: string;
    category: string;
    description: string;
    reportedBy: string;
    severity?: Issue["severity"];
  }) => void;
  checkIn: (reservationId: string, roomId: string) => void;
  updateReservationTimes: (
    reservationId: string,
    times: { expectedCheckIn?: string; expectedCheckOut?: string },
  ) => void;
  /** ── Housekeeper cleaning checklist ── */
  startCleaning: (roomId: string, actor: string) => void;
  toggleChecklistItem: (roomId: string, itemId: string, actor: string) => void;
  skipChecklistItem: (roomId: string, itemId: string, reason: string) => void;
  attachChecklistPhoto: (roomId: string, itemId: string, actor: string) => void;
  markRoomClean: (roomId: string, actor: string) => void;
  /** ── Supervisor inspection ── */
  submitInspection: (
    roomId: string,
    actor: string,
    results: Record<string, boolean>,
    opts?: { note?: string; remote?: boolean },
  ) => boolean;
  remoteApprove: (roomId: string, actor: string) => boolean;
  /** A supervisor can't inspect a room they themselves cleaned. */
  canInspectRoom: (roomId: string, supervisorId: string) => boolean;
  /** ── Guest requests ── */
  setGuestRequestStatus: (
    requestId: string,
    status: GuestRequestStatus,
    assignedTo?: string | null,
  ) => void;
}

const HotelContext = createContext<HotelState | null>(null);

export function HotelProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("supervisor");
  const [rooms, setRooms] = useState<Room[]>(() => buildRooms());
  const [staff] = useState<Staff[]>(seedStaff);
  const [issues, setIssues] = useState<Issue[]>(seedIssues);
  const [reservations, setReservations] = useState<Reservation[]>(seedReservations);
  const [guestRequests, setGuestRequests] = useState<GuestRequest[]>(seedGuestRequests);
  const [focusRoomId, setFocusRoomId] = useState<string | null>(null);
  const [focusReservationId, setFocusReservationId] = useState<string | null>(null);
  const [currentStaffId, setCurrentStaffId] = useState<string | null>(null);
  const [currentSupervisorId, setCurrentSupervisorId] = useState<string | null>(null);

  const patchRoom = useCallback((roomId: string, patch: (r: Room) => Room) => {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? patch(r) : r)));
  }, []);

  const submitInspection = useCallback(
    (
      roomId: string,
      actor: string,
      results: Record<string, boolean>,
      opts: { note?: string; remote?: boolean } = {},
    ) => {
      const { score, criticalFail } = scoreInspection(results);
      const passed = score >= PASS_SCORE && !criticalFail;
      const failedPoints = Object.entries(results)
        .filter(([, ok]) => ok === false)
        .map(([id]) => id);
      patchRoom(roomId, (r) => {
        const inspection = {
          by: actor,
          at: nowClock(),
          score,
          result: (passed ? "passed" : "failed") as "passed" | "failed",
          failedPoints,
          note: opts.note,
          remote: opts.remote,
        };
        return passed
          ? {
              ...r,
              status: "inspected" as const,
              rush: false,
              inspections: [...r.inspections, inspection],
            }
          : {
              ...r,
              status: "dirty" as const,
              taskType: "reclean" as const,
              checklist: {},
              cleaningStartedAt: undefined,
              anomalies: [],
              notes: opts.note ? [`Rejected: ${opts.note}`, ...r.notes] : r.notes,
              inspections: [...r.inspections, inspection],
            };
      });
      return passed;
    },
    [patchRoom],
  );

  const remoteApprove = useCallback(
    (roomId: string, actor: string) => {
      const allPointIds = [
        "i1","i2","i3","i4","i5","i6","i7","i8","i9","i10","i11","i12","i13","i14","i15","i16","i17",
      ];
      const results = Object.fromEntries(allPointIds.map((id) => [id, true]));
      return submitInspection(roomId, actor, results, {
        remote: true,
        note: "Manager remote approval from housekeeper's photos",
      });
    },
    [submitInspection],
  );

  const value = useMemo<HotelState>(() => {
    return {
      role,
      setRole,
      rooms,
      staff,
      issues,
      reservations,
      guestRequests,
      focusRoomId,
      setFocusRoomId,
      focusReservationId,
      setFocusReservationId,
      currentStaffId,
      setCurrentStaffId,
      currentSupervisorId,
      setCurrentSupervisorId,
      supervisors: seedSupervisors,
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
      setRoomNote: (roomId, note) =>
        patchRoom(roomId, (r) => ({ ...r, notes: note ? [note] : [] })),
      setIssueStatus: (issueId, status) =>
        setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, status } : i))),
      reportIssue: ({ roomId, category, description, reportedBy, severity = "medium" }) =>
        setIssues((prev) => [
          {
            id: `i${prev.length + 1}-${roomId}`,
            roomId,
            title: category,
            description,
            category,
            reportedBy,
            reportedAt: new Date().toTimeString().slice(0, 5),
            severity,
            status: "open" as IssueStatus,
            photos: [],
          },
          ...prev,
        ]),
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

      startCleaning: (roomId, actor) =>
        patchRoom(roomId, (r) => ({
          ...r,
          status: "in_progress",
          attendantId: r.attendantId ?? actor,
          cleaningStartedAt: nowClock(),
        })),

      toggleChecklistItem: (roomId, itemId) =>
        patchRoom(roomId, (r) => {
          const checklist = { ...r.checklist };
          if (checklist[itemId]) delete checklist[itemId];
          else checklist[itemId] = { status: "done", at: nowClock() };
          return { ...r, checklist };
        }),

      skipChecklistItem: (roomId, itemId, reason) =>
        patchRoom(roomId, (r) => ({
          ...r,
          checklist: {
            ...r.checklist,
            [itemId]: { status: "skipped", at: nowClock(), skipReason: reason },
          },
        })),

      attachChecklistPhoto: (roomId, itemId) =>
        patchRoom(roomId, (r) => ({
          ...r,
          checklist: { ...r.checklist, [itemId]: { status: "done", at: nowClock(), photo: true } },
        })),

      markRoomClean: (roomId, actor) =>
        patchRoom(roomId, (r) => {
          const minutes = r.cleaningStartedAt ? minutesBetween(r.cleaningStartedAt, nowClock()) : undefined;
          const anomalies = detectAnomalies(r, minutes);
          return {
            ...r,
            status: "clean",
            rush: r.rush,
            anomalies,
            notes: [`Marked clean by ${actor}`, ...r.notes],
          };
        }),

      submitInspection,
      remoteApprove,

      canInspectRoom: (roomId, supervisorId) => {
        const room = rooms.find((r) => r.id === roomId);
        return !room || room.attendantId !== supervisorId;
      },

      setGuestRequestStatus: (requestId, status, assignedTo) =>
        setGuestRequests((prev) =>
          prev.map((g) =>
            g.id === requestId
              ? { ...g, status, assignedTo: assignedTo !== undefined ? assignedTo : g.assignedTo }
              : g,
          ),
        ),
    };
  }, [
    role,
    rooms,
    staff,
    issues,
    reservations,
    guestRequests,
    patchRoom,
    submitInspection,
    remoteApprove,
    focusRoomId,
    focusReservationId,
    currentStaffId,
    currentSupervisorId,
  ]);

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>;
}

export function useHotel() {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error("useHotel must be used inside HotelProvider");
  return ctx;
}
