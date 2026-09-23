# Hotel Operations Hub

Build a web-based hotel operations console called "Hotel App" for two staff roles: Supervisor and Reception (a third role, Housekeeper, already exists as a separate mobile app — don't build that here). This is an internal ops tool for a 100-room hotel, not a consumer product — dense, fast, utilitarian, not marketing-styled.




TECH: React + TypeScript + Tailwind. Define the palette below as named Tailwind theme colors (not hardcoded hex scattered through components) so the codebase stays token-driven — I'll be editing this repo directly afterward. Use Google Material Symbols Rounded (via the Google Fonts icon font, ligature names as text, e.g. "cleaning_services") for ALL icons — not lucide or any other icon set — so icons match an existing Figma mobile app built with the same system.




DESIGN TOKENS (Tailwind theme colors — use these names):

- primary #16A34A / on-primary #FFFFFF

- secondary #47855E (low-emphasis only, chips/links — never status)

- tertiary #387294

- success (="available" status) #0D9488

- warning (="pending" status) #D97706

- error (="dirty" status) #DC2626

- info (="clean" status) #4389B1

- surface #FAFAFA, surface-container-lowest #FFFFFF, surface-container #F1F5F9, surface-container-high #E2E8F0

- on-surface #0F172A, on-surface-variant #475569, on-surface-subtle #94A3B8

- outline #64748B, outline-variant #CBD5E1

Type: system sans (Inter or similar), Material-3-like scale (Display/Headline/Title/Body/Label). 8pt spacing grid. Rounded cards (12-20px radius), soft shadows, pill buttons/chips — same visual language as a mobile app already built for this project (clean, card-based, not skeuomorphic).




ROOM STATUS SYSTEM (use consistently everywhere a room appears):

Dirty (error) → In Progress (warning) → Clean, awaiting inspection (info) → Inspected/Ready (success). Flags on top of status, not replacing it: Out of Order (dark neutral #1E293B), Out of Service (mid neutral #94A3B8), Do Not Disturb (icon badge only).




APP SHELL: persistent left sidebar (Property Board / Inspections / Issues / Performance for Supervisor; Availability / Check-In / Reservations for Reception — group under two labeled sections or a role switcher at the top), top bar with search + a role indicator, main content area. Responsive down to tablet width (Reception can go to desktop-only, Supervisor must work at tablet width too).




SUPERVISOR SCREENS:

1. Property Board — grid of all 100 rooms grouped by floor (5 floors × 20) and room type (Standard/Deluxe/Suite), color-coded by status, filters (floor/status/attendant), rush-flag indicator (star badge) on flagged rooms.

2. Assign/Reassign — click a room, side panel or modal to assign/reassign to a housekeeper from a staff list (avatar, name, current workload).

3. Inspection Queue — list of rooms in "Clean, awaiting inspection", a checklist per room (Bed/Bathroom/Amenities/General), Pass (→ Inspected) / Reject (note field, → back to Dirty/In Progress) actions.

4. Issue Triage — housekeeper-submitted issues with photo thumbnails, assign to maintenance or mark room Out of Service/Out of Order.

5. Performance Dashboard — AGGREGATE ONLY, explicitly no public ranking: per-shift totals (rooms completed, avg time/room, on-time %, inspection pass rate) plus a supervisor-only per-housekeeper table (not a leaderboard, not visible to housekeepers).




RECEPTION SCREENS:

1. Availability Board — table/grid of all rooms defaulting to Inspected/Ready only, toggle for full status, filters by type/floor, sellable count at top ("87 of 100 rooms sellable"), OOO/OOS excluded from that count but visible with a neutral badge.

2. Check-In — reservation lookup, room selection restricted to Inspected rooms (non-ready rooms shown disabled with real status), "Check Guest In" primary action.

3. Not-Ready Room handling — within check-in, show real status + ETA if known, "Flag as Rush" action (notifies supervisor board), "Offer Alternate Room" fallback.

4. Late Checkout / Early Check-In — simple form updating a reservation's expected time, which reprioritizes that room on the housekeeping side.




Placeholder data is fine (100 rooms, sample staff, sample reservations) — I'll wire this to real data later. Keep components cleanly separated per screen for easy editing afterward.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2729a9fd-2a7d-4406-bbb9-de6333a53053).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
