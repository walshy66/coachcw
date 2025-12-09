# Research: Profile Page

## Decisions

- **Profile display uses age-only (DOB hidden)**  
  **Rationale**: Minimizes exposed PII while meeting the requirement to show age; reduces risk if screen is observed.  
  **Alternatives considered**: Show full DOB (rejected: unnecessary exposure); show month/day only (rejected: still exposes partial PII without added value).

- **DOB editing via date picker with clear label**  
  **Rationale**: Prevents format errors and improves accessibility; explicit labeling clarifies it is the date of birth field.  
  **Alternatives considered**: Free-text input (rejected: error-prone); separate day/month/year selects (rejected: slower interaction).

- **Data sources: existing user profile + subscription services**  
  **Rationale**: Avoid duplicating profile state; keeps subscription truth in billing domain.  
  **Alternatives considered**: Local-only mock data (rejected for production, kept as fallback for dev/demo).

- **Error handling: friendly copy, no raw errors**  
  **Rationale**: Prevents PII/technical leakage; aligns with FR-005.  
  **Alternatives considered**: Surface raw error text (rejected: poor UX/security).

- **Accessibility: screen-reader friendly labels, status text, focus order**  
  **Rationale**: Ensures profile and subscription information is readable and status/placeholder notes are announced.  
  **Alternatives considered**: Visual-only cues (rejected: accessibility gap).

- **Localization & formatting**  
  **Rationale**: Use locale-aware formatting for age label, dates, and currency-like subscription labels (without showing payment data yet).  
  **Alternatives considered**: Hard-coded US formats (rejected: limits international users).

- **Performance target: profile view ready within 2 seconds (95th percentile)**  
  **Rationale**: Mirrors SC-001; keeps page responsive even with lazy-loaded assets.  
  **Alternatives considered**: No explicit target (rejected: unclear bar).

## Open Points

- None; clarifications resolved in spec. Additional payment flows are intentionally deferred.***
