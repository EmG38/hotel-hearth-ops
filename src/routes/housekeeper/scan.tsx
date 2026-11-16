import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useHotel } from "@/lib/hotel-store";
import { Icon } from "@/components/Icon";
import { MobileFrame } from "@/components/MobileFrame";
import { useHkT } from "@/lib/housekeeper-i18n";

/**
 * Simulated QR scan: real housekeeping platforms (FCS m-Housekeeping,
 * LiteLog) put a QR code on each room door so staff can jump straight to
 * that room instead of hunting through a list. No physical codes exist in
 * this browser demo, so scanning "finds" the housekeeper's own next
 * not-yet-done room after a short delay — manual room-number entry is
 * always available as a real, persistent alternative, not just a failure
 * fallback (this is the documented real-world pattern, not a guess).
 */
export const Route = createFileRoute("/housekeeper/scan")({
  component: ScanRoom,
});

type Phase = "scanning" | "found";

function ScanRoom() {
  const { rooms, currentStaffId } = useHotel();
  const navigate = useNavigate();
  const t = useHkT();
  const [phase, setPhase] = useState<Phase>("scanning");
  const [foundRoom, setFoundRoom] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const [roomInput, setRoomInput] = useState("");
  const [error, setError] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (manual) return;
    const myRooms = rooms.filter((r) => r.attendantId === currentStaffId);
    const next = myRooms.find((r) => r.status === "dirty" || r.status === "in_progress");
    if (!next) return;
    const t1 = setTimeout(() => {
      setFoundRoom(next.id);
      setPhase("found");
      const t2 = setTimeout(() => {
        navigate({ to: "/housekeeper/room/$roomId", params: { roomId: next.id } });
      }, 900);
      timers.current.push(t2);
    }, 3000);
    timers.current.push(t1);
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manual]);

  function goToRoomNumber() {
    const match = rooms.find((r) => r.number === roomInput.trim());
    if (!match) {
      setError(true);
      return;
    }
    navigate({ to: "/housekeeper/room/$roomId", params: { roomId: match.id } });
  }

  const foundRoomNumber = rooms.find((r) => r.id === foundRoom)?.number;

  return (
    <MobileFrame>
      <div className="relative flex flex-1 flex-col bg-[#0b0e11]">
        <button
          onClick={() => navigate({ to: "/housekeeper" })}
          className="absolute left-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-white/15 text-white"
        >
          <Icon name="close" size={22} />
        </button>

        <div className="flex flex-1 flex-col items-center justify-center px-8">
          <div className="relative size-56">
            {[
              "left-0 top-0 border-l-4 border-t-4 rounded-tl-xl",
              "right-0 top-0 border-r-4 border-t-4 rounded-tr-xl",
              "left-0 bottom-0 border-l-4 border-b-4 rounded-bl-xl",
              "right-0 bottom-0 border-r-4 border-b-4 rounded-br-xl",
            ].map((cls, i) => (
              <span key={i} className={`absolute size-10 border-success ${cls}`} />
            ))}
            {phase === "scanning" && !manual && (
              <span className="absolute inset-x-3 top-1/2 h-0.5 animate-pulse rounded-full bg-success shadow-[0_0_12px_2px_rgba(34,197,94,0.8)]" />
            )}
            {phase === "found" && (
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid size-16 place-items-center rounded-full bg-success text-on-primary">
                  <Icon name="check" size={32} />
                </span>
              </div>
            )}
          </div>

          <p className="text-body mt-6 text-center text-white/80">
            {manual
              ? ""
              : phase === "found"
                ? `${t.t("roomFound")} ${foundRoomNumber}`
                : t.t("pointAtCode")}
          </p>

          {manual && (
            <div className="mt-2 w-full max-w-xs">
              <div className="flex gap-2">
                <input
                  autoFocus
                  inputMode="numeric"
                  value={roomInput}
                  onChange={(e) => {
                    setRoomInput(e.target.value);
                    setError(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && goToRoomNumber()}
                  placeholder={t.t("roomNumber")}
                  className="w-full rounded-xl bg-white/10 px-4 py-3 text-body text-white outline-none placeholder:text-white/40 focus:bg-white/15"
                />
                <button
                  onClick={goToRoomNumber}
                  className="shrink-0 rounded-xl bg-success px-5 py-3 text-label font-semibold text-on-primary"
                >
                  {t.t("go")}
                </button>
              </div>
              {error && <p className="text-label-sm mt-2 text-error">{t.t("roomNotFound")}</p>}
            </div>
          )}
        </div>

        <div className="pb-6 text-center">
          <button
            onClick={() => {
              setManual((m) => !m);
              setPhase("scanning");
              setError(false);
            }}
            className="text-label font-medium text-white/70 underline-offset-4 hover:underline"
          >
            {manual ? t.t("cancel") : t.t("enterRoomInstead")}
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}
