import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/supervisor", label: "Board", icon: "dashboard" },
  { to: "/supervisor/inspections", label: "Inspect", icon: "assignment_turned_in" },
  { to: "/supervisor/issues", label: "Issues", icon: "build_circle" },
  { to: "/supervisor/performance", label: "Stats", icon: "bar_chart" },
] as const;

/** Same white rounded dock as the Housekeeper app (no centre scan button),
 * with four clearly distinct tab icons. */
export function SupervisorNav() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 px-4">
      <nav className="pointer-events-auto flex h-16 items-center rounded-[22px] bg-surface-container-lowest shadow-[0_10px_28px_-8px_rgb(1_41_71/0.35)]">
        {TABS.map((t) => {
          const active = pathname === t.to;
          return (
            <button
              key={t.to}
              onClick={() => navigate({ to: t.to })}
              aria-label={t.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors active:scale-95",
                active ? "text-primary" : "text-on-surface-variant",
              )}
            >
              <Icon name={t.icon} size={24} filled={active} />
              <span className="text-label-sm font-semibold">{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
