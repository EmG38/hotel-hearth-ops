import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useHotel } from "@/lib/hotel-store";
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  PageHeader,
  StatTile,
  inputClass,
} from "@/components/ui-kit";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inspections")({
  head: () => ({
    meta: [
      { title: "Inspection Queue — Golden Sands Hotel" },
      {
        name: "description",
        content: "Inspect cleaned rooms against a four-area checklist and pass or reject them.",
      },
      { property: "og:title", content: "Inspection Queue — Golden Sands Hotel" },
      {
        property: "og:description",
        content: "Inspect cleaned rooms against a four-area checklist and pass or reject them.",
      },
    ],
  }),
  component: InspectionQueue,
});

const CHECKLIST = [
  { key: "bed", label: "Bed", icon: "bed", hint: "Linen, pillows, spread" },
  { key: "bathroom", label: "Bathroom", icon: "bathtub", hint: "Fixtures, towels, floor" },
  { key: "amenities", label: "Amenities", icon: "local_cafe", hint: "Minibar, kettle, stationery" },
  { key: "general", label: "General", icon: "checkroom", hint: "Dusting, floors, windows" },
] as const;

type CheckKey = (typeof CHECKLIST)[number]["key"];

function InspectionCard({ roomId }: { roomId: string }) {
  const { roomById, staffById, setRoomStatus } = useHotel();
  const room = roomById(roomId)!;
  const attendant = staffById(room.attendantId);
  const [checks, setChecks] = useState<Record<CheckKey, boolean>>({
    bed: false,
    bathroom: false,
    amenities: false,
    general: false,
  });
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");

  const allChecked = CHECKLIST.every((c) => checks[c.key]);

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-info/10 text-info">
            <Icon name="search_check" size={22} filled />
          </span>
          <div>
            <p className="text-title-lg flex items-center gap-2 text-on-surface">
              Room {room.number}
              {room.rush && <Icon name="star" size={16} filled className="text-warning" />}
            </p>
            <p className="text-label-sm text-on-surface-subtle">
              Floor {room.floor} · {room.type} · cleaned {room.lastUpdated}
            </p>
          </div>
        </div>
        {attendant && (
          <div className="flex items-center gap-2">
            <Avatar staff={attendant} size={28} />
            <span className="text-body-sm text-on-surface-variant">{attendant.name}</span>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {CHECKLIST.map((c) => (
          <button
            key={c.key}
            onClick={() => setChecks((p) => ({ ...p, [c.key]: !p[c.key] }))}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
              checks[c.key]
                ? "border-success/40 bg-success/5"
                : "border-outline-variant hover:bg-surface-container",
            )}
          >
            <Icon
              name={checks[c.key] ? "check_circle" : "radio_button_unchecked"}
              size={20}
              filled={checks[c.key]}
              className={checks[c.key] ? "text-success" : "text-on-surface-subtle"}
            />
            <span className="min-w-0">
              <span className="text-body block font-medium text-on-surface">{c.label}</span>
              <span className="text-label-sm block text-on-surface-subtle">{c.hint}</span>
            </span>
          </button>
        ))}
      </div>

      {rejecting && (
        <div className="mt-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="What needs redoing? This note goes back to the housekeeper."
            className={inputClass}
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <span className="text-label-sm mr-auto text-on-surface-subtle">
          {CHECKLIST.filter((c) => checks[c.key]).length} of 4 areas checked
        </span>
        {rejecting ? (
          <>
            <Button variant="ghost" onClick={() => setRejecting(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon="undo"
              disabled={note.trim().length === 0}
              onClick={() => {
                setRoomStatus(room.id, "in_progress", `Rejected: ${note.trim()}`);
                toast(`Room ${room.number} sent back to In Progress`, {
                  description: attendant ? `Note sent to ${attendant.name}` : undefined,
                  icon: <Icon name="undo" size={18} filled />,
                });
              }}
            >
              Reject to In Progress
            </Button>
            <Button
              variant="outline"
              icon="cleaning_services"
              disabled={note.trim().length === 0}
              onClick={() => {
                setRoomStatus(room.id, "dirty", `Rejected: ${note.trim()}`);
                toast(`Room ${room.number} sent back to Dirty`, {
                  description: attendant ? `Note sent to ${attendant.name}` : undefined,
                  icon: <Icon name="cleaning_services" size={18} filled />,
                });
              }}
            >
              Reject to Dirty
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" icon="close" onClick={() => setRejecting(true)}>
              Reject
            </Button>
            <Button
              variant="success"
              icon="verified"
              disabled={!allChecked}
              onClick={() => {
                setRoomStatus(room.id, "inspected", "Inspection passed");
                toast.success(`Room ${room.number} passed — ready to sell`, {
                  icon: <Icon name="verified" size={18} filled />,
                });
              }}
            >
              Pass inspection
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

function InspectionQueue() {
  const { rooms } = useHotel();
  const queue = rooms
    .filter((r) => r.status === "clean")
    .sort((a, b) => Number(b.rush) - Number(a.rush));
  const inspectedToday = rooms.filter((r) => r.status === "inspected").length;

  return (
    <>
      <PageHeader
        title="Inspection Queue"
        subtitle="Rooms cleaned and awaiting your sign-off, rush-flagged rooms first"
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatTile
          label="Awaiting inspection"
          value={queue.length}
          icon="search_check"
          tone="info"
        />
        <StatTile
          label="Rush in queue"
          value={queue.filter((r) => r.rush).length}
          icon="star"
          tone="warning"
        />
        <StatTile label="Ready on property" value={inspectedToday} icon="verified" tone="success" />
      </div>

      {queue.length === 0 ? (
        <Card>
          <EmptyState
            icon="task_alt"
            title="Queue is clear"
            body="Every cleaned room has been inspected. New rooms appear here as housekeepers finish."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {queue.map((r) => (
            <InspectionCard key={r.id} roomId={r.id} />
          ))}
        </div>
      )}
    </>
  );
}
