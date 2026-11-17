/**
 * Platform language: English (default) or Urdu. One switch in the top bar
 * flips the whole console — including the Supervisor mobile app — and sets
 * document direction to RTL. The Housekeeper app keeps its own per-device
 * toggle (housekeeper-i18n.ts) because a shared floor phone picks its
 * language independently of the front-desk console.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dict, type DictKey, type Lang } from "./translations";
import type { RoomFlag, RoomStatus, RoomType, RoomView, GuestRequest } from "./hotel-types";

const KEY = "hotel-lang";

interface I18nState {
  lang: Lang;
  isRtl: boolean;
  setLang: (l: Lang) => void;
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nState | null>(null);

function readInitial(): Lang {
  try {
    return window.localStorage.getItem(KEY) === "ur" ? "ur" : "en";
  } catch {
    return "en";
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitial);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      /* private mode: keep in memory only */
    }
  }, []);

  const value = useMemo<I18nState>(() => {
    const t = (key: DictKey, vars?: Record<string, string | number>) => {
      let s: string = dict[key][lang];
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          s = s.replaceAll(`{${k}}`, String(v));
        }
      }
      return s;
    };
    return { lang, isRtl: lang === "ur", setLang, t };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

/* ── Localized lookups for data-driven labels ── */

export function useStatusText(): Record<RoomStatus, { label: string; short: string }> {
  const { t } = useI18n();
  return {
    dirty: { label: t("status.dirty"), short: t("status.dirty.short") },
    in_progress: { label: t("status.in_progress"), short: t("status.in_progress.short") },
    clean: { label: t("status.clean"), short: t("status.clean.short") },
    inspected: { label: t("status.inspected"), short: t("status.inspected.short") },
  };
}

export function useFlagText(): Record<RoomFlag, string> {
  const { t } = useI18n();
  return { ooo: t("flag.ooo"), oos: t("flag.oos"), dnd: t("flag.dnd") };
}

export function useTypeText(): Record<RoomType, string> {
  const { t } = useI18n();
  return { Standard: t("type.Standard"), Deluxe: t("type.Deluxe"), Suite: t("type.Suite") };
}

export function useViewText(): Record<RoomView, string> {
  const { t } = useI18n();
  return { gulf: t("view.gulf"), garden: t("view.garden"), courtyard: t("view.courtyard") };
}

export function useWingName(): (id: number) => string {
  const { t } = useI18n();
  return (id) => t(`wing.${id}` as DictKey);
}

export function useGuestRequestText(): Record<GuestRequest["type"], string> {
  const { t } = useI18n();
  return {
    towels: t("req.towels"),
    amenities: t("req.amenities"),
    late_checkout: t("req.late_checkout"),
    housekeeping: t("req.housekeeping"),
    other: t("req.other"),
  };
}

export function useShiftName(): (shift: string) => string {
  const { t } = useI18n();
  return (shift) =>
    shift === "Morning" ? t("common.morning") : shift === "Evening" ? t("common.evening") : shift;
}
