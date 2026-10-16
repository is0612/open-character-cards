# 角色卡目录

每张角色卡由 **一个 PNG 文件**（必需）+ **一个 meta.json**（可选）组成：

```
cards/
├── 角色卡名.png          # SillyTavern 格式，角色卡数据内嵌在 PNG 的 tEXt 块
└── 角色卡名.meta.json    # 轻量展示信息（可选）
```

## meta.json 格式（可选，仅用于列表页展示）

```json
{
  "name": "角色名",
  "summary": "一句话简介",
  "tags": ["标签1", "标签2"],
  "author": "投稿者",
  "world": "所属世界观",
  "license": "CC BY-SA 4.0",
  "issueUrl": "https://github.com/.../issues/1"
}
```

- 如果**不提供 meta.json**，脚本会尝试从 PNG 内嵌数据里自动解析角色名，其余字段留空。
- PNG 文件名（不含后缀）会自动作为卡片 id。
