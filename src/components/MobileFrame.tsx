import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

function useClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return time
    .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    .replace(/\s?[AP]M/i, "");
}

/**
 * Renders the Housekeeper persona as a real phone mockup inside the desktop
 * console, rather than a separate app — this app is "one app, three role-based
 * views" (see Figma Make Prompts.md), and real housekeepers use a phone, not
 * this console, so the console shows what their phone shows.
 *
 * The notch is a separate dark layer on top of the screen (not a cutout) and
 * the bezel gets its depth from layered shadows, not a border — the two
 * details that separate a convincing phone mockup from an obvious fake.
 */
export function MobileFrame({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  const time = useClock();
  return (
    <div className="flex justify-center py-6">
      <div className="relative rounded-[54px] bg-gradient-to-b from-[#2a2b2e] to-[#17181a] p-[10px] shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_30px_60px_-12px_rgba(0,0,0,0.5),0_18px_36px_-18px_rgba(0,0,0,0.6)]">
        {/* Side button nubs */}
        <span className="absolute -left-[2px] top-28 h-14 w-[3px] rounded-l-sm bg-[#111214]" />
        <span className="absolute -left-[2px] top-44 h-9 w-[3px] rounded-l-sm bg-[#111214]" />
        <span className="absolute -right-[2px] top-36 h-20 w-[3px] rounded-r-sm bg-[#111214]" />

        <div
          className={cn(
            "hk-frame relative flex w-[370px] flex-col overflow-hidden rounded-[44px] bg-surface",
            "h-[min(770px,calc(100vh-150px))]",
          )}
        >
          {/* Notch */}
          <div className="absolute left-1/2 top-0 z-30 h-[26px] w-[114px] -translate-x-1/2 rounded-b-2xl bg-[#17181a]" />

          {/* Status bar */}
          <div
            className={cn(
              "relative z-20 flex h-11 shrink-0 items-center justify-between px-7 pt-1",
              dark ? "bg-transparent text-white" : "bg-surface text-on-surface",
            )}
          >
            <span className="text-label font-semibold">{time}</span>
            <div className="flex items-center gap-1">
              <Icon name="signal_cellular_alt" size={15} filled />
              <Icon name="wifi" size={15} filled />
              <Icon name="battery_full" size={17} filled />
            </div>
          </div>

          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-1",
              dark && "-mt-11",
            )}
          >
            {children}
          </div>

          {/* Home indicator */}
          <div className="pointer-events-none absolute inset-x-0 bottom-1.5 z-30 flex justify-center">
            <span
              className={cn("h-1.5 w-32 rounded-full", dark ? "bg-white/40" : "bg-on-surface/30")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileScreenHeader({
  title,
  subtitle,
  onBack,
  actions,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: ReactNode;
}) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-outline-variant bg-surface-container-lowest px-4 py-3">
      {onBack ? (
        <button
          onClick={onBack}
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-full text-on-surface-variant active:bg-surface-container",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          )}
          aria-label="Back"
        >
          <span className="material-symbols-rounded">chevron_left</span>
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-title truncate text-on-surface">{title}</p>
        {subtitle ? (
          <p className="text-label-sm truncate text-on-surface-subtle">{subtitle}</p>
        ) : null}
      </div>
      {actions}
    </header>
  );
}
