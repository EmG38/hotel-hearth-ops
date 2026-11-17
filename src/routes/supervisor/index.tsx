import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useHotel } from "@/lib/hotel-store";
import type { Room, RoomStatus } from "@/lib/hotel-types";
import { Icon } from "@/components/Icon";
import { MobileFrame } from "@/components/MobileFrame";
import { MobileLoginFlow } from "@/components/supervisor/MobileLoginFlow";
import { RoomRow } from "@/components/supervisor/RoomRow";
import { SupervisorNav } from "@/components/supervisor/SupervisorNav";
import { useOnline } from "@/lib/use-online";
import { wings } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/supervisor/")({
  head: () => ({
    meta: [{ title: "Property Board — Golden Sands Hotel" }],
  }),
  component: SupervisorBoard,
});

type Filter = "active" | "all" | RoomStatus;

const FILTER_TABS: { key: Filter; label: string }[] = [
  { key: "active", label: "Needs action" },
  { key: "dirty", label: "Dirty" },
  { key: "in_progress", label: "In Progress" },
  { key: "clean", label: "Awaiting Insp." },
  { key: "inspected", label: "Ready" },
  { key: "all", label: "All" },
];

const STATUS_PILLS = [
  {
    key: "dirty" as const,
    label: "Dirty",
    tone: "border-error/30 bg-error/5",
    text: "text-error",
    dot: "bg-error",
  },
  {
    key: "in_progress" as const,
    label: "In",
    tone: "border-warning/30 bg-warning/5",
    text: "text-warning",
    dot: "bg-warning",
  },
  {
    key: "clean" as const,
    label: "Awaiting",
    tone: "border-info/30 bg-info/5",
    text: "text-info",
    dot: "bg-info",
  },
  {
    key: "inspected" as const,
    label: "Inspected",
    tone: "border-success/30 bg-success/5",
    text: "text-success",
    dot: "bg-success",
  },
];

