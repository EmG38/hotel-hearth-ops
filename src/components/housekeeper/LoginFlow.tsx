import { useState } from "react";
import { useHotel } from "@/lib/hotel-store";
import type { Staff } from "@/lib/hotel-types";
import { Icon } from "@/components/Icon";
import { useHkT } from "@/lib/housekeeper-i18n";
import { cn } from "@/lib/utils";
import goldenSandsLogo from "@/assets/golden-sands-logo.png";

/**
 * Job → face → PIN, the standard shared-device staff login pattern (retail
 * POS, hotel staff apps) — fast tap-through for a shared phone, no email/
 * password. Any 4-digit PIN succeeds: there's no real backend or stored
 * PINs in this demo, so simulating a wrong-PIN path would just be fiction.
 * Auto-submits on the 4th digit per the researched pattern, with a brief
 * success tick before handing off.
 */
export function LoginFlow() {
  const { staff, setCurrentStaffId } = useHotel();
  const t = useHkT();
  const [selected, setSelected] = useState<Staff | null>(null);
  const [pin, setPin] = useState("");
  const [success, setSuccess] = useState(false);

  function press(digit: string) {
    if (pin.length >= 4 || success) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      setSuccess(true);
      setTimeout(() => selected && setCurrentStaffId(selected.id), 500);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-[#15110b] px-6 pb-8 pt-8">
      <div className="flex flex-col items-center">
        <img
          src={goldenSandsLogo}
          alt="Golden Sands Hotel"
          className="h-16 w-auto object-contain"
        />
      </div>

      {!selected ? (
        <>
          <p className="mt-8 text-center text-title text-white/90">{t.t("signIn")}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 overflow-y-auto">
            {staff.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className="flex flex-col items-center gap-2 hk-card border border-white/10 bg-white/5 p-4 transition-all active:scale-[0.97] active:bg-white/10"
              >
                <span className="grid size-14 place-items-center rounded-full border-2 border-primary/70 bg-primary/20 text-title font-semibold text-primary">
                  {s.initials}
                </span>
                <span className="text-label text-white">{s.name}</span>
                <span className="text-label-sm text-white/50">{s.shift} shift</span>
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
            className="self-start -mt-1 mb-4 flex items-center gap-1 text-label text-white/60"
          >
            <Icon name="chevron_left" size={18} />
            {t.t("switchUser")}
          </button>

          <span className="grid size-16 place-items-center rounded-full border-2 border-primary/70 bg-primary/20 text-title-lg font-semibold text-primary">
            {selected.initials}
          </span>
          <p className="mt-3 text-title text-white">{selected.name}</p>
          <p className="mt-1 text-label-sm text-white/50">{t.t("enterPin")}</p>

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
                      : "border-white/25 bg-transparent",
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
                    className="grid size-16 place-items-center rounded-full bg-white/8 text-title-lg font-semibold text-white active:bg-white/15"
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
