# OBVIOUS Template Library

This repository hosts the OBVIOUS Template Library—a curated collection of NinjaOne automation templates that can be consumed by the SHADOW browser extension.
It follows the structure defined in `template-library-blueprint.md` so that packages, manifests, and supporting documentation are
all available from a single public source.

## Repository layout

- `packages/` – Platform-specific template bundles that can be imported into NinjaOne.
- `manifests/` – The canonical manifest that enumerates every package in this library.
- `schemas/` – JSON Schemas that validate package metadata and manifest contents.
- `scripts/` – Tooling that helps operators fetch and apply packages locally.
- `docs/` – Contributor-facing documentation and change tracking.
- `.github/` – Continuous integration workflows and community health files.

Refer to the documentation in `docs/` for authoring guidelines and release processes.
