<script setup lang="ts">
import { ref } from 'vue'
import type { ManifestCard } from '../types/card'

withDefaults(defineProps<{
  card: ManifestCard
  variant?: 'featured' | 'gallery'
  eager?: boolean
}>(), {
  variant: 'featured',
  eager: false,
})

const emit = defineEmits<{
  (e: 'select', card: ManifestCard): void
}>()

const base = import.meta.env.BASE_URL
const imageFailed = ref(false)
</script>

<template>
  <article class="card-tile" :class="`card-tile--${variant}`">
    <button type="button" class="tile-button" :aria-label="`查看角色卡：${card.name}`" @click="emit('select', card)">
      <span class="tile-thumb">
        <img
          v-if="card.png && !imageFailed"
          :src="`${base}${card.png}`"
          :alt="`${card.name} 角色立绘`"
          :loading="eager ? 'eager' : 'lazy'"
          decoding="async"
          :fetchpriority="eager ? 'high' : 'auto'"
          @error="imageFailed = true"
        />
        <span v-else class="tile-fallback" aria-hidden="true">
          <b>{{ card.name.slice(0, 1) }}</b>
          <small>OPEN CHARACTER CARD</small>
        </span>
        <span class="tile-peek" aria-hidden="true">查看角色卡 →</span>
      </span>
      <span class="tile-info">
        <strong class="tile-name">{{ card.name }}</strong>
        <span v-if="card.tags?.length" class="tile-tags">
          <span v-for="tag in card.tags.slice(0, 2)" :key="tag">{{ tag }}</span>
        </span>
      </span>
    </button>
  </article>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.card-tile { min-width: 0; }

.tile-button {
  display: flex;
  width: 100%;
  flex-direction: column;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid $color-accent;
    outline-offset: 3px;
  }
}

.tile-thumb {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 12px;
  background:
    radial-gradient(ellipse at 50% 14%, rgba(169, 196, 255, .18), transparent 58%),
    linear-gradient(158deg, #152c50 0%, #0d1e3a 58%, #0a1730 100%);

  /* 底部渐变压暗：让立绘下半身融进卡片，而不是硬切断 */
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    height: 40%;
    background: linear-gradient(0deg, rgba(6, 16, 33, .84), transparent);
    pointer-events: none;
    transition: height .3s ease;
  }

  /* 半身特写：按高度铺满并顶部对齐，人物比全身缩略大得多 */
  img {
    position: absolute;
    left: 50%;
    top: -1%;
    z-index: 1;
    height: 150%;
    width: auto;
    transform: translateX(-50%);
    transition: transform .45s cubic-bezier(.2, .75, .25, 1);
  }
}

.tile-peek {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 219, 107, .95);
  color: #1c2432;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .02em;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity .2s ease, transform .2s ease;
  pointer-events: none;
}

.tile-button:hover .tile-peek,
.tile-button:focus-visible .tile-peek {
  opacity: 1;
  transform: translateY(0);
}

.tile-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(230, 234, 243, .68);

  b { font-family: Georgia, 'Times New Roman', serif; font-size: 58px; font-weight: 400; line-height: 1; }
  small { font-size: 8px; letter-spacing: .16em; }
}

.tile-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 11px 2px 0;
}

.tile-name {
  overflow: hidden;
  color: $color-text;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: $color-text-muted;
  font-size: 12px;
  line-height: 1.5;
}

.card-tile--featured {
  .tile-button:hover .tile-thumb img { transform: translateX(-50%) scale(1.05); }
  .tile-button:hover .tile-thumb { box-shadow: 0 14px 34px rgba(0, 0, 0, .34); }
  .tile-button:hover .tile-thumb::after { height: 52%; }
}

.card-tile--gallery {
  overflow: hidden;
  border: 1px solid #1b3157;
  border-radius: 14px;
  background: #0e1f38;
  transition: border-color .22s ease, transform .22s ease, box-shadow .22s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(255, 219, 107, .42);
    box-shadow: 0 16px 34px rgba(0, 0, 0, .28);
  }

  .tile-thumb {
    border-radius: 13px 13px 0 0;
    aspect-ratio: 3 / 4;
  }

  .tile-button:hover .tile-thumb img { transform: translateX(-50%) scale(1.04); }
  .tile-button:hover .tile-thumb::after { height: 58%; }

  .tile-info {
    gap: 8px;
    padding: 13px 14px 16px;
  }

  .tile-name { font-size: 17px; }

  .tile-tags {
    gap: 7px;
    font-size: 12px;

    span {
      padding: 4px 9px;
      border-radius: 999px;
      background: #1a2a4a;
      color: #a7b9d6;
    }
  }
}

@media (max-width: 760px) {
  .tile-name { font-size: 15px; }
  .tile-tags { font-size: 11px; }
  .card-tile--gallery .tile-info { padding: 11px 11px 14px; }
  .card-tile--gallery .tile-name { font-size: 15px; }
  .card-tile--gallery .tile-tags { font-size: 11px; gap: 5px; }
  .card-tile--gallery .tile-tags span { padding: 3px 7px; }
}
</style>
