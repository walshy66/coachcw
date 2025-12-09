# CoachCW frontend (Vite + React + TypeScript)

Client UI for CoachCW built on Vite. Current app flows include the landing overview and the profile page.

## Pages and navigation

- Landing overview: schedule calendar, completion and volume charts, and a top-right nav. Overview keeps you on the landing page; Profile switches to the profile view.
- Profile: client details with DOB editing, subscription status, and the same header/nav so you can jump back to Overview.
- Navigation is in-app (no router yet); `NavLinks` calls the handler from `App.tsx` to swap views.

## Develop

- Start dev server: `npm run dev -- --host --port 5173`
- Lint: `npm run lint`
- Tests: `npm test` (Vitest + Testing Library)
- Build: `npm run build`

## Notes

- Mock data/services backfill schedule, metrics, and profile when backend calls fail or aren't present.
- Styles are page-scoped CSS with shared palette in `src/index.css`; page headers mirror the landing layout for consistency.
