import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useHotel } from "@/lib/hotel-store";
import { MobileFrame, MobileScreenHeader } from "@/components/MobileFrame";
import { Icon } from "@/components/Icon";
import { SupervisorNav } from "@/components/supervisor/SupervisorNav";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/supervisor/inspections")({
  head: () => ({ meta: [{ title: "Inspection Queue — Golden Sands Hotel" }] }),
  component: InspectionQueue,
});

function InspectionQueue() {
  const { rooms, staffById } = useHotel();
  const navigate = useNavigate();

  const queue = useMemo(
    () =>
      rooms
        .filter((r) => r.status === "clean")
        .sort((a, b) => Number(b.rush) - Number(a.rush) || a.floor - b.floor),
    [rooms],
  );

  return (
    <MobileFrame>
      <MobileScreenHeader title="Inspection Queue" subtitle={`${queue.length} awaiting sign-off`} />
      <div className="flex-1 overflow-y-auto p-4">
        {queue.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-2 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-success/10 text-success">
              <Icon name="task_alt" size={28} filled />
            </span>
            <p className="text-body text-on-surface-subtle">Queue is clear</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {queue.map((r) => {
              const attendant = staffById(r.attendantId);
              return (
                <button
                  key={r.id}
                  onClick={() =>
                    navigate({ to: "/supervisor/inspect/$roomId", params: { roomId: r.id } })
                  }
                  className={cn(
                    "flex w-full items-center gap-3 hk-card border p-3 text-left active:bg-surface-container",
                    r.rush
                      ? "border-warning/40 bg-warning/5"
                      : "border-outline-variant bg-surface-container-lowest",
                  )}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-info/10 text-title font-semibold text-info">
                    {r.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="text-label text-on-surface">{r.type}</span>
                      {r.rush && <Icon name="star" size={14} filled className="text-warning" />}
                    </span>
                    <span className="text-label-sm block text-on-surface-subtle">
                      Floor {r.floor} · {attendant?.name ?? "Unassigned"}
                    </span>
                  </span>
                  <Icon name="chevron_right" size={20} className="text-on-surface-subtle" />
                </button>
              );
            })}
          </div>
        )}
      </div>
      <SupervisorNav />
    </MobileFrame>
  );
}
