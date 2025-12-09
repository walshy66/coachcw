# Contracts: Profile Page

## Overview
Read-only profile view with optional DOB edit flow (age displayed). Payment method management is deferred.

## REST Endpoints (proposed)

### GET /api/profile
- **Purpose**: Fetch the signed-in user’s profile details.
- **Response 200** (`application/json`):
```json
{
  "id": "user_123",
  "fullName": "Alex Morgan",
  "username": "alex.morgan",
  "email": "alex.morgan@coachcw.com",
  "dateOfBirth": "1992-05-12",
  "avatarUrl": "https://...",
  "avatarInitials": "AM",
  "location": "San Diego, CA",
  "role": "Client"
}
```
- **Errors**: 401 (unauthenticated), 403 (wrong user), 500 (generic message only).

### PATCH /api/profile/dob
- **Purpose**: Update date of birth for the signed-in user.
- **Request** (`application/json`):
```json
{ "dateOfBirth": "1992-05-12" }
```
- **Response 200**:
```json
{ "dateOfBirth": "1992-05-12", "age": 33 }
```
- **Validation**: DOB must be a valid past date; reject future dates with 422.
- **Errors**: 401, 403, 422 (invalid date), 500 (generic).

### GET /api/subscription
- **Purpose**: Fetch the user’s subscription details.
- **Response 200** (`application/json`):
```json
{
  "id": "sub_456",
  "planName": "Performance Plus",
  "status": "active",
  "memberSince": "2023-06-01",
  "renewalDate": "2025-01-15",
  "sessionsPerPeriod": 12,
  "period": "month",
  "autoRenew": true,
  "addOns": ["Nutrition coaching", "Recovery lab"]
}
```
- **Errors**: 401, 403, 404 (if subscription missing), 500 (generic).

## Notes
- Responses must not expose payment method details (out of scope).
- Error payloads should be user-friendly and free of internal error messages.***
