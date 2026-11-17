import { useState } from "react";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import goldenSandsLogo from "@/assets/golden-sands-logo.png";

export interface PinLoginProfile {
  id: string;
  name: string;
  initials: string;
  shift: string;
}

/**
 * Job → face → PIN, the standard shared-device staff login pattern (retail
 * POS, hotel staff apps) — fast tap-through for a shared phone, no email/
 * password. Shared by the Housekeeper and Supervisor mobile apps so both
 * logins look and behave identically. Any 4-digit PIN succeeds: there's no
 * real backend or stored PINs in this demo, so simulating a wrong-PIN path
 * would just be fiction. Auto-submits on the 4th digit, with a brief
 * success tick before handing off.
 */
export function PinLogin({
  roster,
  onComplete,
  signInLabel = "Who's signing in?",
  pinPrompt = "Enter your PIN",
  switchUserLabel = "Switch user",
}: {
  roster: PinLoginProfile[];
  onComplete: (id: string) => void;
  signInLabel?: string;
  pinPrompt?: string;
  switchUserLabel?: string;
}) {
  const [selected, setSelected] = useState<PinLoginProfile | null>(null);
  const [pin, setPin] = useState("");
  const [success, setSuccess] = useState(false);

  function press(digit: string) {
    if (pin.length >= 4 || success) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      setSuccess(true);
      setTimeout(() => selected && onComplete(selected.id), 500);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-surface px-6 pb-8 pt-8">
      <div className="flex flex-col items-center">
        <img
          src={goldenSandsLogo}
          alt="Golden Sands Hotel"
          className="h-16 w-auto object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
        />
      </div>

      {!selected ? (
        <>
          <p className="mt-8 text-center text-title text-on-surface font-semibold">{signInLabel}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-5 overflow-y-auto pb-2">
            {roster.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className="group flex w-[calc((100%-1.5rem)/3)] flex-col items-center gap-1.5 transition-transform active:scale-95"
              >
                <Avatar p={s} className="size-[72px]" />
                <span className="w-full truncate text-center text-label font-semibold text-on-surface">{s.name.split(" ")[0]}</span>
                <span className="-mt-1 text-label-sm text-on-surface-variant">{s.shift} shift</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center">
          <button
            onClick={() => {
              setSelected(null);
              setPin("");
              setSuccess(false);
            }}
            className="self-start -mt-1 mb-4 flex items-center gap-1 text-label text-on-surface-variant"
          >
            <Icon name="chevron_left" size={18} />
            {switchUserLabel}
          </button>

          <Avatar p={selected} className="size-20" />
          <p className="mt-3 text-title font-semibold text-on-surface">{selected.name}</p>
          <p className="mt-1 text-label-sm text-on-surface-variant">{pinPrompt}</p>

          <div className="mt-6 flex gap-4">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "size-3.5 rounded-full border-2 transition-all",
                  success
                    ? "border-success bg-success"
                    : i < pin.length
                      ? "border-primary bg-primary"
                      : "border-outline-variant bg-transparent",
                )}
              />
            ))}
          </div>

          {success ? (
            <span className="mt-10 grid size-14 place-items-center rounded-full bg-success/20 text-success">
              <Icon name="check" size={28} />
            </span>
          ) : (
            <div className="mt-8 grid grid-cols-3 gap-4">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"].map((k, i) =>
                k === "" ? (
                  <span key={i} />
                ) : (
                  <button
                    key={i}
                    onClick={() => (k === "back" ? setPin((p) => p.slice(0, -1)) : press(k))}
                    className="grid size-16 place-items-center rounded-full bg-surface-container-lowest text-title-lg font-semibold text-on-surface shadow-sm active:bg-surface-container"
                  >
                    {k === "back" ? <Icon name="backspace" size={22} /> : k}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Avatar({ p, className }: { p: PinLoginProfile; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full bg-tertiary-container text-title font-semibold text-tertiary ring-2 ring-surface-container-lowest shadow-md",
        className,
      )}
    >
      {failed ? (
        p.initials
      ) : (
        <img
          src={photoFor(p)}
          alt={p.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      )}
    </span>
  );
}

/** Placeholder portrait matched to the person's gender by first name. Swap
 * for real staff photos when wiring real data. */
const MALE_FIRST_NAMES = new Set(["khalid", "ahmed", "omar", "ali", "raj", "jose", "mohammed"]);
function photoFor(p: PinLoginProfile) {
  const first = (p.name.split(" ")[0] ?? "").toLowerCase();
  const set = MALE_FIRST_NAMES.has(first) ? "men" : "women";
  let h = 0;
  for (const c of p.id) h = (h * 31 + c.charCodeAt(0)) % 90;
  return `https://randomuser.me/api/portraits/${set}/${h + 1}.jpg`;
}
