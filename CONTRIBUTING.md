# Contributing

## Branching
- The default branch is `main`.
- Create feature branches from `main` using names like `feature/short-description` or `fix/short-description`.
- Keep commits focused and descriptive.

## Pull Requests
- Open pull requests against `main`.
- Run `pre-commit run --all-files` and ensure `npm run lint` passes before pushing.
- Provide a clear description of the changes and reference related issues.
- At least one review is required before merging.

## Pre-commit Setup
- Install [pre-commit](https://pre-commit.com/) and run `pre-commit install` to enable hooks.
- The configured hook runs ESLint via `npm run lint` on each commit.
