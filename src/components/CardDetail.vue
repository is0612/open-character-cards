<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { ManifestCard } from '../types/card'

const props = defineProps<{
  card: ManifestCard
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const base = import.meta.env.BASE_URL
const favorites = ref<string[]>([])

const isFavorite = computed(() => favorites.value.includes(props.card.id))
const source = computed(() => props.card.world || '原创角色')
const artist = computed(() => props.card.author || '佚名')
const tags = computed(() => props.card.tags ?? [])
const summary = computed(() => props.card.summary || '这张角色卡还没有填写简介。下载 PNG 后，角色设定会完整保留在文件中。')
const embedState = computed(() => (props.card.hasEmbeddedData ? 'PNG 内嵌 · 已解析' : '未内嵌角色数据'))
const license = computed(() => props.card.license || 'CC BY-SA 4.0')

function loadFavorites() {
  try {
    const saved = localStorage.getItem('occ:favorites')
    if (!saved) return
    const parsed: unknown = JSON.parse(saved)
    if (Array.isArray(parsed)) {
      favorites.value = parsed.filter((id): id is string => typeof id === 'string')
    }
  } catch {
    // 收藏只是本地偏好，存储不可用时不影响浏览。
  }
}

function persistFavorites() {
  try {
    localStorage.setItem('occ:favorites', JSON.stringify(favorites.value))
  } catch {
    // 忽略存储限制。
  }
}

function toggleFavorite() {
  favorites.value = isFavorite.value
    ? favorites.value.filter((id) => id !== props.card.id)
    : [...favorites.value, props.card.id]
  persistFavorites()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  loadFavorites()
  document.body.classList.add('modal-open')
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.body.classList.remove('modal-open')
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="detail-mask" @click.self="emit('close')">
    <div class="detail" role="dialog" aria-modal="true" :aria-label="`${card.name} 角色详情`">
      <button class="detail-close" type="button" aria-label="关闭" @click="emit('close')">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg>
      </button>

      <div class="detail-portrait-wrap">
        <img v-if="card.png" class="detail-portrait" :src="`${base}${card.png}`" :alt="`${card.name} 角色立绘`" />
        <div v-else class="detail-portrait detail-portrait--empty" aria-hidden="true">{{ card.name.slice(0, 1) }}</div>
      </div>

      <div class="detail-info">
        <p class="detail-kicker">CHARACTER ARCHIVE</p>

        <div class="detail-title-row">
          <h2 class="detail-name">{{ card.name }}</h2>
        </div>

        <div v-if="tags.length" class="detail-tag-row">
          <div class="detail-tags">
            <span v-for="tag in tags" :key="tag">{{ tag }}</span>
          </div>
        </div>

        <p class="detail-summary">{{ summary }}</p>

        <dl class="detail-meta">
          <div><dt>作品来源</dt><dd>{{ source }}</dd></div>
          <div><dt>画师</dt><dd>{{ artist }}</dd></div>
          <div><dt>数据</dt><dd>{{ embedState }}</dd></div>
          <div><dt>授权</dt><dd :title="license">{{ license }}</dd></div>
        </dl>

        <div class="detail-actions">
          <a
            class="detail-button detail-button--primary"
            :href="`${base}${card.png}`"
            :download="`${card.name}.png`"
          >下载 PNG</a>
          <button
            class="detail-button detail-button--ghost"
            :class="{ 'is-active': isFavorite }"
            type="button"
            :aria-pressed="isFavorite"
            @click="toggleFavorite"
          >{{ isFavorite ? '已收藏' : '收藏' }}</button>
        </div>

        <p v-if="card.issueUrl" class="detail-footnote">
          <a :href="card.issueUrl" target="_blank" rel="noreferrer">查看投稿 Issue →</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.detail-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: rgba(2, 7, 16, .82);
  backdrop-filter: blur(9px);
  animation: mask-in .2s ease both;
}

.detail {
  position: relative;
  display: grid;
  grid-template-columns: 400px minmax(0, 1fr);
  gap: 36px;
  width: min(960px, 100%);
  height: min(580px, 88vh);
  overflow: hidden;
  padding: 28px;
  border: 1px solid #22375c;
  border-radius: 18px;
  background:
    radial-gradient(ellipse at 100% 0%, rgba(255, 205, 102, .07), transparent 32%),
    linear-gradient(140deg, #0c1c36, #09172c);
  box-shadow: 0 34px 90px rgba(0, 0, 0, .55);
  animation: detail-in .24s cubic-bezier(.2, .75, .25, 1) both;
}

.detail-close {
  position: absolute;
  z-index: 5;
  top: 13px;
  right: 13px;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #c5d1e3;
  cursor: pointer;
  transition: color .18s ease, background .18s ease;

  svg { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; }
  &:hover { color: #fff; background: rgba(255, 255, 255, .07); }
}

.detail-portrait-wrap {
  position: relative;
  min-height: 0;
  align-self: stretch;
  overflow: hidden;
  border-radius: 12px;
  background: #12233f;
}

.detail-portrait {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 18%;

  &--empty {
    display: grid;
    place-items: center;
    color: #8a9bb8;
    font-family: Georgia, serif;
    font-size: 96px;
  }
}

.detail-info {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  padding: 12px 4px 2px 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.detail-kicker {
  margin: 0;
  color: #8496b4;
  font-size: 9.5px;
  font-weight: 650;
  letter-spacing: .18em;
}

.detail-title-row {
  display: flex;
  align-items: center;
  margin-top: 9px;
  padding-right: 42px;
}

.detail-name {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: #f3f5fa;
  font-size: 30px;
  font-weight: 600;
  letter-spacing: .02em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-tag-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 15px;
}

.detail-tags {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
  gap: 8px;

  span {
    padding: 5px 12px;
    border-radius: 999px;
    background: #1a2a4a;
    color: #a7b9d6;
    font-size: 12.5px;
    line-height: 1.5;
  }
}

.detail-summary {
  margin: 21px 0 0;
  padding-bottom: 21px;
  border-bottom: 1px solid rgba(40, 61, 96, .72);
  color: #b8c6db;
  font-size: 13.5px;
  line-height: 1.95;
  letter-spacing: .01em;
}

.detail-meta {
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr) 60px minmax(0, 1fr);
  gap: 12px 16px;
  margin: 20px 0 0;
  padding-top: 20px;
  border-top: 1px solid rgba(40, 61, 96, .72);

  div { display: contents; }
  dt { color: #8a9bb8; font-size: 12.5px; }
  dd {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    color: #dfe6f2;
    font-size: 12.5px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.detail-actions {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 12px;
  margin-top: auto;
  padding-top: 26px;
}

.detail-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 20px;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background .2s ease, border-color .2s ease, color .2s ease, transform .2s ease;

  &:hover { text-decoration: none; transform: translateY(-1px); }

  &--primary {
    border: 1px solid #ffdb6b;
    background: #ffdb6b;
    color: #1c2432;

    &:hover { background: #ffe491; border-color: #ffe491; }
  }

  &--ghost {
    border: 1px solid #2b446b;
    background: transparent;
    color: #dfe6f2;

    &:hover { border-color: rgba(255, 219, 107, .55); color: #ffe4a6; }
    &.is-active { border-color: rgba(255, 219, 107, .7); color: #ffdb6b; background: rgba(255, 219, 107, .07); }
  }
}

.detail-footnote {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 16px;
  margin: 14px 0 0;
  color: #7587a4;
  font-size: 11px;

  a { color: #a9b7cd; text-decoration: none; }
  a:hover { color: #ffdb6b; }
}

@keyframes mask-in {
  from { opacity: 0; }
}

@keyframes detail-in {
  from { opacity: 0; transform: translateY(14px) scale(.985); }
}

@media (max-width: 760px) {
  .detail-mask { padding: 12px; align-items: flex-end; }
  .detail {
    grid-template-columns: 1fr;
    gap: 20px;
    height: auto;
    max-height: 92vh;
    overflow-y: auto;
    padding: 16px;
    border-radius: 18px;
  }

  .detail-portrait-wrap { min-height: 0; height: 300px; }
  .detail-portrait { min-height: 0; height: 300px; }
  .detail-info { padding: 0 2px 4px; overflow: visible; }
  .detail-name { font-size: 24px; }
  .detail-title-row { padding-right: 36px; }
  .detail-summary { margin-top: 16px; padding-bottom: 16px; }
  .detail-meta { grid-template-columns: 64px minmax(0, 1fr); }
  .detail-actions { margin-top: 22px; padding-top: 0; }
  .detail-footnote { margin-top: 17px; }
}

@media (prefers-reduced-motion: reduce) {
  .detail-mask, .detail { animation: none; }
}
</style>
