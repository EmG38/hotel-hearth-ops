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

export const ISSUE_CATEGORIES = [
  { id: "maintenance", en: "Maintenance", hi: "रखरखाव" },
  { id: "lost_found", en: "Lost & Found", hi: "खोया-पाया" },
  { id: "other", en: "Other", hi: "अन्य" },
] as const;

const dict = {
  goodMorning: { en: "Good morning,", hi: "सुप्रभात," },
  goodAfternoon: { en: "Good afternoon,", hi: "नमस्ते," },
  goodEvening: { en: "Good evening,", hi: "शुभ संध्या," },
  housekeeper: { en: "Housekeeper", hi: "हाउसकीपर" },
  todaysShift: { en: "TODAY'S SHIFT", hi: "आज की शिफ्ट" },
  roomsCompleted: { en: "rooms completed", hi: "कमरे पूरे" },
  complete: { en: "complete", hi: "पूर्ण" },
  avgPerRoom: { en: "avg", hi: "औसत" },
  minPerRoom: { en: "min/room", hi: "मिनट/कमरा" },
  summary: { en: "Summary", hi: "सारांश" },
  statusOverview: { en: "Status Overview", hi: "स्थिति अवलोकन" },
  dirty: { en: "Dirty", hi: "गंदा" },
  inProgressShort: { en: "In", hi: "जारी" },
  awaitingShort: { en: "Awaiting", hi: "प्रतीक्षा" },
  inspectedShort: { en: "Inspected", hi: "निरीक्षित" },
  needsAttention: { en: "Needs Attention", hi: "ध्यान चाहिए" },
  seeAll: { en: "See All", hi: "सभी देखें" },
  allRooms: { en: "All Rooms", hi: "सभी कमरे" },
  floor: { en: "Floor", hi: "मंज़िल" },
  ready: { en: "ready", hi: "तैयार" },
  viewAll: { en: "View all", hi: "सभी देखें" },
  roomsWord: { en: "rooms", hi: "कमरे" },
  allClear: {
    en: "All clear — nothing needs attention",
    hi: "सब ठीक है — कुछ भी ध्यान देने योग्य नहीं",
  },
  noRoomsOnFloor: {
    en: "No rooms assigned on this floor",
    hi: "इस मंज़िल पर कोई कमरा नहीं सौंपा गया",
  },
  justNow: { en: "just now", hi: "अभी" },
  minAgo: { en: "m ago", hi: "मि पहले" },
  hourAgo: { en: "h ago", hi: "घं पहले" },
  statusDirty: { en: "Dirty", hi: "गंदा" },
  statusInProgress: { en: "In Progress", hi: "सफ़ाई जारी" },
  statusAwaiting: { en: "Awaiting Inspection", hi: "निरीक्षण की प्रतीक्षा" },
  statusInspected: { en: "Inspected · Ready", hi: "निरीक्षित · तैयार" },
  updated: { en: "Updated", hi: "अपडेट किया गया" },
  startCleaning: { en: "Start Cleaning", hi: "सफ़ाई शुरू करें" },
  markDone: { en: "Mark Done", hi: "पूरा हुआ" },
  awaitingBanner: {
    en: "Submitted — awaiting supervisor inspection",
    hi: "भेजा गया — पर्यवेक्षक के निरीक्षण की प्रतीक्षा में",
  },
  inspectedBanner: {
    en: "Inspected and ready for guests",
    hi: "निरीक्षित और मेहमानों के लिए तैयार",
  },
  reportIssue: { en: "Report an Issue", hi: "समस्या बताएं" },
  notes: { en: "NOTES", hi: "टिप्पणियाँ" },
  notesPlaceholder: { en: "Add notes about this room…", hi: "इस कमरे के बारे में टिप्पणी लिखें…" },
  category: { en: "Category", hi: "श्रेणी" },
  photo: { en: "Photo", hi: "फ़ोटो" },
  camera: { en: "Camera", hi: "कैमरा" },
  upload: { en: "Upload", hi: "अपलोड" },
  photoRequired: { en: "Photo required to submit", hi: "भेजने के लिए फ़ोटो ज़रूरी है" },
  photoAttached: { en: "1 photo attached", hi: "1 फ़ोटो जोड़ी गई" },
  description: { en: "Description", hi: "विवरण" },
  descriptionPlaceholder: {
    en: "Briefly describe the issue…",
    hi: "समस्या के बारे में संक्षेप में लिखें…",
  },
  submitReport: { en: "Submit Report", hi: "रिपोर्ट भेजें" },
  reportSent: { en: "Report Sent", hi: "रिपोर्ट भेज दी गई" },
  reportSentBody: {
    en: "Your supervisor has been notified and will follow up shortly.",
    hi: "आपके पर्यवेक्षक को सूचित कर दिया गया है, वे जल्द ही संपर्क करेंगे।",
  },
  yourPerformanceToday: { en: "Your performance today", hi: "आज आपका प्रदर्शन" },
  avgPerRoomStat: { en: "Avg / room", hi: "औसत / कमरा" },
  passRate: { en: "Pass rate", hi: "पास दर" },
  roomsAssigned: { en: "Rooms assigned", hi: "सौंपे गए कमरे" },
  completed: { en: "Completed", hi: "पूरे हुए" },
  awaitingInspection: { en: "Awaiting inspection", hi: "निरीक्षण की प्रतीक्षा में" },
  dndSkipped: { en: "DND / skipped", hi: "DND / छोड़े गए" },
  issuesReported: { en: "Issues reported", hi: "दर्ज समस्याएँ" },
  yourTimes: { en: "YOUR TIMES", hi: "आपका समय" },
  shiftStart: { en: "Shift start", hi: "शिफ्ट शुरू" },
  shiftEnd: { en: "Shift end", hi: "शिफ्ट खत्म" },
  fastestRoom: { en: "Fastest room", hi: "सबसे तेज़ कमरा" },
  longestRoom: { en: "Longest room", hi: "सबसे धीमा कमरा" },
  averageTime: { en: "Average time", hi: "औसत समय" },
  personalStatsNote: {
    en: "Personal stats only — no team ranking or comparison is shown. Great work today",
    hi: "यह केवल आपका व्यक्तिगत आँकड़ा है — कोई टीम रैंकिंग या तुलना नहीं दिखाई जाती। आज शानदार काम किया",
  },
  doneSignOff: { en: "Done — Sign Off", hi: "पूरा हुआ — साइन ऑफ़" },
  signIn: { en: "Who's signing in?", hi: "कौन साइन इन कर रहा है?" },
  enterPin: { en: "Enter your PIN", hi: "अपना पिन डालें" },
  switchUser: { en: "Switch user", hi: "उपयोगकर्ता बदलें" },
  offline: { en: "Offline", hi: "ऑफ़लाइन" },
  offlineBanner: {
    en: "You're offline — changes are saved here and will sync automatically",
    hi: "आप ऑफ़लाइन हैं — बदलाव यहीं सुरक्षित हैं और वापस आने पर अपने आप सिंक होंगे",
  },
  home: { en: "Home", hi: "होम" },
  scan: { en: "Scan", hi: "स्कैन" },
  scanRoom: { en: "Scan Room", hi: "कमरा स्कैन करें" },
  pointAtCode: {
    en: "Point your camera at the door's QR code",
    hi: "दरवाज़े के QR कोड पर कैमरा रखें",
  },
  searching: { en: "Searching…", hi: "खोज रहे हैं…" },
  roomFound: { en: "Room found", hi: "कमरा मिल गया" },
  enterRoomInstead: { en: "Enter room number instead", hi: "इसके बजाय कमरा नंबर डालें" },
  roomNumber: { en: "Room number", hi: "कमरा नंबर" },
  go: { en: "Go", hi: "जाएँ" },
  roomNotFound: { en: "No room found with that number", hi: "यह नंबर किसी कमरे का नहीं है" },
  cancel: { en: "Cancel", hi: "रद्द करें" },
} as const;

