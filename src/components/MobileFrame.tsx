import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Renders the Housekeeper persona as a phone-shaped preview inside the desktop
 * console, rather than a separate app — this app is "one app, three role-based
 * views" (see Figma Make Prompts.md), and real housekeepers use a phone, not
 * this console, so the console shows what their phone shows.
 */
export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center py-2">
      <div className="w-full max-w-[390px] overflow-hidden rounded-[36px] border border-outline-variant bg-surface shadow-soft">
        <div className="flex h-11 shrink-0 items-center justify-center bg-surface">
          <span className="h-1.5 w-24 rounded-full bg-on-surface-subtle/30" />
        </div>
        <div className="flex h-[min(720px,calc(100vh-140px))] flex-col overflow-y-auto">
          {children}
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
            "grid size-10 shrink-0 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container",
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
