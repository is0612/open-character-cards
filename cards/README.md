# 角色卡目录

每张角色卡由 **一个 PNG 文件**（必需）+ **一个 meta.json**（可选）组成：

```
cards/
├── 角色卡名.png          # SillyTavern 格式，角色卡数据内嵌在 PNG 的 tEXt 块
└── 角色卡名.meta.json    # 轻量展示信息（可选）
```

## 标签从哪里来

角色卡的标签来自两处，生成清单时会合并：

1. PNG 内嵌的角色卡数据（SillyTavern V2 的 `data.tags`）；
2. meta.json 里的 `tags`，作为展示用的补充标签，排在前面。

所以卡片上会优先看到 meta 里维护的展示标签（例如 `猫耳 / 萝莉`），
详情页和筛选里也会包含 PNG 内嵌的角色标签。

> Git 的 tag 是版本标记（例如 `v1.0`），不是角色卡标签；GitHub 的 topics 也只属于仓库本身。
> 角色卡的标签跟着角色卡文件走，不依赖 Git。

## meta.json 格式（可选，仅用于列表页展示）

```json
{
  "name": "角色名",
  "summary": "一句话简介",
  "tags": ["兜底标签1", "兜底标签2"],
  "category": "校园日常",
  "author": "投稿者",
  "world": "所属世界观",
  "license": "CC BY-SA 4.0",
  "issueUrl": "https://github.com/.../issues/1"
}
```

- 如果**不提供 meta.json**，脚本会尝试从 PNG 内嵌数据里自动解析角色名，其余字段留空。
- `category` 是侧边栏「分类」用的单选值；不写时取标签里的第一个。
- PNG 文件名（不含后缀）会自动作为卡片 id。
