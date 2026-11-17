import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Icon } from "./Icon";
import { useHotel } from "@/lib/hotel-store";
import { statusMeta } from "@/lib/room-status";
import { wings } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type ResultItem =
  | { kind: "room"; id: string; primary: string; secondary: string; icon: string }
  | { kind: "reservation"; id: string; primary: string; secondary: string; icon: string };

export function GlobalSearch() {
  const { rooms, reservations, setFocusRoomId, setFocusReservationId } = useHotel();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo<ResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return [];

    const roomMatches: ResultItem[] = rooms
      .filter(
        (r) =>
          r.number.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          wings[r.wing].name.toLowerCase().includes(q),
      )
      .slice(0, 5)
      .map((r) => ({
        kind: "room",
        id: r.id,
        primary: `Room ${r.number}`,
        secondary: `${wings[r.wing].name} · ${r.type} · ${statusMeta[r.status].label}`,
        icon: "meeting_room",
      }));

    const reservationMatches: ResultItem[] = reservations
      .filter((r) => r.guestName.toLowerCase().includes(q) || r.code.toLowerCase().includes(q))
      .slice(0, 5)
      .map((r) => ({
        kind: "reservation",
        id: r.id,
        primary: r.guestName,
        secondary: `${r.code} · ${r.roomType} · ${r.status === "checked_in" ? "In house" : "Expected " + r.expectedCheckIn}`,
        icon: "event_note",
      }));

    return [...roomMatches, ...reservationMatches];
  }, [query, rooms, reservations]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function selectResult(item: ResultItem) {
    if (item.kind === "room") {
      setFocusRoomId(item.id);
      navigate({ to: "/" });
    } else {
      setFocusReservationId(item.id);
      navigate({ to: "/check-in" });
    }
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <Icon
        name="search"
        size={18}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-subtle"
      />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => query && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            (e.target as HTMLInputElement).blur();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && results[activeIndex]) {
            selectResult(results[activeIndex]);
          }
        }}
        placeholder="Search room, guest or reservation"
        className="text-body w-full rounded-full border border-outline-variant bg-surface-container py-2 pl-10 pr-3 text-on-surface outline-none transition-colors placeholder:text-on-surface-subtle focus:border-primary focus:bg-surface-container-lowest focus-visible:ring-2 focus-visible:ring-primary/30"
      />

      {open && query.trim().length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-1 absolute top-full z-40 mt-2 w-full overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-raised duration-150">
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 px-4 py-8 text-center">
              <Icon name="search_off" size={26} className="text-on-surface-subtle" />
              <p className="text-body-sm text-on-surface-variant">
                No rooms or reservations match "{query}"
              </p>
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1.5">
              {results.map((item, i) => (
                <li key={`${item.kind}-${item.id}`}>
                  <button
                    onClick={() => selectResult(item)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                      i === activeIndex ? "bg-surface-container" : "hover:bg-surface-container",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-full",
                        item.kind === "room"
                          ? "bg-primary/10 text-primary"
                          : "bg-tertiary/10 text-tertiary",
                      )}
                    >
                      <Icon name={item.icon} size={18} filled />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-body block truncate font-medium text-on-surface">
                        {item.primary}
                      </span>
                      <span className="text-label-sm block truncate text-on-surface-subtle">
                        {item.secondary}
                      </span>
                    </span>
                    <Icon name="chevron_right" size={18} className="text-on-surface-subtle" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
