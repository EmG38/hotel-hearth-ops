import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useHotel } from "@/lib/hotel-store";
import { MobileFrame, MobileScreenHeader } from "@/components/MobileFrame";
import { Icon } from "@/components/Icon";
import { SupervisorAccountButton } from "@/components/supervisor/SupervisorAccountSheet";
import { guestRequestLabel } from "@/lib/mock-data";
import type { GuestRequest } from "@/lib/hotel-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/supervisor/requests")({
  head: () => ({ meta: [{ title: "Guest Requests — Marsa Dhahab Hotel" }] }),
  component: GuestRequestsScreen,
});

const requestIcon: Record<GuestRequest["type"], string> = {
  towels: "dry_cleaning",
  amenities: "local_cafe",
  late_checkout: "schedule",
  housekeeping: "cleaning_services",
  other: "chat",
};

const FILTERS = [
  { key: "open" as const, label: "Open" },
  { key: "all" as const, label: "All" },
];

function GuestRequestsScreen() {
  const { guestRequests, roomById, staff, setGuestRequestStatus } = useHotel();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"open" | "all">("open");

  const list = guestRequests
    .filter((g) => filter === "all" || g.status !== "completed")
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));

  return (
    <MobileFrame>
      <MobileScreenHeader
        title="Guest Requests"
        subtitle={`${list.length} shown`}
        onBack={() => navigate({ to: "/supervisor" })}
        actions={<SupervisorAccountButton />}
      />
      <div className="flex gap-2 px-4 pt-3">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "text-label-sm rounded-full border px-3 py-1.5 font-medium transition-colors",
              filter === f.key
                ? "border-primary bg-primary text-on-primary"
                : "border-outline-variant bg-surface-container-lowest text-on-surface-variant",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
        {list.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-2 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-success/10 text-success">
              <Icon name="task_alt" size={28} filled />
            </span>
            <p className="text-body text-on-surface-subtle">Nothing open</p>
          </div>
        ) : (
          list.map((g) => {
            const room = roomById(g.roomId);
            const assignee = staff.find((s) => s.id === g.assignedTo);
            return (
              <div
                key={g.id}
                className="hk-card bg-surface-container-lowest shadow-soft p-3"
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-container text-primary">
                    <Icon name={requestIcon[g.type]} size={18} filled />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-medium text-on-surface">
                      {guestRequestLabel[g.type]} · Room {room?.number ?? g.roomId}
                    </p>
                    <p className="text-label-sm text-on-surface-subtle">{g.note}</p>
                    <p className="text-label-sm mt-1 text-on-surface-subtle">
                      {g.requestedAt}
                      {assignee ? ` · ${assignee.name}` : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-label-sm shrink-0 rounded-full px-2 py-0.5 font-medium",
                      g.status === "pending"
                        ? "bg-warning/10 text-warning"
                        : g.status === "acknowledged"
                          ? "bg-info/10 text-info"
                          : "bg-success/10 text-success",
                    )}
                  >
                    {g.status}
                  </span>
                </div>
                {g.status !== "completed" && (
                  <div className="mt-2.5 flex gap-2 border-t border-outline-variant pt-2.5">
                    {g.status === "pending" && (
                      <button
                        onClick={() => {
                          setGuestRequestStatus(g.id, "acknowledged");
                          toast(`Acknowledged — Room ${room?.number ?? g.roomId}`);
                        }}
                        className="text-label-sm rounded-full border border-outline-variant px-3 py-1.5 font-medium text-on-surface-variant active:bg-surface-container"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setGuestRequestStatus(g.id, "completed");
                        toast.success(`Completed — Room ${room?.number ?? g.roomId}`);
                      }}
                      className="text-label-sm rounded-full bg-primary px-3 py-1.5 font-medium text-on-primary"
                    >
                      Mark Completed
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </MobileFrame>
  );
}
