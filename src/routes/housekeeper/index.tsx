import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useHotel } from "@/lib/hotel-store";
import type { Room } from "@/lib/hotel-types";
import { Avatar } from "@/components/ui-kit";
import { Icon } from "@/components/Icon";
import { MobileFrame } from "@/components/MobileFrame";
import { useHkLang, setHkLang, useHkT, greetingKey, timeAgo } from "@/lib/housekeeper-i18n";
import { cn } from "@/lib/utils";

function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

export const Route = createFileRoute("/housekeeper/")({
  head: () => ({
    meta: [{ title: "Housekeeper App — Hotel App" }],
  }),
  component: HousekeeperHome,
});

function SignInPicker() {
  const { staff, setCurrentStaffId } = useHotel();
  const t = useHkT();
  return (
    <div className="flex flex-1 flex-col px-5 py-6">
      <p className="text-title text-on-surface">{t.t("signIn")}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {staff.map((s) => (
          <button
            key={s.id}
            onClick={() => setCurrentStaffId(s.id)}
            className="flex flex-col items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Avatar staff={s} size={56} />
            <span className="text-label text-on-surface">{s.name}</span>
            <span className="text-label-sm text-on-surface-subtle">{s.shift} shift</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const STATUS_PILLS = [
  {
    key: "dirty" as const,
    label: "dirty" as const,
    tone: "border-error/30 bg-error/5",
    text: "text-error",
    dot: "bg-error",
  },
  {
    key: "in_progress" as const,
    label: "inProgressShort" as const,
    tone: "border-warning/30 bg-warning/5",
    text: "text-warning",
    dot: "bg-warning",
  },
  {
    key: "clean" as const,
    label: "awaitingShort" as const,
    tone: "border-info/30 bg-info/5",
    text: "text-info",
    dot: "bg-info",
  },
  {
    key: "inspected" as const,
    label: "inspectedShort" as const,
    tone: "border-success/30 bg-success/5",
    text: "text-success",
    dot: "bg-success",
  },
];

const badgeTone: Record<Room["status"], string> = {
  dirty: "bg-error/10 text-error",
  in_progress: "bg-warning/10 text-warning",
  clean: "bg-info/10 text-info",
  inspected: "bg-success/10 text-success",
};

const statusLabelKey: Record<
  Room["status"],
  "statusDirty" | "statusInProgress" | "statusAwaiting" | "statusInspected"
> = {
  dirty: "statusDirty",
  in_progress: "statusInProgress",
  clean: "statusAwaiting",
  inspected: "statusInspected",
};

function LangToggle() {
  const lang = useHkLang();
  return (
    <div className="flex rounded-full bg-surface-container p-0.5 text-label-sm">
      {(["en", "hi"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setHkLang(l)}
          className={cn(
            "rounded-full px-2 py-0.5 transition-colors",
            lang === l
              ? "bg-surface-container-lowest text-on-surface shadow-soft"
              : "text-on-surface-variant",
          )}
        >
          {l === "en" ? "EN" : "हि"}
        </button>
      ))}
    </div>
  );
}

function HousekeeperHome() {
  const { rooms, currentStaffId, setCurrentStaffId, staffById } = useHotel();
  const navigate = useNavigate();
  const t = useHkT();
  const online = useOnline();
  const me = staffById(currentStaffId);

  const myRooms = useMemo(
    () => rooms.filter((r) => r.attendantId === currentStaffId),
    [rooms, currentStaffId],
  );
  const byStatus = useMemo(() => {
    const g: Record<Room["status"], Room[]> = {
      dirty: [],
      in_progress: [],
      clean: [],
      inspected: [],
    };
    myRooms.forEach((r) => g[r.status].push(r));
    return g;
  }, [myRooms]);
  const total = myRooms.length;
  const doneCount = byStatus.inspected.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const needsAttention = byStatus.dirty.slice(0, 6);

  const floors = useMemo(() => {
    const map = new Map<number, Room[]>();
    myRooms.forEach((r) => {
      const list = map.get(r.floor) ?? [];
      list.push(r);
      map.set(r.floor, list);
    });
    return [...map.entries()]
      .sort(([a], [b]) => a - b)
      .map(([floor, list]) => ({
        floor,
        rooms: list.sort((a, b) => Number(a.number) - Number(b.number)),
        ready: list.filter((r) => r.status === "inspected").length,
      }));
  }, [myRooms]);

  return (
    <MobileFrame>
      {!me ? (
        <SignInPicker />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {!online && (
            <div className="flex items-center justify-end gap-1.5 px-4 pt-3 text-label-sm text-on-surface-variant">
              <Icon name="cloud_off" size={14} />
              {t.t("offline")}
            </div>
          )}
          <div className="flex items-center justify-between px-4 pt-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentStaffId(null)}
                title={t.t("switchUser")}
                className="relative"
              >
                <Avatar staff={me} size={44} />
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-surface bg-success" />
              </button>
              <div>
                <p className="text-label-sm text-on-surface-subtle">{t.t(greetingKey())}</p>
                <p className="text-title text-on-surface">{me.name}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-label-sm inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1.5 font-medium text-success">
                <Icon name="cleaning_services" size={14} filled />
                {t.t("housekeeper")}
              </span>
              <LangToggle />
            </div>
          </div>

          <div className="mx-4 mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-success p-5 text-on-primary shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-label-sm font-semibold uppercase tracking-wide opacity-90">
                {t.t("todaysShift")}
              </p>
              <button
                onClick={() => navigate({ to: "/housekeeper/summary" })}
                className="text-label-sm rounded-full bg-white/20 px-3 py-1 font-medium"
              >
                {t.t("summary")} →
              </button>
            </div>
            <p className="mt-2 text-3xl font-bold">
              {doneCount}
              <span className="text-xl opacity-80">/{total}</span>
            </p>
            <p className="text-label opacity-90">{t.t("roomsCompleted")}</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-label-sm mt-2 opacity-90">
              {pct}% {t.t("complete")} · {t.t("avgPerRoom")} {me.avgMinutes} {t.t("minPerRoom")}
            </p>
          </div>

          <div className="px-4 pt-5">
            <p className="text-title-sm text-on-surface">{t.t("statusOverview")}</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {STATUS_PILLS.map((p) => (
                <div
                  key={p.key}
                  className={cn("rounded-2xl border px-2 py-2.5 text-center", p.tone)}
                >
                  <span className={cn("mx-auto mb-1 block size-1.5 rounded-full", p.dot)} />
                  <p className={cn("text-title-lg font-bold", p.text)}>{byStatus[p.key].length}</p>
                  <p className="text-label-sm text-on-surface-subtle">{t.t(p.label)}</p>
                </div>
              ))}
            </div>
          </div>

          {needsAttention.length > 0 && (
            <div className="pt-5">
              <div className="flex items-center justify-between px-4">
                <p className="text-title-sm text-on-surface">{t.t("needsAttention")}</p>
                <button className="text-label-sm font-medium text-primary">
                  {t.t("seeAll")} →
                </button>
              </div>
              <div className="mt-2 flex gap-3 overflow-x-auto px-4 pb-1">
                {needsAttention.map((r) => (
                  <button
                    key={r.id}
                    onClick={() =>
                      navigate({ to: "/housekeeper/room/$roomId", params: { roomId: r.id } })
                    }
                    className="relative h-28 w-36 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-error/80 to-error text-left"
                  >
                    <Icon
                      name="bed"
                      size={56}
                      className="absolute -bottom-2 -right-2 text-white/20"
                      filled
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2.5">
                      <p className="text-label font-semibold text-white">Rm {r.number}</p>
                      <p className="text-label-sm text-white/80">{r.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="px-4 pt-5 pb-4">
            <p className="text-title-sm text-on-surface">{t.t("allRooms")}</p>
            {floors.map(({ floor, rooms: floorRooms, ready }) => (
              <div key={floor} className="mt-3">
                <div className="flex items-center justify-between">
                  <p className="text-label-sm uppercase text-on-surface-subtle">
                    {t.t("floor")} {floor}
                  </p>
                  <p className="text-label-sm text-on-surface-subtle">
                    {ready}/{floorRooms.length} {t.t("ready")}
                  </p>
                </div>
                <div className="mt-1.5 overflow-hidden rounded-2xl border border-outline-variant">
                  {floorRooms.map((r, i) => (
                    <button
                      key={r.id}
                      onClick={() =>
                        navigate({ to: "/housekeeper/room/$roomId", params: { roomId: r.id } })
                      }
                      className={cn(
                        "flex w-full items-center gap-3 bg-surface-container-lowest px-3 py-3 text-left hover:bg-surface-container",
                        i > 0 && "border-t border-outline-variant",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-11 shrink-0 place-items-center rounded-xl text-title font-semibold",
                          badgeTone[r.status],
                        )}
                      >
                        {r.number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-label text-on-surface">{r.type}</p>
                          {r.flags.includes("dnd") && (
                            <span className="text-label-sm inline-flex items-center gap-1 rounded-full bg-surface-container px-1.5 py-0.5 text-on-surface-variant">
                              <Icon name="do_not_disturb_on" size={12} />
                              DND
                            </span>
                          )}
                          {r.flags.includes("ooo") && (
                            <span className="text-label-sm rounded-full bg-on-surface px-1.5 py-0.5 text-on-primary">
                              Out of Order
                            </span>
                          )}
                        </div>
                        <p className="text-label-sm text-on-surface-subtle">
                          {timeAgo(r.lastUpdated, t)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-label-sm inline-flex items-center gap-1.5 shrink-0",
                          badgeTone[r.status].split(" ")[1],
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            STATUS_PILLS.find((p) => p.key === r.status)?.dot,
                          )}
                        />
                        {t.t(statusLabelKey[r.status])}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {floors.length === 0 && (
              <p className="text-body mt-6 text-center text-on-surface-subtle">
                No rooms assigned yet
              </p>
            )}
          </div>
        </div>
      )}

      {me && (
        <nav className="flex shrink-0 items-center justify-around border-t border-outline-variant bg-surface-container-lowest py-2">
          <button className="flex flex-col items-center gap-0.5 px-4 py-1 text-primary">
            <Icon name="home" size={22} filled />
            <span className="text-label-sm font-medium">{t.t("home")}</span>
          </button>
          <button
            onClick={() => navigate({ to: "/housekeeper/scan" })}
            className="-mt-6 grid size-14 place-items-center rounded-full bg-primary text-on-primary shadow-soft active:scale-95"
          >
            <Icon name="qr_code_scanner" size={24} />
          </button>
          <button
            onClick={() => navigate({ to: "/housekeeper/summary" })}
            className="flex flex-col items-center gap-0.5 px-4 py-1 text-on-surface-variant"
          >
            <Icon name="assignment" size={22} />
            <span className="text-label-sm">{t.t("summary")}</span>
          </button>
        </nav>
      )}
    </MobileFrame>
  );
}
