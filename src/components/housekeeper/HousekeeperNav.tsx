import { useNavigate } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import { useHkT } from "@/lib/housekeeper-i18n";
import { cn } from "@/lib/utils";

/** Housekeeper bottom bar: two side tabs and a raised centre Scan Room button
 * sitting in a notch cut into the bar. */
export function HousekeeperNav({ active }: { active: "home" | "summary" | "scan" }) {
  const navigate = useNavigate();
  const t = useHkT();
  const side = (key: "home" | "summary", icon: string, label: string, to: "/housekeeper" | "/housekeeper/summary") => (
    <button
      onClick={() => navigate({ to })}
      aria-label={label}
      aria-current={active === key ? "page" : undefined}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors active:scale-95",
        active === key ? "text-primary" : "text-on-surface-variant",
      )}
    >
      <Icon name={icon} size={24} filled={active === key} />
      <span className="text-label-sm font-semibold">{label}</span>
    </button>
  );
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 px-4">
      <div className="pointer-events-auto relative">
        <nav className="flex h-16 items-center rounded-[22px] bg-surface-container-lowest shadow-[0_10px_28px_-8px_rgb(20_35_63/0.35)] [mask:radial-gradient(circle_40px_at_50%_0,transparent_39px,#000_40px)]">
          {side("home", "home", t.t("home"), "/housekeeper")}
          <div className="w-24 shrink-0" />
          {side("summary", "fact_check", t.t("summary"), "/housekeeper/summary")}
        </nav>
        <button
          onClick={() => navigate({ to: "/housekeeper/scan" })}
          aria-label="Scan room"
          className={cn(
            "absolute left-1/2 top-0 grid size-[62px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-on-primary shadow-[0_8px_20px_-6px_rgb(20_35_63/0.5)] ring-4 ring-surface-container-lowest/0 transition-transform active:scale-95",
          )}
        >
          <Icon name="qr_code_scanner" size={28} filled />
        </button>
        <span className="pointer-events-none absolute left-1/2 top-[42px] -translate-x-1/2 text-label-sm font-semibold text-on-surface-variant">
          Scan
        </span>
      </div>
    </div>
  );
}
