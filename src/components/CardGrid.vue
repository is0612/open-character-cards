<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { ManifestCard } from '../types/card'

const props = defineProps<{
  cards: ManifestCard[]
}>()

const emit = defineEmits<{
  (e: 'select', card: ManifestCard): void
}>()

const base = import.meta.env.BASE_URL
const query = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const activeTag = ref('全部')
const sortBy = ref<'default' | 'name'>('default')
const favoritesOnly = ref(false)
const favorites = ref<string[]>([])
const failedImages = ref<string[]>([])

const allTags = computed(() => [
  '全部',
  ...new Set(props.cards.flatMap((card) => card.tags ?? []).filter(Boolean)),
])

const filteredCards = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  const result = props.cards.filter((card) => {
    const matchesQuery = !needle || [
      card.name,
      card.summary,
      card.author,
      card.world,
      ...(card.tags ?? []),
    ].some((value) => value?.toLocaleLowerCase().includes(needle))
    const matchesTag = activeTag.value === '全部' || card.tags?.includes(activeTag.value)
    const matchesFavorite = !favoritesOnly.value || favorites.value.includes(card.id)
    return matchesQuery && matchesTag && matchesFavorite
  })

  if (sortBy.value === 'name') {
    return [...result].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  }
  return result
})

function loadFavorites() {
  try {
    const saved = localStorage.getItem('occ:favorites')
    if (saved) {
      const parsed: unknown = JSON.parse(saved)
      if (Array.isArray(parsed)) favorites.value = parsed.filter((id): id is string => typeof id === 'string')
    }
  } catch {
    // 浏览器禁用存储或数据损坏时，收藏仍可在当前会话中使用。
  }
}

function toggleFavorite(id: string) {
  favorites.value = favorites.value.includes(id)
    ? favorites.value.filter((item) => item !== id)
    : [...favorites.value, id]
}

watch(favorites, (value) => {
  try {
    localStorage.setItem('occ:favorites', JSON.stringify(value))
  } catch {
    // 收藏状态保留在内存中；不让存储限制影响画廊使用。
  }
}, { deep: true })

function clearFilters() {
  query.value = ''
  activeTag.value = '全部'
  favoritesOnly.value = false
  sortBy.value = 'default'
}

function handleSearchShortcut(event: KeyboardEvent) {
  if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return
  const target = event.target as HTMLElement | null
  if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')) return
  event.preventDefault()
  searchInput.value?.focus()
}

onMounted(() => {
  loadFavorites()
  window.addEventListener('keydown', handleSearchShortcut)
})
onUnmounted(() => window.removeEventListener('keydown', handleSearchShortcut))
</script>

