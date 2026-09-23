import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useHotel } from "@/lib/hotel-store";
import type { Reservation, Room } from "@/lib/hotel-types";
import { isBlocked, isSellable, statusMeta } from "@/lib/room-status";
import {
  Button,
  Card,
  Chip,
  EmptyState,
  PageHeader,
  StatusChip,
  inputClass,
} from "@/components/ui-kit";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/check-in")({
  head: () => ({
    meta: [
      { title: "Check-In — Hotel App" },
      {
        name: "description",
        content:
          "Look up a reservation, assign an inspected room, flag rush cleans or offer an alternate.",
      },
      { property: "og:title", content: "Check-In — Hotel App" },
      {
        property: "og:description",
        content:
          "Look up a reservation, assign an inspected room, flag rush cleans or offer an alternate.",
      },
    ],
  }),
  component: CheckIn,
});

function ReservationRow({
  reservation,
  active,
  onClick,
}: {
  reservation: Reservation;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
        active
          ? "border-primary bg-primary-container"
          : "border-outline-variant hover:bg-surface-container",
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tertiary/10 text-tertiary">
        <Icon name="person" size={18} filled />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-body flex items-center gap-1.5 font-medium text-on-surface">
          <span className="truncate">{reservation.guestName}</span>
          {reservation.vip && (
            <Icon name="workspace_premium" size={15} filled className="text-secondary" />
          )}
        </span>
        <span className="text-label-sm block text-on-surface-subtle">
          {reservation.code} · {reservation.roomType} · {reservation.nights}n · {reservation.guests}{" "}
          guests · ETA {reservation.expectedCheckIn}
        </span>
      </span>
      {reservation.status === "checked_in" && (
        <span className="text-label-sm rounded-full border border-success/20 bg-success/10 px-2 py-0.5 uppercase text-success">
          In
        </span>
      )}
    </button>
  );
}

