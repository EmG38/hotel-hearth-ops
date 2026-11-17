import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useHotel } from "@/lib/hotel-store";
import type { Room, RoomStatus, RoomType } from "@/lib/hotel-types";
import { STATUS_ORDER, statusMeta } from "@/lib/room-status";
import { Card, Chip, Select, StatTile } from "@/components/ui-kit";
import { PageHero } from "@/components/PageHero";
import { RoomTile } from "@/components/RoomTile";
import { StatusLegend } from "@/components/StatusLegend";
import { AssignPanel } from "@/components/supervisor/AssignPanel";
import { Icon } from "@/components/Icon";
import { useI18n, useStatusText, useTypeText, useWingName } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Property Board — Golden Sands Hotel" },
      {
        name: "description",
        content:
          "Live status of all 100 rooms by wing and room type, with rush flags and filters.",
      },
      { property: "og:title", content: "Property Board — Golden Sands Hotel" },
      {
        property: "og:description",
        content:
          "Live status of all 100 rooms by wing and room type, with rush flags and filters.",
      },
    ],
  }),
  component: PropertyBoard,
});

const ROOM_TYPES: RoomType[] = ["Standard", "Deluxe", "Suite"];

function PropertyBoard() {
  const { rooms, staff, focusRoomId, setFocusRoomId } = useHotel();
  const { t } = useI18n();
  const statusText = useStatusText();
  const typeText = useTypeText();
  const wingName = useWingName();
  const [wing, setWing] = useState<string>("all");
  const [status, setStatus] = useState<RoomStatus | "all">("all");
  const [attendant, setAttendant] = useState<string>("all");
  const [rushOnly, setRushOnly] = useState(false);

  const filtered = useMemo(
    () =>
      rooms.filter(
        (r) =>
          (wing === "all" || r.wing === Number(wing)) &&
          (status === "all" || r.status === status) &&
          (attendant === "all" ||
            (attendant === "none" ? r.attendantId === null : r.attendantId === attendant)) &&
          (!rushOnly || r.rush),
      ),
    [rooms, wing, status, attendant, rushOnly],
  );

  const counts = useMemo(() => {
    const base: Record<string, number> = { dirty: 0, in_progress: 0, clean: 0, inspected: 0 };
    rooms.forEach((r) => {
      base[r.status] = (base[r.status] ?? 0) + 1;
    });
    return base;
  }, [rooms]);

  const [selected, setSelected] = useState<Room | null>(null);
  const wingIds = [5, 4, 3, 2, 1] as const;

  useEffect(() => {
    if (!focusRoomId) return;
    const room = rooms.find((r) => r.id === focusRoomId);
    if (room) {
      setSelected(room);
      setWing("all");
      setStatus("all");
      setAttendant("all");
      setRushOnly(false);
    }
    setFocusRoomId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRoomId]);

  return (
    <>
      <PageHero
        ghostIcon="apartment"
        eyebrow={t("role.supervisor")}
        title={t("pb.title")}
        subtitle={t("pb.subtitle", {
          total: rooms.length,
          shown: filtered.length,
          rush: rooms.filter((r) => r.rush).length,
        })}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {STATUS_ORDER.map((s) => (
            <StatTile
              key={s}
              label={statusText[s].label}
              value={counts[s] ?? 0}
              icon={statusMeta[s].icon}
              tone={
                s === "dirty"
                  ? "error"
                  : s === "in_progress"
                    ? "warning"
                    : s === "clean"
                      ? "info"
                      : "success"
              }
              hint={t("pb.ofProperty", { n: Math.round(((counts[s] ?? 0) / rooms.length) * 100) })}
            />
          ))}
        </div>
      </PageHero>

      <Card className="mb-5 p-4">
        <div className="flex flex-wrap items-end gap-3">
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
          <label className="min-w-40">
            <span className="text-label-sm uppercase text-on-surface-subtle">{t("pb.status")}</span>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as RoomStatus | "all")}
              className="mt-1.5"
            >
              <option value="all">{t("common.allStatuses")}</option>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {statusText[s].label}
                </option>
              ))}
            </Select>
          </label>
          <label className="min-w-40">
            <span className="text-label-sm uppercase text-on-surface-subtle">
              {t("pb.attendant")}
            </span>
            <Select
              value={attendant}
              onChange={(e) => setAttendant(e.target.value)}
              className="mt-1.5"
            >
              <option value="all">{t("common.anyone")}</option>
              <option value="none">{t("common.unassigned")}</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </label>
          <Chip active={rushOnly} onClick={() => setRushOnly((v) => !v)} className="mb-0.5">
            <Icon name="star" size={15} filled />
            {t("pb.rushOnly")}
          </Chip>
        </div>
        <StatusLegend className="mt-4 border-t border-outline-variant pt-3" />
      </Card>

      <div className="space-y-4">
        {wingIds.map((w) => {
          const wingRooms = filtered.filter((r) => r.wing === w);
          if (wingRooms.length === 0) return null;
          return (
            <Card key={w} className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-title-lg text-on-surface">{wingName(w)}</h2>
                <span className="text-label-sm text-on-surface-subtle">
                  {t("common.roomsCount", { n: wingRooms.length })}
                </span>
              </div>
              <div className="space-y-3">
                {ROOM_TYPES.map((ty) => {
                  const typeRooms = wingRooms.filter((r) => r.type === ty);
                  if (typeRooms.length === 0) return null;
                  return (
                    <div key={ty}>
                      <p className="text-label-sm mb-1.5 uppercase text-on-surface-subtle">
                        {typeText[ty]} · {typeRooms.length}
                      </p>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10">
                        {typeRooms.map((r) => (
                          <RoomTile
                            key={r.id}
                            room={r}
                            selected={selected?.id === r.id}
                            onClick={() => setSelected(r)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <AssignPanel
        room={selected ? (rooms.find((r) => r.id === selected.id) ?? null) : null}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
