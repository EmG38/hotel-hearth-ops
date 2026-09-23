import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import type { Room, Staff } from "@/lib/hotel-types";
import { flagMeta, statusMeta } from "@/lib/room-status";

/* ---------- Buttons ---------- */

type ButtonVariant = "primary" | "outline" | "ghost" | "tonal" | "danger" | "success";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary/90 shadow-soft",
  outline:
    "border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container",
  ghost: "text-on-surface-variant hover:bg-surface-container",
  tonal: "bg-primary-container text-secondary hover:bg-primary-container/70",
  danger: "bg-error text-on-primary hover:bg-error/90",
  success: "bg-success text-on-primary hover:bg-success/90",
};

export function Button({
  variant = "outline",
  icon,
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; icon?: string }) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-label transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        buttonVariants[variant],
        className,
      )}
    >
      {icon ? <Icon name={icon} size={18} /> : null}
      {children}
    </button>
  );
}

/* ---------- Chips ---------- */

export function Chip({
  active,
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-label transition-all duration-150 active:scale-[0.96]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        active
          ? "border-primary bg-primary text-on-primary"
          : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function StatusChip({ status, className }: { status: Room["status"]; className?: string }) {
  const meta = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-label-sm uppercase",
        meta.chip,
        className,
      )}
    >
      <Icon name={meta.icon} size={14} filled />
      {meta.label}
    </span>
  );
}

export function FlagChip({ flag }: { flag: Room["flags"][number] }) {
  const meta = flagMeta[flag];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-label-sm uppercase",
        meta.chip,
      )}
    >
      <Icon name={meta.icon} size={13} filled />
      {meta.label}
    </span>
  );
}

/* ---------- Layout ---------- */

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("card-surface", className)}>{children}</div>;
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-headline text-on-surface">{title}</h1>
        {subtitle ? <p className="text-body mt-1 text-on-surface-variant">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatTile({
  label,
  value,
  unit,
  icon,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  tone?: "neutral" | "success" | "warning" | "error" | "info" | "tertiary";
  hint?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "text-on-surface bg-surface-container",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    error: "text-error bg-error/10",
    info: "text-info bg-info/10",
    tertiary: "text-tertiary bg-tertiary/10",
  };
  return (
    <Card className="flex items-start gap-3 p-4">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", tones[tone])}>
        <Icon name={icon} size={20} filled />
      </span>
      <div className="min-w-0">
        <p className="text-label-sm uppercase text-on-surface-subtle">{label}</p>
        <p className="text-title-lg mt-0.5 text-on-surface">
          {value}
          {unit ? <span className="text-body ml-1 text-on-surface-variant">{unit}</span> : null}
        </p>
        {hint ? <p className="text-label-sm mt-1 text-on-surface-subtle">{hint}</p> : null}
      </div>
    </Card>
  );
}

export function Avatar({ staff, size = 32 }: { staff: Staff; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-secondary text-on-primary"
      style={{ width: size, height: size, fontSize: size / 2.8 }}
    >
      <span className="font-semibold">{staff.initials}</span>
    </span>
  );
}

export function EmptyState({ icon, title, body }: { icon: string; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <Icon name={icon} size={40} className="text-on-surface-subtle" />
      <p className="text-title text-on-surface">{title}</p>
      {body ? <p className="text-body max-w-sm text-on-surface-variant">{body}</p> : null}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string | undefined;
}) {
  return (
    <label className="block">
      <span className="text-label-sm uppercase text-on-surface-subtle">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? (
        <span className="text-label-sm mt-1 block text-on-surface-subtle">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body text-on-surface outline-none placeholder:text-on-surface-subtle focus:border-primary focus:ring-2 focus:ring-primary/20";

export function Select({ className, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...rest} className={cn(inputClass, "appearance-none pr-8", className)} />;
}
