<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ManifestCard } from '../types/card'
import CardTile from './CardTile.vue'
import { REPO_URL } from '../config'

const props = defineProps<{
  cards: ManifestCard[]
  loading: boolean
  error: string
  query: string
}>()

const emit = defineEmits<{
  (e: 'select', card: ManifestCard): void
  (e: 'clearQuery'): void
}>()

const PAGE_SIZE = 8
const MAX_CATEGORIES = 8

const activeCategory = ref<string>('全部')
const activeTags = ref<string[]>([])
const sortBy = ref<'default' | 'name' | 'newest'>('default')
const page = ref(1)

function cardCategory(card: ManifestCard) {
  return card.category?.trim() || card.tags?.[0] || ''
}

const categoryInfo = computed(() => {
  const counts = new Map<string, number>()
  let withoutCategory = 0

  for (const card of props.cards) {
    const category = cardCategory(card)
    if (category) counts.set(category, (counts.get(category) ?? 0) + 1)
    else withoutCategory += 1
  }

  const ranked = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
    .map(([name]) => name)
  const visible = ranked.slice(0, MAX_CATEGORIES)

  return {
    visible,
    hasOther: withoutCategory > 0 || ranked.length > visible.length,
    counts,
    withoutCategory,
  }
})

const categoryOptions = computed(() => [
  ...new Set([
    '全部',
    ...categoryInfo.value.visible,
    ...(categoryInfo.value.hasOther ? ['其他'] : []),
  ]),
])

const visibleCategorySet = computed(() => new Set(categoryInfo.value.visible))

/** 侧栏每个分类右侧的数量角标 */
function categoryCount(category: string) {
  if (category === '全部') return props.cards.length
  const info = categoryInfo.value
  if (category === '其他') {
    // 「其他」既可能是真实分类名，也可能兜住无分类 + 被折叠的分类
    let total = info.counts.get('其他') ?? 0
    total += info.withoutCategory
    for (const [name, count] of info.counts) {
      if (name !== '其他' && !info.visible.includes(name)) total += count
    }
    return total
  }
  return info.counts.get(category) ?? 0
}

const allTags = computed(() => {
  const seen = new Set<string>()
  const list: string[] = []
  for (const card of props.cards) {
    for (const tag of card.tags ?? []) {
      if (seen.has(tag)) continue
      seen.add(tag)
      list.push(tag)
    }
  }
  return list
})

const filteredCards = computed(() => {
  const needle = props.query.trim().toLocaleLowerCase()
  const result = props.cards.filter((card) => {
    const tags = card.tags ?? []
    const matchesQuery = !needle || [
      card.name,
      card.summary,
      card.author,
      card.world,
      ...tags,
    ].some((value) => value?.toLocaleLowerCase().includes(needle))

    let matchesCategory = true
    if (activeCategory.value !== '全部') {
      const category = cardCategory(card)
      matchesCategory = activeCategory.value === '其他'
        ? !category || category === '其他' || !visibleCategorySet.value.has(category)
        : category === activeCategory.value
    }

    const matchesTags = activeTags.value.every((tag) => tags.includes(tag))
    return matchesQuery && matchesCategory && matchesTags
  })

  if (sortBy.value === 'name') {
    return [...result].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  }
  if (sortBy.value === 'newest') {
    return [...result].sort((a, b) => (b.addedAt ?? '').localeCompare(a.addedAt ?? ''))
  }
  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredCards.value.length / PAGE_SIZE)))
