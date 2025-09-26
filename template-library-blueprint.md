# Template Library Repository Blueprint

This blueprint describes a fixed layout for a public template library on GitHub and how that library can be integrated with the existing SHADOW extension.

## 1. Objectives

- **Central distribution:** Make all JSON templates, scripts, and metadata available from a single public repository.
- **Automation:** Provide manifests and workflows so import scripts can automatically download the correct assets.
- **Validation & governance:** Enforce linting, schema validation, and release procedures before changes go live.

## 2. Recommended repository structure

```
📁 ninjaone-template-library/
├── README.md                        # Overview, installation, and usage
├── LICENSE                          # Open-source license (e.g., MIT)
├── CONTRIBUTING.md                  # Contribution and review guidelines
├── .github/
│   ├── workflows/
│   │   ├── validate.yml             # Runs JSON schema checks and linting
│   │   └── release.yml              # Builds artifacts / npm package (optional)
│   └── ISSUE_TEMPLATE/              # (Optional) issue and feature templates
├── packages/
│   ├── windows/
│   │   └── <script-name>/
│   │       ├── script.json          # Exported script (already sanitized)
│   │       └── custom-fields/
│   │           └── scriptfields.json   # Only present when the script needs them
│   └── linux/
│       └── <script-name>/
│           ├── script.json
│           └── custom-fields/
│               └── ...
├── manifests/
│   └── index.json                   # Single manifest describing every package
├── schemas/
│   ├── package.schema.json          # Validates metadata.json + folder contents
│   └── custom-field.schema.json
├── scripts/
│   └── apply-package.mjs            # Node CLI to download/import a package by ID
└── docs/
    ├── package-guidelines.md        # Naming, folder layout, review checklist
    └── changelog.md                 # Track breaking changes
```

### 2.1 Package layout and naming

- **One folder per importable script:** Every directory inside `packages/<platform>/<script-name>/` is a self-contained bundle that the extension can import in one go.
- **Sanitized exports:** Commit the NinjaOne-exported JSON files directly (`script.json`, optional `custom-fields/*.json`). They already contain no private data, so no post-processing is required before publishing.
- **metadata.json:** Keep descriptive fields with a minimal schema:
  ```json
  {
    "id": "windows/disk-check",
    "name": "Windows Disk Check",
    "version": "1.2.0",
    "tags": ["windows", "powershell", "maintenance"],
    "requiresBackup": true,
    "customFields": [
      { "type": "device", "path": "custom-fields/device/disk_status.json" }
    ]
  }
  ```
- **Folder naming:** Use kebab-case directory names (`disk-check`, `linux-upgrade-os`) so URLs stay readable.
- **Optional assets:** If a package ships documentation or screenshots, store them alongside the script (`README.md`, `images/`). Reference them from `metadata.json` using a `docs` array.

### 2.2 Manifest structure

- **Single manifest:** `manifests/index.json` enumerates every package and mirrors the `metadata.json` fields plus Git information (commit SHA, updated at).
- **Integrity:** Store a SHA-256 checksum for each asset (`script.json`, every custom field file) so the extension can verify downloads.
- **Relationships:** Include a `customFields` array that maps to the relative paths in the package folder. The SHADOW extension uses it to queue imports automatically.
- **Discovery:** Add optional filters like `platform`, `category`, `tags`, and `ninjaMinVersion` so the UI can slice the catalog quickly.

### 2.3 Validation

- **Schema checks:** Validate both `metadata.json` (per package) and `manifests/index.json` in the `validate.yml` workflow. Reject packages missing their referenced files.
- **Linting:** Run a lightweight JSON formatter (e.g., `biome`, `prettier`, or `jq`) to ensure consistent indentation across every committed export.
- **Release tagging:** Publish a release (`v1.0.0`) whenever the manifest changes. Attach a ZIP that mirrors the `packages/` tree so teams can mirror it offline.

## 3. Integration with the SHADOW extension

### 3.1 Configuration updates (popup.js / ui.js)

