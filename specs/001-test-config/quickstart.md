# Quickstart: test-config

## Goal
Add and verify `.specify/config.yaml` so contributors can run Specify commands with consistent defaults.

## Steps
1. **Create config file**: Add `.specify/config.yaml` with project metadata, constitution path, feature root (`specs`), and template mappings.
2. **Validate YAML**: Run `python -c "import yaml, sys; yaml.safe_load(open('.specify/config.yaml'))"` (requires PyYAML) or `yamllint .specify/config.yaml` if available.
3. **Dry-run template resolution**: From repo root, confirm referenced template files exist:
   - `.specify/templates/plan-template.md`
   - `.specify/templates/spec-template.md`
   - `.specify/templates/tasks-template.md`
   - `.specify/templates/agent-file-template.md`
4. **Document usage**: Note in README or CONTRIBUTING that `/speckit.*` commands rely on this config (future task).
5. **Commit & review**: Ensure tests/lints pass and link this plan/spec in PR description.

## Rollback
Delete `.specify/config.yaml` and revert associated docs if the configuration causes issues.
