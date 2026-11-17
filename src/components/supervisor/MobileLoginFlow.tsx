import { useHotel } from "@/lib/hotel-store";
import { PinLogin } from "@/components/mobile/PinLogin";

/** Supervisor-specific wrapper around the shared PinLogin. English only —
 * unlike the Housekeeper app, there's no researched case for a language
 * toggle here, so this isn't speculatively added. */
export function MobileLoginFlow() {
  const { supervisors, setCurrentSupervisorId } = useHotel();

  return <PinLogin roster={supervisors} onComplete={setCurrentSupervisorId} />;
}
