# Data Model: Profile Page

## Entities

### UserProfile
- `id`: string (unique user identifier)
- `fullName`: string
- `username`: string
- `email`: string
- `dateOfBirth`: string (ISO date, stored for age calculation)
- `age`: number (derived, not persisted)
- `location`: string (city/region)
- `role`: string (e.g., Client, Coach)
- `avatarUrl`: string (optional)
- `avatarInitials`: string (fallback derived from name)

### Subscription
- `id`: string (subscription identifier)
- `userId`: string (references UserProfile.id)
- `planName`: string
- `status`: enum (`active`, `on_hold`, `canceled`)
- `memberSince`: string (ISO date)
- `renewalDate`: string (ISO date, optional if canceled/on hold)
- `sessionsPerPeriod`: number
- `period`: enum (`month`, `year`) with default `month`
- `autoRenew`: boolean
- `addOns`: string[] (optional)

## Relationships
- `UserProfile` 1 — 1 `Subscription` (for this feature scope)

## Validation Rules
- `email` must be well-formed.
- `dateOfBirth` must be a valid past date; if missing/invalid, age is omitted and “Not provided” is shown.
- `status` must be one of the allowed enum values.
- `renewalDate` required when `status = active`; optional otherwise.
- `sessionsPerPeriod` must be a positive integer when present.

## Derived / Display Logic
- `age` = years between today and `dateOfBirth` (no display if invalid/missing).
- Avatar display: use `avatarUrl` when available; otherwise derive `avatarInitials` from `fullName`.
- Subscription status badges/text must reflect `status` with friendly labels.***
