# Quickstart: Program progress page

## Run the app

1. `cd app`
2. Ensure env uses mocks (default: VITE_USE_MOCKS=true in .env.example). Adjust as needed when backend is ready.
3. `npm install` (if not already)
4. `npm run dev`

## Run tests

1. `cd app`
2. `npm test` (Vitest) to run unit/integration suite.
3. For focused work, use `npm test -- --runInBand program` (once Program tests exist).

## What to verify

- Program page renders macro phase timeline, micro cycle list, and progress graphs with mock data.
- Current phase/cycle and next session are highlighted and linked to sessions.
- Empty/error states render when program data is missing or failing to load.
- Nav links remain consistent with shared `NavLinks` component.
