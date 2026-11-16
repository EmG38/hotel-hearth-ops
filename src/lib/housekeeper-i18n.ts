/**
 * Language for the Housekeeper mobile preview only. English is the default
 * (it's the mandated hiring language for this workforce) with Hindi as the
 * first additional option, since research shows Hindi/Urdu is the real
 * cross-national bridge language on a Gulf housekeeping floor — see
 * "Gulf Workforce Culture Research.md" in the project root. One language
 * per screen, never mixed, so this never touches the desktop Supervisor/
 * Reception console (English only).
 */
import { useSyncExternalStore } from "react";

export type HkLang = "en" | "hi";

const KEY = "hotel-hk-lang";
const listeners = new Set<() => void>();
let current: HkLang | null = null;

function read(): HkLang {
  if (current) return current;
  try {
    current = window.localStorage.getItem(KEY) === "hi" ? "hi" : "en";
  } catch {
    current = "en";
  }
  return current;
}

export function setHkLang(lang: HkLang) {
  current = lang;
  try {
    window.localStorage.setItem(KEY, lang);
  } catch {
    /* private mode: keep in memory only */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useHkLang(): HkLang {
  return useSyncExternalStore(subscribe, read, () => "en");
}

/** Pause/break reasons, including Prayer — grounded in Gulf break-law research
 * (Saudi Arabia: no more than 5 consecutive hours without a 30-min break) and
 * respectful of a majority-Muslim migrant workforce. */
export const PAUSE_REASONS = [
  { id: "break", en: "Break", hi: "ब्रेक", icon: "free_breakfast" },
  { id: "prayer", en: "Prayer", hi: "नमाज़", icon: "self_improvement" },
  {
    id: "called_to_assist",
    en: "Called to assist",
    hi: "मदद के लिए बुलाया गया",
    icon: "support_agent",
  },
  { id: "missing_supplies", en: "Missing supplies", hi: "सामान कम है", icon: "inventory_2" },
  { id: "guest_in_room", en: "Guest in room", hi: "मेहमान कमरे में है", icon: "person" },
  { id: "other", en: "Other", hi: "अन्य", icon: "more_horiz" },
] as const;

export const ISSUE_CATEGORIES = [
  { id: "maintenance", en: "Maintenance", hi: "रखरखाव", icon: "build" },
  { id: "lost_found", en: "Lost & Found", hi: "खोया-पाया", icon: "backpack" },
  { id: "other", en: "Other", hi: "अन्य", icon: "more_horiz" },
] as const;

const dict = {
  goodMorning: { en: "Good morning", hi: "सुप्रभात" },
  goodAfternoon: { en: "Good afternoon", hi: "नमस्ते" },
  goodEvening: { en: "Good evening", hi: "शुभ संध्या" },
  roomsDone: { en: "rooms done", hi: "कमरे पूरे" },
  myRooms: { en: "My rooms today", hi: "आज मेरे कमरे" },
  offline: {
    en: "Offline — changes will sync when back online",
    hi: "ऑफ़लाइन — वापस आने पर अपने आप सिंक होगा",
  },
  noRooms: { en: "No rooms assigned yet", hi: "अभी कोई कमरा नहीं दिया गया" },
  endShift: { en: "End of shift", hi: "शिफ्ट खत्म" },
  signIn: { en: "Who's signing in?", hi: "कौन साइन इन कर रहा है?" },
  startCleaning: { en: "Start Cleaning", hi: "सफ़ाई शुरू करें" },
  markDone: { en: "Mark Done", hi: "पूरा हुआ" },
  reportIssue: { en: "Report an Issue", hi: "समस्या बताएं" },
  pause: { en: "Pause", hi: "रोकें" },
  resume: { en: "Resume", hi: "फिर शुरू करें" },
  dndSkipped: { en: "Do Not Disturb — skipped", hi: "डिस्टर्ब न करें — छोड़ा गया" },
  retry: { en: "Retry Now", hi: "अभी दोबारा कोशिश करें" },
  notes: { en: "Notes", hi: "टिप्पणियाँ" },
  category: { en: "Category", hi: "श्रेणी" },
  description: { en: "Description", hi: "विवरण" },
  addPhoto: { en: "Add photo", hi: "फ़ोटो जोड़ें" },
  submit: { en: "Submit Report", hi: "रिपोर्ट भेजें" },
  cancel: { en: "Cancel", hi: "रद्द करें" },
  whyPausing: { en: "Why are you pausing?", hi: "आप क्यों रुक रहे हैं?" },
  shiftSummary: { en: "Shift Summary", hi: "शिफ्ट सारांश" },
  roomsCompleted: { en: "Rooms completed", hi: "पूरे किए गए कमरे" },
  avgTime: { en: "Avg. time / room", hi: "औसत समय / कमरा" },
  onTime: { en: "On-time %", hi: "समय पर %" },
  personalStatsNote: {
    en: "Personal stats only — not shared or compared with your team.",
    hi: "यह केवल आपका व्यक्तिगत आँकड़ा है — टीम से साझा या तुलना नहीं होती।",
  },
  switchUser: { en: "Switch user", hi: "उपयोगकर्ता बदलें" },
  backToRoom: { en: "Back", hi: "वापस" },
  viewSummary: { en: "View shift summary", hi: "शिफ्ट सारांश देखें" },
  submitted: { en: "Submitted — awaiting inspection", hi: "भेजा गया — निरीक्षण की प्रतीक्षा में" },
  inspected: { en: "Inspected", hi: "निरीक्षण हो गया" },
} as const;

export type HkDictKey = keyof typeof dict;

export function makeHkT(lang: HkLang) {
  return {
    lang,
    t: (key: HkDictKey) => dict[key][lang],
    reason: (id: string) => PAUSE_REASONS.find((r) => r.id === id)?.[lang] ?? id,
    category: (id: string) => ISSUE_CATEGORIES.find((c) => c.id === id)?.[lang] ?? id,
  };
}

export type HkTranslator = ReturnType<typeof makeHkT>;

export function useHkT(): HkTranslator {
  return makeHkT(useHkLang());
}
