# Phase 1 Data Model: test-config

## Configuration entities
- **Repository metadata**: project name, default branch (optional), constitution path.
- **Template mapping**: paths for `plan`, `spec`, `tasks`, `agent` files relative to repo root.
- **Feature defaults**: base directory for artifacts (`specs/`), naming pattern (`###-feature-name`).
- **Validation hooks**: optional commands for linting/parsing (documented, not executed automatically by config).

## Structure (YAML sketch)
```yaml
project: coachcw
constitution: .specify/memory/constitution.md
features:
  root: specs
  naming: "{id}-{slug}"  # e.g., 001-test-config
  pad: 3
templates:
  plan: .specify/templates/plan-template.md
  spec: .specify/templates/spec-template.md
  tasks: .specify/templates/tasks-template.md
  agent: .specify/templates/agent-file-template.md
checks:
  yaml_parse: "python -c \"import yaml,sys; yaml.safe_load(sys.stdin)\""
```

## Notes
- Keep command strings shell-escaped for portability.
- Avoid embedding secrets or environment-specific paths.