<template>
  <div class="gallery">
    <div class="gallery-toolbar">
      <label class="search-box">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg>
        <input ref="searchInput" v-model="query" type="search" placeholder="搜索角色名、作者、标签…" aria-label="搜索角色卡" />
        <kbd>/</kbd>
      </label>
      <label class="sort-control">
        <span>排序</span>
        <select v-model="sortBy" aria-label="角色卡排序">
          <option value="default">默认顺序</option>
          <option value="name">名称 A–Z</option>
        </select>
      </label>
      <button
        class="favorites-toggle"
        :class="{ 'is-active': favoritesOnly }"
        type="button"
        :aria-pressed="favoritesOnly"
        @click="favoritesOnly = !favoritesOnly"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.3 4.7a5.1 5.1 0 0 0-7.2 0L12 5.8l-1.1-1.1a5.1 5.1 0 0 0-7.2 7.2l1.1 1.1L12 20l7.2-7 1.1-1.1a5.1 5.1 0 0 0 0-7.2Z" /></svg>
        只看收藏 <span>{{ favorites.length }}</span>
      </button>
    </div>

    <div v-if="allTags.length > 1" class="tag-filters" aria-label="按标签筛选">
      <button
        v-for="tag in allTags"
        :key="tag"
        type="button"
        class="filter-chip"
        :class="{ 'is-active': activeTag === tag }"
        :aria-pressed="activeTag === tag"
        @click="activeTag = tag"
      >{{ tag }}</button>
    </div>

    <div class="results-line" aria-live="polite">
      <span><strong>{{ filteredCards.length }}</strong> 张角色卡</span>
      <span v-if="query || activeTag !== '全部' || favoritesOnly" class="filter-note">已应用筛选</span>
    </div>

    <div v-if="filteredCards.length" class="card-grid">
      <article v-for="(card, index) in filteredCards" :key="card.id" class="card-shell">
        <button
          class="card"
          type="button"
          :aria-label="`查看角色卡：${card.name}`"
          @click="emit('select', card)"
        >
          <div class="card-portrait">
            <img
              v-if="card.png && !failedImages.includes(card.id)"
              :src="`${base}${card.png}`"
              :alt="`${card.name} 角色立绘`"
              loading="lazy"
              decoding="async"
              :fetchpriority="index < 3 ? 'high' : 'auto'"
              @error="failedImages.push(card.id)"
            />
            <div v-else class="card-portrait-fallback" aria-hidden="true">
              <span>{{ card.name.slice(0, 1) }}</span>
              <small>OPEN CHARACTER CARD</small>
            </div>
            <span v-if="card.hasEmbeddedData" class="portrait-badge">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3.1 3.1L13 4.5" /></svg>
              PNG 卡
            </span>
            <span class="portrait-index">{{ String(index + 1).padStart(2, '0') }}</span>
          </div>
          <div class="card-body">
            <div class="card-title-row">
              <h3 class="card-name">{{ card.name }}</h3>
              <span v-if="card.author" class="card-author">{{ card.author }}</span>
            </div>
            <p v-if="card.summary" class="card-summary">{{ card.summary }}</p>
            <div v-if="card.tags?.length" class="card-tags">
              <span v-for="tag in card.tags.slice(0, 3)" :key="tag" class="card-tag">{{ tag }}</span>
              <span v-if="card.tags.length > 3" class="more-tags">+{{ card.tags.length - 3 }}</span>
            </div>
            <div class="card-footer">
              <span>{{ card.world || '角色档案' }}</span>
              <span class="view-label">查看档案 <span aria-hidden="true">↗</span></span>
            </div>
          </div>
        </button>
        <button
          class="favorite-button"
          :class="{ 'is-favorite': favorites.includes(card.id) }"
          type="button"
          :aria-label="favorites.includes(card.id) ? `取消收藏 ${card.name}` : `收藏 ${card.name}`"
          :aria-pressed="favorites.includes(card.id)"
          @click="toggleFavorite(card.id)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.3 4.7a5.1 5.1 0 0 0-7.2 0L12 5.8l-1.1-1.1a5.1 5.1 0 0 0-7.2 7.2l1.1 1.1L12 20l7.2-7 1.1-1.1a5.1 5.1 0 0 0 0-7.2Z" /></svg>
        </button>
      </article>
    </div>

    <div v-else class="empty-state">
      <span class="empty-mark" aria-hidden="true">⌕</span>
      <h3>没有找到匹配的角色卡</h3>
      <p>试试更短的关键词，或清除标签与收藏筛选。</p>
      <button type="button" @click="clearFilters">清除所有筛选</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.gallery { width: 100%; }

.gallery-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 18px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 180px;
  height: 48px;
  padding: 0 14px;
  border: 1px solid $color-border;
  border-radius: 14px;
  background: $color-surface;
  box-shadow: 0 3px 12px rgba(47, 38, 29, 0.035);
  transition: border-color .18s ease, box-shadow .18s ease;

  &:focus-within {
    border-color: $color-accent;
    box-shadow: 0 0 0 3px rgba(201, 118, 43, .12);
  }

  svg {
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
    fill: none;
    stroke: $color-text-muted;
    stroke-width: 1.7;
    stroke-linecap: round;
  }

  input {
    min-width: 0;
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: $color-text;
    font: inherit;
    font-size: 14px;

    &::placeholder { color: #a59a89; }
  }

  kbd {
    flex: 0 0 auto;
    padding: 2px 6px;
    border: 1px solid $color-border;
    border-radius: 5px;
    color: $color-text-muted;
    font: 11px/1.5 ui-monospace, monospace;
  }
}

