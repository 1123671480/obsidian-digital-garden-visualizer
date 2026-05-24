# Obsidian Community Plugin Submission Notes

This file tracks the steps required before submitting Digital Garden Visualizer to the official Obsidian community plugin directory.

## Official requirements to keep in mind

- Repository root should contain `README.md`, `LICENSE`, and `manifest.json`.
- GitHub release tag must match the `version` field in `manifest.json`.
- Release assets must include:
  - `main.js`
  - `manifest.json`
  - `styles.css` if the plugin uses CSS
- Plugin versions must use semantic versioning in `x.y.z` format.
- `versions.json` only needs updates when `minAppVersion` changes.
- The plugin ID must not contain `obsidian`.

## Current gap

The current repository starts from a working bundled `main.js`.

For a stronger community submission, migrate this into a normal Obsidian TypeScript plugin project:

```text
src/
  main.ts
manifest.json
package.json
tsconfig.json
esbuild.config.mjs
styles.css
README.md
LICENSE
versions.json
```

After migration, keep source files in the repository and attach the compiled `main.js` only to GitHub releases.
