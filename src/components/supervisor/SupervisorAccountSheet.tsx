import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useHotel } from "@/lib/hotel-store";
import { usePhoneOverlay } from "@/components/MobileFrame";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

/**
 * The supervisor's account entry point: a tap on the avatar opens a sheet
 * inside the phone showing who is signed in and a clear "Sign out" action.
 * Before this, signing out meant finding a bare avatar with a tooltip — the
 * only way out of a session on a shared front-desk device.
 */
export function SupervisorAccountButton({ className }: { className?: string }) {
  const { supervisors, currentSupervisorId, setCurrentSupervisorId } = useHotel();
  const overlay = usePhoneOverlay();
  const navigate = useNavigate();
  const me = supervisors.find((s) => s.id === currentSupervisorId);
  if (!me) return null;

  return (
    <>
      <button
        onClick={() =>
          overlay.open(
            <AccountSheet
              name={me.name}
              initials={me.initials}
              shift={me.shift}
              onClose={overlay.close}
              onSignOut={() => {
                overlay.close();
                setCurrentSupervisorId(null);
                navigate({ to: "/supervisor" });
              }}
            />,
          )
        }
        aria-label={`Account: ${me.name}. Open sign-out menu`}
        className={cn(
          "relative grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-label font-semibold text-on-primary shadow-soft transition-transform active:scale-95",
          className,
        )}
      >
        {me.initials}
        <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface bg-success" />
      </button>
    </>
  );
}

function AccountSheet({
  name,
  initials,
  shift,
  onClose,
  onSignOut,
}: {
  name: string;
  initials: string;
  shift: "Morning" | "Evening";
  onClose: () => void;
  onSignOut: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="absolute inset-0 flex flex-col justify-end">
      <button
        aria-label="Close account menu"
        onClick={onClose}
        className="animate-in fade-in absolute inset-0 bg-on-surface/45 duration-200"
      />
      <div className="animate-in slide-in-from-bottom-6 relative rounded-t-[28px] bg-surface-container-lowest px-5 pb-10 pt-2 shadow-raised duration-200">
        <span className="mx-auto mb-4 block h-1.5 w-10 rounded-full bg-outline-variant" />

        {!confirming ? (
          <>
            <div className="flex items-center gap-3">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-secondary text-title font-semibold text-on-primary">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-title font-semibold text-on-surface">{name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-label-sm rounded-full bg-primary-container px-2 py-0.5 font-semibold text-on-surface">
                    Supervisor
                  </span>
                  <span className="text-label-sm inline-flex items-center gap-1 rounded-full bg-tertiary-container px-2 py-0.5 font-medium text-tertiary">
                    <Icon name={shift === "Morning" ? "wb_sunny" : "bedtime"} size={12} filled />
                    {shift} shift
                  </span>
                </div>
              </div>
            </div>

            <p className="text-label-sm mt-4 flex items-start gap-2 rounded-2xl bg-surface-container px-3 py-2.5 text-on-surface-variant">
              <Icon name="lock" size={16} className="mt-0.5 shrink-0 text-tertiary" />
              This is a shared device. Sign out so the next person starts on their own board.
            </p>

            <button
              onClick={() => setConfirming(true)}
              className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-error/25 bg-error/5 px-4 py-3.5 text-left transition-colors active:bg-error/10"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-error/12 text-error">
                <Icon name="logout" size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-label block font-semibold text-on-surface">Sign out</span>
                <span className="text-label-sm block text-on-surface-variant">
                  End this shift on the device
                </span>
              </span>
              <Icon name="chevron_right" size={20} className="shrink-0 text-on-surface-subtle" />
            </button>

            <button
              onClick={onClose}
              className="text-label mt-2 w-full rounded-full py-3 font-semibold text-on-surface-variant active:bg-surface-container"
            >
              Stay signed in
            </button>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center text-center">
              <span className="grid size-14 place-items-center rounded-full bg-error/10 text-error">
                <Icon name="logout" size={26} />
              </span>
              <p className="mt-3 text-title font-semibold text-on-surface">
                Sign out of this device?
              </p>
              <p className="text-label mt-1.5 max-w-[19rem] text-on-surface-variant">
                Your board is saved as it is. The next person taps their own name to sign in.
              </p>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={onClose}
                className="text-label flex-1 rounded-full border border-outline-variant py-3.5 font-semibold text-on-surface-variant active:bg-surface-container"
              >
                Cancel
              </button>
              <button
                onClick={onSignOut}
                className="text-label flex-1 rounded-full bg-secondary py-3.5 font-semibold text-on-primary shadow-soft active:scale-[0.98]"
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
