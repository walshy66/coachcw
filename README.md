# CoachCW

CoachCW is a web-focused training companion for new or returning exercisers, busy professionals, and ambitious amateurs. The app emphasizes training plans, logging, simple metrics, and clear guidance on the "why" behind recommendations.

## Governance and safety

- CoachCW follows the constitution at `.specify/memory/constitution.md` (version 1.1.0). It outlines scope, training safety guardrails, privacy expectations, and workflow rules.
- The app is **not a medical device** and does not provide medical advice; recommendations must respect the conservative, progressive-loading defaults described in the constitution.

## Delivery workflow

All behavioral or documentation changes use the Specify flow and should remain linked in PRs:

1. **Plan**: capture context and Constitution Check (`specs/<feature>/plan.md`).
2. **Spec**: prioritize user stories and acceptance scenarios (`specs/<feature>/spec.md`).
3. **Tasks**: list independently testable tasks per story (`specs/<feature>/tasks.md`).
4. **Implementation**: code or docs changes with tests.

Current artifacts for this repo orientation live in `specs/000-repo-readme/`.

## Repository layout

This repository currently contains governance and documentation only:

```text
.specify/memory/constitution.md  # Governing principles and guardrails
specs/000-repo-readme/           # Plan, spec, tasks for this README
```

Future work should use a single-project layout when source code is added:

```text
src/
|-- models/
|-- services/
|-- cli/
`-- lib/

tests/
|-- contract/
|-- integration/
`-- unit/
```

Use synthetic or anonymized data in non-production environments and keep dependencies pinned once added.
