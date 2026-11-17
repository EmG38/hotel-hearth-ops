import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useHotel } from "@/lib/hotel-store";
import { Button, Chip, inputClass } from "@/components/ui-kit";
import { Icon } from "@/components/Icon";
import { MobileFrame, MobileScreenHeader } from "@/components/MobileFrame";
import { useHkT, ISSUE_CATEGORIES } from "@/lib/housekeeper-i18n";
import { useOnline } from "@/lib/use-online";

export const Route = createFileRoute("/housekeeper/report-issue/$roomId")({
  component: ReportIssue,
});

function ReportIssue() {
  const { roomId } = Route.useParams();
  const { roomById, reportIssue, currentStaffId } = useHotel();
  const navigate = useNavigate();
  const t = useHkT();
  const online = useOnline();
  const room = roomById(roomId);
  const [category, setCategory] = useState<string>(ISSUE_CATEGORIES[0].id);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [description, setDescription] = useState("");

  if (!room) return null;

  const canSubmit = Boolean(category) && hasPhoto;

  function submit() {
    if (!hasPhoto) {
      toast.warning(`${t.t("photo")} · ${t.t("required")}`);
      return;
    }
    reportIssue({
      roomId: room!.id,
      category: ISSUE_CATEGORIES.find((c) => c.id === category)?.en ?? category,
      description,
      reportedBy: currentStaffId ?? "",
    });
    toast.success(t.t("reportSent"), { description: t.t("reportSentBody") });
    navigate({ to: "/housekeeper/room/$roomId", params: { roomId: room!.id } });
  }

  return (
    <MobileFrame>
      <MobileScreenHeader
        title={t.t("reportIssue")}
        subtitle={`Room ${room.number}`}
        onBack={() => navigate({ to: "/housekeeper/room/$roomId", params: { roomId: room.id } })}
      />
      {!online && (
        <div className="flex items-center gap-2 bg-warning/15 px-4 py-2.5 text-label text-warning">
          <Icon name="cloud_off" size={18} filled />
          <span>{t.t("offlineBanner")}</span>
        </div>
      )}
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div>
          <p className="text-label-sm uppercase text-on-surface-subtle">
            {t.t("category")} <span className="text-error">*</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ISSUE_CATEGORIES.map((c) => (
              <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                {t.category(c.id)}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="text-label-sm uppercase text-on-surface-subtle">
            {t.t("photo")} <span className="text-error">*</span>
          </p>
          {hasPhoto ? (
            <div className="relative mt-2 flex h-40 items-center justify-center overflow-hidden hk-card bg-gradient-to-br from-primary/20 to-primary/40">
              <Icon name="image" size={48} className="text-primary" filled />
              <button
                onClick={() => setHasPhoto(false)}
                className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-on-surface/60 text-on-primary"
              >
                <Icon name="close" size={16} />
              </button>
              <span className="text-label-sm absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-on-surface/60 px-2.5 py-1 text-on-primary">
                <Icon name="check" size={13} />
                {t.t("photoAttached")}
              </span>
            </div>
          ) : (
            <div className="mt-2 flex h-28 items-center justify-center gap-10 hk-card border-2 border-dashed border-outline-variant">
              <button
                onClick={() => setHasPhoto(true)}
                className="flex flex-col items-center gap-1.5 text-on-surface"
              >
                <span className="grid size-11 place-items-center rounded-full bg-success/10 text-success">
                  <Icon name="photo_camera" size={22} />
                </span>
                <span className="text-label-sm">{t.t("camera")}</span>
              </button>
              <button
                onClick={() => setHasPhoto(true)}
                className="flex flex-col items-center gap-1.5 text-on-surface"
              >
                <span className="grid size-11 place-items-center rounded-full bg-success/10 text-success">
                  <Icon name="upload" size={22} />
                </span>
                <span className="text-label-sm">{t.t("upload")}</span>
              </button>
            </div>
          )}
          {!hasPhoto && <p className="text-label-sm mt-1.5 text-info">{t.t("photoRequired")}</p>}
        </div>

        <div>
          <p className="text-label-sm uppercase text-on-surface-subtle">{t.t("description")}</p>
          <textarea
            className={`${inputClass} mt-2 min-h-24 resize-none`}
            placeholder={t.t("descriptionPlaceholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
      <div className="shrink-0 border-t border-outline-variant p-4">
        <Button variant="primary" className={`w-full py-3 ${canSubmit ? "" : "opacity-50"}`} aria-disabled={!canSubmit} onClick={submit}>
          {t.t("submitReport")}
        </Button>
      </div>
    </MobileFrame>
  );
}
