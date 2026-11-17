import type { CleaningAnomaly, Room } from "@/lib/hotel-types";
import { checklistTemplateFor, inspectionPoints, scoreInspection as scoreInspectionPoints } from "@/lib/mock-data";

export function checklistProgress(room: Room) {
  const list = checklistTemplateFor(room.taskType === "reclean" ? "departure" : room.taskType);
  const done = list.filter((it) => room.checklist[it.id]?.status === "done").length;
  const missingMandatory = list.filter((it) => it.mandatory && room.checklist[it.id]?.status !== "done");
  const missingPhoto = list.filter(
    (it) => it.photo && room.checklist[it.id]?.status === "done" && !room.checklist[it.id]?.photo,
  );
  const skipped = list.filter((it) => room.checklist[it.id]?.status === "skipped").length;
  return {
    list,
    total: list.length,
    done,
    skipped,
    percent: list.length ? Math.round((done / list.length) * 100) : 0,
    canComplete: missingMandatory.length === 0 && missingPhoto.length === 0,
    missingCount: missingMandatory.length + missingPhoto.length,
  };
}

/** Quality signals computed when a room is marked clean — surfaced to the
 * supervisor only, never shown to the housekeeper, same as Abdul's Riwaq. */
export function detectAnomalies(room: Room, minutes: number | undefined): CleaningAnomaly[] {
  const anomalies: CleaningAnomaly[] = [];
  if (room.cleaningStartedAt === undefined) {
    anomalies.push("no_start");
    return anomalies;
  }
  const standardMinutes = room.type === "Suite" ? 55 : room.type === "Deluxe" ? 40 : 30;
  if (minutes !== undefined && minutes < standardMinutes * 0.4) anomalies.push("too_fast");
  const ticks = Object.values(room.checklist).map((x) => x.at);
  if (ticks.length >= 5) {
    const unique = new Set(ticks).size;
    if (unique <= 2 && (minutes ?? 0) > 3) anomalies.push("bulk_tick");
  }
  return anomalies;
}

export function scoreInspection(results: Record<string, boolean>) {
  return scoreInspectionPoints(results);
}

export { inspectionPoints };
