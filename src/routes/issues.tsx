import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useHotel } from "@/lib/hotel-store";
import { Avatar, Button, Card, Chip, EmptyState, PageHeader, StatTile } from "@/components/ui-kit";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import type { IssueStatus } from "@/lib/hotel-types";

export const Route = createFileRoute("/issues")({
  head: () => ({
    meta: [
      { title: "Issue Triage — Golden Sands Hotel" },
      {
        name: "description",
        content:
          "Triage housekeeper-reported room issues: send to maintenance or block the room from sale.",
      },
      { property: "og:title", content: "Issue Triage — Golden Sands Hotel" },
      {
        property: "og:description",
        content:
          "Triage housekeeper-reported room issues: send to maintenance or block the room from sale.",
      },
    ],
  }),
  component: IssueTriage,
});

const severityChip: Record<string, string> = {
  high: "bg-error/10 text-error border-error/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-surface-container-high text-on-surface-variant border-outline-variant",
};

function PhotoThumb({ tag }: { tag: string }) {
  return (
    <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high">
      <Icon name="image" size={22} className="text-on-surface-subtle" />
      <span className="text-label-sm absolute bottom-0 w-full truncate bg-on-surface/60 px-1 text-center text-on-primary">
        {tag}
      </span>
    </span>
  );
}

function IssueTriage() {
  const { issues, roomById, staffById, setIssueStatus, toggleFlag } = useHotel();
  const [filter, setFilter] = useState<IssueStatus | "all">("open");

  const list = issues.filter((i) => filter === "all" || i.status === filter);

  return (
    <>
      <PageHeader
        title="Issue Triage"
        subtitle="Reported from the housekeeping mobile app during cleaning rounds"
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatTile
          label="Open"
          value={issues.filter((i) => i.status === "open").length}
          icon="report"
          tone="error"
        />
        <StatTile
          label="With maintenance"
          value={issues.filter((i) => i.status === "maintenance").length}
          icon="handyman"
          tone="warning"
        />
        <StatTile
          label="Resolved today"
          value={issues.filter((i) => i.status === "resolved").length}
          icon="task_alt"
          tone="success"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["open", "maintenance", "resolved", "all"] as const).map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === "all" ? "All issues" : f === "maintenance" ? "With maintenance" : f}
          </Chip>
        ))}
      </div>

      {list.length === 0 ? (
        <Card>
          <EmptyState icon="inbox" title="Nothing here" body="No issues match this filter." />
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((issue) => {
            const room = roomById(issue.roomId);
            const reporter = staffById(issue.reportedBy);
            return (
              <Card key={issue.id} className="p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex gap-2">
                    {issue.photos.length > 0 ? (
                      issue.photos.map((p) => <PhotoThumb key={p} tag={p} />)
                    ) : (
                      <span className="grid size-16 place-items-center rounded-xl border border-dashed border-outline-variant text-on-surface-subtle">
                        <Icon name="no_photography" size={20} />
                      </span>
                    )}
                  </div>

                  <div className="min-w-56 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-title text-on-surface">{issue.title}</p>
                      <span
                        className={cn(
                          "text-label-sm rounded-full border px-2 py-0.5 uppercase",
                          severityChip[issue.severity],
                        )}
                      >
                        {issue.severity}
                      </span>
                      <span className="text-label-sm rounded-full border border-outline-variant bg-surface-container px-2 py-0.5 text-on-surface-variant">
                        {issue.category}
                      </span>
                    </div>
                    <p className="text-body mt-1 text-on-surface-variant">{issue.description}</p>
                    <div className="text-label-sm mt-2 flex flex-wrap items-center gap-3 text-on-surface-subtle">
                      <span className="flex items-center gap-1">
                        <Icon name="meeting_room" size={14} />
                        Room {room?.number} · Floor {room?.floor}
                      </span>
                      {reporter && (
                        <span className="flex items-center gap-1.5">
                          <Avatar staff={reporter} size={18} />
                          {reporter.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Icon name="schedule" size={14} />
                        {issue.reportedAt}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-outline-variant pt-3">
                  {issue.status !== "resolved" && (
                    <>
                      <Button
                        variant="outline"
                        icon="do_not_disturb_on"
                        onClick={() => {
                          if (!room) return;
                          const willAdd = !room.flags.includes("oos");
                          toggleFlag(room.id, "oos");
                          toast(
                            `Room ${room.number} ${willAdd ? "marked Out of Service" : "cleared from Out of Service"}`,
                          );
                        }}
                      >
                        {room?.flags.includes("oos") ? "Clear Out of Service" : "Out of Service"}
                      </Button>
                      <Button
                        variant="outline"
                        icon="build"
                        onClick={() => {
                          if (!room) return;
                          const willAdd = !room.flags.includes("ooo");
                          toggleFlag(room.id, "ooo");
                          toast(
                            `Room ${room.number} ${willAdd ? "marked Out of Order" : "cleared from Out of Order"}`,
                          );
                        }}
                      >
                        {room?.flags.includes("ooo") ? "Clear Out of Order" : "Out of Order"}
                      </Button>
                    </>
                  )}
                  {issue.status === "open" ? (
                    <Button
                      variant="primary"
                      icon="handyman"
                      onClick={() => {
                        setIssueStatus(issue.id, "maintenance");
                        toast(`"${issue.title}" assigned to maintenance`, {
                          icon: <Icon name="handyman" size={18} filled />,
                        });
                      }}
                    >
                      Assign to maintenance
                    </Button>
                  ) : issue.status === "maintenance" ? (
                    <Button
                      variant="success"
                      icon="task_alt"
                      onClick={() => {
                        setIssueStatus(issue.id, "resolved");
                        toast.success(`"${issue.title}" marked resolved`, {
                          icon: <Icon name="task_alt" size={18} filled />,
                        });
                      }}
                    >
                      Mark resolved
                    </Button>
                  ) : (
                    <Button variant="ghost" onClick={() => setIssueStatus(issue.id, "open")}>
                      Reopen
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
