import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { useHotel } from "@/lib/hotel-store";
import { useI18n } from "@/lib/i18n";
import type { DictKey } from "@/lib/translations";
import type { Role } from "@/lib/hotel-types";
import logoAsset from "@/assets/marsa-dhahab-emblem.png.asset.json";

type Persona = {
  key: string;
  role?: Role;
  label: string;
  blurb: string;
  icon: string;
  to: string;
  items?: { to: string; labelKey: DictKey; icon: string }[];
};

const personas: Persona[] = [
  { key: "supervisor", role: "supervisor", label: "Supervisor", blurb: "Mobile · floor control", icon: "supervisor_account", to: "/supervisor" },
  {
    key: "reception", role: "reception", label: "Reception", blurb: "Desk · guests & rooms", icon: "concierge", to: "/availability",
    items: [
      { to: "/availability", labelKey: "nav.availability", icon: "meeting_room" },
      { to: "/check-in", labelKey: "nav.checkIn", icon: "how_to_reg" },
      { to: "/reservations", labelKey: "nav.reservations", icon: "event_note" },
    ],
  },
  { key: "housekeeper", role: "housekeeper", label: "Housekeeper", blurb: "Mobile · room tasks", icon: "cleaning_services", to: "/housekeeper" },
  { key: "manager", label: "Manager", blurb: "Coming soon", icon: "business_center", to: "/manager" },
];

function personaActive(p: Persona, pathname: string) {
  if (p.key === "reception") return p.items!.some((i) => i.to === pathname);
  return pathname === p.to || pathname.startsWith(p.to + "/");
}

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { setRole } = useHotel();
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "relative flex shrink-0 flex-col gap-6 overflow-hidden bg-gradient-to-b from-brand-ink via-secondary to-tertiary py-6 text-on-primary transition-[width]",
        collapsed ? "w-20" : "w-72",
      )}
    >
      <div className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -top-20 right-[-40%] size-56 rounded-full bg-sand/20 blur-3xl" />

      <div className={cn("relative flex flex-col items-center gap-2 px-4 text-center")}>
        <img src={logoAsset.url} alt="Marsa Dhahab Hotel logo" className={cn("object-contain drop-shadow-lg", collapsed ? "size-10" : "size-16")} />
        {!collapsed && (
          <>
            <p className="text-title tracking-wide">{t("app.name")}</p>
            <p className="text-label-sm uppercase tracking-[0.25em] text-on-primary/70">Choose a persona</p>
          </>
        )}
      </div>

      <nav className="relative flex-1 space-y-3 overflow-y-auto px-3">
        {personas.map((p, i) => {
          const active = personaActive(p, pathname);
          return (
            <div key={p.key}>
              <Link
                to={p.to}
                onClick={() => p.role && setRole(p.role)}
                title={p.label}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-primary",
                  collapsed && "justify-center p-2",
                  active
                    ? "border-on-primary/40 bg-on-primary/20 shadow-lg backdrop-blur"
                    : "border-transparent hover:bg-on-primary/10",
                )}
              >
                <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", active ? "bg-primary text-on-primary" : "bg-on-primary/15")}>
                  <Icon name={p.icon} size={22} filled={active} />
                </span>
                {!collapsed && (
                  <span className="min-w-0 flex-1">
                    <span className="text-label-sm block text-on-primary/60">0{i + 1}</span>
                    <span className="text-title block truncate">{p.label}</span>
                    <span className="text-label-sm block truncate text-on-primary/70">{p.blurb}</span>
                  </span>
                )}
              </Link>
              {active && p.items && !collapsed && (
                <ul className="mt-1.5 space-y-0.5 ps-6">
                  {p.items.map((item) => {
                    const on = pathname === item.to;
                    return (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          className={cn(
                            "text-body flex items-center gap-2 rounded-full px-3 py-1.5",
                            on ? "bg-on-primary font-semibold text-brand-ink" : "text-on-primary/80 hover:bg-on-primary/10",
                          )}
                        >
                          <Icon name={item.icon} size={18} filled={on} />
                          {t(item.labelKey)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      <button
        onClick={onToggle}
        className={cn("text-label relative mx-3 flex items-center gap-3 rounded-full px-3 py-2 text-on-primary/80 hover:bg-on-primary/10", collapsed && "justify-center px-0")}
      >
        <Icon name={collapsed ? "chevron_right" : "chevron_left"} size={20} className="rtl-flip" />
        {!collapsed && t("shell.collapse")}
      </button>
    </aside>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  // Auto-collapse the sidebar on narrower screens so it doesn't cover the phone preview.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1180px)");
    const apply = () => setCollapsed(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
