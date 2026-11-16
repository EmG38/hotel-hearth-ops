import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useHotel } from "@/lib/hotel-store";
import { Button, Chip, Field, inputClass } from "@/components/ui-kit";
import { Icon } from "@/components/Icon";
import { MobileFrame, MobileScreenHeader } from "@/components/MobileFrame";
import { useHkT, ISSUE_CATEGORIES } from "@/lib/housekeeper-i18n";

export const Route = createFileRoute("/housekeeper/report-issue/$roomId")({
  component: ReportIssue,
});

function ReportIssue() {
  const { roomId } = Route.useParams();
  const { roomById, reportIssue, currentStaffId } = useHotel();
  const navigate = useNavigate();
  const t = useHkT();
  const room = roomById(roomId);
  const [category, setCategory] = useState<string>(ISSUE_CATEGORIES[0].id);
  const [description, setDescription] = useState("");

  if (!room) return null;

  function submit() {
    reportIssue({
      roomId: room!.id,
      category: ISSUE_CATEGORIES.find((c) => c.id === category)?.en ?? category,
      description,
      reportedBy: currentStaffId ?? "",
    });
    toast.success(t.t("submit"));
    navigate({ to: "/housekeeper/room/$roomId", params: { roomId: room!.id } });
  }

  return (
    <MobileFrame>
      <MobileScreenHeader
        title={t.t("reportIssue")}
        subtitle={`Room ${room.number}`}
        onBack={() => navigate({ to: "/housekeeper/room/$roomId", params: { roomId: room.id } })}
      />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <Field label={t.t("category")}>
          <div className="flex flex-wrap gap-2">
            {ISSUE_CATEGORIES.map((c) => (
              <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                <Icon name={c.icon} size={14} />
                {t.category(c.id)}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label={t.t("addPhoto")}>
          <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-outline-variant text-on-surface-subtle">
            <Icon name="add_a_photo" size={28} />
          </div>
        </Field>

        <Field label={t.t("description")}>
          <textarea
            className={`${inputClass} min-h-24 resize-none`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
      </div>
      <div className="shrink-0 border-t border-outline-variant p-4">
        <Button variant="danger" className="w-full py-3" disabled={!description} onClick={submit}>
          {t.t("submit")}
        </Button>
      </div>
    </MobileFrame>
  );
}
