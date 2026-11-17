import type {
  ChecklistItem,
  CleaningZone,
  GuestRequest,
  Inspection,
  InspectionPoint,
  Issue,
  Reservation,
  Room,
  RoomStatus,
  RoomType,
  RoomView,
  Staff,
  SupervisorProfile,
  TaskType,
  Wing,
  WingId,
  WingProximity,
} from "./hotel-types";
import roomStandardPhoto from "@/assets/photos/room-standard.jpg";
import roomDeluxePhoto from "@/assets/photos/room-deluxe.jpg";
import roomSuitePhoto from "@/assets/photos/room-suite.jpg";

export const roomPhotoByType: Record<RoomType, string> = {
  Standard: roomStandardPhoto,
  Deluxe: roomDeluxePhoto,
  Suite: roomSuitePhoto,
};

/** Deterministic pseudo-random so SSR and client agree. */
function seeded(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Room attendants (housekeepers). Names reflect the real nationality mix on a Gulf
 * hotel housekeeping floor — majority South/Southeast Asian — rather than the
 * property's local Arab staff, who in practice concentrate at supervisor/front-desk
 * level. See "Gulf Workforce Culture Research.md" in the project root.
 */
export const staff: Staff[] = [
  {
    id: "s1",
    name: "Ligaya Santos",
    initials: "LS",
    shift: "Morning",
    roomsCompleted: 14,
    avgMinutes: 26,
    onTimePct: 93,
    passRate: 96,
  },
  {
    id: "s2",
    name: "Priya Sharma",
    initials: "PS",
    shift: "Morning",
    roomsCompleted: 12,
    avgMinutes: 31,
    onTimePct: 84,
    passRate: 88,
  },
  {
    id: "s3",
    name: "Sunita Gurung",
    initials: "SG",
    shift: "Morning",
    roomsCompleted: 16,
    avgMinutes: 24,
    onTimePct: 97,
    passRate: 94,
  },
  {
    id: "s4",
    name: "Nazia Khan",
    initials: "NK",
    shift: "Evening",
    roomsCompleted: 9,
    avgMinutes: 34,
    onTimePct: 78,
    passRate: 82,
  },
  {
    id: "s5",
    name: "Chamari Perera",
    initials: "CP",
    shift: "Evening",
    roomsCompleted: 11,
    avgMinutes: 29,
    onTimePct: 88,
    passRate: 91,
  },
  {
    id: "s6",
    name: "Nasrin Akter",
    initials: "NA",
    shift: "Evening",
    roomsCompleted: 13,
    avgMinutes: 27,
    onTimePct: 90,
    passRate: 93,
  },
];

/** Supervisors for the mobile Supervisor app's login — local Gulf nationals,
 * matching the management-tier skew noted above. */
export const supervisors: SupervisorProfile[] = [
  { id: "sup1", name: "Noura Al Qahtani", initials: "NQ", shift: "Morning" },
  { id: "sup2", name: "Khalid Al Otaibi", initials: "KO", shift: "Evening" },
];

/**
 * The resort sits on the Gulf shoreline as five low-rise wings running along
 * the water, not stacked floors — each wing's position relative to the shore
 * (rather than its room number) is what determines whether its rooms can be
 * sold with a Gulf view. See docs discussion: don't carry Riwaq's heritage
 * wing theme over, this property is a beachfront resort, not a heritage inn.
 */
export const wings: Record<WingId, Wing> = {
  1: { id: 1, name: "Marina Wing", proximity: "beachfront" },
  2: { id: 2, name: "Lagoon Wing", proximity: "beachfront" },
  3: { id: 3, name: "Palm Wing", proximity: "midground" },
  4: { id: 4, name: "Dune Wing", proximity: "midground" },
  5: { id: 5, name: "Oasis Wing", proximity: "garden" },
};

function viewFor(proximity: WingProximity, unitInWing: number): RoomView {
  if (proximity === "beachfront") return unitInWing <= 14 ? "gulf" : "garden";
  if (proximity === "midground") return unitInWing <= 10 ? "garden" : "courtyard";
  return unitInWing <= 4 ? "garden" : "courtyard";
}

function roomType(index: number): RoomType {
  if (index >= 18) return "Suite";
  if (index >= 13) return "Deluxe";
  return "Standard";
}

const statusPool: RoomStatus[] = [
  "inspected",
  "inspected",
  "inspected",
  "inspected",
  "inspected",
  "clean",
  "clean",
  "in_progress",
  "in_progress",
  "dirty",
  "dirty",
  "inspected",
];

const taskTypePool: TaskType[] = ["departure", "departure", "stayover"];

/* ───────────────────────── Housekeeper cleaning checklist ─────────────────────────
 * What the housekeeper works through, in order, while actually cleaning — distinct
 * from the supervisor's post-clean inspection rubric below. Departure (checkout) is
 * the full clean; stayover (guest still in-house) is a lighter touch; a re-clean
 * (sent back after a failed inspection) reuses the full departure template. */

const item = (
  id: string,
  zone: CleaningZone,
  label: string,
  mandatory = true,
  photo = false,
): ChecklistItem => ({ id, zone, label, mandatory, photo });

export const checklistTemplates: Record<"departure" | "stayover", ChecklistItem[]> = {
  departure: [
    item("d1", "entry_waste", "Open balcony doors to air the room", false),
    item("d2", "entry_waste", "Empty all bins & replace liners"),
    item("d3", "entry_waste", "Clear room-service trays to corridor", false),
    item("d4", "linen", "Strip all bed linen & towels"),
    item("d5", "linen", "Inspect mattress & pillows for stains or damage"),
    item("d6", "dusting", "Dust high to low: fixtures to furniture"),
    item("d7", "dusting", "Disinfect remote, phone, switches & door handles"),
    item("d8", "bathroom", "Disinfect toilet"),
    item("d9", "bathroom", "Clean sink, vanity & countertops", true, true),
    item("d10", "bathroom", "Clean shower / tub & glass"),
    item("d11", "bathroom", "Polish mirrors & chrome fixtures", false),
    item("d12", "restock", "Make bed to brand standard", true, true),
    item("d13", "restock", "Restock towels & toiletries"),
    item("d14", "restock", "Restock minibar, coffee & water", false),
    item("d15", "floor", "Vacuum carpet & rugs"),
    item("d16", "floor", "Mop hard flooring"),
    item("d17", "final_check", "Check all lights & AC"),
    item("d18", "final_check", "Align curtains, furniture & balcony chairs", false),
    item("d19", "final_check", "Lock door & balcony securely"),
  ],
  stayover: [
    item("s1", "entry_waste", "Empty bins & replace liners"),
    item("s2", "linen", "Replace used towels"),
    item("s3", "dusting", "Wipe down high-touch surfaces"),
    item("s4", "bathroom", "Clean toilet, sink & shower"),
    item("s5", "restock", "Make bed", true, true),
    item("s6", "restock", "Restock toiletries"),
    item("s7", "restock", "Restock coffee & water", false),
    item("s8", "floor", "Vacuum traffic areas", false),
    item("s9", "final_check", "Tidy guest belongings — don't move valuables", false),
    item("s10", "final_check", "Lock door & balcony securely"),
  ],
};

export function checklistTemplateFor(taskType: TaskType): ChecklistItem[] {
  return taskType === "stayover" ? checklistTemplates.stayover : checklistTemplates.departure;
}

export const zoneLabel: Record<CleaningZone, string> = {
  entry_waste: "Entry & Waste",
  linen: "Linen",
  dusting: "Dusting",
  bathroom: "Bathroom",
  restock: "Restock",
  floor: "Floor",
  final_check: "Final Check",
};

export const skipReasons = [
  "Guest belongings in the way",
  "Supplies not available",
  "Not needed this visit",
  "Other",
];

/* ───────────────────────── Supervisor inspection rubric ─────────────────────────
 * A separate, weighted checklist the supervisor uses to pass or fail a room after
 * the housekeeper has marked it clean. A critical point failing auto-fails the
 * inspection no matter the overall score. */

const pt = (
  id: string,
  zone: InspectionPoint["zone"],
  label: string,
  weight: 1 | 2 | 3,
  critical = false,
): InspectionPoint => ({ id, zone, label, weight, critical });

export const inspectionPoints: InspectionPoint[] = [
  pt("i1", "Bedroom", "Bed made to brand standard, no wrinkles", 3),
  pt("i2", "Bedroom", "Linen clean, no hair or stains", 3, true),
  pt("i3", "Bedroom", "Surfaces dust-free", 2),
  pt("i4", "Bedroom", "Carpet / floor clean", 2),
  pt("i5", "Bathroom", "Toilet sanitized", 3, true),
  pt("i6", "Bathroom", "Sink & vanity spotless", 2),
  pt("i7", "Bathroom", "Shower / tub & glass clean", 2),
  pt("i8", "Bathroom", "Towels complete & folded", 2),
  pt("i9", "Amenities", "Toiletries complete", 2),
  pt("i10", "Amenities", "Minibar, coffee & water stocked", 1),
  pt("i11", "Amenities", "Welcome items placed", 1),
  pt("i12", "Safety", "TV, AC & lights working", 2),
  pt("i13", "Safety", "Safe open & empty", 3, true),
  pt("i14", "Safety", "Door & balcony door lock secure", 3, true),
  pt("i15", "View & Balcony", "Balcony door & windows clean, view unobstructed", 2),
  pt("i16", "View & Balcony", "Balcony furniture clean & aligned", 1),
  pt("i17", "View & Balcony", "No pests or odors present", 3, true),
];

export function scoreInspection(results: Record<string, boolean>) {
  let total = 0;
  let got = 0;
  let criticalFail = false;
  for (const point of inspectionPoints) {
    total += point.weight;
    if (results[point.id] !== false) got += point.weight;
    if (point.critical && results[point.id] === false) criticalFail = true;
  }
  return { score: Math.round((got / total) * 100), criticalFail };
}

export const PASS_SCORE = 90;

function buildChecklistState(taskType: TaskType, fillRatio: number, seed: number) {
  const list = checklistTemplateFor(taskType === "reclean" ? "departure" : taskType);
  const state: Room["checklist"] = {};
  list.forEach((it, i) => {
    if (seeded(seed + i) < fillRatio) {
      state[it.id] = {
        status: "done",
        at: `${9 + ((seed + i) % 8)}:${String(((seed + i) * 7) % 60).padStart(2, "0")}`,
      };
    }
  });
  return state;
}

export function buildRooms(): Room[] {
  const rooms: Room[] = [];
  for (let wing = 1; wing <= 5; wing++) {
    const wingMeta = wings[wing as WingId];
    for (let i = 1; i <= 20; i++) {
      const seq = (wing - 1) * 20 + i;
      const r = seeded(seq);
      const status = statusPool[Math.floor(r * statusPool.length)]!;
      const flags: Room["flags"] = [];
      if (seq % 37 === 0) flags.push("ooo");
      else if (seq % 29 === 0) flags.push("oos");
      if (seq % 23 === 0) flags.push("dnd");

      const needsAttendant = status === "in_progress" || status === "clean";
      const type = roomType(i);
      const taskType = taskTypePool[Math.floor(seeded(seq + 11) * taskTypePool.length)]!;
      const level: 1 | 2 = i <= 10 ? 1 : 2;

      const checklist =
        status === "in_progress"
          ? buildChecklistState(taskType, 0.45, seq)
          : status === "clean" || status === "inspected"
            ? buildChecklistState(taskType, 1, seq)
            : {};

      const anomalies: Room["anomalies"] =
        (status === "clean" || status === "inspected") && seq % 31 === 0
          ? ["bulk_tick"]
          : (status === "clean" || status === "inspected") && seq % 41 === 0
            ? ["too_fast"]
            : [];

      const inspections: Inspection[] =
        status === "inspected"
          ? [
              {
                by: seq % 2 === 0 ? "sup1" : "sup2",
                at: `${10 + (seq % 6)}:${String((seq * 11) % 60).padStart(2, "0")}`,
                score: 92 + (seq % 8),
                result: "passed",
                failedPoints: [],
                note: undefined,
                remote: undefined,
              },
            ]
          : [];

      rooms.push({
        id: `r${wing}${String(i).padStart(2, "0")}`,
        number: `${wing}${String(i).padStart(2, "0")}`,
        wing: wing as WingId,
        level,
        view: viewFor(wingMeta.proximity, i),
        type,
        status,
        occupancy:
          `r${wing}${String(i).padStart(2, "0")}` === "r215" ||
          `r${wing}${String(i).padStart(2, "0")}` === "r419"
            ? "occupied"
            : taskType === "stayover"
              ? "occupied"
              : seeded(seq + 17) < 0.25
                ? "occupied"
                : "vacant",
        taskType,
        flags,
        photo: roomPhotoByType[type],
        attendantId: needsAttendant
          ? staff[Math.floor(seeded(seq + 7) * staff.length)]!.id
          : seq % 5 === 0
            ? staff[Math.floor(seeded(seq + 3) * staff.length)]!.id
            : null,
        rush: seq % 19 === 0 && status !== "inspected",
        eta:
          status === "in_progress"
            ? `${13 + (seq % 4)}:${seq % 2 ? "15" : "45"}`
            : status === "dirty"
              ? `${14 + (seq % 3)}:${seq % 2 ? "30" : "00"}`
              : null,
        lastUpdated: `${9 + (seq % 8)}:${String((seq * 7) % 60).padStart(2, "0")}`,
        notes: [],
        checklist,
        cleaningStartedAt:
          status === "in_progress"
            ? `${9 + (seq % 5)}:${String((seq * 3) % 60).padStart(2, "0")}`
            : undefined,
        anomalies,
        inspections,
      });
    }
  }
  return rooms;
}

export const issues: Issue[] = [
  {
    id: "i1",
    roomId: "r204",
    title: "Shower drain blocked",
    description: "Water pooling in the tub, drains very slowly. Guest checking in at 15:00.",
    category: "Plumbing",
    reportedBy: "s1",
    reportedAt: "09:42",
    severity: "high",
    status: "open",
    photos: ["bath", "drain"],
  },
  {
    id: "i2",
    roomId: "r318",
    title: "AC not cooling",
    description: "Unit runs but air stays warm. Room temperature 27C.",
    category: "HVAC",
    reportedBy: "s3",
    reportedAt: "10:05",
    severity: "high",
    status: "open",
    photos: ["ac"],
  },
  {
    id: "i3",
    roomId: "r112",
    title: "Torn bedsheet",
    description: "Fitted sheet ripped at the corner, replaced with spare from wing store.",
    category: "Linen",
    reportedBy: "s2",
    reportedAt: "10:31",
    severity: "low",
    status: "open",
    photos: ["sheet"],
  },
  {
    id: "i4",
    roomId: "r420",
    title: "Broken safe keypad",
    description: "Keypad unresponsive, safe currently locked shut.",
    category: "Fixtures",
    reportedBy: "s5",
    reportedAt: "11:12",
    severity: "medium",
    status: "maintenance",
    photos: ["safe", "keypad"],
  },
  {
    id: "i5",
    roomId: "r507",
    title: "Stained carpet near window",
    description: "Dark stain roughly 30cm, will not lift with spot cleaner.",
    category: "Housekeeping",
    reportedBy: "s6",
    reportedAt: "11:48",
    severity: "medium",
    status: "open",
    photos: ["carpet"],
  },
  {
    id: "i6",
    roomId: "r301",
    title: "Flickering bathroom light",
    description: "Ceiling light flickers when switched on.",
    category: "Electrical",
    reportedBy: "s4",
    reportedAt: "12:20",
    severity: "low",
    status: "resolved",
    photos: [],
  },
];

export const reservations: Reservation[] = [
  {
    id: "b1",
    code: "HTL-48219",
    guestName: "Laila Mansour",
    roomType: "Deluxe",
    nights: 3,
    guests: 2,
    arrival: "Today",
    expectedCheckIn: "14:00",
    expectedCheckOut: "11:00",
    status: "expected",
    roomId: null,
    vip: true,
  },
  {
    id: "b2",
    code: "HTL-48224",
    guestName: "Omar Shafik",
    roomType: "Standard",
    nights: 1,
    guests: 1,
    arrival: "Today",
    expectedCheckIn: "15:30",
    expectedCheckOut: "11:00",
    status: "expected",
    roomId: null,
    vip: false,
  },
  {
    id: "b3",
    code: "HTL-48231",
    guestName: "Hana Abdelaziz",
    roomType: "Suite",
    nights: 5,
    guests: 3,
    arrival: "Today",
    expectedCheckIn: "16:00",
    expectedCheckOut: "12:00",
    status: "expected",
    roomId: null,
    vip: true,
  },
  {
    id: "b4",
    code: "HTL-48237",
    guestName: "Karim Adel",
    roomType: "Standard",
    nights: 2,
    guests: 2,
    arrival: "Today",
    expectedCheckIn: "13:00",
    expectedCheckOut: "11:00",
    status: "expected",
    roomId: null,
    vip: false,
  },
  {
    id: "b5",
    code: "HTL-48198",
    guestName: "Dina Rashad",
    roomType: "Deluxe",
    nights: 4,
    guests: 2,
    arrival: "Yesterday",
    expectedCheckIn: "14:00",
    expectedCheckOut: "11:00",
    status: "checked_in",
    roomId: "r215",
    vip: false,
  },
  {
    id: "b6",
    code: "HTL-48201",
    guestName: "Peter Novak",
    roomType: "Suite",
    nights: 2,
    guests: 2,
    arrival: "Yesterday",
    expectedCheckIn: "14:00",
    expectedCheckOut: "11:00",
    status: "checked_in",
    roomId: "r419",
    vip: true,
  },
  {
    id: "b7",
    code: "HTL-48244",
    guestName: "Sara Khalil",
    roomType: "Standard",
    nights: 1,
    guests: 1,
    arrival: "Today",
    expectedCheckIn: "17:30",
    expectedCheckOut: "11:00",
    status: "expected",
    roomId: null,
    vip: false,
  },
];

export const shiftTotals = {
  morning: { completed: 42, avgMinutes: 27, onTimePct: 91, passRate: 94, assigned: 46 },
  evening: { completed: 33, avgMinutes: 30, onTimePct: 85, passRate: 89, assigned: 39 },
};

/** Guest-services requests routed to housekeeping — extra amenities, late
 * checkout and the like. Distinct from Issues, which are maintenance defects
 * nobody asked for. */
export const guestRequests: GuestRequest[] = [
  {
    id: "gr1",
    roomId: "r215",
    type: "towels",
    note: "2 extra bath towels",
    requestedAt: "10:15",
    status: "pending",
    assignedTo: null,
  },
  {
    id: "gr2",
    roomId: "r419",
    type: "late_checkout",
    note: "Requesting checkout at 14:00 instead of 11:00",
    requestedAt: "09:40",
    status: "acknowledged",
    assignedTo: "s5",
  },
  {
    id: "gr3",
    roomId: "r215",
    type: "amenities",
    note: "Extra pillows and bottled water",
    requestedAt: "08:05",
    status: "completed",
    assignedTo: "s1",
  },
];

export const guestRequestLabel: Record<GuestRequest["type"], string> = {
  towels: "Extra towels",
  amenities: "Extra amenities",
  late_checkout: "Late checkout",
  housekeeping: "Extra housekeeping",
  other: "Other request",
};
