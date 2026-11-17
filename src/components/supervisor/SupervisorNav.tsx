import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/supervisor", label: "Board", icon: "grid_view" },
  { to: "/supervisor/inspections", label: "Inspect", icon: "fact_check" },
  { to: "/supervisor/issues", label: "Issues", icon: "report" },
  { to: "/supervisor/performance", label: "Performance", icon: "monitoring" },
] as const;

/** Persistent bottom nav across the Supervisor mobile app's 4 top-level
 * screens — unlike Housekeeper, all 4 sections are peers a supervisor jumps
 * between directly, not drill-downs from one Home, so (per the user's own
 * call) this is 4 flat tabs rather than Housekeeper's 3-tabs-plus-FAB — no
 * single action dominates enough to deserve the center slot. */
export function SupervisorNav() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex shrink-0 items-center justify-around border-t border-outline-variant bg-surface-container-lowest py-2">
      {TABS.map((tab) => {
        const active = pathname === tab.to;
        return (
          <button
            key={tab.to}
            onClick={() => navigate({ to: tab.to })}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1",
              active ? "text-primary" : "text-on-surface-variant",
            )}
          >
            <Icon name={tab.icon} size={22} filled={active} />
            <span className={cn("text-label-sm", active && "font-medium")}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
