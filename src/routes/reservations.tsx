import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useHotel } from "@/lib/hotel-store";
import { Button, Card, Field, PageHeader, StatTile, inputClass } from "@/components/ui-kit";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import { statusMeta } from "@/lib/room-status";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "Reservations — Hotel App" },
      {
        name: "description",
        content:
          "Adjust expected arrival and departure times; changes reprioritise housekeeping order.",
      },
      { property: "og:title", content: "Reservations — Hotel App" },
      {
        property: "og:description",
        content:
          "Adjust expected arrival and departure times; changes reprioritise housekeeping order.",
      },
    ],
  }),
  component: Reservations,
});

function TimeEditor({ reservationId }: { reservationId: string }) {
  const { reservations, updateReservationTimes, roomById, toggleRush } = useHotel();
  const res = reservations.find((r) => r.id === reservationId)!;
  const [checkIn, setCheckInTime] = useState(res.expectedCheckIn);
  const [checkOut, setCheckOutTime] = useState(res.expectedCheckOut);
  const [saved, setSaved] = useState(false);
  const room = roomById(res.roomId);

  const earlyCheckIn = checkIn < "14:00";
  const lateCheckout = checkOut > "11:00";

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-title flex items-center gap-2 text-on-surface">
            {res.guestName}
            {res.vip && (
              <Icon name="workspace_premium" size={15} filled className="text-secondary" />
            )}
          </p>
          <p className="text-label-sm text-on-surface-subtle">
            {res.code} · {res.roomType} · {res.nights} nights ·{" "}
            {res.status === "checked_in" ? "in house" : "expected"}
          </p>
        </div>
        {room && (
          <span
            className={cn(
              "text-label-sm inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 uppercase",
              statusMeta[room.status].chip,
            )}
          >
            <Icon name="meeting_room" size={14} filled />
            Room {room.number} · {statusMeta[room.status].short}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field
          label="Expected check-in"
          hint={earlyCheckIn ? "Early arrival — room prioritised" : undefined}
        >
          <input
            type="time"
            value={checkIn}
            onChange={(e) => {
              setCheckInTime(e.target.value);
              setSaved(false);
            }}
            className={inputClass}
          />
        </Field>
        <Field
          label="Expected check-out"
          hint={lateCheckout ? "Late checkout — clean scheduled later" : undefined}
        >
          <input
            type="time"
            value={checkOut}
            onChange={(e) => {
              setCheckOutTime(e.target.value);
              setSaved(false);
            }}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-outline-variant pt-3">
        {saved && (
          <span className="text-body-sm mr-auto flex items-center gap-1.5 text-success">
            <Icon name="check_circle" size={16} filled />
            Times updated and sent to housekeeping
          </span>
        )}
        {room && earlyCheckIn && (
          <Button
            variant="outline"
            icon="star"
            onClick={() => {
              const next = !room.rush;
              toggleRush(room.id);
              toast(
                next
                  ? `Room ${room.number} flagged Rush`
                  : `Rush flag removed from Room ${room.number}`,
              );
            }}
          >
            {room.rush ? "Remove rush flag" : "Flag room as Rush"}
          </Button>
        )}
        <Button
          variant="primary"
          icon="save"
          disabled={checkIn === res.expectedCheckIn && checkOut === res.expectedCheckOut}
          onClick={() => {
            updateReservationTimes(res.id, {
              expectedCheckIn: checkIn,
              expectedCheckOut: checkOut,
            });
            setSaved(true);
            toast.success(`${res.guestName}'s times updated`, {
              description: "Housekeeping priority order refreshed",
              icon: <Icon name="save" size={18} filled />,
            });
          }}
        >
          Update reservation
        </Button>
      </div>
    </Card>
  );
}

function Reservations() {
  const { reservations } = useHotel();
  const [tab, setTab] = useState<"arrivals" | "in_house">("arrivals");

  const arrivals = reservations.filter((r) => r.status === "expected");
  const inHouse = reservations.filter((r) => r.status === "checked_in");
  const list = tab === "arrivals" ? arrivals : inHouse;

  return (
    <>
      <PageHeader
        title="Reservations"
        subtitle="Early check-in and late checkout changes reprioritise the housekeeping order for that room"
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatTile
          label="Arrivals today"
          value={arrivals.length}
          icon="flight_land"
          tone="tertiary"
        />
        <StatTile label="In house" value={inHouse.length} icon="hotel" tone="info" />
        <StatTile
          label="Late checkouts"
          value={inHouse.filter((r) => r.expectedCheckOut > "11:00").length}
          icon="more_time"
          tone="warning"
        />
      </div>

      <div className="mb-4 flex gap-1.5">
        {(
          [
            { key: "arrivals", label: "Arrivals", icon: "flight_land" },
            { key: "in_house", label: "In house", icon: "hotel" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "text-label inline-flex items-center gap-2 rounded-full border px-4 py-2 transition-colors",
              tab === t.key
                ? "border-primary bg-primary text-on-primary"
                : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container",
            )}
          >
            <Icon name={t.icon} size={16} filled />
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.map((r) => (
          <TimeEditor key={r.id} reservationId={r.id} />
        ))}
      </div>
    </>
  );
}
