# Contributing

Thank you for helping to build the public OBVIOUS Template Library! Before submitting a pull request, please review these
guidelines.

## Workflow

1. Fork the repository and create a feature branch.
2. Add or update packages inside `packages/<platform>/<package-name>/` following the structure in `docs/package-guidelines.md`.
3. Update `manifests/index.json` to describe your package and ensure checksums are correct.
4. Run `npm test` (or `npm run lint`) once validation tooling is published to make sure linting and schema checks pass.
5. Submit a pull request and request review from a maintainer.

## Code of Conduct

Be respectful and constructive in discussions. The maintainers reserve the right to close issues or pull requests that violate
our community standards.
