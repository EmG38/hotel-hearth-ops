import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useHotel } from "@/lib/hotel-store";
import { MobileFrame, MobileScreenHeader } from "@/components/MobileFrame";
import { Icon } from "@/components/Icon";
import { wings, inspectionPoints, PASS_SCORE } from "@/lib/mock-data";
import { checklistProgress, scoreInspection } from "@/lib/checklist";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/supervisor/inspect/$roomId")({
  component: Inspect,
});

const zones = Array.from(new Set(inspectionPoints.map((p) => p.zone)));

function Inspect() {
  const { roomId } = Route.useParams();
  const { roomById, staffById, currentSupervisorId, canInspectRoom, submitInspection } = useHotel();
  const navigate = useNavigate();
  const room = roomById(roomId);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [showHkChecklist, setShowHkChecklist] = useState(false);

  if (!room) return null;
  const attendant = staffById(room.attendantId);
  const answered = Object.keys(results).length;
  const { score, criticalFail } = scoreInspection(results);
  const anyFail = Object.values(results).includes(false);
  const allAnswered = answered === inspectionPoints.length;
  const canApprove = allAnswered && score >= PASS_SCORE && !criticalFail;
  const selfInspect = !canInspectRoom(room.id, currentSupervisorId ?? "");
  const hkProgress = checklistProgress(room);

  function back() {
    navigate({ to: "/supervisor/room/$roomId", params: { roomId: room!.id } });
  }

  return (
    <MobileFrame>
      <MobileScreenHeader
        title={`Room ${room.number}`}
        subtitle={`${wings[room.wing].name} · ${room.type} · ${attendant?.name ?? "Unassigned"}`}
        onBack={back}
      />
      <div className="flex-1 overflow-y-auto p-4">
        {selfInspect && (
          <div className="mb-3 flex items-start gap-2 hk-card border border-error/30 bg-error/5 p-3 text-label text-error">
            <Icon name="block" size={18} filled />
            <span>You cleaned this room yourself — ask another supervisor to inspect it.</span>
          </div>
        )}

        <button
          onClick={() => setShowHkChecklist((v) => !v)}
          className="flex w-full items-center justify-between hk-card border border-outline-variant bg-surface-container-lowest p-3 text-left"
        >
          <span>
            <span className="text-body block font-medium text-on-surface">
              {attendant?.name ?? "Unassigned"}'s checklist
            </span>
            <span className="text-label-sm block text-on-surface-subtle">
              {hkProgress.done}/{hkProgress.total} done · {hkProgress.skipped} skipped
              {room.anomalies.length > 0 && (
                <span className="ml-1 font-medium text-warning">
                  · {room.anomalies.length} flag{room.anomalies.length > 1 ? "s" : ""}
                </span>
              )}
            </span>
          </span>
          <Icon
            name={showHkChecklist ? "expand_less" : "expand_more"}
            size={20}
            className="text-on-surface-subtle"
          />
        </button>

        {showHkChecklist && (
          <div className="mt-1.5 space-y-1 hk-card border border-outline-variant bg-surface-container-lowest p-3">
            {room.anomalies.includes("too_fast") && (
              <p className="text-label-sm font-medium text-warning">⚠ Finished suspiciously fast</p>
            )}
            {room.anomalies.includes("bulk_tick") && (
              <p className="text-label-sm font-medium text-warning">
                ⚠ Most items ticked within a minute
              </p>
            )}
            {room.anomalies.includes("no_start") && (
              <p className="text-label-sm font-medium text-warning">
                ⚠ Marked clean without a start event
              </p>
            )}
            {hkProgress.list.map((it) => {
              const res = room.checklist[it.id];
              return (
                <div key={it.id} className="flex items-center gap-2">
                  <Icon
                    name={
                      res?.status === "done"
                        ? "check_circle"
                        : res?.status === "skipped"
                          ? "block"
                          : "radio_button_unchecked"
                    }
                    size={16}
                    filled={res?.status === "done"}
                    className={res?.status === "done" ? "text-success" : "text-on-surface-subtle"}
                  />
                  <span className="text-label-sm text-on-surface-variant">
                    {it.label}
                    {res?.skipReason ? ` · ${res.skipReason}` : ""}
                  </span>
                  {res?.photo && <Icon name="image" size={13} className="text-success" />}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-label-sm mt-4 uppercase text-on-surface-subtle">
          {answered}/{inspectionPoints.length} points checked · score {answered ? `${score}%` : "—"}{" "}
          · pass ≥ {PASS_SCORE}%{criticalFail ? " · critical fail" : ""}
        </p>

        {zones.map((zone) => {
          const zonePoints = inspectionPoints.filter((p) => p.zone === zone);
          const zonePassed = zonePoints.every((p) => results[p.id] === true);
          return (
            <div key={zone} className="mt-3">
              <div className="flex items-center justify-between">
                <p className="text-label-sm font-semibold uppercase text-on-surface-subtle">
                  {zone}
                </p>
                <button
                  onClick={() =>
                    setResults((prev) => {
                      const next = { ...prev };
                      zonePoints.forEach((p) => {
                        next[p.id] = true;
                      });
                      return next;
                    })
                  }
                  className={cn(
                    "text-label-sm inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium",
                    zonePassed
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-outline-variant text-on-surface-variant",
                  )}
                >
                  <Icon name="done_all" size={13} />
                  Pass zone
                </button>
              </div>
              <div className="mt-1.5 space-y-1.5">
                {inspectionPoints
                  .filter((p) => p.zone === zone)
                  .map((p) => (
                    <div
                      key={p.id}
                      className={cn(
                        "flex items-center gap-3 hk-card border p-2.5",
                        results[p.id] === false
                          ? "border-error/40 bg-error/5"
                          : "border-outline-variant bg-surface-container-lowest",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="text-label block text-on-surface">{p.label}</span>
                        <span className="text-label-sm block text-on-surface-subtle">
                          {p.critical && <em className="not-italic text-error">Critical</em>}
                          {p.critical && " · "}weight {p.weight}
                        </span>
                      </span>
                      <div className="flex shrink-0 gap-1.5">
                        <button
                          onClick={() => setResults({ ...results, [p.id]: true })}
                          className={cn(
                            "grid size-9 place-items-center rounded-full",
                            results[p.id] === true
                              ? "bg-success text-on-primary"
                              : "bg-surface-container text-on-surface-subtle",
                          )}
                        >
                          <Icon name="check" size={16} />
                        </button>
                        <button
                          onClick={() => setResults({ ...results, [p.id]: false })}
                          className={cn(
                            "grid size-9 place-items-center rounded-full",
                            results[p.id] === false
                              ? "bg-error text-on-primary"
                              : "bg-surface-container text-on-surface-subtle",
                          )}
                        >
                          <Icon name="close" size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}

        {rejecting && (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="What needs redoing? This note goes back to the housekeeper, who will see it as a re-clean."
            className="mt-4 w-full hk-card border border-outline-variant bg-surface-container-lowest p-3 text-body text-on-surface outline-none placeholder:text-on-surface-subtle focus:ring-2 focus:ring-primary/30"
          />
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-outline-variant p-4">
        {rejecting ? (
          <>
            <button
              disabled={note.trim().length === 0 || selfInspect}
              onClick={() => {
                submitInspection(room.id, currentSupervisorId ?? "", results, {
                  note: note.trim(),
                });
                toast(
                  `Room ${room.number} sent back to ${attendant?.name ?? "housekeeping"} for re-clean`,
                );
                back();
              }}
              className="hk-card bg-error py-3.5 text-label font-semibold text-on-primary shadow-soft disabled:opacity-40"
            >
              Send Re-clean
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
              disabled={!canApprove || selfInspect}
              onClick={() => {
                submitInspection(room.id, currentSupervisorId ?? "", results);
                toast.success(`Room ${room.number} passed — ${score}% — ready to sell`);
                back();
              }}
              className="hk-card bg-success py-3.5 text-label font-semibold text-on-primary shadow-soft disabled:opacity-40"
            >
              Approve
            </button>
            <button
              disabled={!anyFail || selfInspect}
              onClick={() => setRejecting(true)}
              className="hk-card border border-error/30 bg-surface py-3.5 text-label font-semibold text-error disabled:opacity-40"
            >
              Reject
            </button>
          </>
        )}
      </div>
    </MobileFrame>
  );
}
