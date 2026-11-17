import { useNavigate, useRouterState } from "@tanstack/react-router";
import { FloatingNav } from "@/components/mobile/FloatingNav";

const TABS = [
  { to: "/supervisor", label: "Board", icon: "grid_view" },
  { to: "/supervisor/inspections", label: "Inspect", icon: "fact_check" },
  { to: "/supervisor/issues", label: "Issues", icon: "report" },
  { to: "/supervisor/performance", label: "Stats", icon: "monitoring" },
] as const;

/** 4 flat peer tabs for the Supervisor mobile app, as a floating pill bar. */
export function SupervisorNav() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <FloatingNav
      items={TABS.map((t) => ({
        key: t.to,
        label: t.label,
        icon: t.icon,
        active: pathname === t.to,
        onClick: () => navigate({ to: t.to }),
      }))}
    />
  );
}
