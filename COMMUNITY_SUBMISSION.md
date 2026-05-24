# Obsidian 社区插件市场提交说明

本文件用于记录 Digital Garden Visualizer 未来提交到 Obsidian 官方社区插件市场前需要处理的事项。

## 官方要求要点

- 仓库根目录应包含 `README.md`、`LICENSE` 和 `manifest.json`。
- GitHub Release tag 必须和 `manifest.json` 里的 `version` 一致。
- Release 附件必须包含：
  - `main.js`
  - `manifest.json`
  - 如果插件使用 CSS，则包含 `styles.css`
- 插件版本号必须使用 `x.y.z` 语义化版本格式。
- 只有当 `minAppVersion` 发生变化时，才需要更新 `versions.json`。
- 插件 ID 不能包含 `obsidian`。

## 当前差距

当前仓库是从一个可运行插件包开始整理的，核心代码在已编译的 `main.js` 中。

这不影响你上传 GitHub，也不影响手动安装和创建 Release。

但如果要提高社区审核通过率，并方便长期维护，建议迁移成标准 TypeScript 源码工程：

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

迁移后：

- 仓库中保留 TypeScript 源码。
- 本地开发时运行构建命令生成 `main.js`。
- GitHub Release 中上传编译后的 `main.js`、`manifest.json`、`styles.css`。

## TypeScript 源码工程的影响

好处：

- 代码更容易拆分和维护。
- 更容易接入 Obsidian 官方 API 类型提示。
- 更容易让其他开发者看懂和贡献。
- 更适合社区插件审核。
- 后续可以接入自动构建和自动发布。

代价：

- 需要安装 Node.js 和 npm 依赖。
- 开发流程从“直接改 main.js”变成“改 src/main.ts，然后构建生成 main.js”。
- 对新手多一个学习成本。

结论：

- 现在上传 GitHub：不必立刻迁移。
- 准备提交社区市场：建议迁移。

---

# Obsidian Community Plugin Submission Notes

This file tracks the steps required before submitting Digital Garden Visualizer to the official Obsidian community plugin directory.

## Official Requirements

- The repository root should contain `README.md`, `LICENSE`, and `manifest.json`.
- The GitHub release tag must match the `version` field in `manifest.json`.
- Release assets must include:
  - `main.js`
  - `manifest.json`
  - `styles.css` if the plugin uses CSS
- Plugin versions must use semantic versioning in `x.y.z` format.
- `versions.json` only needs updates when `minAppVersion` changes.
- The plugin ID must not contain `obsidian`.

## Current Gap

The current repository starts from a working bundled `main.js`.

This does not block GitHub backup, manual installation, or GitHub Releases.

For a stronger community submission and long-term maintenance, migrate this into a normal Obsidian TypeScript plugin project:

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

After migration:

- Keep TypeScript source files in the repository.
- Generate `main.js` from the source during builds.
- Attach the compiled `main.js`, `manifest.json`, and `styles.css` to GitHub releases.

## Impact of Migrating to TypeScript

Benefits:

- Easier to split and maintain code.
- Better Obsidian API type hints.
- Easier for other developers to review and contribute.
- Better fit for community plugin review.
- Possible to add automated builds and releases later.

Costs:

- Requires Node.js and npm dependencies.
- Development changes from editing `main.js` directly to editing `src/main.ts` and building `main.js`.
- Adds some learning overhead for beginners.

Conclusion:

- For GitHub upload now: migration is not mandatory.
- For community plugin submission: migration is recommended.