const pagedCards = computed(() => filteredCards.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

watch([() => props.query, activeCategory, activeTags, sortBy], () => {
  page.value = 1
}, { deep: true })

watch(totalPages, (value) => {
  if (page.value > value) page.value = value
})

watch(categoryOptions, (options) => {
  if (activeCategory.value !== '全部' && !options.includes(activeCategory.value)) {
    activeCategory.value = '全部'
  }
})

function toggleCategory(category: string) {
  activeCategory.value = category
}

function toggleTag(tag: string) {
  activeTags.value = activeTags.value.includes(tag)
    ? activeTags.value.filter((item) => item !== tag)
    : [...activeTags.value, tag]
}

function clearFilters() {
  activeCategory.value = '全部'
  activeTags.value = []
  sortBy.value = 'default'
  page.value = 1
  emit('clearQuery')
}

function goToPage(value: number) {
  page.value = Math.min(Math.max(value, 1), totalPages.value)
}
</script>

<template>
  <main class="cards-page">
    <div class="cards-layout">
      <aside class="filters" aria-label="角色卡筛选">
        <div class="filter-block">
          <h2>分类</h2>
          <div class="category-list" role="radiogroup" aria-label="角色卡分类">
            <button
              v-for="category in categoryOptions"
              :key="category"
              class="category-item"
              :class="{ 'is-active': activeCategory === category }"
              type="button"
              role="radio"
              :aria-checked="activeCategory === category"
              @click="toggleCategory(category)"
            >
              <span>{{ category }}</span>
              <em aria-hidden="true">{{ categoryCount(category) }}</em>
            </button>
          </div>
        </div>

        <div v-if="allTags.length" class="filter-block">
          <h2>标签</h2>
          <div class="tag-list">
            <button
              v-for="tag in allTags"
              :key="tag"
              class="tag-chip"
              :class="{ 'is-active': activeTags.includes(tag) }"
              type="button"
              :aria-pressed="activeTags.includes(tag)"
              @click="toggleTag(tag)"
            >{{ tag }}</button>
          </div>
        </div>

        <div class="filter-block">
          <h2>排序</h2>
          <label class="sort-select">
            <select v-model="sortBy" aria-label="角色卡排序">
              <option value="default">默认排序</option>
              <option value="newest">最新收录</option>
              <option value="name">名称 A–Z</option>
            </select>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
          </label>
        </div>

        <a class="sidebar-github" :href="REPO_URL" target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4.3 1.3-4.3-2.4-6-2.9M15 21v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6A4.7 4.7 0 0 0 18.4 6 4.3 4.3 0 0 0 18.3 3S17.2 2.7 15 4.2a12.7 12.7 0 0 0-6 0C6.8 2.7 5.7 3 5.7 3A4.3 4.3 0 0 0 5.6 6 4.7 4.7 0 0 0 4.3 9.3c0 4.7 2.8 5.7 5.5 6A3 3 0 0 0 9 17.6V21" /></svg>
          <span><b>基于 GitHub 开源项目</b><small>Open Character Cards</small></span>
        </a>
      </aside>

      <section class="gallery" aria-labelledby="gallery-title">
        <div class="gallery-head">
          <h1 id="gallery-title">角色卡画廊</h1>
          <span class="gallery-count">共 {{ filteredCards.length }} 个角色</span>
        </div>

        <p v-if="loading" class="gallery-state">正在整理角色档案…</p>
        <div v-else-if="error" class="gallery-state gallery-state--error">{{ error }}</div>
        <div v-else-if="filteredCards.length === 0" class="gallery-state gallery-state--empty">
          <span aria-hidden="true">☾</span>
          <strong>没有找到匹配的角色卡</strong>
          <p>试试更短的关键词，或清除分类与标签筛选。</p>
          <button type="button" @click="clearFilters">清除全部筛选</button>
        </div>

        <template v-else>
          <div class="gallery-grid">
            <CardTile
              v-for="(card, index) in pagedCards"
              :key="card.id"
              :card="card"
              variant="gallery"
              :eager="index < 4"
              @select="emit('select', $event)"
            />
          </div>

          <nav class="pagination" aria-label="角色卡分页">
            <button type="button" class="page-arrow" :disabled="page === 1" aria-label="上一页" @click="goToPage(page - 1)">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m10 3-5 5 5 5" /></svg>
            </button>
            <button
              v-for="value in totalPages"
              :key="value"
              type="button"
              class="page-number"
              :class="{ 'is-current': page === value }"
              :aria-current="page === value ? 'page' : undefined"
              @click="goToPage(value)"
            >{{ value }}</button>
            <button type="button" class="page-arrow" :disabled="page === totalPages" aria-label="下一页" @click="goToPage(page + 1)">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" /></svg>
            </button>
          </nav>
        </template>
      </section>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.cards-page {
  min-height: calc(100vh - 74px);
  padding: 30px 0 72px;
  background: $color-bg;
}

.cards-layout {
  width: min(1280px, calc(100% - 56px));
  margin: 0 auto;
  display: grid;
  grid-template-columns: 262px minmax(0, 1fr);
  gap: 30px;
  align-items: start;
}

.filters {
  position: sticky;
  top: 96px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 150px);
  padding: 23px 19px 20px;
  border: 1px solid #16294a;
  border-radius: 14px;
  background: #0b1a33;
}

