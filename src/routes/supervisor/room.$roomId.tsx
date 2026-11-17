import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useHotel } from "@/lib/hotel-store";
import { Icon } from "@/components/Icon";
import { MobileFrame } from "@/components/MobileFrame";
import { wings } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/supervisor/room/$roomId")({
  component: SupervisorRoomDetail,
});

const heroTone: Record<string, string> = {
  dirty: "from-error/80 to-error",
  in_progress: "from-warning/80 to-warning",
  clean: "from-info/80 to-info",
  inspected: "from-success/80 to-success",
};

const pillTone: Record<string, string> = {
  dirty: "bg-error/10 text-error",
  in_progress: "bg-warning/10 text-warning",
  clean: "bg-info/10 text-info",
  inspected: "bg-success/10 text-success",
};

const statusLabel: Record<string, string> = {
  dirty: "Dirty",
  in_progress: "In Progress",
  clean: "Clean, awaiting inspection",
  inspected: "Inspected / Ready",
};

function SupervisorRoomDetail() {
  const { roomId } = Route.useParams();
  const { roomById, staff, staffById, workload, assignRoom, toggleRush, toggleFlag } = useHotel();
  const navigate = useNavigate();
  const room = roomById(roomId);
  const [assigning, setAssigning] = useState(false);

  if (!room) return null;

  const status = room.status;
  const attendant = staffById(room.attendantId);

  return (
    <MobileFrame dark>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="relative flex h-80 shrink-0 flex-col justify-between overflow-hidden p-5 pb-12 pt-14">
          {room.photo ? (
            <>
              <img
                src={room.photo}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/35" />
            </>
          ) : (
            <>
              <div className={cn("absolute inset-0 bg-gradient-to-br", heroTone[status])} />
              <Icon
                name="bed"
                size={140}
                filled
                className="pointer-events-none absolute -bottom-6 -right-6 text-white/15"
              />
            </>
          )}
          <div className="relative flex items-start justify-between">
            <button
              onClick={() => navigate({ to: "/supervisor" })}
              className="grid size-10 place-items-center rounded-full bg-white/90 text-on-surface shadow-soft"
            >
              <Icon name="chevron_left" size={22} />
            </button>
            <div className="flex items-center gap-2">
              {room.rush && (
                <button
                  onClick={() => toggleRush(room.id)}
                  className="grid size-10 place-items-center rounded-full bg-warning text-on-primary shadow-soft"
                >
                  <Icon name="star" size={18} filled />
                </button>
              )}
              <span className="text-label-sm rounded-full bg-white/25 px-3 py-1 font-medium text-white">
                {wings[room.wing].name}
              </span>
            </div>
          </div>
          <div className="relative">
            <p className="text-label-sm text-white/80">{room.type}</p>
            <p className="text-4xl font-semibold tracking-tight text-white">Room {room.number}</p>
          </div>
        </div>

        <div className="relative z-10 -mt-8 flex-1 rounded-t-[32px] bg-surface p-5">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-label-sm inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium",
                pillTone[status],
              )}
            >
              <span className="size-1.5 rounded-full bg-current" />
              {statusLabel[status]}
            </span>
            <span className="text-label-sm text-on-surface-subtle">Updated {room.lastUpdated}</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="text-label-sm inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 text-on-surface-variant">
              <Icon
                name={room.view === "gulf" ? "waves" : room.view === "garden" ? "park" : "deck"}
                size={12}
                filled
              />
              {room.view === "gulf"
                ? "Gulf View"
                : room.view === "garden"
                  ? "Garden View"
                  : "Courtyard View"}
            </span>
            <span className="text-label-sm inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 text-on-surface-variant">
              <Icon name={room.occupancy === "occupied" ? "person" : "person_off"} size={12} />
              {room.occupancy === "occupied" ? "Occupied" : "Vacant"}
            </span>
            {room.taskType === "reclean" && (
              <span className="text-label-sm rounded-full bg-error/10 px-2 py-0.5 font-medium text-error">
                Re-clean
              </span>
            )}
          </div>

          {room.flags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {room.flags.map((f) => (
                <span
                  key={f}
                  className="text-label-sm rounded-full bg-surface-container px-2 py-0.5 text-on-surface-variant"
                >
                  {f === "ooo" ? "Out of Order" : f === "oos" ? "Out of Service" : "Do Not Disturb"}
                </span>
              ))}
            </div>
          )}

          {status === "clean" && (
            <button
              onClick={() =>
                navigate({ to: "/supervisor/inspect/$roomId", params: { roomId: room.id } })
              }
              className="mt-4 flex w-full items-center justify-center gap-2 hk-card bg-primary py-3.5 text-label font-semibold text-on-primary shadow-soft active:scale-[0.98]"
            >
              <Icon name="search_check" size={18} />
              Inspect Now
            </button>
          )}

          <p className="text-label-sm mt-5 uppercase text-on-surface-subtle">Housekeeper</p>
          {!assigning ? (
            <button
              onClick={() => setAssigning(true)}
              className="mt-1.5 flex w-full items-center gap-3 hk-card bg-surface-container-lowest shadow-soft p-3 text-left active:bg-surface-container"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-label font-semibold text-on-primary">
                {attendant?.initials ?? "?"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-body block text-on-surface">
                  {attendant?.name ?? "Unassigned"}
                </span>
                <span className="text-label-sm block text-on-surface-subtle">Tap to reassign</span>
              </span>
              <Icon name="chevron_right" size={20} className="text-on-surface-subtle" />
            </button>
          ) : (
            <div className="mt-1.5 overflow-hidden hk-card border border-outline-variant">
              {staff.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => {
                    assignRoom(room.id, s.id);
                    toast.success(`Room ${room.number} assigned to ${s.name}`);
                    setAssigning(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 bg-surface-container-lowest p-3 text-left active:bg-surface-container",
                    i > 0 && "border-t border-outline-variant",
                    s.id === room.attendantId && "bg-primary-container",
                  )}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-label font-semibold text-on-primary">
                    {s.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-body block text-on-surface">{s.name}</span>
                    <span className="text-label-sm block text-on-surface-subtle">
                      {workload(s.id)} active rooms
                    </span>
                  </span>
                  {s.id === room.attendantId && (
                    <Icon name="check" size={18} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}

          <p className="text-label-sm mt-5 uppercase text-on-surface-subtle">Availability</p>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const willAdd = !room.flags.includes("oos");
                toggleFlag(room.id, "oos");
                toast(willAdd ? `Room ${room.number} marked Out of Service` : `Room ${room.number} back in service`);
              }}
              aria-pressed={room.flags.includes("oos")}
              className={cn(
                "flex flex-col items-start gap-1 hk-card border-2 px-3 py-3 text-left text-label font-semibold transition-colors",
                room.flags.includes("oos")
                  ? "border-oos bg-oos text-on-primary shadow-soft"
                  : "border-dashed border-outline-variant bg-surface-container-lowest text-on-surface-variant",
              )}
            >
              <span className="flex w-full items-center justify-between">
                <Icon name="build_circle" size={20} filled={room.flags.includes("oos")} />
                <Icon name={room.flags.includes("oos") ? "toggle_on" : "toggle_off"} size={24} filled />
              </span>
              Out of Service
              <span className="text-label-sm font-medium opacity-80">
                {room.flags.includes("oos") ? "Active · tap to clear" : "Not set · tap to mark"}
              </span>
            </button>
            <button
              onClick={() => {
                const willAdd = !room.flags.includes("ooo");
                toggleFlag(room.id, "ooo");
                toast(willAdd ? `Room ${room.number} marked Out of Order` : `Room ${room.number} Out of Order cleared`);
              }}
              aria-pressed={room.flags.includes("ooo")}
              className={cn(
                "flex flex-col items-start gap-1 hk-card border-2 px-3 py-3 text-left text-label font-semibold transition-colors",
                room.flags.includes("ooo")
                  ? "border-ooo bg-ooo text-on-primary shadow-soft"
                  : "border-dashed border-outline-variant bg-surface-container-lowest text-on-surface-variant",
              )}
            >
              <span className="flex w-full items-center justify-between">
                <Icon name="block" size={20} filled={room.flags.includes("ooo")} />
                <Icon name={room.flags.includes("ooo") ? "toggle_on" : "toggle_off"} size={24} filled />
              </span>
              Out of Order
              <span className="text-label-sm font-medium opacity-80">
                {room.flags.includes("ooo") ? "Active · tap to clear" : "Not set · tap to mark"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
