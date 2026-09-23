import { useState } from "react";
import { SidePanel } from "../SidePanel";
import { Avatar, Button, Chip, FlagChip, StatusChip } from "../ui-kit";
import { Icon } from "../Icon";
import { useHotel } from "@/lib/hotel-store";
import type { Room, RoomStatus } from "@/lib/hotel-types";
import { STATUS_ORDER, statusMeta } from "@/lib/room-status";
import { cn } from "@/lib/utils";

export function AssignPanel({ room, onClose }: { room: Room | null; onClose: () => void }) {
  const { staff, workload, assignRoom, toggleRush, toggleFlag, setRoomStatus, issues } = useHotel();
  const [picked, setPicked] = useState<string | null>(null);

  if (!room) return null;
  const selected = picked ?? room.attendantId;
  const roomIssues = issues.filter((i) => i.roomId === room.id && i.status !== "resolved");

  return (
    <SidePanel
      open
      title={`Room ${room.number}`}
      subtitle={`Floor ${room.floor} · ${room.type} · updated ${room.lastUpdated}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon="assignment_ind"
            disabled={!selected || selected === room.attendantId}
            onClick={() => {
              if (selected) assignRoom(room.id, selected);
              onClose();
            }}
          >
            {room.attendantId ? "Reassign room" : "Assign room"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip status={room.status} />
          {room.flags.map((f) => (
            <FlagChip key={f} flag={f} />
          ))}
          {room.rush && (
            <span className="text-label-sm inline-flex items-center gap-1 rounded-full border border-warning/20 bg-warning/10 px-2 py-0.5 uppercase text-warning">
              <Icon name="star" size={13} filled /> Rush
            </span>
          )}
        </div>

        <section>
          <p className="text-label-sm mb-2 uppercase text-on-surface-subtle">Housekeeper</p>
          <ul className="space-y-1.5">
            {staff.map((s) => {
              const load = workload(s.id);
              const active = selected === s.id;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setPicked(s.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors",
                      active
                        ? "border-primary bg-primary-container"
                        : "border-outline-variant hover:bg-surface-container",
                    )}
                  >
                    <Avatar staff={s} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="text-body block truncate font-medium text-on-surface">
                        {s.name}
                      </span>
                      <span className="text-label-sm block text-on-surface-subtle">
                        {s.shift} shift · {load} open {load === 1 ? "room" : "rooms"}
                      </span>
                    </span>
                    {active && <Icon name="check_circle" size={20} filled className="text-primary" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <p className="text-label-sm mb-2 uppercase text-on-surface-subtle">Override status</p>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_ORDER.map((s: RoomStatus) => (
              <Chip
                key={s}
                active={room.status === s}
                onClick={() => setRoomStatus(room.id, s)}
              >
                <Icon name={statusMeta[s].icon} size={14} filled />
                {statusMeta[s].short}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <p className="text-label-sm mb-2 uppercase text-on-surface-subtle">Flags</p>
          <div className="flex flex-wrap gap-1.5">
            <Chip active={room.rush} onClick={() => toggleRush(room.id)}>
              <Icon name="star" size={14} filled /> Rush
            </Chip>
            <Chip active={room.flags.includes("ooo")} onClick={() => toggleFlag(room.id, "ooo")}>
              <Icon name="build" size={14} filled /> Out of Order
            </Chip>
            <Chip active={room.flags.includes("oos")} onClick={() => toggleFlag(room.id, "oos")}>
              <Icon name="do_not_disturb_on" size={14} filled /> Out of Service
            </Chip>
            <Chip active={room.flags.includes("dnd")} onClick={() => toggleFlag(room.id, "dnd")}>
              <Icon name="bedtime" size={14} filled /> DND
            </Chip>
          </div>
        </section>

        {roomIssues.length > 0 && (
          <section>
            <p className="text-label-sm mb-2 uppercase text-on-surface-subtle">Open issues</p>
            <ul className="space-y-1.5">
              {roomIssues.map((i) => (
                <li
                  key={i.id}
                  className="text-body-sm flex items-start gap-2 rounded-xl bg-surface-container p-2.5 text-on-surface-variant"
                >
                  <Icon name="report" size={16} filled className="mt-0.5 text-error" />
                  <span>
                    <span className="font-medium text-on-surface">{i.title}</span> · {i.category}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {room.notes.length > 0 && (
          <section>
            <p className="text-label-sm mb-2 uppercase text-on-surface-subtle">Activity</p>
            <ul className="text-body-sm space-y-1 text-on-surface-variant">
              {room.notes.map((n, idx) => (
                <li key={idx} className="rounded-xl bg-surface-container p-2.5">
                  {n}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </SidePanel>
  );
}
