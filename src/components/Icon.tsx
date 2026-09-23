import { cn } from "@/lib/utils";

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
  weight?: number;
  size?: number;
}

/** Google Material Symbols Rounded — ligature name as text content. */
export function Icon({ name, className, filled = false, weight = 400, size }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-rounded", className)}
      style={{
        fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" ${weight}, "GRAD" 0, "opsz" 24`,
        fontSize: size ? `${size}px` : undefined,
      }}
    >
      {name}
    </span>
  );
}