function SupervisorBoard() {
  const {
    rooms,
    staffById,
    currentSupervisorId,
    setCurrentSupervisorId,
    supervisors,
    guestRequests,
  } = useHotel();
  const navigate = useNavigate();
  const online = useOnline();
  const me = supervisors.find((s) => s.id === currentSupervisorId);
  const [filter, setFilter] = useState<Filter>("active");
  const [rushOnly, setRushOnly] = useState(false);

  const byStatus = useMemo(() => {
    const g: Record<RoomStatus, Room[]> = { dirty: [], in_progress: [], clean: [], inspected: [] };
    rooms.forEach((r) => g[r.status].push(r));
    return g;
  }, [rooms]);
  const total = rooms.length;
  const readyPct = total ? Math.round((byStatus.inspected.length / total) * 100) : 0;
  const rushCount = rooms.filter((r) => r.rush).length;

  const filtered = useMemo(() => {
    let list =
      filter === "all"
        ? rooms
        : filter === "active"
          ? rooms.filter((r) => r.status !== "inspected")
          : rooms.filter((r) => r.status === filter);
    if (rushOnly) list = list.filter((r) => r.rush);
    return list;
  }, [rooms, filter, rushOnly]);

  const wingGroups = useMemo(() => {
    const map = new Map<number, Room[]>();
    filtered.forEach((r) => {
      const list = map.get(r.wing) ?? [];
      list.push(r);
      map.set(r.wing, list);
    });
    return [...map.entries()]
      .sort(([a], [b]) => a - b)
      .map(([wing, list]) => ({
        wing,
        rooms: list.sort((a, b) => Number(a.number) - Number(b.number)),
      }));
  }, [filtered]);

  const pendingRequests = guestRequests.filter((g) => g.status !== "completed").length;

  return (
    <MobileFrame dark={!me}>
      {!me ? (
        <MobileLoginFlow />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {!online && (
            <div className="flex items-center gap-2 bg-warning/15 px-4 py-2.5 text-label text-warning">
              <Icon name="cloud_off" size={18} filled />
              <span>You're offline — changes are saved here and will sync automatically</span>
            </div>
          )}
          <div className="flex items-center justify-between px-4 pt-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentSupervisorId(null)}
                title="Switch user"
                className="relative"
              >
                <span className="grid size-11 place-items-center rounded-full bg-secondary text-title font-semibold text-on-primary">
                  {me.initials}
                </span>
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-surface bg-success" />
              </button>
              <div>
                <p className="text-label-sm text-on-surface-subtle">Good day,</p>
                <p className="text-title text-on-surface">{me.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate({ to: "/supervisor/requests" })}
                className="relative grid size-9 place-items-center rounded-full bg-surface-container text-on-surface-variant"
              >
                <Icon name="room_service" size={18} />
                {pendingRequests > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-error text-[10px] font-semibold text-on-primary">
                    {pendingRequests}
                  </span>
                )}
              </button>
              <span className="text-label-sm inline-flex items-center gap-1 rounded-full bg-primary-container px-3 py-1.5 font-medium text-primary">
                <Icon name="supervisor_account" size={14} filled />
                Supervisor
              </span>
            </div>
          </div>

          <div className="mx-4 mt-4 overflow-hidden hk-card bg-gradient-to-br from-primary to-secondary p-5 text-on-primary shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-label-sm font-semibold uppercase tracking-wide opacity-90">
                Property Status
              </p>
              {rushCount > 0 && (
                <span className="text-label-sm inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 font-medium">
                  <Icon name="star" size={13} filled />
                  {rushCount} rush
                </span>
              )}
            </div>
            <p className="mt-2 text-3xl font-bold">
              {byStatus.inspected.length}
              <span className="text-xl opacity-80">/{total}</span>
            </p>
            <p className="text-label opacity-90">rooms ready to sell</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white" style={{ width: `${readyPct}%` }} />
            </div>
            <p className="text-label-sm mt-2 opacity-90">{readyPct}% of property ready</p>
          </div>

          <div className="px-4 pt-5">
            <p className="text-title-sm text-on-surface">Status Overview</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {STATUS_PILLS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setFilter(p.key)}
                  className={cn("hk-card border px-2 py-2.5 text-center", p.tone)}
                >
                  <span className={cn("mx-auto mb-1 block size-1.5 rounded-full", p.dot)} />
                  <p className={cn("text-title-lg font-bold", p.text)}>{byStatus[p.key].length}</p>
                  <p className="text-label-sm text-on-surface-subtle">{p.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {FILTER_TABS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "text-label-sm shrink-0 rounded-full border px-3 py-1.5 font-medium transition-colors",
                  filter === f.key
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant bg-surface-container-lowest text-on-surface-variant",
                )}
              >
                {f.label}
              </button>
            ))}
            <button
              onClick={() => setRushOnly((r) => !r)}
              className={cn(
                "text-label-sm inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 font-medium transition-colors",
                rushOnly
                  ? "border-warning bg-warning text-on-primary"
                  : "border-outline-variant bg-surface-container-lowest text-on-surface-variant",
              )}
            >
              <Icon name="star" size={13} filled={rushOnly} />
              Rush
            </button>
          </div>

          <div className="px-4 pb-4 pt-4">
            {wingGroups.length === 0 ? (
              <div className="mt-10 flex flex-col items-center gap-2 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-success/10 text-success">
                  <Icon name="task_alt" size={28} filled />
                </span>
                <p className="text-body text-on-surface-subtle">Nothing matches this filter</p>
              </div>
            ) : (
              wingGroups.map(({ wing, rooms: wingRooms }) => (
                <div key={wing} className="mt-3">
                  <p className="text-label-sm uppercase text-on-surface-subtle">
                    {wings[wing as 1 | 2 | 3 | 4 | 5]?.name ?? `Wing ${wing}`}
                  </p>
                  <div className="mt-1.5 overflow-hidden hk-card border border-outline-variant">
                    {wingRooms.map((r, i) => (
                      <RoomRow
                        key={r.id}
                        room={r}
                        attendant={staffById(r.attendantId)}
                        divider={i > 0}
                        onClick={() =>
                          navigate({ to: "/supervisor/room/$roomId", params: { roomId: r.id } })
                        }
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {me && <SupervisorNav />}
    </MobileFrame>
  );
}