export type HkDictKey = keyof typeof dict;

export function makeHkT(lang: HkLang) {
  return {
    lang,
    t: (key: HkDictKey) => dict[key][lang],
    category: (id: string) => ISSUE_CATEGORIES.find((c) => c.id === id)?.[lang] ?? id,
  };
}

export type HkTranslator = ReturnType<typeof makeHkT>;

export function useHkT(): HkTranslator {
  return makeHkT(useHkLang());
}

/** Greeting key by local hour, e.g. "goodMorning". */
export function greetingKey(): "goodMorning" | "goodAfternoon" | "goodEvening" {
  const h = new Date().getHours();
  if (h < 12) return "goodMorning";
  if (h < 17) return "goodAfternoon";
  return "goodEvening";
}

/** "lastUpdated" is a clock time like "14:32" (no date). Renders "Xm ago"/"Xh ago"/"just now". */
export function timeAgo(lastUpdated: string, t: HkTranslator): string {
  const [h, m] = lastUpdated.split(":").map(Number);
  const then = new Date();
  then.setHours(h ?? 0, m ?? 0, 0, 0);
  const now = new Date();
  let diffMin = Math.round((now.getTime() - then.getTime()) / 60000);
  if (diffMin < 0) diffMin += 24 * 60;
  if (diffMin < 1) return t.t("justNow");
  if (diffMin < 60) return `${diffMin}${t.t("minAgo")}`;
  return `${Math.round(diffMin / 60)}${t.t("hourAgo")}`;
}
