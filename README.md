# Digital Garden Visualizer

中文 | [English](#english)

Digital Garden Visualizer 是一个 Obsidian 插件，用来把带有数字花园 frontmatter 的笔记可视化成森林 / 网格视图。

它适合使用 `dg-publish`、`dg-note-icon`、`title` 等字段管理数字花园发布状态的 Vault。

## 功能

- 按 frontmatter 字段筛选笔记，例如 `dg-publish: true`
- 将筛选结果渲染为森林 / 网格视图
- 支持自定义图标字段和图标路径前缀
- 支持内置备用图标
- 点击可视化节点直接打开笔记
- 支持调整格子大小、间距、图标缩放、排序方式和图例显示

## 安装

### 手动安装

1. 从 GitHub Release 下载最新版文件：
   - `main.js`
   - `manifest.json`
   - `styles.css`
2. 在你的 Obsidian Vault 中创建插件文件夹：

```text
.obsidian/plugins/digital-garden-visualizer/
```

3. 将这三个文件复制到该文件夹。
4. 重启或重新加载 Obsidian。
5. 在 **设置 -> 第三方插件** 中启用 **Digital Garden Visualizer**。

## 设置

插件会把本地设置保存到 `data.json`。

`data.json` 属于每个用户自己的 Vault 配置，不应该提交到 GitHub。本仓库已通过 `.gitignore` 忽略它。

常用设置：

- `folderPath`：限制扫描的文件夹
- `filterField`：用于筛选的 frontmatter 字段，例如 `dg-publish`
- `filterValue`：筛选字段需要匹配的值
- `iconField`：用于选择图标的 frontmatter 字段
- `titleField`：用于显示标题的 frontmatter 字段
- `iconPathPrefix`：自定义图标路径前缀
- `sortMode`：笔记排序方式

## 当前仓库状态

本仓库目前保存的是从本地 Vault 中提取出来的可运行插件包。

当前形式可以用于 GitHub 备份、手动安装和创建 Release。

如果未来要正式提交到 Obsidian 社区插件市场，建议下一步迁移成标准 TypeScript 源码工程。这样更适合长期维护、代码审查、多人协作和自动构建。

## 发布检查清单

创建 GitHub Release 前：

1. 更新 `manifest.json` 中的 `version`。
2. 如果最低 Obsidian 版本发生变化，更新 `versions.json`。
3. 在单独的测试 Vault 中测试插件。
4. 创建 GitHub Release，tag 必须与 `manifest.json` 中的版本号一致。
5. 上传 Release 附件：
   - `main.js`
   - `manifest.json`
   - `styles.css`

## 社区插件市场准备清单

提交到 Obsidian 官方社区插件市场前：

- [ ] GitHub 仓库保持公开。
- [ ] 仓库根目录保留 `README.md`、`LICENSE`、`manifest.json`。
- [ ] `manifest.json` 使用 `x.y.z` 语义化版本号。
- [ ] GitHub Release tag 与 `manifest.json` 版本号完全一致。
- [ ] Release 附件包含 `main.js`、`manifest.json`、`styles.css`。
- [ ] 迁移为标准 TypeScript 源码工程。
- [ ] 在单独测试 Vault 中测试，不直接拿主 Vault 当实验环境。
- [ ] 默认设置和文档中不要暴露私人 Vault 路径。

## 许可证

MIT

---

## English

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

## Current Repository Status

This repository currently preserves the working plugin package extracted from a local vault.

This format is enough for GitHub backup, manual installation, and GitHub Releases.

For long-term development and submission to the Obsidian community plugin directory, the next recommended step is to migrate the plugin into a standard TypeScript source project.

## Release Checklist

Before creating a GitHub release:

1. Update `version` in `manifest.json`.
2. Update `versions.json` if `minAppVersion` changes.
3. Test the plugin in a separate development vault.
4. Create a GitHub release whose tag matches the `manifest.json` version.
5. Upload release assets:
   - `main.js`
   - `manifest.json`
   - `styles.css`

## Community Plugin Readiness Checklist

Before submitting to the official Obsidian community plugin directory:

- [ ] Keep the GitHub repository public.
- [ ] Keep `README.md`, `LICENSE`, and `manifest.json` in the repository root.
- [ ] Ensure `manifest.json` uses semantic versioning in `x.y.z` format.
- [ ] Ensure the release tag matches the `manifest.json` version.
- [ ] Upload `main.js`, `manifest.json`, and `styles.css` as release assets.
- [ ] Migrate the plugin to a source-based TypeScript project.
- [ ] Test in a separate development vault instead of the main vault.
- [ ] Remove private vault paths from default settings and documentation.

## License

MIT