.filter-block {
  padding: 0 0 20px;
  margin: 0 0 20px;
  border-bottom: 1px solid rgba(31, 53, 87, .62);

  &:last-of-type { border-bottom: 0; margin-bottom: 0; }

  h2 {
    margin: 0 0 14px;
    color: #dfe6f2;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: .02em;
  }
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  height: 34px;
  padding: 0 11px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #a9b7cd;
  font: inherit;
  font-size: 13.5px;
  text-align: left;
  cursor: pointer;
  transition: color .18s ease, background .18s ease;

  &:hover { color: #f0dcae; background: rgba(255, 219, 107, .055); }

  &.is-active {
    background: rgba(255, 219, 107, .10);
    color: $color-accent;
    font-weight: 600;
  }

  em {
    flex: 0 0 auto;
    font-style: normal;
    font-size: 11px;
    font-weight: 400;
    color: #6f80a0;
    font-variant-numeric: tabular-nums;
  }

  &.is-active em { color: rgba(255, 219, 107, .72); }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-right: -3px;
}

.tag-chip {
  padding: 7px 11px;
  border: 1px solid #1e3557;
  border-radius: 999px;
  background: #12233f;
  color: #a9b7cd;
  font: inherit;
  font-size: 12.5px;
  line-height: 1;
  cursor: pointer;
  transition: color .18s ease, border-color .18s ease, background .18s ease;

  &:hover { border-color: rgba(255, 219, 107, .5); color: #f0dca8; }
  &.is-active { border-color: $color-accent; background: rgba(255, 219, 107, .12); color: $color-accent; }
}

.sort-select {
  position: relative;
  display: block;

  select {
    width: 100%;
    height: 40px;
    padding: 0 32px 0 12px;
    border: 1px solid #1e3557;
    border-radius: 9px;
    outline: 0;
    background: #12233f;
    color: #c6d2e6;
    font: inherit;
    font-size: 12.5px;
    cursor: pointer;
    appearance: none;

    &:focus { border-color: rgba(255, 219, 107, .55); }
  }

  svg {
    position: absolute;
    right: 11px;
    top: 50%;
    width: 15px;
    height: 15px;
    fill: none;
    stroke: #93a4c1;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
    transform: translateY(-50%);
    pointer-events: none;
  }
}

.sidebar-github {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding-top: 26px;
  color: #8a9bb8;
  text-decoration: none;

  &:hover { color: #c9d6ea; text-decoration: none; }

  svg {
    width: 24px;
    height: 24px;
    flex: 0 0 auto;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  b, small { display: block; }
  b { color: #b5c2d8; font-size: 11px; font-weight: 500; }
  small { margin-top: 1px; color: #7587a4; font-size: 10px; }
}

.gallery-head {
  display: flex;
  align-items: baseline;
  gap: 13px;
  margin: 6px 0 24px;

  h1 {
    margin: 0;
    color: #f1f4fa;
    font-size: clamp(24px, 2.4vw, 30px);
    font-weight: 600;
    letter-spacing: .02em;
  }
}

.gallery-count {
  color: $color-text-muted;
  font-size: 13px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 26px;
}

.gallery-state {
  margin: 0;
  padding: 64px 0;
  color: $color-text-muted;
  font-size: 13px;

  &--error { color: #d99a96; }

  &--empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 320px;
    padding: 50px 24px;
    border: 1px dashed #22385b;
    border-radius: 16px;
    background: rgba(11, 26, 51, .58);
    text-align: center;

    > span { color: #e7c681; font-size: 28px; }
    strong { margin-top: 10px; color: #e6eaf3; font-size: 15px; }
    p { margin: 7px 0 18px; font-size: 12.5px; }

    button {
      padding: 8px 15px;
      border: 1px solid #2a436a;
      border-radius: 999px;
      background: #12233f;
      color: $color-accent;
      font: inherit;
      font-size: 12px;
      cursor: pointer;

      &:hover { border-color: rgba(255, 219, 107, .55); }
    }
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 34px;
}

.page-arrow,
.page-number {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid #22385b;
  border-radius: 50%;
  background: transparent;
  color: #a9b7cd;
  font: inherit;
  font-size: 12.5px;
  cursor: pointer;
  transition: border-color .18s ease, color .18s ease, background .18s ease;

  &:hover:not(:disabled) { border-color: rgba(255, 219, 107, .55); color: $color-accent; }
  &:disabled { opacity: .35; cursor: default; }
}

.page-arrow svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.page-number.is-current {
  border-color: $color-accent;
  color: $color-accent;
  background: rgba(255, 219, 107, .07);
}

@media (max-width: 1120px) {
  .cards-layout { grid-template-columns: 232px minmax(0, 1fr); gap: 24px; }
  .gallery-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
}

@media (max-width: 900px) {
  .cards-page { padding-top: 22px; }
  .cards-layout {
    width: calc(100% - 36px);
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .filters {
    position: static;
    min-height: 0;
    padding: 18px 16px 16px;
  }

  .filter-block { padding-bottom: 15px; margin-bottom: 15px; }

  .category-list {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
  }

  .category-item { min-width: 92px; height: 32px; padding: 0 10px; }

  .sidebar-github { display: none; }
}

@media (max-width: 760px) {
  .cards-layout { width: calc(100% - 28px); }
  .gallery-head { margin: 2px 0 18px; }
  .gallery-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 13px; }
  .pagination { justify-content: center; margin-top: 26px; }
  .page-arrow, .page-number { width: 31px; height: 31px; }
  .filter-block h2 { font-size: 14px; margin-bottom: 11px; }
  .tag-chip { padding: 6px 10px; font-size: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  * { transition-duration: .01ms !important; }
}
</style>
