<script setup lang="ts">
import type { ManifestCard } from '../types/card'

defineProps<{
  cards: ManifestCard[]
}>()

const emit = defineEmits<{
  (e: 'select', card: ManifestCard): void
}>()

const base = import.meta.env.BASE_URL
</script>

<template>
  <div class="card-grid">
    <button
      v-for="card in cards"
      :key="card.id"
      class="card"
      type="button"
      @click="emit('select', card)"
    >
      <div class="card-portrait">
        <img
          v-if="card.png"
          :src="`${base}${card.png}`"
          :alt="card.name"
          loading="lazy"
        />
        <div v-else class="card-portrait-fallback">{{ card.name.slice(0, 1) }}</div>
      </div>
      <div class="card-body">
        <h3 class="card-name">{{ card.name }}</h3>
        <p v-if="card.summary" class="card-summary">{{ card.summary }}</p>
        <div v-if="card.tags?.length" class="card-tags">
          <span v-for="tag in card.tags" :key="tag" class="card-tag">{{ tag }}</span>
        </div>
      </div>
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 22px;
}

.card {
  display: flex;
  flex-direction: column;
  text-align: left;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  box-shadow: $shadow-sm;
  font-family: inherit;
  color: inherit;

  &:hover {
    box-shadow: $shadow-lg;
    transform: translateY(-4px);
  }

  &:focus-visible {
    outline: 2px solid $color-accent;
    outline-offset: 2px;
  }
}

.card-portrait {
  aspect-ratio: 3 / 4;
  background: $color-primary-soft;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }
}

.card:hover .card-portrait img {
  transform: scale(1.04);
}

.card-portrait-fallback {
  font-size: 52px;
  color: $color-primary;
  font-weight: 700;
}

.card-body {
  padding: 16px 18px 18px;
}

.card-name {
  margin: 0 0 4px;
  font-size: $fs-card-title;
  font-weight: 700;
}

.card-summary {
  margin: 0 0 10px;
  font-size: $fs-muted;
  color: $color-text-muted;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card-tag {
  font-size: $fs-small;
  padding: 3px 10px;
  border-radius: 999px;
  background: $color-primary-soft;
  color: $color-primary;
}
</style>
