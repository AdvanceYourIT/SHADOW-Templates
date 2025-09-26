# Package Authoring Guidelines

Follow these requirements when contributing new templates to the library.

## Directory layout

Each package must live inside `packages/<platform>/<package-name>/` and include at minimum:

- `metadata.json` – Descriptive metadata used by the manifest and SHADOW extension.
- `script.json` – The exported NinjaOne script.
- `custom-fields/` – Optional JSON files required by the script.

## Naming

- Use kebab-case for directory names.
- Match the `id` field in `metadata.json` to the folder path, e.g. `"id": "windows/sample-package"`.

## Quality checks

- Verify that scripts contain no credentials or environment-specific data.
- Keep JSON files pretty-printed with two-space indentation.
- Update `manifests/index.json` so the manifest stays in sync with the package contents.

## Review checklist

- [ ] Metadata includes version, description, tags, and checksum entries for each asset.
- [ ] Required custom fields are present and referenced in `metadata.json`.
- [ ] Any documentation or screenshots are stored within the package folder and linked from metadata.
