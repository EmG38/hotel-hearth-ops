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

const STATUS_TABS: { key: Filter; label: string }[] = [
  { key: "active", label: "Needs Action" },
  { key: "dirty", label: "Dirty" },
  { key: "in_progress", label: "In Progress" },
  { key: "clean", label: "Awaiting Insp." },
  { key: "inspected", label: "Ready" },
  { key: "all", label: "All" },
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
  const [wing, setWing] = useState<string>("all");
  const [rushOnly, setRushOnly] = useState(false);
  const [occupiedOnly, setOccupiedOnly] = useState(false);

  const byStatus = useMemo(() => {
    const g: Record<RoomStatus, Room[]> = { dirty: [], in_progress: [], clean: [], inspected: [] };
    rooms.forEach((r) => g[r.status].push(r));
    return g;
  }, [rooms]);
  const total = rooms.length;
  const readyPct = total ? Math.round((byStatus.inspected.length / total) * 100) : 0;
  const rushCount = rooms.filter((r) => r.rush).length;
  const tabCount = (key: Filter) =>
    key === "all"
      ? total
      : key === "active"
        ? total - byStatus.inspected.length
        : byStatus[key].length;

  const filtered = useMemo(() => {
    let list =
      filter === "all"
        ? rooms
        : filter === "active"
          ? rooms.filter((r) => r.status !== "inspected")
          : rooms.filter((r) => r.status === filter);
    if (wing !== "all") list = list.filter((r) => r.wing === Number(wing));
    if (rushOnly) list = list.filter((r) => r.rush);
    if (occupiedOnly) list = list.filter((r) => r.occupancy === "occupied");
    return [...list].sort(
      (a, b) =>
        Number(b.rush) - Number(a.rush) || a.wing - b.wing || Number(a.number) - Number(b.number),
    );
  }, [rooms, filter, wing, rushOnly, occupiedOnly]);

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
          <div className="flex items-center justify-between px-5 pt-3">
            <button
              onClick={() => setCurrentSupervisorId(null)}
              title="Switch user"
              className="relative"
            >
              <span className="grid size-[46px] place-items-center rounded-full bg-secondary text-title font-semibold text-on-primary">
                {me.initials}
              </span>
              <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-surface bg-success" />
            </button>
            <button
              onClick={() => navigate({ to: "/supervisor/requests" })}
              className="relative grid size-11 place-items-center rounded-full bg-surface-container-lowest text-on-surface shadow-soft"
              aria-label="Guest requests"
            >
              <Icon name="room_service" size={20} />
              {pendingRequests > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-error text-[10px] font-semibold text-on-primary">
                  {pendingRequests}
                </span>
              )}
            </button>
          </div>

          <div className="px-5 pt-5">
            <p className="text-label text-on-surface-subtle">Good day, {me.name.split(" ")[0]}</p>
            <h1 className="text-[28px] font-semibold leading-[1.15] tracking-tight text-on-surface">
              Property board,
              <br />
              {total - byStatus.inspected.length} rooms need action
            </h1>
          </div>

          <div className="relative mx-5 mt-5 h-48 overflow-hidden rounded-[28px] shadow-soft">
            {rooms.find((r) => r.photo)?.photo ? (
              <img src={rooms.find((r) => r.photo)!.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <span className="text-label-sm absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 font-semibold text-on-surface">
              <Icon name="supervisor_account" size={14} filled className="text-primary" />
              Property status
            </span>
            {rushCount > 0 && (
              <span className="text-label-sm absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-warning px-3 py-1.5 font-semibold text-on-primary">
                <Icon name="star" size={13} filled />
                {rushCount} rush
              </span>
            )}
            <div className="absolute inset-x-4 bottom-4 text-white">
              <p className="text-4xl font-semibold tracking-tight">
                {byStatus.inspected.length}
                <span className="text-xl opacity-75">/{total}</span>
              </p>
              <p className="text-label opacity-90">rooms ready to sell · {readyPct}%</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
                <div className="h-full rounded-full bg-primary" style={{ width: `${readyPct}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto px-5 pb-1">
            {STATUS_TABS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "text-label shrink-0 rounded-full border px-4 py-2 font-medium transition-colors",
                  filter === f.key
                    ? "border-on-surface bg-on-surface text-surface"
                    : "border-transparent bg-surface-container-lowest text-on-surface-variant shadow-soft",
                )}
              >
                {f.label} · {tabCount(f.key)}
              </button>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-2 overflow-x-auto px-5 pb-1">
            <select
              value={wing}
              onChange={(e) => setWing(e.target.value)}
              className="text-label-sm shrink-0 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1.5 font-medium text-on-surface-variant"
            >
              <option value="all">All wings</option>
              {([1, 2, 3, 4, 5] as const).map((w) => (
                <option key={w} value={w}>
                  {wings[w].name}
                </option>
              ))}
            </select>
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
            <button
              onClick={() => setOccupiedOnly((o) => !o)}
              className={cn(
                "text-label-sm inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 font-medium transition-colors",
                occupiedOnly
                  ? "border-primary bg-primary text-on-primary"
                  : "border-outline-variant bg-surface-container-lowest text-on-surface-variant",
              )}
            >
              <Icon name="person" size={13} filled={occupiedOnly} />
              Occupied
            </button>
          </div>

          <div className="px-5 pb-4 pt-4">
            {filtered.length === 0 ? (
              <div className="mt-10 flex flex-col items-center gap-2 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-success/10 text-success">
                  <Icon name="task_alt" size={28} filled />
                </span>
                <p className="text-body text-on-surface-subtle">Nothing matches this filter</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filtered.map((r, i) => (
                  <RoomRow
                    key={r.id}
                    room={r}
                    attendant={staffById(r.attendantId)}
                    divider={i > 0}
                    showWing
                    onClick={() =>
                      navigate({ to: "/supervisor/room/$roomId", params: { roomId: r.id } })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {me && <SupervisorNav />}
    </MobileFrame>
  );
}
