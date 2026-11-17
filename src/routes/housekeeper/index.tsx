import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useHotel } from "@/lib/hotel-store";
import type { Room } from "@/lib/hotel-types";
import { Avatar } from "@/components/ui-kit";
import { Icon } from "@/components/Icon";
import { MobileFrame } from "@/components/MobileFrame";
import { FloatingNav } from "@/components/mobile/FloatingNav";
import { RoomRow } from "@/components/housekeeper/RoomRow";
import { LoginFlow } from "@/components/housekeeper/LoginFlow";
import { sortByPriority } from "@/lib/housekeeper-room";
import { useOnline } from "@/lib/use-online";
import { useHkLang, setHkLang, useHkT, greetingKey } from "@/lib/housekeeper-i18n";
import { wings } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const WING_PREVIEW_MAX = 3;

export const Route = createFileRoute("/housekeeper/")({
  head: () => ({
    meta: [{ title: "Housekeeper App — Golden Sands Hotel" }],
  }),
  component: HousekeeperHome,
});

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
      {/* Placeholder only — Urdu translation isn't wired up yet. */}
      <button
        type="button"
        disabled
        title="Urdu — coming soon"
        className="cursor-not-allowed rounded-full px-2 py-0.5 text-on-surface-subtle opacity-60"
      >
        اردو
      </button>
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

  const wingGroups = useMemo(() => {
    const map = new Map<number, Room[]>();
    myRooms.forEach((r) => {
      const list = map.get(r.wing) ?? [];
      list.push(r);
      map.set(r.wing, list);
    });
    return [...map.entries()]
      .sort(([a], [b]) => a - b)
      .map(([wing, list]) => ({
        wing,
        total: list.length,
        ready: list.filter((r) => r.status === "inspected").length,
        preview: sortByPriority(list).slice(0, WING_PREVIEW_MAX),
        hasMore: list.length > WING_PREVIEW_MAX,
      }));
  }, [myRooms]);

  return (
    <MobileFrame dark={!me}>
      {!me ? (
        <LoginFlow />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {!online && (
            <div className="flex items-center gap-2 bg-warning/15 px-4 py-2.5 text-label text-warning">
              <Icon name="cloud_off" size={18} filled />
              <span>{t.t("offlineBanner")}</span>
            </div>
          )}
          <div className="flex items-center justify-between px-5 pt-3">
            <button
              onClick={() => setCurrentStaffId(null)}
              title={t.t("switchUser")}
              className="relative"
            >
              <Avatar staff={me} size={46} />
              <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-surface bg-success" />
            </button>
            <div className="flex items-center gap-2">
              <LangToggle />
              <button
                onClick={() => navigate({ to: "/housekeeper/attention" })}
                className="grid size-11 place-items-center rounded-full bg-surface-container-lowest text-on-surface shadow-soft"
                aria-label={t.t("needsAttention")}
              >
                <Icon name="notifications" size={20} />
              </button>
            </div>
          </div>

          <div className="px-5 pt-5">
            <p className="text-label text-on-surface-subtle">{t.t(greetingKey())}</p>
            <h1 className="text-[28px] font-semibold leading-[1.15] tracking-tight text-on-surface">
              {me.name.split(" ")[0]},<br />
              {total - doneCount} {t.t("roomsWord")} to go
            </h1>
          </div>

          <button
            onClick={() => navigate({ to: "/housekeeper/summary" })}
            className="relative mx-5 mt-5 block h-52 w-[calc(100%-2.5rem)] overflow-hidden rounded-[28px] text-left shadow-soft active:scale-[0.99]"
          >
            {myRooms[0]?.photo ? (
              <img src={myRooms[0].photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <span className="text-label-sm absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 font-semibold text-on-surface">
              <Icon name="cleaning_services" size={14} filled className="text-primary" />
              {t.t("todaysShift")}
            </span>
            <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/25 text-white backdrop-blur">
              <Icon name="arrow_outward" size={18} />
            </span>
            <div className="absolute inset-x-4 bottom-4 text-white">
              <p className="text-4xl font-semibold tracking-tight">
                {doneCount}
                <span className="text-xl opacity-75">/{total}</span>
              </p>
              <p className="text-label opacity-90">{t.t("roomsCompleted")}</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2.5 flex gap-1.5">
                <span className="text-label-sm rounded-full bg-white/20 px-2.5 py-1 backdrop-blur">
                  {pct}% {t.t("complete")}
                </span>
                <span className="text-label-sm inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 backdrop-blur">
                  <Icon name="schedule" size={12} />
                  {me.avgMinutes} {t.t("minPerRoom")}
                </span>
              </div>
            </div>
          </button>

          <div className="pt-6">
            <p className="px-5 text-lg font-semibold tracking-tight text-on-surface">{t.t("statusOverview")}</p>
            <div className="mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
              {STATUS_PILLS.map((p) => (
                <div
                  key={p.key}
                  className="flex shrink-0 items-center gap-2 rounded-full bg-surface-container-lowest py-2 pl-2 pr-4 shadow-soft"
                >
                  <span className={cn("grid size-8 place-items-center rounded-full text-label font-bold text-on-primary", p.dot)}>
                    {byStatus[p.key].length}
                  </span>
                  <span className="text-label text-on-surface">{t.t(p.label)}</span>
                </div>
              ))}
            </div>
          </div>

          {needsAttention.length > 0 && (
            <div className="pt-5">
              <div className="flex items-center justify-between px-5">
                <p className="text-lg font-semibold tracking-tight text-on-surface">{t.t("needsAttention")}</p>
                <button
                  onClick={() => navigate({ to: "/housekeeper/attention" })}
                  className="text-label-sm font-medium text-primary"
                >
                  {t.t("seeAll")} →
                </button>
              </div>
              <div className="mt-3 flex snap-x gap-3 overflow-x-auto px-5 pb-1">
                {needsAttention.map((r) => (
                  <button
                    key={r.id}
                    onClick={() =>
                      navigate({ to: "/housekeeper/room/$roomId", params: { roomId: r.id } })
                    }
                    className="relative h-56 w-60 shrink-0 snap-start overflow-hidden rounded-[26px] text-left shadow-soft transition-transform active:scale-[0.97]"
                  >
                    {r.photo ? (
                      <img
                        src={r.photo}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-error/80 to-error" />
                    )}
                    {!r.photo && (
                      <Icon
                        name="bed"
                        size={56}
                        className="absolute -bottom-2 -right-2 text-white/20"
                        filled
                      />
                    )}
                    <span className="text-label-sm absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-error px-2.5 py-1 font-semibold text-on-primary">
                      <span className="size-1.5 rounded-full bg-white" />
                      {t.t("dirty")}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pt-12">
                      <p className="text-2xl font-semibold tracking-tight text-white">{r.number}</p>
                      <div className="mt-2 flex gap-1.5">
                        <span className="text-label-sm inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-white backdrop-blur">
                          <Icon name="bed" size={12} />
                          {r.type}
                        </span>
                        {r.view === "gulf" && (
                          <span className="text-label-sm inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-white backdrop-blur">
                            <Icon name="waves" size={12} />
                            {t.t("gulfView")}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="px-5 pt-6 pb-4">
            <p className="text-lg font-semibold tracking-tight text-on-surface">{t.t("allRooms")}</p>
            {wingGroups.map(({ wing, total, ready, preview, hasMore }) => (
              <div key={wing} className="mt-4">
                <button
                  onClick={() =>
                    navigate({ to: "/housekeeper/wing/$wing", params: { wing: String(wing) } })
                  }
                  className="flex w-full items-center justify-between py-1 active:opacity-60"
                >
                  <p className="text-label-sm uppercase text-on-surface-subtle">
                    {wings[wing as 1 | 2 | 3 | 4 | 5]?.name ?? `${t.t("wing")} ${wing}`}
                  </p>
                  <p className="text-label-sm inline-flex items-center gap-1 text-on-surface-subtle">
                    {ready}/{total} {t.t("ready")}
                    <Icon name="chevron_right" size={14} />
                  </p>
                </button>
                <div className="mt-1.5 flex flex-col gap-2.5">
                  {preview.map((r, i) => (
                    <RoomRow
                      key={r.id}
                      room={r}
                      divider={i > 0}
                      onClick={() =>
                        navigate({ to: "/housekeeper/room/$roomId", params: { roomId: r.id } })
                      }
                    />
                  ))}
                  {hasMore && (
                    <button
                      onClick={() =>
                        navigate({
                          to: "/housekeeper/wing/$wing",
                          params: { wing: String(wing) },
                        })
                      }
                      className="flex w-full items-center justify-center gap-1 rounded-full border border-outline-variant py-2.5 text-label font-medium text-on-surface active:bg-surface-container"
                    >
                      {t.t("viewAll")} {total} {t.t("roomsWord")}
                      <Icon name="chevron_right" size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {wingGroups.length === 0 && (
              <p className="text-body mt-6 text-center text-on-surface-subtle">
                No rooms assigned yet
              </p>
            )}
          </div>
        </div>
      )}

      {me && (
        <FloatingNav
          items={[
            { key: "home", label: t.t("home"), icon: "home", active: true, onClick: () => {} },
            { key: "scan", label: "Scan", icon: "qr_code_scanner", onClick: () => navigate({ to: "/housekeeper/scan" }) },
            { key: "summary", label: t.t("summary"), icon: "assignment", onClick: () => navigate({ to: "/housekeeper/summary" }) },
          ]}
        />
      )}
    </MobileFrame>
  );
}
