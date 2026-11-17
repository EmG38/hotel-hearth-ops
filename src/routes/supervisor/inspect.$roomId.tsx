import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useHotel } from "@/lib/hotel-store";
import { MobileFrame, MobileScreenHeader } from "@/components/MobileFrame";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/supervisor/inspect/$roomId")({
  component: Inspect,
});

const CHECKLIST = [
  { key: "bed", label: "Bed", icon: "bed", hint: "Linen, pillows, spread" },
  { key: "bathroom", label: "Bathroom", icon: "bathtub", hint: "Fixtures, towels, floor" },
  { key: "amenities", label: "Amenities", icon: "local_cafe", hint: "Minibar, kettle, stationery" },
  { key: "general", label: "General", icon: "checkroom", hint: "Dusting, floors, windows" },
] as const;

type CheckKey = (typeof CHECKLIST)[number]["key"];

function Inspect() {
  const { roomId } = Route.useParams();
  const { roomById, staffById, setRoomStatus } = useHotel();
  const navigate = useNavigate();
  const room = roomById(roomId);
  const [checks, setChecks] = useState<Record<CheckKey, boolean>>({
    bed: false,
    bathroom: false,
    amenities: false,
    general: false,
  });
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");

  if (!room) return null;
  const attendant = staffById(room.attendantId);
  const allChecked = CHECKLIST.every((c) => checks[c.key]);
  const checkedCount = CHECKLIST.filter((c) => checks[c.key]).length;

  function back() {
    navigate({ to: "/supervisor/room/$roomId", params: { roomId: room!.id } });
  }

  return (
    <MobileFrame>
      <MobileScreenHeader
        title={`Room ${room.number}`}
        subtitle={`Floor ${room.floor} · ${room.type} · ${attendant?.name ?? "Unassigned"}`}
        onBack={back}
      />
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-label-sm uppercase text-on-surface-subtle">
          {checkedCount} of 4 areas checked
        </p>
        <div className="mt-2 space-y-2">
          {CHECKLIST.map((c) => (
            <button
              key={c.key}
              onClick={() => setChecks((p) => ({ ...p, [c.key]: !p[c.key] }))}
              className={cn(
                "flex w-full items-center gap-3 hk-card border p-3 text-left transition-colors",
                checks[c.key]
                  ? "border-success/40 bg-success/5"
                  : "border-outline-variant bg-surface-container-lowest active:bg-surface-container",
              )}
            >
              <Icon
                name={checks[c.key] ? "check_circle" : "radio_button_unchecked"}
                size={22}
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
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="What needs redoing? This note goes back to the housekeeper."
            className="mt-4 w-full hk-card border border-outline-variant bg-surface-container-lowest p-3 text-body text-on-surface outline-none placeholder:text-on-surface-subtle focus:ring-2 focus:ring-primary/30"
          />
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-outline-variant p-4">
        {rejecting ? (
          <>
            <button
              disabled={note.trim().length === 0}
              onClick={() => {
                setRoomStatus(room.id, "in_progress", `Rejected: ${note.trim()}`);
                toast(`Room ${room.number} sent back to In Progress`);
                back();
              }}
              className="hk-card bg-error py-3.5 text-label font-semibold text-on-primary shadow-soft disabled:opacity-40"
            >
              Reject to In Progress
            </button>
            <button
              disabled={note.trim().length === 0}
              onClick={() => {
                setRoomStatus(room.id, "dirty", `Rejected: ${note.trim()}`);
                toast(`Room ${room.number} sent back to Dirty`);
                back();
              }}
              className="hk-card border border-outline-variant bg-surface py-3.5 text-label font-semibold text-on-surface disabled:opacity-40"
            >
              Reject to Dirty
            </button>
            <button
              onClick={() => setRejecting(false)}
              className="py-2 text-label font-medium text-on-surface-variant"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              disabled={!allChecked}
              onClick={() => {
                setRoomStatus(room.id, "inspected", "Inspection passed");
                toast.success(`Room ${room.number} passed — ready to sell`);
                back();
              }}
              className="hk-card bg-success py-3.5 text-label font-semibold text-on-primary shadow-soft disabled:opacity-40"
            >
              Pass Inspection
            </button>
            <button
              onClick={() => setRejecting(true)}
              className="hk-card border border-error/30 bg-surface py-3.5 text-label font-semibold text-error"
            >
              Reject
            </button>
          </>
        )}
      </div>
    </MobileFrame>
  );
}
