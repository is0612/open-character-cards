# Open Character Cards

开源角色卡共享平台。角色卡以**文件形式存进 Git 仓库**，人人可投稿共建。

> 国内角色卡平台太少，类脑又难进 —— 于是有了这个项目。我们想让「分享一张角色卡」这件事，简单到只需要往仓库里放一张图。

## 这是什么

- 一个**开源的角色卡仓库**：每张角色卡就是一张 SillyTavern 格式的 PNG，角色名、人设、开场白等完整数据**内嵌在 PNG 图片里**，下载导入酒馆即可使用。
- 一个**静态展示网站**：Vue3 + TypeScript + Vite + Sass，自动解析 PNG 内嵌数据、渲染成画廊。
- 一套**零门槛共建机制**：不懂代码的人通过 GitHub Issue 投稿（就传一张图），懂代码的人直接发 PR。

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 生成角色卡清单（新增角色卡后运行，会自动解析 PNG 内嵌数据）
npm run build:manifest

# 构建生产版本
npm run build
```

## 目录结构

```
.
├── cards/                 # 角色卡（每张卡一张 PNG + 可选 meta.json）
│   ├── 角色名.png         # SillyTavern 格式角色卡（数据内嵌在 PNG tEXt 块）
│   └── 角色名.meta.json   # 轻量展示信息（可选，name/summary/tags 等）
├── public/
│   └── data/manifest.json # 自动生成的卡片清单（勿手改）
├── src/                   # 前端源码（Vue3 + TS + Sass）
├── tools/
│   ├── parse-png.mjs      # 解析 PNG 内嵌角色卡数据（读 tEXt 块）
│   └── build-manifest.mjs # 扫描 cards/ 生成 manifest.json
└── .github/               # Issue 模板 + 部署工作流
```

## 如何投稿一张角色卡

### 方式一：Issue 投稿（适合不会用 Git 的人）

1. 打开 [Issues](https://github.com/is0612/open-character-cards/issues) → New Issue → 选择「角色卡投稿」模板。
2. 填写名称、简介、标签，**上传你的角色卡 PNG**（SillyTavern 格式，内嵌数据的那种）。
3. 维护者审核后会把 PNG 存进 `cards/` 目录并合入仓库。

### 方式二：直接发 PR（适合会用 Git 的人）

1. Fork 本仓库，clone 到本地。
2. 把你的角色卡 PNG 放进 `cards/` 目录，文件名用角色名（如 `旅人.png`）。
3. （可选）在同目录放一个 `旅人.meta.json`，填写 name/summary/tags 等展示信息。
4. 运行 `npm run build:manifest` 生成 manifest，提交并发起 PR。

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
