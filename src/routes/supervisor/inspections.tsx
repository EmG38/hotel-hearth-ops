import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useHotel } from "@/lib/hotel-store";
import { MobileFrame, MobileScreenHeader } from "@/components/MobileFrame";
import { Icon } from "@/components/Icon";
import { SupervisorNav } from "@/components/supervisor/SupervisorNav";
import { SupervisorAccountButton } from "@/components/supervisor/SupervisorAccountSheet";
import { wings } from "@/lib/mock-data";
import type { RoomType } from "@/lib/hotel-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/supervisor/inspections")({
  head: () => ({ meta: [{ title: "Inspection Queue — Marsa Dhahab Hotel" }] }),
  component: InspectionQueue,
});

const ROOM_TYPES: RoomType[] = ["Standard", "Deluxe", "Suite"];

function InspectionQueue() {
  const { rooms, staff, staffById } = useHotel();
  const navigate = useNavigate();
  const [wing, setWing] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [attendant, setAttendant] = useState<string>("all");
  const [shift, setShift] = useState<string>("all");

  const queue = useMemo(
    () =>
      rooms
        .filter((r) => r.status === "clean")
        .filter((r) => wing === "all" || r.wing === Number(wing))
        .filter((r) => type === "all" || r.type === type)
        .filter((r) => attendant === "all" || r.attendantId === attendant)
        .filter((r) => shift === "all" || staffById(r.attendantId)?.shift === shift)
        .sort((a, b) => Number(b.rush) - Number(a.rush) || a.wing - b.wing),
    [rooms, wing, type, attendant, shift, staffById],
  );

  return (
    <MobileFrame>
      <MobileScreenHeader
        title="Inspection Queue"
        subtitle={`${queue.length} awaiting sign-off`}
        actions={<SupervisorAccountButton />}
      />
      <div className="flex gap-2 overflow-x-auto px-4 pt-3 pb-1">
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
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="text-label-sm shrink-0 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1.5 font-medium text-on-surface-variant"
        >
          <option value="all">All types</option>
          {ROOM_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={shift}
          onChange={(e) => setShift(e.target.value)}
          className="text-label-sm shrink-0 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1.5 font-medium text-on-surface-variant"
        >
          <option value="all">All shifts</option>
          <option value="Morning">Morning</option>
          <option value="Evening">Evening</option>
        </select>
        <select
          value={attendant}
          onChange={(e) => setAttendant(e.target.value)}
          className="text-label-sm shrink-0 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1.5 font-medium text-on-surface-variant"
        >
          <option value="all">Anyone</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pt-2">
        {queue.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-2 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-success/10 text-success">
              <Icon name="task_alt" size={28} filled />
            </span>
            <p className="text-body text-on-surface-subtle">Nothing matches this filter</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {queue.map((r) => {
              const att = staffById(r.attendantId);
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
                      {wings[r.wing].name} · {att?.name ?? "Unassigned"}
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
