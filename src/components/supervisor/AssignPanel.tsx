import { useState } from "react";
import { toast } from "sonner";
import { SidePanel } from "../SidePanel";
import { Avatar, Button, Chip, FlagChip, StatusChip } from "../ui-kit";
import { Icon } from "../Icon";
import { useHotel } from "@/lib/hotel-store";
import type { Room, RoomStatus } from "@/lib/hotel-types";
import { STATUS_ORDER, flagMeta, statusMeta } from "@/lib/room-status";
import { wings } from "@/lib/mock-data";
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
      subtitle={`${wings[room.wing].name} · ${room.type} · updated ${room.lastUpdated}`}
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
              if (selected) {
                assignRoom(room.id, selected);
                const name = staff.find((s) => s.id === selected)?.name ?? "attendant";
                toast.success(`Room ${room.number} assigned to ${name}`, {
                  icon: <Icon name="assignment_ind" size={18} filled />,
                });
              }
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
                    {active && (
                      <Icon name="check_circle" size={20} filled className="text-primary" />
                    )}
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
                onClick={() => {
                  if (room.status === s) return;
                  setRoomStatus(room.id, s);
                  toast(`Room ${room.number} marked ${statusMeta[s].label}`, {
                    icon: <Icon name={statusMeta[s].icon} size={18} filled />,
                  });
                }}
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
            <Chip
              active={room.rush}
              onClick={() => {
                const next = !room.rush;
                toggleRush(room.id);
                toast(
                  next
                    ? `Room ${room.number} flagged Rush`
                    : `Rush flag removed from Room ${room.number}`,
                  {
                    icon: <Icon name="star" size={18} filled />,
                  },
                );
              }}
            >
              <Icon name="star" size={14} filled /> Rush
            </Chip>
            {(["ooo", "oos", "dnd"] as const).map((flag) => (
              <Chip
                key={flag}
                active={room.flags.includes(flag)}
                onClick={() => {
                  const willAdd = !room.flags.includes(flag);
                  toggleFlag(room.id, flag);
                  toast(
                    `${flagMeta[flag].label} ${willAdd ? "added to" : "cleared from"} Room ${room.number}`,
                    { icon: <Icon name={flagMeta[flag].icon} size={18} filled /> },
                  );
                }}
              >
                <Icon name={flagMeta[flag].icon} size={14} filled /> {flagMeta[flag].label}
              </Chip>
            ))}
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
