import type { ReactNode } from "react";
import { Icon } from "./Icon";

/**
 * A distinctive landing-screen header: dark tinted band with an oversized
 * ghost icon bleeding into the background, and an elevated card that floats
 * over the seam between the band and the page below. Reserved for the two
 * screens each persona actually "lands" on (Property Board, Availability
 * Board) — task screens keep the plainer PageHeader so this stays a real
 * landmark instead of wallpaper.
 */
export function PageHero({
  ghostIcon,
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}: {
  ghostIcon: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="relative mb-10">
      <div className="from-brand-ink via-brand-ink to-tertiary/60 relative overflow-hidden rounded-3xl bg-gradient-to-br px-6 pb-20 pt-7 text-on-primary sm:px-8 sm:pt-8">
        <Icon
          name={ghostIcon}
          filled
          size={280}
          className="pointer-events-none absolute -right-8 -top-16 select-none leading-none text-on-primary/[0.08]"
        />
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              {eyebrow ? (
                <p className="text-label-sm mb-1.5 uppercase tracking-wider text-on-primary/50">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="text-3xl font-bold tracking-tight text-on-primary sm:text-4xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-body mt-2 max-w-md text-on-primary/65">{subtitle}</p>
              ) : null}
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
        </div>
      </div>

      <div className="relative z-10 -mt-14 px-1 sm:-mt-16 sm:px-0">
        <div className="card-surface shadow-raised p-4 sm:p-5">{children}</div>
      </div>
    </section>
  );
}
