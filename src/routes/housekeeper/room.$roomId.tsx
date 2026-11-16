import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useHotel } from "@/lib/hotel-store";
import { Button } from "@/components/ui-kit";
import { Icon } from "@/components/Icon";
import { MobileFrame } from "@/components/MobileFrame";
import { useHkT, timeAgo } from "@/lib/housekeeper-i18n";
import { useOnline } from "@/lib/use-online";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/housekeeper/room/$roomId")({
  component: RoomDetail,
});

const heroTone: Record<string, string> = {
  dirty: "from-error/80 to-error",
  in_progress: "from-warning/80 to-warning",
  clean: "from-info/80 to-info",
  inspected: "from-success/80 to-success",
};

const pillTone: Record<string, string> = {
  dirty: "bg-error/10 text-error",
  in_progress: "bg-warning/10 text-warning",
  clean: "bg-info/10 text-info",
  inspected: "bg-success/10 text-success",
};

function RoomDetail() {
  const { roomId } = Route.useParams();
  const { roomById, setRoomStatus, setRoomNote } = useHotel();
  const navigate = useNavigate();
  const t = useHkT();
  const online = useOnline();
  const room = roomById(roomId);
  const [note, setNote] = useState(room?.notes[0] ?? "");

  useEffect(() => {
    setNote(room?.notes[0] ?? "");
  }, [room?.id]);

  if (!room) {
    return (
      <MobileFrame>
        <div className="flex flex-1 items-center justify-center">
          <Button variant="outline" onClick={() => navigate({ to: "/housekeeper" })}>
            {t.t("home")}
          </Button>
        </div>
      </MobileFrame>
    );
  }

  const status = room.status;
  const statusLabel = {
    dirty: t.t("statusDirty"),
    in_progress: t.t("statusInProgress"),
    clean: t.t("statusAwaiting"),
    inspected: t.t("statusInspected"),
  }[status];

  function advance() {
    if (status === "dirty") {
      setRoomStatus(room!.id, "in_progress");
      toast.success(t.t("startCleaning"));
    } else if (status === "in_progress") {
      setRoomStatus(room!.id, "clean");
      toast.success(t.t("awaitingBanner"));
    }
  }

  return (
    <MobileFrame>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="relative flex h-56 shrink-0 flex-col justify-between overflow-hidden p-4">
          {room.photo ? (
            <>
              <img
                src={room.photo}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/35" />
            </>
          ) : (
            <>
              <div className={cn("absolute inset-0 bg-gradient-to-br", heroTone[status])} />
              <Icon
                name="bed"
                size={140}
                filled
                className="pointer-events-none absolute -bottom-6 -right-6 text-white/15"
              />
            </>
          )}
          <div className="relative flex items-start justify-between">
            <button
              onClick={() => navigate({ to: "/housekeeper" })}
              className="grid size-10 place-items-center rounded-full bg-white/90 text-on-surface shadow-soft"
            >
              <Icon name="chevron_left" size={22} />
            </button>
            <span className="text-label-sm rounded-full bg-white/25 px-3 py-1 font-medium text-white">
              Floor {room.floor}
            </span>
          </div>
          <div className="relative">
            <p className="text-label-sm text-white/80">{room.type}</p>
            <p className="text-2xl font-bold text-white">Room {room.number}</p>
          </div>
        </div>

        <div className="-mt-6 flex-1 rounded-t-3xl bg-surface p-4">
          {!online && (
            <div className="-mx-4 -mt-4 mb-4 flex items-center gap-2 bg-warning/15 px-4 py-2.5 text-label text-warning">
              <Icon name="cloud_off" size={18} filled />
              <span>{t.t("offlineBanner")}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-label-sm inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium",
                pillTone[status],
              )}
            >
              <span className="size-1.5 rounded-full bg-current" />
              {statusLabel}
            </span>
            <span className="text-label-sm text-on-surface-subtle">
              {t.t("updated")} {timeAgo(room.lastUpdated, t)}
            </span>
          </div>

          {(status === "dirty" || status === "in_progress") && (
            <button
              onClick={advance}
              className="mt-4 flex w-full items-center justify-center gap-2 hk-card bg-primary py-3.5 text-label font-semibold text-on-primary shadow-soft active:scale-[0.98]"
            >
              {status === "dirty" ? t.t("startCleaning") : t.t("markDone")}
              <Icon name="check" size={18} />
            </button>
          )}

          {status === "clean" && (
            <div className="mt-4 flex items-center gap-2 hk-card bg-info/10 px-4 py-3 text-label font-medium text-info">
              <Icon name="hourglass_top" size={18} filled />
              {t.t("awaitingBanner")}
            </div>
          )}

          {status === "inspected" && (
            <div className="mt-4 flex items-center gap-2 hk-card bg-success/10 px-4 py-3 text-label font-medium text-success">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-success text-on-primary">
                <Icon name="check" size={16} />
              </span>
              {t.t("inspectedBanner")}
            </div>
          )}

          <button
            onClick={() =>
              navigate({ to: "/housekeeper/report-issue/$roomId", params: { roomId: room.id } })
            }
            className="mt-2.5 flex w-full items-center justify-center gap-2 hk-card border border-error/30 bg-surface py-3 text-label font-semibold text-error active:scale-[0.98]"
          >
            <Icon name="error" size={18} />
            {t.t("reportIssue")}
          </button>

          <p className="text-label-sm mt-5 uppercase text-on-surface-subtle">{t.t("notes")}</p>
          <textarea
            className="mt-1.5 min-h-20 w-full resize-none hk-card bg-surface-container-lowest p-3 text-body text-on-surface outline-none placeholder:text-on-surface-subtle focus:ring-2 focus:ring-primary/30"
            placeholder={t.t("notesPlaceholder")}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => setRoomNote(room.id, note)}
          />
        </div>
      </div>
    </MobileFrame>
  );
}
