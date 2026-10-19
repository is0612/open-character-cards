# Open Character Cards

角色卡分享平台。角色卡以**文件形式存进 Git 仓库**，人人可投稿共建。

> 国内角色卡平台太少，类脑又难进 —— 于是有了这个项目。我们想让「分享一张角色卡」这件事，简单到只需要往仓库里放一张图。

## 这是什么

- 一个**开源的角色卡仓库**：每张角色卡就是一张 SillyTavern 格式的 PNG，角色名、人设、开场白等完整数据**内嵌在 PNG 图片里**，下载导入酒馆即可使用。
- 一个**静态展示网站**：Vue3 + TypeScript + Vite + Sass，自动解析 PNG 内嵌数据、渲染成画廊。
- 一套**零门槛共建机制**：不懂代码的人通过 GitHub Issue 投稿（就传一张图），懂代码的人直接发 PR。

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发（启动前自动生成角色卡清单，并自动打开浏览器）
npm run dev

# 单独生成角色卡清单（新增角色卡后手动刷新时用，会自动解析 PNG 内嵌数据）
npm run build:manifest

# 构建生产版本
npm run build
```

> `public/data/manifest.json` 与 `public/cards/` 都是脚本生成的中间产物，已加入 `.gitignore`，不需要提交。
> `npm run dev` 期间，往 `cards/` 里增删改文件会自动重新生成清单并刷新页面。

## 目录结构

```
.
├── cards/                 # 角色卡（每张卡一张 PNG + 可选 meta.json）
│   ├── 角色名.png         # SillyTavern 格式角色卡（数据内嵌在 PNG tEXt 块）
│   └── 角色名.meta.json   # 轻量展示信息（可选，name/summary/tags 等）
├── public/
│   ├── cards/             # 自动生成的卡片图片副本（供站点直接访问，勿手改）
│   └── data/manifest.json # 自动生成的卡片清单（勿手改）
├── src/                   # 前端源码（Vue3 + TS + Sass）
├── tools/
│   ├── parse-png.mjs      # 解析 PNG 内嵌角色卡数据（读 tEXt 块）
│   ├── build-manifest.mjs # 扫描 cards/ 生成 manifest.json（并同步图片到 public/cards）
│   ├── ingest-issue.mjs   # 把「角色卡投稿」Issue 自动导入 cards/（CI 与本地都能跑）
│   └── remove-card.mjs    # 本地快捷下架：node tools/remove-card.mjs <卡片名>
└── .github/               # Issue 模板 + 部署 / 投稿导入工作流
```

## 如何投稿一张角色卡

### 方式一：Issue 投稿（适合不会用 Git 的人）

1. 打开 [Issues](https://github.com/is0612/open-character-cards/issues) → New Issue → 选择「角色卡投稿」模板。
2. 填写角色名等信息，**把 PNG 直接拖进「角色卡 PNG」一栏**（必须是 GitHub 附件，不要贴相册/网盘分享链接）。
3. 提交即完事。`Ingest Card Issue` 工作流会自动下载附件、写入 `cards/<角色名>.png` 和 `.meta.json`，然后按校验结果分流：

| 机器校验 | 结果 |
| --- | --- |
| 通过（真 PNG + 内含 SillyTavern 角色数据 + ≤ 8MB） | 直接提交 `main` 并部署，约 1 分钟后网站可见 |
| 不通过（普通图片 / 截图 / 超大文件） | 推到 `cards/issue-<编号>` 分支开 PR，等维护者判断 |

> 审核从「事前拦截」变成了「事后兜底」：合格的卡零延迟上线，可疑的卡才转人工。
> 附件链接不是 `github.com/user-attachments/...` 时自动导入会失败，机器人会在 Issue 里回复说明；
> 维护者也可本地补救：`node tools/ingest-issue.mjs <Issue 编号>`（网络受限时可加 `--image 本地图片.png`）。
> 手动重跑：Actions → Ingest Card Issue → Run workflow，填 Issue 编号。

### 方式二：直接发 PR（适合会用 Git 的人）

1. Fork 本仓库，clone 到本地。
2. 把你的角色卡 PNG 放进 `cards/` 目录，文件名用角色名（如 `旅人.png`）。
3. （可选）在同目录放一个 `旅人.meta.json`，填写 name/summary/tags 等展示信息。
4. 本地跑 `npm run dev` 确认能正常显示，然后提交并发起 PR（manifest 由 CI 自动生成，无需提交）。

### 下架一张角色卡

**方式一：网页一键（最快）**

Actions → **Remove Card** → Run workflow → 填卡片名（`cards/` 下的文件名，不含 `.png`，例如 `林可`）→ Run。
工作流会删掉 PNG 和同名 meta、提交到 `main`、自动重新部署；约 1 分钟后网站不再展示。

> 只有对该仓库有写权限的人能触发 `workflow_dispatch`，所以不存在「谁开个 Issue 就能删卡」的问题。

**方式二：本地一条命令**

```bash
npm run rm:card 林可          # 删文件 + 重建清单
git add -A cards && git commit -m "下架角色卡：林可" && git push origin main
```

加 `--dry-run` 只看会删哪些文件，不动手。

**方式三：纯手动**

```bash
git rm "cards/角色名.png" "cards/角色名.meta.json"
git commit -m "下架角色卡：角色名"
git push origin main
```

关于删除的两点：

- 推送后 CI 会重建清单，`public/cards/` 里的图片副本同时清掉；只删 PNG 也能下架（清单只扫 PNG），但 meta 会变成垃圾文件。
- **这只删掉当前版本**。图片仍留在 git 历史里，`git log` 能翻到旧提交；只有涉及侵权、隐私等确需彻底清除时才值得改写历史（会让所有 fork 失效、commit sha 全变）。

## 角色卡数据格式

一张角色卡 = **一张 PNG**（SillyTavern 格式，数据内嵌）+ 可选 **meta.json**（仅展示用）。

PNG 本身已包含完整角色卡数据（角色名、人设、开场白等），无需单独提供 JSON。平台会：

1. 自动读取 PNG 的 `tEXt` 元数据块，解析出角色名等信息；
2. 结合 meta.json（若有）补全列表页展示所需的名称、简介、标签。

meta.json 字段（全部可选，不提供则自动解析）：

| 字段 | 说明 |
|---|---|
| `name` | 角色名（缺省时从 PNG 自动解析） |
| `summary` | 一句话简介 |
| `tags` | 标签数组 |
| `author` | 投稿者/作者 |
| `world` | 所属世界观 |
| `license` | 授权协议，默认 CC BY-SA 4.0 |
| `issueUrl` | 投稿 Issue 链接 |

## 许可

- 网站源代码：MIT License
- 角色卡内容：默认遵循各卡标注的授权协议，未标注则按 CC BY-SA 4.0
- 立绘图片：遵循各卡作者标注，使用前请核实
