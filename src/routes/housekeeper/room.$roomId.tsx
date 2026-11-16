import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useHotel } from "@/lib/hotel-store";
import { statusMeta } from "@/lib/room-status";
import { Button, StatusChip, FlagChip } from "@/components/ui-kit";
import { Icon } from "@/components/Icon";
import { MobileFrame, MobileScreenHeader } from "@/components/MobileFrame";
import { useHkT, PAUSE_REASONS } from "@/lib/housekeeper-i18n";

export const Route = createFileRoute("/housekeeper/room/$roomId")({
  component: RoomDetail,
});

function PauseSheet({
  onPick,
  onClose,
}: {
  onPick: (reasonId: string) => void;
  onClose: () => void;
}) {
  const t = useHkT();
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col justify-end bg-on-surface/40"
      onClick={onClose}
    >
      <div
        className="rounded-t-3xl bg-surface-container-lowest p-4 pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-title mb-3 text-on-surface">{t.t("whyPausing")}</p>
        <div className="grid grid-cols-2 gap-2">
          {PAUSE_REASONS.map((r) => (
            <button
              key={r.id}
              onClick={() => onPick(r.id)}
              className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface px-3 py-3 text-left text-label text-on-surface hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Icon name={r.icon} size={18} className="text-primary" />
              {t.reason(r.id)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoomDetail() {
  const { roomId } = Route.useParams();
  const { roomById, setRoomStatus, addRoomNote } = useHotel();
  const navigate = useNavigate();
  const t = useHkT();
  const [showPause, setShowPause] = useState(false);
  const room = roomById(roomId);

  if (!room) {
    return (
      <MobileFrame>
        <MobileScreenHeader
          title="Room not found"
          onBack={() => navigate({ to: "/housekeeper" })}
        />
      </MobileFrame>
    );
  }

  const dnd = room.flags.includes("dnd");
  const meta = statusMeta[room.status];
  const rid = room.id;
  const roomStatus = room.status;

  function time() {
    return new Date().toTimeString().slice(0, 5);
  }

  function advance() {
    if (roomStatus === "dirty") {
      setRoomStatus(rid, "in_progress", `${time()} · ${t.t("startCleaning")}`);
      toast.success(t.t("startCleaning"));
    } else if (roomStatus === "in_progress") {
      setRoomStatus(rid, "clean", `${time()} · ${t.t("markDone")}`);
      toast.success(t.t("submitted"));
    }
  }

  function pause(reasonId: string) {
    addRoomNote(rid, `${time()} · ${t.t("pause")} — ${t.reason(reasonId)}`);
    setShowPause(false);
    toast(t.reason(reasonId));
  }

  return (
    <MobileFrame>
      <div className="relative flex flex-1 flex-col">
        <MobileScreenHeader
          title={`${room.number}`}
          subtitle={`${t.t("category")}: ${room.type} · Floor ${room.floor}`}
          onBack={() => navigate({ to: "/housekeeper" })}
        />

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <StatusChip status={room.status} className="text-label" />
            {room.flags.map((f) => (
              <FlagChip key={f} flag={f} />
            ))}
          </div>

          {dnd && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-on-surface-subtle/15 p-3 text-label text-on-surface">
              <Icon name="bedtime" size={18} />
              <span>{t.t("dndSkipped")}</span>
            </div>
          )}

          {room.notes.length > 0 && (
            <div className="mt-4">
              <p className="text-label-sm uppercase text-on-surface-subtle">{t.t("notes")}</p>
              <ul className="mt-2 space-y-1.5">
                {room.notes.map((n, i) => (
                  <li key={i} className="text-body text-on-surface-variant">
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(room.status === "clean" || room.status === "inspected") && (
            <p className="mt-6 flex items-center gap-2 text-body text-on-surface-variant">
              <Icon name={meta.icon} size={18} className={meta.text} filled />
              {room.status === "inspected" ? t.t("inspected") : t.t("submitted")}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-outline-variant p-4">
          {(room.status === "dirty" || room.status === "in_progress") && (
            <>
              {dnd ? (
                <Button variant="primary" className="w-full py-3" onClick={advance}>
                  {t.t("retry")}
                </Button>
              ) : (
                <Button variant="primary" className="w-full py-3" onClick={advance}>
                  {room.status === "dirty" ? t.t("startCleaning") : t.t("markDone")}
                </Button>
              )}
              {room.status === "in_progress" && (
                <Button
                  variant="outline"
                  className="w-full py-3"
                  onClick={() => setShowPause(true)}
                >
                  <Icon name="pause" size={18} />
                  {t.t("pause")}
                </Button>
              )}
            </>
          )}
          <Button
            variant="outline"
            className="w-full py-3 text-error"
            onClick={() =>
              navigate({ to: "/housekeeper/report-issue/$roomId", params: { roomId: room.id } })
            }
          >
            <Icon name="report" size={18} />
            {t.t("reportIssue")}
          </Button>
        </div>

        {showPause && <PauseSheet onPick={pause} onClose={() => setShowPause(false)} />}
      </div>
    </MobileFrame>
  );
}
