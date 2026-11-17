import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useHotel } from "@/lib/hotel-store";
import { Button, Chip } from "@/components/ui-kit";
import { Icon } from "@/components/Icon";
import { MobileFrame } from "@/components/MobileFrame";
import { useHkT, timeAgo } from "@/lib/housekeeper-i18n";
import { useOnline } from "@/lib/use-online";
import { wings, skipReasons, zoneLabel } from "@/lib/mock-data";
import { checklistProgress } from "@/lib/checklist";
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
  const {
    roomById,
    setRoomNote,
    currentStaffId,
    startCleaning,
    toggleChecklistItem,
    skipChecklistItem,
    attachChecklistPhoto,
    markRoomClean,
  } = useHotel();
  const navigate = useNavigate();
  const t = useHkT();
  const online = useOnline();
  const room = roomById(roomId);
  const actor = currentStaffId ?? "";
  const [note, setNote] = useState(room?.notes[0] ?? "");
  const [photoItem, setPhotoItem] = useState<string | null>(null);
  const [skipItem, setSkipItem] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

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

  const progress = checklistProgress(room);
  const zones = Array.from(new Set(progress.list.map((it) => it.zone)));

  function tapItem(itemId: string, needsPhoto: boolean) {
    if (status !== "in_progress") {
      toast.info(
        status === "dirty" ? t.t("startCleaningFirst") : t.t("checklistClosed"),
      );
      return;
    }
    if (needsPhoto && !room!.checklist[itemId]) {
      setPhotoItem(itemId);
      return;
    }
    toggleChecklistItem(room!.id, itemId, actor);
  }

  return (
    <MobileFrame dark>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="relative flex h-80 shrink-0 flex-col justify-between overflow-hidden p-5 pt-14">
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
            <div className="flex flex-col items-end gap-1">
              <span className="text-label-sm rounded-full bg-white/25 px-3 py-1 font-medium text-white">
                {wings[room.wing].name}
              </span>
              {room.view === "gulf" && (
                <span className="text-label-sm inline-flex items-center gap-1 rounded-full bg-white/25 px-3 py-1 font-medium text-white">
                  <Icon name="waves" size={13} filled />
                  {t.t("gulfView")}
                </span>
              )}
            </div>
          </div>
          <div className="relative">
            <p className="text-label-sm text-white/80">{room.type}</p>
            <p className="text-4xl font-semibold tracking-tight text-white">Room {room.number}</p>
          </div>
        </div>

        <div className="relative z-10 -mt-8 flex-1 rounded-t-[32px] bg-surface p-5">
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

          {status === "dirty" && (
            <button
              onClick={() => {
                startCleaning(room.id, actor);
                toast.success(t.t("startedCleaning"));
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 hk-card bg-primary py-3.5 text-label font-semibold text-on-primary shadow-soft active:scale-[0.98]"
            >
              {t.t("startCleaning")}
              <Icon name="check" size={18} />
            </button>
          )}

          {status === "in_progress" && (
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <p className="text-label-sm uppercase text-on-surface-subtle">
                  {t.t("checklist")} · {progress.done}/{progress.total}
                </p>
                <p className="text-label-sm text-on-surface-subtle">{progress.percent}%</p>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>

              {zones.map((zone) => (
                <div key={zone} className="mt-4">
                  <p className="text-label-sm font-semibold uppercase text-on-surface-subtle">
                    {zoneLabel[zone]}
                  </p>
                  <div className="mt-1.5 space-y-1.5">
                    {progress.list
                      .filter((it) => it.zone === zone)
                      .map((it) => {
                        const res = room.checklist[it.id];
                        const done = res?.status === "done";
                        const skipped = res?.status === "skipped";
                        return (
                          <div key={it.id}>
                            <button
                              onClick={() => tapItem(it.id, it.photo)}
                              className={cn(
                                "flex w-full items-center gap-2.5 hk-card border px-3 py-2.5 text-left transition-colors",
                                done
                                  ? "border-success/30 bg-success/5"
                                  : skipped
                                    ? "border-outline-variant bg-surface-container-lowest opacity-60"
                                    : "border-outline-variant bg-surface-container-lowest active:bg-surface-container",
                              )}
                            >
                              <Icon
                                name={done ? "check_circle" : skipped ? "block" : "radio_button_unchecked"}
                                size={20}
                                filled={done}
                                className={done ? "text-success" : skipped ? "text-on-surface-subtle" : "text-on-surface-subtle"}
                              />
                              <span className="min-w-0 flex-1">
                                <span className="text-label block text-on-surface">{it.label}</span>
                                <span className="text-label-sm flex flex-wrap items-center gap-1.5 text-on-surface-subtle">
                                  {it.mandatory && !res && <em className="not-italic text-warning">{t.t("required")}</em>}
                                  {it.photo && (
                                    <em className="not-italic inline-flex items-center gap-0.5">
                                      <Icon name="photo_camera" size={11} /> {t.t("photo")}
                                    </em>
                                  )}
                                  {skipped && res?.skipReason}
                                </span>
                              </span>
                              {res?.photo && <Icon name="image" size={16} className="shrink-0 text-success" />}
                            </button>
                            {status === "in_progress" && !it.mandatory && !res && (
                              <button
                                onClick={() => setSkipItem(it.id)}
                                className="mt-1 pl-3 text-label-sm font-medium text-on-surface-variant"
                              >
                                {t.t("skip")}
                              </button>
                            )}
                            {photoItem === it.id && (
                              <div className="mt-1.5 flex h-20 items-center justify-center gap-8 hk-card border-2 border-dashed border-outline-variant">
                                <button
                                  onClick={() => {
                                    attachChecklistPhoto(room.id, it.id, actor);
                                    setPhotoItem(null);
                                    toast.success(t.t("photoSaved"));
                                  }}
                                  className="flex flex-col items-center gap-1 text-on-surface"
                                >
                                  <span className="grid size-9 place-items-center rounded-full bg-success/10 text-success">
                                    <Icon name="photo_camera" size={18} />
                                  </span>
                                  <span className="text-label-sm">{t.t("camera")}</span>
                                </button>
                                <button
                                  onClick={() => setPhotoItem(null)}
                                  className="text-label-sm text-on-surface-variant"
                                >
                                  {t.t("cancel")}
                                </button>
                              </div>
                            )}
                            {skipItem === it.id && (
                              <div className="mt-1.5 flex flex-wrap gap-1.5 pl-3">
                                {skipReasons.map((r) => (
                                  <Chip
                                    key={r}
                                    onClick={() => {
                                      skipChecklistItem(room.id, it.id, r);
                                      setSkipItem(null);
                                    }}
                                  >
                                    {r}
                                  </Chip>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}

              {!confirming ? (
                <button
                  disabled={!progress.canComplete}
                  onClick={() => setConfirming(true)}
                  className="mt-5 flex w-full items-center justify-center gap-2 hk-card bg-primary py-3.5 text-label font-semibold text-on-primary shadow-soft active:scale-[0.98] disabled:opacity-40"
                >
                  {progress.canComplete
                    ? t.t("markCleanBtn")
                    : `${progress.missingCount} ${t.t("requiredLeft")}`}
                </button>
              ) : (
                <div className="mt-5 hk-card bg-surface-container-lowest shadow-soft p-3.5">
                  <p className="text-body font-semibold text-on-surface">{t.t("confirmMarkClean")}</p>
                  <p className="text-label-sm mt-1 text-on-surface-subtle">
                    {progress.done} {t.t("itemsDone").toLowerCase()} · {progress.skipped}{" "}
                    {t.t("skippedWord").toLowerCase()}
                  </p>
                  <p className="text-label-sm mt-2 text-on-surface-subtle">
                    {t.t("supervisorWillBeNotified")}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        markRoomClean(room.id, actor);
                        setConfirming(false);
                        toast.success(t.t("awaitingBanner"));
                        navigate({ to: "/housekeeper" });
                      }}
                      className="flex-1 hk-card bg-primary py-3 text-label font-semibold text-on-primary shadow-soft active:scale-[0.98]"
                    >
                      {t.t("confirmMarkCleanBtn")}
                    </button>
                    <button
                      onClick={() => setConfirming(false)}
                      className="px-3 text-label font-medium text-on-surface-variant"
                    >
                      {t.t("cancel")}
                    </button>
                  </div>
                </div>
              )}
            </div>
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
