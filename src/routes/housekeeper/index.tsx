import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useHotel } from "@/lib/hotel-store";
import { statusMeta } from "@/lib/room-status";
import { Avatar, Chip, StatusChip, FlagChip } from "@/components/ui-kit";
import { Icon } from "@/components/Icon";
import { MobileFrame, MobileScreenHeader } from "@/components/MobileFrame";
import { useHkLang, setHkLang, useHkT } from "@/lib/housekeeper-i18n";

export const Route = createFileRoute("/housekeeper/")({
  head: () => ({
    meta: [{ title: "Housekeeper App — Hotel App" }],
  }),
  component: HousekeeperHome,
});

function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

function SignInPicker() {
  const { staff, setCurrentStaffId } = useHotel();
  const t = useHkT();
  return (
    <div className="flex flex-1 flex-col px-5 py-6">
      <p className="text-title text-on-surface">{t.t("signIn")}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {staff.map((s) => (
          <button
            key={s.id}
            onClick={() => setCurrentStaffId(s.id)}
            className="flex flex-col items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Avatar staff={s} size={56} />
            <span className="text-label text-on-surface">{s.name}</span>
            <span className="text-label-sm text-on-surface-subtle">{s.shift} shift</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function LangToggle() {
  const lang = useHkLang();
  return (
    <div className="flex rounded-full bg-surface-container p-0.5 text-label-sm">
      {(["en", "hi"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setHkLang(l)}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            lang === l
              ? "bg-surface-container-lowest text-on-surface shadow-soft"
              : "text-on-surface-variant"
          }`}
        >
          {l === "en" ? "EN" : "हि"}
        </button>
      ))}
    </div>
  );
}

function greetingKey() {
  const h = new Date().getHours();
  if (h < 12) return "goodMorning" as const;
  if (h < 17) return "goodAfternoon" as const;
  return "goodEvening" as const;
}

function HousekeeperHome() {
  const { rooms, currentStaffId, setCurrentStaffId, staffById } = useHotel();
  const navigate = useNavigate();
  const t = useHkT();
  const online = useOnline();
  const me = staffById(currentStaffId);

  const myRooms = useMemo(
    () =>
      rooms
        .filter((r) => r.attendantId === currentStaffId)
        .sort((a, b) => Number(a.number) - Number(b.number)),
    [rooms, currentStaffId],
  );
  const done = myRooms.filter((r) => r.status === "clean" || r.status === "inspected").length;

  return (
    <MobileFrame>
      {!me ? (
        <SignInPicker />
      ) : (
        <>
          <MobileScreenHeader
            title={`${t.t(greetingKey())}, ${me.name.split(" ")[0]}`}
            subtitle={`${done}/${myRooms.length} ${t.t("roomsDone")}`}
            actions={
              <div className="flex items-center gap-2">
                <LangToggle />
                <button
                  onClick={() => setCurrentStaffId(null)}
                  title={t.t("switchUser")}
                  className="grid size-9 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container"
                >
                  <Avatar staff={me} size={32} />
                </button>
              </div>
            }
          />

          {!online && (
            <div className="flex items-center gap-2 bg-warning/10 px-4 py-2 text-label-sm text-warning">
              <Icon name="cloud_off" size={16} />
              {t.t("offline")}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-label-sm uppercase text-on-surface-subtle">{t.t("myRooms")}</p>
              <Chip
                onClick={() => navigate({ to: "/housekeeper/summary" })}
                className="text-label-sm"
              >
                <Icon name="military_tech" size={14} />
                {t.t("viewSummary")}
              </Chip>
            </div>

            {myRooms.length === 0 ? (
              <p className="text-body mt-6 text-center text-on-surface-subtle">{t.t("noRooms")}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {myRooms.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() =>
                        navigate({ to: "/housekeeper/room/$roomId", params: { roomId: r.id } })
                      }
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${statusMeta[r.status].tile}`}
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-container-lowest text-title text-on-surface">
                        {r.number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-label text-on-surface">{r.type}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <StatusChip status={r.status} />
                          {r.flags.map((f) => (
                            <FlagChip key={f} flag={f} />
                          ))}
                        </div>
                      </div>
                      <Icon name="chevron_right" className="text-on-surface-subtle" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </MobileFrame>
  );
}
