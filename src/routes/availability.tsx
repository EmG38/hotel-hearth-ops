import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useHotel } from "@/lib/hotel-store";
import type { Room, RoomType } from "@/lib/hotel-types";
import { isBlocked, isSellable, statusMeta } from "@/lib/room-status";
import { Card, Chip, EmptyState, Select, StatTile } from "@/components/ui-kit";
import { PageHero } from "@/components/PageHero";
import { StatusLegend } from "@/components/StatusLegend";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import { wings } from "@/lib/mock-data";

export const Route = createFileRoute("/availability")({
  head: () => ({
    meta: [
      { title: "Availability Board — Golden Sands Hotel" },
      {
        name: "description",
        content: "Sellable room count and live inventory by type and wing for the front desk.",
      },
      { property: "og:title", content: "Availability Board — Golden Sands Hotel" },
      {
        property: "og:description",
        content: "Sellable room count and live inventory by type and wing for the front desk.",
      },
    ],
  }),
  component: AvailabilityBoard,
});

const viewLabel: Record<Room["view"], string> = {
  gulf: "Gulf View",
  garden: "Garden View",
  courtyard: "Courtyard View",
};
const viewIcon: Record<Room["view"], string> = { gulf: "waves", garden: "park", courtyard: "deck" };

const ROOM_TYPES: RoomType[] = ["Standard", "Deluxe", "Suite"];

function AvailabilityBoard() {
  const { rooms, staffById } = useHotel();
  const [showAll, setShowAll] = useState(false);
  const [type, setType] = useState<string>("all");
  const [wing, setWing] = useState<string>("all");

  const sellable = rooms.filter(isSellable);

  const rows = useMemo(
    () =>
      rooms
        .filter(
          (r) =>
            (type === "all" || r.type === type) &&
            (wing === "all" || r.wing === Number(wing)) &&
            (showAll || isSellable(r)),
        )
        .sort((a, b) => a.number.localeCompare(b.number)),
    [rooms, type, wing, showAll],
  );

  return (
    <>
      <PageHero
        ghostIcon="vpn_key"
        eyebrow="Reception"
        title="Availability Board"
        subtitle="Out of Order and Out of Service rooms are excluded from the sellable count"
        actions={
          <Chip active={showAll} onClick={() => setShowAll((v) => !v)}>
            <Icon name={showAll ? "visibility" : "verified"} size={15} filled />
            {showAll ? "Showing all statuses" : "Ready rooms only"}
          </Chip>
        }
      >
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-display text-primary">
              {sellable.length}
              <span className="text-headline text-on-surface-subtle"> of {rooms.length}</span>
            </p>
            <p className="text-label uppercase text-on-surface-variant">Rooms sellable now</p>
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            {ROOM_TYPES.map((t) => {
              const all = rooms.filter((r) => r.type === t);
              return (
                <StatTile
                  key={t}
                  label={t}
                  value={all.filter(isSellable).length}
                  unit={`/ ${all.length}`}
                  icon={t === "Suite" ? "king_bed" : t === "Deluxe" ? "bed" : "single_bed"}
                  tone="success"
                  hint={`${all.filter(isBlocked).length} blocked`}
                />
              );
            })}
          </div>
        </div>
      </PageHero>

      <Card className="mb-5 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-32">
            <span className="text-label-sm uppercase text-on-surface-subtle">Room type</span>
            <Select value={type} onChange={(e) => setType(e.target.value)} className="mt-1.5">
              <option value="all">All types</option>
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </label>
          <label className="min-w-28">
            <span className="text-label-sm uppercase text-on-surface-subtle">Wing</span>
            <Select value={wing} onChange={(e) => setWing(e.target.value)} className="mt-1.5">
              <option value="all">All wings</option>
              {([1, 2, 3, 4, 5] as const).map((w) => (
                <option key={w} value={w}>
                  {wings[w].name}
                </option>
              ))}
            </Select>
          </label>
          <span className="text-body-sm mb-2.5 ml-auto text-on-surface-subtle">
            {rows.length} rooms listed
          </span>
        </div>
        <StatusLegend className="mt-4 border-t border-outline-variant pt-3" />
      </Card>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            icon="search_off"
            title="No rooms match"
            body="Widen the filters or switch to all statuses."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-left">
              <thead>
                <tr className="text-label-sm bg-surface-container uppercase text-on-surface-subtle">
                  <th className="px-4 py-2.5 font-semibold">Room</th>
                  <th className="px-4 py-2.5 font-semibold">Wing</th>
                  <th className="px-4 py-2.5 font-semibold">Type</th>
                  <th className="px-4 py-2.5 font-semibold">View</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold">Flags</th>
                  <th className="px-4 py-2.5 font-semibold">ETA</th>
                  <th className="px-4 py-2.5 font-semibold">Sellable</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const meta = statusMeta[r.status];
                  const attendant = staffById(r.attendantId);
                  return (
                    <tr key={r.id} className="border-t border-outline-variant">
                      <td className="text-body px-4 py-2.5 font-semibold text-on-surface">
                        <span className="flex items-center gap-1.5">
                          {r.number}
                          {r.rush && <Icon name="star" size={14} filled className="text-warning" />}
                        </span>
                      </td>
                      <td className="text-body px-4 py-2.5 text-on-surface-variant">{wings[r.wing].name}</td>
                      <td className="text-body px-4 py-2.5 text-on-surface-variant">{r.type}</td>
                      <td className="px-4 py-2.5">
                        <span className="text-body-sm inline-flex items-center gap-1 text-on-surface-variant">
                          <Icon name={viewIcon[r.view]} size={14} filled={r.view === "gulf"} />
                          {viewLabel[r.view]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={cn("text-body-sm flex items-center gap-1.5", meta.text)}>
                          <span className={cn("size-2 rounded-full", meta.dot)} />
                          {meta.label}
                        </span>
                        {attendant && r.status !== "inspected" && (
                          <span className="text-label-sm text-on-surface-subtle">
                            {attendant.name}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="flex flex-wrap gap-1">
                          {r.flags.length === 0 ? (
                            <span className="text-body-sm text-on-surface-subtle">—</span>
                          ) : (
                            r.flags.map((f) => (
                              <span
                                key={f}
                                className={cn(
                                  "text-label-sm rounded-full border px-2 py-0.5 uppercase",
                                  f === "ooo"
                                    ? "border-ooo/30 bg-ooo/10 text-ooo"
                                    : "border-oos/40 bg-oos/15 text-on-surface-variant",
                                )}
                              >
                                {f === "ooo"
                                  ? "Out of Order"
                                  : f === "oos"
                                    ? "Out of Service"
                                    : "DND"}
                              </span>
                            ))
                          )}
                        </span>
                      </td>
                      <td className="text-body-sm px-4 py-2.5 tabular-nums text-on-surface-variant">
                        {r.eta ?? "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        {isSellable(r) ? (
                          <Icon name="check_circle" size={20} filled className="text-success" />
                        ) : (
                          <Icon name="block" size={20} className="text-on-surface-subtle" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
