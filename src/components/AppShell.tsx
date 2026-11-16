import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { GlobalSearch } from "./GlobalSearch";
import { useHotel } from "@/lib/hotel-store";
import type { Role } from "@/lib/hotel-types";
import logoAsset from "@/assets/hotel-logo.png.asset.json";

const navSections: {
  role: Role;
  label: string;
  items: { to: string; label: string; icon: string }[];
}[] = [
  {
    role: "supervisor",
    label: "Supervisor",
    items: [
      { to: "/", label: "Property Board", icon: "grid_view" },
      { to: "/inspections", label: "Inspections", icon: "fact_check" },
      { to: "/issues", label: "Issues", icon: "report" },
      { to: "/performance", label: "Performance", icon: "monitoring" },
    ],
  },
  {
    role: "reception",
    label: "Reception",
    items: [
      { to: "/availability", label: "Availability", icon: "meeting_room" },
      { to: "/check-in", label: "Check-In", icon: "how_to_reg" },
      { to: "/reservations", label: "Reservations", icon: "event_note" },
    ],
  },
  {
    role: "housekeeper",
    label: "Housekeeper",
    items: [{ to: "/housekeeper", label: "Housekeeper App", icon: "cleaning_services" }],
  },
];

const roleIcon: Record<Role, string> = {
  supervisor: "supervisor_account",
  reception: "concierge",
  housekeeper: "cleaning_services",
};

const roleLabel: Record<Role, string> = {
  supervisor: "Supervisor",
  reception: "Reception",
  housekeeper: "Housekeeper",
};

function RoleSwitcher({ collapsed }: { collapsed: boolean }) {
  const { role, setRole } = useHotel();
  if (collapsed) {
    return (
      <div className="flex flex-col gap-1 px-2">
        {navSections.map((s) => (
          <button
            key={s.role}
            onClick={() => setRole(s.role)}
            title={s.label}
            className={cn(
              "grid h-9 place-items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              role === s.role
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container",
            )}
          >
            <Icon name={roleIcon[s.role]} size={18} />
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="mx-3 flex rounded-full bg-surface-container p-1">
      {navSections.map((s) => (
        <button
          key={s.role}
          onClick={() => setRole(s.role)}
          className={cn(
            "text-label flex-1 rounded-full px-2 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            role === s.role
              ? "bg-surface-container-lowest text-on-surface shadow-soft"
              : "text-on-surface-variant",
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { role } = useHotel();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col gap-4 border-r border-outline-variant bg-surface-container-lowest py-4 transition-[width]",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className={cn("flex items-center gap-2 px-4", collapsed && "justify-center px-2")}>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-container">
          <img src={logoAsset.url} alt="Hotel App logo" className="size-7 object-contain" />
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-title truncate text-on-surface">Hotel App</p>
            <p className="text-label-sm text-on-surface-subtle">Ops console</p>
          </div>
        )}
      </div>

      <RoleSwitcher collapsed={collapsed} />

      <nav className="flex-1 overflow-y-auto">
        {navSections.map((section) => {
          const active = section.role === role || section.items.some((i) => i.to === pathname);
          return (
            <div key={section.role} className={cn("mb-2", !active && "opacity-45")}>
              {!collapsed && (
                <p className="text-label-sm px-5 py-2 uppercase text-on-surface-subtle">
                  {section.label}
                </p>
              )}
              <ul className="space-y-0.5 px-2">
                {section.items.map((item) => {
                  const isActive = pathname === item.to;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        title={item.label}
                        className={cn(
                          "text-body flex items-center gap-3 rounded-full px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          collapsed && "justify-center px-0",
                          isActive
                            ? "bg-primary-container font-semibold text-secondary"
                            : "text-on-surface-variant hover:bg-surface-container",
                        )}
                      >
                        <Icon name={item.icon} size={20} filled={isActive} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <button
        onClick={onToggle}
        className={cn(
          "text-label mx-2 flex items-center gap-3 rounded-full px-3 py-2 text-on-surface-variant hover:bg-surface-container",
          collapsed && "justify-center px-0",
        )}
      >
        <Icon name={collapsed ? "chevron_right" : "chevron_left"} size={20} />
        {!collapsed && "Collapse"}
      </button>
    </aside>
  );
}

function TopBar() {
  const { role, rooms } = useHotel();
  const rush = rooms.filter((r) => r.rush).length;
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-outline-variant bg-surface-container-lowest px-4 md:px-6">
      <GlobalSearch />

      <div className="ml-auto flex items-center gap-3">
        <span className="text-label hidden items-center gap-1.5 rounded-full border border-warning/20 bg-warning/10 px-3 py-1.5 text-warning sm:inline-flex">
          <Icon name="star" size={16} filled />
          {rush} rush
        </span>
        <span className="text-label inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container px-3 py-1.5 text-on-surface-variant">
          <Icon name={roleIcon[role]} size={16} filled />
          {roleLabel[role]}
        </span>
        <span className="grid size-9 place-items-center rounded-full bg-secondary text-label text-on-primary">
          EG
        </span>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