.sort-control {
  display: flex;
  align-items: center;
  gap: 8px;
  color: $color-text-muted;
  font-size: 12px;
  white-space: nowrap;

  select {
    height: 44px;
    max-width: 140px;
    padding: 0 28px 0 12px;
    border: 1px solid $color-border;
    border-radius: 12px;
    background: $color-surface;
    color: $color-text;
    font: inherit;
    cursor: pointer;
  }
}

.favorites-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 44px;
  padding: 0 13px;
  border: 1px solid $color-border;
  border-radius: 12px;
  background: $color-surface;
  color: $color-text-muted;
  font: inherit;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  transition: all .18s ease;

  svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.7;
  }

  span {
    display: inline-grid;
    place-items: center;
    min-width: 19px;
    height: 19px;
    padding: 0 4px;
    border-radius: 7px;
    background: $color-bg;
    font-size: 11px;
  }

  &:hover, &.is-active {
    color: $color-accent;
    border-color: rgba(201, 118, 43, .5);
    background: $color-accent-soft;
  }

  &.is-active svg { fill: currentColor; }
}

.tag-filters {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 0 12px;
  scrollbar-width: thin;
}

.filter-chip {
  flex: 0 0 auto;
  padding: 7px 13px;
  border: 1px solid $color-border;
  border-radius: 999px;
  background: rgba(255, 253, 248, .65);
  color: $color-text-muted;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: color .18s ease, background .18s ease, border-color .18s ease;

  &:hover { border-color: $color-accent; color: $color-accent; }
  &.is-active {
    border-color: $color-primary;
    background: $color-primary;
    color: #fffaf0;
  }
}

.results-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 6px 0 18px;
  color: $color-text-muted;
  font-size: 12px;

  strong { color: $color-text; font-size: 14px; }
}

.filter-note {
  padding-left: 10px;
  border-left: 1px solid $color-border;
  color: $color-accent;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 22px;
}

.card-shell {
  position: relative;
  min-width: 0;
  border-radius: 18px;
  isolation: isolate;
}

.card {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  border: 1px solid rgba(115, 85, 54, .18);
  border-radius: 18px;
  background: $color-surface;
  box-shadow: 0 4px 18px rgba(47, 38, 29, .055), 0 1px 2px rgba(47, 38, 29, .04);
  color: inherit;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;

  &:hover {
    transform: translateY(-5px);
    border-color: rgba(201, 118, 43, .45);
    box-shadow: 0 18px 38px rgba(47, 38, 29, .14), 0 3px 8px rgba(47, 38, 29, .05);
  }

  &:focus-visible {
    outline: 3px solid $color-accent;
    outline-offset: 3px;
  }
}

.card-portrait {
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
  aspect-ratio: 3 / 4;
  background:
    radial-gradient(ellipse at 50% 20%, rgba(255, 255, 255, .7), transparent 55%),
    linear-gradient(145deg, #e7d8c2, #c5a887);
  isolation: isolate;

  &::after {
    position: absolute;
    z-index: 1;
    inset: 45% 0 0;
    content: '';
    background: linear-gradient(180deg, transparent, rgba(35, 25, 19, .24));
    pointer-events: none;
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform .45s cubic-bezier(.2, .75, .25, 1);
  }
}

.card:hover .card-portrait img { transform: scale(1.045); }

.card-portrait-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: rgba(74, 54, 40, .7);

  span { font-family: Georgia, serif; font-size: 68px; line-height: 1; }
  small { font-size: 8px; letter-spacing: .18em; }
}

