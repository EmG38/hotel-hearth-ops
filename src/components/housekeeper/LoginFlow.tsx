import { useHotel } from "@/lib/hotel-store";
import { useHkT } from "@/lib/housekeeper-i18n";
import { PinLogin } from "@/components/mobile/PinLogin";

/** Housekeeper-specific wrapper around the shared PinLogin: supplies the
 * attendant roster and the EN/HI translated copy. */
export function LoginFlow() {
  const { staff, setCurrentStaffId } = useHotel();
  const t = useHkT();

  return (
    <PinLogin
      roster={staff}
      onComplete={setCurrentStaffId}
      signInLabel={t.t("signIn")}
      pinPrompt={t.t("enterPin")}
      switchUserLabel={t.t("switchUser")}
    />
  );
}
