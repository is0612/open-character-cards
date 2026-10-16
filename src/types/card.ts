/**
 * 角色卡数据模型（PNG 自包含方案）
 *
 * 核心设计：
 *  - 一张角色卡 = 一张 SillyTavern 格式的 PNG（角色卡数据内嵌在 PNG 的 tEXt 元数据块里）
 *  - 投稿者只需上传这一张 PNG，无需单独写 JSON
 *  - 名称 / 人设等信息由脚本从 PNG 的 tEXt 块自动解析
 *  - 仅用于「列表展示」的名称 / 简介 / 标签，存一个轻量 meta.json（不重复存卡数据）
 */

/** 从 PNG 的 tEXt 块解析出的角色卡字段（SillyTavern 常用键） */
export interface ParsedCardData {
  /** 角色名（对应 tEXt 里的 name 或 character 键） */
  name?: string
  /** 角色人设/描述（对应 description 键） */
  description?: string
  /** 开场白（对应 first_mes / greeting 键） */
  greeting?: string
  /** 角色卡原始版本号 */
  spec?: string
}

/** 轻量展示元数据：仅用于网站列表页的展示与筛选 */
export interface CardMeta {
  /** 文件名（不含 .png 后缀），同时作为卡片 id */
  id: string
  /** 角色名 */
  name: string
  /** 一句话简介（列表页展示用） */
  summary: string
  /** 标签 */
  tags: string[]
  /** 投稿者 / 作者 */
  author?: string
  /** 所属世界观 */
  world?: string
  /** 授权协议，默认 CC BY-SA 4.0 */
  license?: string
  /** 投稿 Issue 链接 */
  issueUrl?: string
}

/** manifest.json 中的一条卡片（meta + PNG 路径 + 解析出的信息） */
export interface ManifestCard extends CardMeta {
  /** 角色卡 PNG 相对路径 */
  png: string
  /** 从 PNG 解析出的角色名（若有） */
  parsedName?: string
  /** 是否有内嵌角色卡数据 */
  hasEmbeddedData: boolean
}

/** manifest.json 顶层结构 */
export interface Manifest {
  version: number
  updated: string
  cards: ManifestCard[]
}
