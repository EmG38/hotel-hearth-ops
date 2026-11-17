import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useHotel } from "@/lib/hotel-store";
import type { IssueStatus } from "@/lib/hotel-types";
import { MobileFrame, MobileScreenHeader } from "@/components/MobileFrame";
import { Icon } from "@/components/Icon";
import { SupervisorNav } from "@/components/supervisor/SupervisorNav";
import { wings } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/supervisor/issues")({
  head: () => ({ meta: [{ title: "Issue Triage — Marsa Dhahab Hotel" }] }),
  component: IssueTriage,
});

const severityChip: Record<string, string> = {
  high: "bg-error/10 text-error",
  medium: "bg-warning/10 text-warning",
  low: "bg-surface-container-high text-on-surface-variant",
};

const FILTERS: { key: IssueStatus | "all"; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "maintenance", label: "With maintenance" },
  { key: "resolved", label: "Resolved" },
  { key: "all", label: "All" },
];

function IssueTriage() {
  const { issues, roomById, staffById, setIssueStatus, toggleFlag } = useHotel();
  const [filter, setFilter] = useState<IssueStatus | "all">("open");
  const list = issues.filter((i) => filter === "all" || i.status === filter);

  return (
    <MobileFrame>
      <MobileScreenHeader title="Issue Triage" subtitle="Reported by housekeeping" />
      <div className="flex gap-2 overflow-x-auto px-4 pb-1 pt-3">
        {FILTERS.map((f) => (
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
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-3">
        {list.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-2 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-surface-container text-on-surface-subtle">
              <Icon name="inbox" size={28} />
            </span>
            <p className="text-body text-on-surface-subtle">No issues match this filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((issue) => {
              const room = roomById(issue.roomId);
              const reporter = staffById(issue.reportedBy);
              return (
                <div
                  key={issue.id}
                  className="hk-card bg-surface-container-lowest shadow-soft p-3.5"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-label text-on-surface">{issue.title}</p>
                    <span
                      className={cn(
                        "text-label-sm rounded-full px-2 py-0.5 uppercase",
                        severityChip[issue.severity],
                      )}
                    >
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-body-sm mt-1 text-on-surface-variant">{issue.description}</p>
                  <p className="text-label-sm mt-2 text-on-surface-subtle">
                    Room {room?.number} · {room ? wings[room.wing].name : ""}
                    {reporter ? ` · ${reporter.name}` : ""} · {issue.reportedAt}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-outline-variant pt-3">
                    {issue.status !== "resolved" && (
                      <>
                        <button
                          onClick={() => {
                            if (!room) return;
                            const willAdd = !room.flags.includes("oos");
                            toggleFlag(room.id, "oos");
                            toast(
                              `Room ${room.number} ${willAdd ? "marked Out of Service" : "cleared"}`,
                            );
                          }}
                          className="text-label-sm rounded-full border border-outline-variant px-3 py-1.5 font-medium text-on-surface-variant active:bg-surface-container"
                        >
                          {room?.flags.includes("oos") ? "Clear OOS" : "Out of Service"}
                        </button>
                        <button
                          onClick={() => {
                            if (!room) return;
                            const willAdd = !room.flags.includes("ooo");
                            toggleFlag(room.id, "ooo");
                            toast(
                              `Room ${room.number} ${willAdd ? "marked Out of Order" : "cleared"}`,
                            );
                          }}
                          className="text-label-sm rounded-full border border-outline-variant px-3 py-1.5 font-medium text-on-surface-variant active:bg-surface-container"
                        >
                          {room?.flags.includes("ooo") ? "Clear OOO" : "Out of Order"}
                        </button>
                      </>
                    )}
                    {issue.status === "open" ? (
                      <button
                        onClick={() => {
                          setIssueStatus(issue.id, "maintenance");
                          toast(`"${issue.title}" assigned to maintenance`);
                        }}
                        className="text-label-sm ml-auto rounded-full bg-primary px-3 py-1.5 font-medium text-on-primary"
                      >
                        Assign to maintenance
                      </button>
                    ) : issue.status === "maintenance" ? (
                      <button
                        onClick={() => {
                          setIssueStatus(issue.id, "resolved");
                          toast.success(`"${issue.title}" marked resolved`);
                        }}
                        className="text-label-sm ml-auto rounded-full bg-success px-3 py-1.5 font-medium text-on-primary"
                      >
                        Mark resolved
                      </button>
                    ) : (
                      <button
                        onClick={() => setIssueStatus(issue.id, "open")}
                        className="text-label-sm ml-auto rounded-full border border-outline-variant px-3 py-1.5 font-medium text-on-surface-variant"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <SupervisorNav />
    </MobileFrame>
  );
}
