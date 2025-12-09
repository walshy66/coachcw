# Quickstart: Profile Page

## Prerequisites
- Node.js 20+
- npm 10+

## Setup
```bash
cd app
npm install
```

## Run the app
```bash
npm run dev -- --host --port 5173 --strictPort
```
Open http://localhost:5173/.

## Tests
```bash
npm test
```

## Data assumptions
- Profile and subscription endpoints are available at `/api/profile`, `/api/subscription`.
- If APIs are unavailable, provide a mocked response for UI development (age-only display; DOB used only in edit flow).

## Feature behaviors to verify
- Age shows on profile; full DOB hidden.
- DOB edit opens a labeled date picker; saving recalculates age.
- Subscription section shows plan, status, dates, sessions, add-ons, auto-renew; shows friendly “unavailable” copy on errors.
- Placeholder note indicates payment management will be added later.