function NotReadyPanel({ room, onAlternate }: { room: Room; onAlternate: () => void }) {
  const { toggleRush, staffById } = useHotel();
  const attendant = staffById(room.attendantId);
  return (
    <div className="mt-3 rounded-xl border border-warning/30 bg-warning/5 p-4">
      <div className="flex items-start gap-3">
        <Icon name="warning" size={20} filled className="mt-0.5 text-warning" />
        <div className="min-w-0 flex-1">
          <p className="text-title text-on-surface">Room {room.number} is not ready</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <StatusChip status={room.status} />
            {room.eta && (
              <span className="text-label-sm inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-lowest px-2 py-0.5 text-on-surface-variant">
                <Icon name="schedule" size={13} />
                ETA {room.eta}
              </span>
            )}
            {attendant && (
              <span className="text-label-sm text-on-surface-subtle">
                Assigned to {attendant.name}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant={room.rush ? "outline" : "primary"}
              icon="star"
              onClick={() => {
                const next = !room.rush;
                toggleRush(room.id);
                toast(
                  next
                    ? `Room ${room.number} flagged Rush — supervisor notified`
                    : `Rush flag removed from Room ${room.number}`,
                  { icon: <Icon name="star" size={18} filled /> },
                );
              }}
            >
              {room.rush ? "Rush flag active — remove" : "Flag as Rush"}
            </Button>
            <Button variant="outline" icon="swap_horiz" onClick={onAlternate}>
              Offer alternate room
            </Button>
          </div>
          <p className="text-label-sm mt-2 text-on-surface-subtle">
            Rush flags appear immediately on the supervisor Property Board and inspection queue.
          </p>
        </div>
      </div>
    </div>
  );
}

function CheckIn() {
  const { rooms, reservations, checkIn, roomById, focusReservationId, setFocusReservationId } =
    useHotel();
  const [query, setQuery] = useState("");
  const [resId, setResId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [sameTypeOnly, setSameTypeOnly] = useState(true);
  const [alternates, setAlternates] = useState(false);

  useEffect(() => {
    if (!focusReservationId) return;
    const res = reservations.find((r) => r.id === focusReservationId);
    if (res) {
      setResId(res.id);
      setRoomId(res.roomId);
    }
    setFocusReservationId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusReservationId]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reservations.filter(
      (r) => q === "" || r.guestName.toLowerCase().includes(q) || r.code.toLowerCase().includes(q),
    );
  }, [reservations, query]);

  const reservation = reservations.find((r) => r.id === resId) ?? null;
  const selectedRoom = roomById(roomId);

  const candidates = useMemo(() => {
    if (!reservation) return [];
    return rooms
      .filter((r) => !isBlocked(r))
      .filter((r) => (sameTypeOnly && !alternates ? r.type === reservation.roomType : true))
      .sort(
        (a, b) => Number(isSellable(b)) - Number(isSellable(a)) || a.number.localeCompare(b.number),
      )
      .slice(0, 24);
  }, [rooms, reservation, sameTypeOnly, alternates]);

  return (
    <>
      <PageHeader
        title="Check-In"
        subtitle="Only Inspected / Ready rooms can be assigned — everything else is shown with its real status"
      />

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Card className="p-4">
          <p className="text-title mb-3 text-on-surface">Reservation lookup</p>
          <div className="relative">
            <Icon
              name="search"
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-subtle"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Guest name or reservation code"
              className={cn(inputClass, "pl-10")}
            />
          </div>
          <div className="mt-3 space-y-1.5">
            {results.length === 0 ? (
              <EmptyState icon="person_search" title="No reservation found" />
            ) : (
              results.map((r) => (
                <ReservationRow
                  key={r.id}
                  reservation={r}
                  active={resId === r.id}
                  onClick={() => {
                    setResId(r.id);
                    setRoomId(r.roomId);
                    setAlternates(false);
                  }}
                />
              ))
            )}
          </div>
        </Card>

        <Card className="p-4">
          {!reservation ? (
            <EmptyState
              icon="how_to_reg"
              title="Select a reservation"
              body="Pick a guest on the left to choose a room and complete check-in."
            />
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-outline-variant pb-3">
                <div>
                  <p className="text-title-lg flex items-center gap-2 text-on-surface">
                    {reservation.guestName}
                    {reservation.vip && (
                      <span className="text-label-sm inline-flex items-center gap-1 rounded-full border border-secondary/30 bg-primary-container px-2 py-0.5 uppercase text-secondary">
                        <Icon name="workspace_premium" size={13} filled />
                        VIP
                      </span>
                    )}
                  </p>
                  <p className="text-body-sm mt-0.5 text-on-surface-variant">
                    {reservation.code} · {reservation.roomType} · {reservation.nights} nights ·{" "}
                    {reservation.guests} guests · arriving {reservation.arrival} at{" "}
                    {reservation.expectedCheckIn}
                  </p>
                </div>
                {reservation.status === "checked_in" && selectedRoom && (
                  <span className="text-label animate-in fade-in zoom-in-95 inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-success duration-300">
                    <Icon name="check_circle" size={16} filled />
                    Checked in to {selectedRoom.number}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Chip active={sameTypeOnly && !alternates} onClick={() => setSameTypeOnly(true)}>
                  {reservation.roomType} only
                </Chip>
                <Chip
                  active={!sameTypeOnly || alternates}
                  onClick={() => {
                    setSameTypeOnly(false);
                    setAlternates(true);
                  }}
                >
                  <Icon name="swap_horiz" size={15} />
                  All alternates
                </Chip>
                <span className="text-label-sm ml-auto text-on-surface-subtle">
                  {candidates.filter(isSellable).length} ready of {candidates.length} shown
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {candidates.map((r) => {
                  const ready = isSellable(r);
                  const meta = statusMeta[r.status];
                  return (
                    <button
                      key={r.id}
                      disabled={!ready}
                      onClick={() => setRoomId(r.id)}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-colors",
                        ready
                          ? "border-success/30 bg-success/5 hover:bg-success/10"
                          : "cursor-not-allowed border-outline-variant bg-surface-container opacity-70",
                        roomId === r.id && "ring-2 ring-primary ring-offset-1",
                      )}
                    >
                      <span className="text-title flex items-center justify-between text-on-surface">
                        {r.number}
                        {r.rush && <Icon name="star" size={14} filled className="text-warning" />}
                      </span>
                      <span className="text-label-sm block text-on-surface-subtle">{r.type}</span>
                      <span className={cn("text-label-sm mt-1 flex items-center gap-1", meta.text)}>
                        <Icon name={meta.icon} size={13} filled />
                        {meta.short}
                      </span>
                      {r.eta && !ready && (
                        <span className="text-label-sm block text-on-surface-subtle">
                          ETA {r.eta}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedRoom && !isSellable(selectedRoom) && (
                <NotReadyPanel
                  room={selectedRoom}
                  onAlternate={() => {
                    setSameTypeOnly(false);
                    setAlternates(true);
                  }}
                />
              )}

              <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-outline-variant pt-4">
                <span className="text-body-sm mr-auto text-on-surface-variant">
                  {selectedRoom
                    ? isSellable(selectedRoom)
                      ? `Room ${selectedRoom.number} is inspected and ready.`
                      : `Room ${selectedRoom.number} cannot be assigned yet.`
                    : "Choose a ready room to continue."}
                </span>
                <Button
                  variant="primary"
                  icon="how_to_reg"
                  disabled={
                    !selectedRoom ||
                    !isSellable(selectedRoom) ||
                    reservation.status === "checked_in"
                  }
                  onClick={() => {
                    if (!selectedRoom) return;
                    checkIn(reservation.id, selectedRoom.id);
                    toast.success(
                      `${reservation.guestName} checked in to Room ${selectedRoom.number}`,
                      {
                        description: "Welcome them in — have a great stay!",
                        icon: <Icon name="celebration" size={18} filled />,
                      },
                    );
                  }}
                >
                  Check Guest In
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
