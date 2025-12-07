# Phase 0 Research: test-config

## Current state
- No `.specify/config.yaml` exists; templates live in `.specify/templates/`.
- Constitution is stored at `.specify/memory/constitution.md` and referenced manually in README.
- Previous feature docs use `specs/000-repo-readme/` with manually created files.

## Questions and decisions
- **How should feature numbering map to directories?** Use zero-padded `###-feature-name` to match existing `000-repo-readme`.
- **Where should templates live?** Keep current `.specify/templates/` paths and reference explicitly in config to avoid drift.
- **What defaults should commands use?** Default root `specs/` for artifacts, with template mapping for plan/spec/tasks.
- **Validation approach?** Use a lightweight YAML parse check (e.g., `python -c "import yaml; ..."` if PyYAML available) or built-in `python -c` with `ruamel`? If unavailable, rely on CI-friendly `yamllint` or simple `python -c 'import yaml'` guard; document fallback.

## Risks
- Missing dependencies for YAML validation in fresh environments.
- Template path changes could break config unless kept in sync; mitigation is documenting update steps in quickstart.

## Go/No-Go
- Proceed: configuration is small, low risk, and improves contributor experience.
