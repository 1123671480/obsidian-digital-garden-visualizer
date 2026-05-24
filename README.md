# Digital Garden Visualizer

Digital Garden Visualizer is an Obsidian plugin that visualizes digital garden notes as a forest/grid based on frontmatter fields.

It is designed for vaults that use fields such as `dg-publish`, `dg-note-icon`, and `title` to manage digital garden publishing.

## Features

- Filter notes by a frontmatter field, for example `dg-publish: true`
- Render matching notes as a visual forest/grid
- Support custom icon fields and icon path prefixes
- Support built-in fallback icons
- Open notes directly from the visualizer
- Adjust cell size, gap, icon scale, sorting, and legend display

## Installation

### Manual install

1. Download the latest release files:
   - `main.js`
   - `manifest.json`
   - `styles.css`
2. Create this folder in your vault:

```text
.obsidian/plugins/digital-garden-visualizer/
```

3. Copy the three files into that folder.
4. Reload Obsidian.
5. Enable **Digital Garden Visualizer** in **Settings -> Community plugins**.

## Settings

The plugin stores local settings in `data.json`.

`data.json` is intentionally ignored by Git because it belongs to each user's local vault configuration.

Common settings:

- `folderPath`: limit scanning to a specific folder
- `filterField`: frontmatter field used for filtering, such as `dg-publish`
- `filterValue`: expected value for the filter field
- `iconField`: frontmatter field used to select an icon
- `titleField`: frontmatter field used as display title
- `iconPathPrefix`: folder prefix for custom icons
- `sortMode`: note sorting mode

## Current repository status

This repository currently preserves the working plugin package extracted from a local vault.

For long-term development and submission to the Obsidian community plugin directory, the next recommended step is to migrate the plugin into a standard TypeScript source project based on the official Obsidian sample plugin structure.

## Release checklist

Before creating a GitHub release:

1. Update `version` in `manifest.json`.
2. Update `versions.json` if `minAppVersion` changes.
3. Test the plugin in a separate development vault.
4. Create a GitHub release whose tag matches `manifest.json` version.
5. Upload release assets:
   - `main.js`
   - `manifest.json`
   - `styles.css`

## Community plugin readiness checklist

Before submitting to the official Obsidian community plugin directory:

- [ ] Keep the GitHub repository public.
- [ ] Keep `README.md`, `LICENSE`, and `manifest.json` in the repository root.
- [ ] Ensure `manifest.json` uses semantic versioning in `x.y.z` format.
- [ ] Ensure the release tag matches `manifest.json` version.
- [ ] Upload `main.js`, `manifest.json`, and `styles.css` as release assets.
- [ ] Migrate the plugin to a source-based TypeScript project.
- [ ] Test in a separate development vault instead of the main vault.
- [ ] Remove private vault paths from default settings and documentation.

## License

MIT
