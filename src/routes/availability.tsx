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
import { useI18n, useStatusText, useTypeText, useViewText, useWingName } from "@/lib/i18n";

export const Route = createFileRoute("/availability")({
  head: () => ({
    meta: [
      { title: "Availability Board — Marsa Dhahab Hotel" },
      {
        name: "description",
        content: "Sellable room count and live inventory by type and wing for the front desk.",
      },
      { property: "og:title", content: "Availability Board — Marsa Dhahab Hotel" },
      {
        property: "og:description",
        content: "Sellable room count and live inventory by type and wing for the front desk.",
      },
    ],
  }),
  component: AvailabilityBoard,
});

const viewIcon: Record<Room["view"], string> = { gulf: "waves", garden: "park", courtyard: "deck" };

const ROOM_TYPES: RoomType[] = ["Standard", "Deluxe", "Suite"];

function AvailabilityBoard() {
  const { rooms, staffById } = useHotel();
  const { t } = useI18n();
  const statusText = useStatusText();
  const typeText = useTypeText();
  const viewText = useViewText();
  const wingName = useWingName();
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
        eyebrow={t("role.reception")}
        title={t("av.title")}
        subtitle={t("av.subtitle")}
        actions={
          <Chip active={showAll} onClick={() => setShowAll((v) => !v)}>
            <Icon name={showAll ? "visibility" : "verified"} size={15} filled />
            {showAll ? t("av.showAll") : t("av.readyOnly")}
          </Chip>
        }
      >
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-display text-primary">
              {sellable.length}
              <span className="text-headline text-on-surface-subtle">
                {" "}
                {t("av.of")} {rooms.length}
              </span>
            </p>
            <p className="text-label uppercase text-on-surface-variant">{t("av.sellableNow")}</p>
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            {ROOM_TYPES.map((ty) => {
              const all = rooms.filter((r) => r.type === ty);
              return (
                <StatTile
                  key={ty}
                  label={typeText[ty]}
                  value={all.filter(isSellable).length}
                  unit={`/ ${all.length}`}
                  icon={ty === "Suite" ? "king_bed" : ty === "Deluxe" ? "bed" : "single_bed"}
                  tone="success"
                  hint={t("av.blocked", { n: all.filter(isBlocked).length })}
                />
              );
            })}
          </div>
        </div>
      </PageHero>

      <Card className="mb-5 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-32">
            <span className="text-label-sm uppercase text-on-surface-subtle">
              {t("av.roomType")}
            </span>
            <Select value={type} onChange={(e) => setType(e.target.value)} className="mt-1.5">
              <option value="all">{t("common.allTypes")}</option>
              {ROOM_TYPES.map((ty) => (
                <option key={ty} value={ty}>
                  {typeText[ty]}
                </option>
              ))}
            </Select>
          </label>
          <label className="min-w-28">
            <span className="text-label-sm uppercase text-on-surface-subtle">{t("pb.wing")}</span>
            <Select value={wing} onChange={(e) => setWing(e.target.value)} className="mt-1.5">
              <option value="all">{t("common.allWings")}</option>
              {([1, 2, 3, 4, 5] as const).map((w) => (
                <option key={w} value={w}>
                  {wingName(w)}
                </option>
              ))}
            </Select>
          </label>
          <span className="text-body-sm mb-2.5 ml-auto text-on-surface-subtle">
            {t("av.listed", { n: rows.length })}
          </span>
        </div>
        <StatusLegend className="mt-4 border-t border-outline-variant pt-3" />
      </Card>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon="search_off" title={t("av.noMatch")} body={t("av.noMatchBody")} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-left">
              <thead>
                <tr className="text-label-sm bg-surface-container uppercase text-on-surface-subtle">
                  <th className="px-4 py-2.5 font-semibold">{t("av.col.room")}</th>
                  <th className="px-4 py-2.5 font-semibold">{t("av.col.wing")}</th>
                  <th className="px-4 py-2.5 font-semibold">{t("av.col.type")}</th>
                  <th className="px-4 py-2.5 font-semibold">{t("av.col.view")}</th>
                  <th className="px-4 py-2.5 font-semibold">{t("av.col.status")}</th>
                  <th className="px-4 py-2.5 font-semibold">{t("av.col.flags")}</th>
                  <th className="px-4 py-2.5 font-semibold">{t("av.col.eta")}</th>
                  <th className="px-4 py-2.5 font-semibold">{t("av.col.sellable")}</th>
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
                      <td className="text-body px-4 py-2.5 text-on-surface-variant">
                        {wingName(r.wing)}
                      </td>
                      <td className="text-body px-4 py-2.5 text-on-surface-variant">
                        {typeText[r.type]}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-body-sm inline-flex items-center gap-1 text-on-surface-variant">
                          <Icon
                            name={viewIcon[r.view]}
                            size={14}
                            filled={r.view === "gulf"}
                            className="text-tertiary"
                          />
                          {viewText[r.view]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={cn("text-body-sm flex items-center gap-1.5", meta.text)}>
                          <span className={cn("size-2 rounded-full", meta.dot)} />
                          {statusText[r.status].label}
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
                                  ? t("flag.ooo")
                                  : f === "oos"
                                    ? t("flag.oos")
                                    : t("flag.dnd.short")}
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
