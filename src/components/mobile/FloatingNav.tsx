import type { ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

export type FloatingNavItem = {
  key: string;
  label: string;
  icon: string;
  active?: boolean;
  onClick: () => void;
  badge?: ReactNode;
};

/** Floating pill tab bar (inspired by modern booking apps): sits over the
 * content instead of a flat bordered strip; the active tab expands into a
 * labelled pill, the others stay icon-only. */
export function FloatingNav({ items }: { items: FloatingNavItem[] }) {
  return (
    <div className="floating-nav pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-5">
      <nav className="pointer-events-auto flex items-center gap-1 rounded-full bg-on-surface p-1.5 shadow-[0_12px_30px_-8px_rgb(20_35_63/0.45)]">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={it.onClick}
            aria-label={it.label}
            className={cn(
              "relative flex h-11 items-center gap-1.5 rounded-full transition-all active:scale-95",
              it.active
                ? "bg-primary px-4 text-on-primary"
                : "w-11 justify-center text-surface/70",
            )}
          >
            <Icon name={it.icon} size={21} filled={!!it.active} />
            {it.active && <span className="text-label font-semibold">{it.label}</span>}
            {it.badge}
          </button>
        ))}
      </nav>
    </div>
  );
}
