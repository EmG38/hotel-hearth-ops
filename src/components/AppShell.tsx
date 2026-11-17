import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { GlobalSearch } from "./GlobalSearch";
import { useHotel } from "@/lib/hotel-store";
import { useI18n } from "@/lib/i18n";
import type { DictKey } from "@/lib/translations";
import type { Role } from "@/lib/hotel-types";
import logoAsset from "@/assets/marsa-dhahab-emblem.png.asset.json";

const navSections: {
  role: Role;
  labelKey: DictKey;
  items: { to: string; labelKey: DictKey; icon: string }[];
}[] = [
  {
    role: "supervisor",
    labelKey: "role.supervisor",
    items: [{ to: "/supervisor", labelKey: "nav.supervisorApp", icon: "supervisor_account" }],
  },
  {
    role: "reception",
    labelKey: "role.reception",
    items: [
      { to: "/availability", labelKey: "nav.availability", icon: "meeting_room" },
      { to: "/check-in", labelKey: "nav.checkIn", icon: "how_to_reg" },
      { to: "/reservations", labelKey: "nav.reservations", icon: "event_note" },
    ],
  },
  {
    role: "housekeeper",
    labelKey: "role.housekeeper",
    items: [{ to: "/housekeeper", labelKey: "nav.housekeeperApp", icon: "cleaning_services" }],
  },
];

const roleIcon: Record<Role, string> = {
  supervisor: "supervisor_account",
  reception: "concierge",
  housekeeper: "cleaning_services",
};

const roleLabelKey: Record<Role, DictKey> = {
  supervisor: "role.supervisor",
  reception: "role.reception",
  housekeeper: "role.housekeeper",
};

function RoleSwitcher({ collapsed }: { collapsed: boolean }) {
  const { role, setRole } = useHotel();
  const { t } = useI18n();
  if (collapsed) {
    return (
      <div className="flex flex-col gap-1 px-2">
        {navSections.map((s) => (
          <button
            key={s.role}
            onClick={() => setRole(s.role)}
            title={t(s.labelKey)}
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
    <div className="mx-3 flex rounded-3xl bg-surface-container p-1">
      {navSections.map((s) => (
        <button
          key={s.role}
          onClick={() => setRole(s.role)}
          className={cn(
            "text-label-sm flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-0.5 py-1.5 tracking-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            role === s.role
              ? "bg-surface-container-lowest text-on-surface shadow-soft"
              : "text-on-surface-variant",
          )}
        >
          <Icon name={roleIcon[s.role]} size={16} filled={role === s.role} />
          <span className="whitespace-nowrap text-[10px] font-semibold leading-3">
            {t(s.labelKey)}
          </span>
        </button>
      ))}
    </div>
  );
}

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { role } = useHotel();
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col gap-4 border-r border-outline-variant bg-surface-container-lowest py-4 transition-[width]",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className={cn("flex items-center gap-2 px-4", collapsed && "justify-center px-2")}>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-container">
          <img
            src={logoAsset.url}
            alt="Marsa Dhahab Hotel logo"
            className="size-7 object-contain"
          />
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-title truncate tracking-wide text-secondary">{t("app.name")}</p>
            <p className="text-label-sm uppercase tracking-[0.2em] text-tertiary">
              {t("app.tag")}
            </p>
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
                <p
                  className={cn(
                    "text-label-sm px-5 py-2 uppercase",
                    active ? "text-tertiary" : "text-on-surface-subtle",
                  )}
                >
                  {t(section.labelKey)}
                </p>
              )}
              <ul className="space-y-0.5 px-2">
                {section.items.map((item) => {
                  const isActive = pathname === item.to;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        title={t(item.labelKey)}
                        className={cn(
                          "text-body flex items-center gap-3 rounded-full px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          collapsed && "justify-center px-0",
                          isActive
                            ? "bg-primary-container font-semibold text-secondary"
                            : "text-on-surface-variant hover:bg-surface-container",
                        )}
                      >
                        <Icon name={item.icon} size={20} filled={isActive} />
                        {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
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
        <Icon name={collapsed ? "chevron_right" : "chevron_left"} size={20} className="rtl-flip" />
        {!collapsed && t("shell.collapse")}
      </button>
    </aside>
  );
}

function LangSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center rounded-full border border-outline-variant bg-surface-container p-0.5">
      {(
        [
          { key: "en", label: "EN" },
          { key: "ur", label: "اردو" },
        ] as const
      ).map((l) => (
        <button
          key={l.key}
          onClick={() => setLang(l.key)}
          aria-pressed={lang === l.key}
          className={cn(
            "text-label-sm rounded-full px-2.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            lang === l.key
              ? "bg-surface-container-lowest text-on-surface shadow-soft"
              : "text-on-surface-variant",
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

function TopBar() {
  const { role, rooms } = useHotel();
  const { t } = useI18n();
  const rush = rooms.filter((r) => r.rush).length;
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-outline-variant bg-surface-container-lowest px-4 md:px-6">
      <GlobalSearch />

      <div className="ml-auto flex items-center gap-3">
        <LangSwitcher />
        <span className="text-label hidden items-center gap-1.5 rounded-full border border-warning/20 bg-warning/10 px-3 py-1.5 text-warning sm:inline-flex">
          <Icon name="star" size={16} filled />
          {t("shell.rushCount", { n: rush })}
        </span>
        <span className="text-label inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container px-3 py-1.5 text-on-surface-variant">
          <Icon name={roleIcon[role]} size={16} filled className="text-tertiary" />
          {t(roleLabelKey[role])}
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
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
