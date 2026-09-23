import type { Issue, Reservation, Room, RoomStatus, RoomType, Staff } from "./hotel-types";

/** Deterministic pseudo-random so SSR and client agree. */
function seeded(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export const staff: Staff[] = [
  {
    id: "s1",
    name: "Amina Hassan",
    initials: "AH",
    shift: "Morning",
    roomsCompleted: 14,
    avgMinutes: 26,
    onTimePct: 93,
    passRate: 96,
  },
  {
    id: "s2",
    name: "Youssef Nabil",
    initials: "YN",
    shift: "Morning",
    roomsCompleted: 12,
    avgMinutes: 31,
    onTimePct: 84,
    passRate: 88,
  },
  {
    id: "s3",
    name: "Mariam Fouad",
    initials: "MF",
    shift: "Morning",
    roomsCompleted: 16,
    avgMinutes: 24,
    onTimePct: 97,
    passRate: 94,
  },
  {
    id: "s4",
    name: "Tarek Samir",
    initials: "TS",
    shift: "Evening",
    roomsCompleted: 9,
    avgMinutes: 34,
    onTimePct: 78,
    passRate: 82,
  },
  {
    id: "s5",
    name: "Nour El Din",
    initials: "ND",
    shift: "Evening",
    roomsCompleted: 11,
    avgMinutes: 29,
    onTimePct: 88,
    passRate: 91,
  },
  {
    id: "s6",
    name: "Salma Ibrahim",
    initials: "SI",
    shift: "Evening",
    roomsCompleted: 13,
    avgMinutes: 27,
    onTimePct: 90,
    passRate: 93,
  },
];

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

export function buildRooms(): Room[] {
  const rooms: Room[] = [];
  for (let floor = 1; floor <= 5; floor++) {
    for (let i = 1; i <= 20; i++) {
      const seq = (floor - 1) * 20 + i;
      const r = seeded(seq);
      const status = statusPool[Math.floor(r * statusPool.length)];
      const flags: Room["flags"] = [];
      if (seq % 37 === 0) flags.push("ooo");
      else if (seq % 29 === 0) flags.push("oos");
      if (seq % 23 === 0) flags.push("dnd");

      const needsAttendant = status === "in_progress" || status === "clean";
      rooms.push({
        id: `r${floor}${String(i).padStart(2, "0")}`,
        number: `${floor}${String(i).padStart(2, "0")}`,
        floor,
        type: roomType(i),
        status,
        flags,
        attendantId: needsAttendant
          ? staff[Math.floor(seeded(seq + 7) * staff.length)].id
          : seq % 5 === 0
            ? staff[Math.floor(seeded(seq + 3) * staff.length)].id
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
    description: "Fitted sheet ripped at the corner, replaced with spare from floor store.",
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