1. **New settings in the popup:**
   - "Template library repo" (default empty → use the built-in repo).
   - "Template manifest path" (default `manifests/index.json`).
   - Optional toggle "Use public templates" to switch between private scripts and the public library.
2. **Validation:** Reuse existing input validation in `ui.js` to verify URLs/paths and sanitize references.
3. **Storage:** Persist the new settings securely via `crypto-utils.js`, similar to the GitHub token flow.

### 3.2 Fetching packages (github-security.js / api.js)

- Add helpers `fetchTemplateManifest(repoOverride, path)` and `fetchTemplatePackage(repoOverride, packagePath)` that use the existing GitHub API wrapper (`github-security.js`). The latter downloads an entire folder (`packages/windows/disk-check/`) in one request.
- Verify each file checksum from the manifest before processing and cache both the manifest and fetched package payloads in `background.js`.
- Reuse `jszip-loader.js` when the user selects multiple packages so they can be fetched in parallel and unzipped locally.

### 3.3 UI overlay for package browsing (main.js / ui.js)

- Reuse the diff overlay component to add a new "Template Library" tab.
- Group manifest entries by `platform` and expose filters for `tags`, `ninjaMinVersion`, and `requiresBackup`.
- Show for each package:
  - Name, description, and last updated date (from manifest metadata).
  - Included assets: always `script.json`, plus a list of `customFields` with their type (device/organization/location).
  - Safety notes such as `requiresBackup` or minimum NinjaOne version.
- Provide buttons:
  - "Import" → enqueue the package (script + custom fields) in the import flow.
  - "View files" → open read-only viewers for each JSON inside the package (reuse the script diff component and add tabs per file).

### 3.4 Extend the import flow (import.js / migration.js)

- Create a new `packageImportQueue` alongside the existing script queue.
- For every queued package, download `script.json` and any `customFields` listed in the manifest, then hand them off to the existing import helpers (`import.js`, `validation.js`).
- Ensure the backup guardrail (daily backup check from `backup-security.js`) runs before import, using the `requiresBackup` flag captured in the manifest.
- Add structured logging via `main.js` so users see progress per asset (download → validation → import).

### 3.5 Caching & versioning (background.js)

- Cache manifests and individual package folders per `repo@ref` with a TTL (e.g., 1 hour) to limit API calls.
- Store the last imported manifest version so the extension can warn when updates are available (`version` or `commitSha` changes). Offer a "Compare" link that shows the changelog from `metadata.json` if present.

### 3.6 Security and error handling

- Use the existing sanitization helpers from `utils.js` to prevent path injection.
- When manifest download fails (rate limit / 404), show clear error messages and recovery options (e.g., "Verify that the repo is public").
- Extend `validation.js` with schema checks against the repository `schemas/` so incoming templates are validated locally before being sent to NinjaOne.

## 4. Roadmap

| Phase | Description | Artifacts |
| --- | --- | --- |
| **MVP** | Repository structure + manifest + manual import via CLI script. | `packages/`, `manifests/index.json`, `scripts/apply-package.mjs` |
| **Extension integration v1** | Settings + manifest fetch + basic import button in existing overlays. | Changes in `popup.js`, `ui.js`, `github-security.js`, `import.js` |
| **Extension integration v2** | Full overlay with filters, caching, automatic custom field import. | Updates in `main.js`, `background.js`, `validation.js` |
| **Quality of life** | Release automation, changelog, diff view, and update notifications. | GitHub Actions, UI notifications |

## 5. Next steps

1. **Initialize the repository:** Create the public GitHub project following the structure above.
2. **Define manifests and schemas:** Build the first version of `schemas/` and `manifests/index.json` so validation can run.
3. **Extension proof of concept:**
   - Hardcode the manifest endpoint in a feature branch.
   - Test fetching, validating, and importing one template plus related custom fields.
4. **Finalize configuration UI:** Add the popup inputs and test encrypted storage.
5. **Roll out and document:** Publish guidance in `docs/template-guidelines.md` and update the SHADOW README with links to the template library.

This approach delivers a maintainable public template library and a clear plan to integrate it seamlessly with the SHADOW extension.
