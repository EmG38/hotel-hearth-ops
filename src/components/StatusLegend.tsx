import { cn } from "@/lib/utils";
import { STATUS_ORDER, flagMeta, statusMeta } from "@/lib/room-status";
import { useFlagText, useI18n, useStatusText } from "@/lib/i18n";
import { Icon } from "./Icon";

export function StatusLegend({ className }: { className?: string }) {
  const { t } = useI18n();
  const statusText = useStatusText();
  const flagText = useFlagText();
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {STATUS_ORDER.map((s, i) => (
        <span key={s} className="text-label-sm flex items-center gap-1.5 text-on-surface-variant">
          <span className={cn("size-2.5 rounded-full", statusMeta[s].dot)} />
          {statusText[s].label}
          {i < STATUS_ORDER.length - 1 && (
            <Icon name="arrow_right_alt" size={14} className="rtl-flip ml-2 text-on-surface-subtle" />
          )}
        </span>
      ))}
      <span className="mx-1 h-4 w-px bg-outline-variant" />
      {(["ooo", "oos", "dnd"] as const).map((f) => (
        <span key={f} className="text-label-sm flex items-center gap-1.5 text-on-surface-variant">
          <span className={cn("size-2.5 rounded-full", flagMeta[f].dot)} />
          {flagText[f]}
        </span>
      ))}
      <span className="text-label-sm flex items-center gap-1.5 text-on-surface-variant">
        <Icon name="star" size={14} filled className="text-warning" />
        {t("common.rush")}
      </span>
    </div>
  );
}