.portrait-badge {
  position: absolute;
  z-index: 2;
  left: 12px;
  top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border: 1px solid rgba(255, 255, 255, .36);
  border-radius: 7px;
  background: rgba(35, 28, 23, .56);
  color: #fffaf2;
  font-size: 10px;
  letter-spacing: .04em;
  backdrop-filter: blur(8px);

  svg { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
}

.portrait-index {
  position: absolute;
  z-index: 2;
  right: 12px;
  bottom: 10px;
  color: rgba(255, 250, 242, .82);
  font-family: Georgia, serif;
  font-size: 12px;
  font-style: italic;
  text-shadow: 0 1px 5px rgba(0, 0, 0, .3);
}

.card-body { padding: 15px 16px 13px; }

.card-title-row { display: flex; flex-direction: column; gap: 2px; }

.card-name {
  margin: 0;
  overflow: hidden;
  color: $color-text;
  font-size: 16px;
  font-weight: 750;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-author {
  color: $color-text-muted;
  font-size: 11px;
}

.card-summary {
  display: -webkit-box;
  min-height: 38px;
  margin: 10px 0 12px;
  overflow: hidden;
  color: $color-text-muted;
  font-size: 12px;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.card-tags { display: flex; flex-wrap: wrap; gap: 5px; }

.card-tag {
  padding: 3px 7px;
  border: 1px solid rgba(201, 118, 43, .12);
  border-radius: 6px;
  background: $color-accent-soft;
  color: #87501f;
  font-size: 10px;
}

.more-tags { align-self: center; color: $color-text-muted; font-size: 10px; }

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 13px;
  padding-top: 10px;
  border-top: 1px solid rgba(115, 85, 54, .12);
  color: $color-text-muted;
  font-size: 10px;

  > span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}

.view-label {
  flex: 0 0 auto;
  color: $color-accent;
  font-weight: 650;
  transition: transform .18s ease;

  span { display: inline-block; }
}

.card:hover .view-label span { transform: translate(2px, -2px); }

.favorite-button {
  position: absolute;
  z-index: 3;
  top: 10px;
  right: 10px;
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, .55);
  border-radius: 50%;
  background: rgba(255, 253, 248, .9);
  color: #6e5b4c;
  box-shadow: 0 3px 12px rgba(28, 21, 16, .12);
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: transform .18s ease, color .18s ease, background .18s ease;

  svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.7; }
  &:hover { transform: scale(1.08); }
  &.is-favorite { color: #b94b45; background: #fff7f4; }
  &.is-favorite svg { fill: currentColor; }
  &:focus-visible { outline: 2px solid $color-accent; outline-offset: 2px; }
}

.empty-state {
  display: flex;
  min-height: 260px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 20px;
  border: 1px dashed $color-border;
  border-radius: 18px;
  background: rgba(255, 253, 248, .55);
  text-align: center;

  h3 { margin: 12px 0 4px; font-size: 17px; }
  p { margin: 0 0 18px; color: $color-text-muted; font-size: 13px; }
  button { padding: 9px 15px; border: 1px solid $color-border; border-radius: 999px; background: $color-surface; color: $color-accent; font: inherit; cursor: pointer; }
}

.empty-mark {
  display: grid;
  width: 54px;
  height: 54px;
  place-items: center;
  border-radius: 18px;
  background: $color-accent-soft;
  color: $color-accent;
  font-family: Georgia, serif;
  font-size: 34px;
}

@media (max-width: 760px) {
  .gallery-toolbar { flex-wrap: wrap; }
  .search-box { flex-basis: 100%; }
  .sort-control { margin-right: auto; }
  .card-grid { grid-template-columns: repeat(auto-fill, minmax(165px, 1fr)); gap: 14px; }
  .card-body { padding: 12px; }
  .card-name { font-size: 14px; }
  .card-summary { min-height: 36px; font-size: 11px; }
  .favorite-button { width: 32px; height: 32px; top: 8px; right: 8px; }
}

@media (max-width: 380px) {
  .card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .card-footer { font-size: 9px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; }
}
</style>
