<script setup lang="ts">
import { ref } from 'vue'
import type { ManifestCard } from '../types/card'

const props = defineProps<{
  card: ManifestCard
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const base = import.meta.env.BASE_URL

const copied = ref(false)

async function copyImage() {
  try {
    const url = `${base}${props.card.png}`
    const res = await fetch(url)
    const blob = await res.blob()
    // 复制图片到剪贴板（保留 PNG 内嵌数据）
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ])
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch (e) {
    console.error('复制图片失败：', e)
    alert('复制图片失败，请改用「下载角色卡 PNG」。')
  }
}
</script>

<template>
  <div class="detail-mask" @click.self="emit('close')">
    <div class="detail" role="dialog" aria-modal="true">
      <button class="detail-close" type="button" @click="emit('close')">×</button>

      <div class="detail-head">
        <img
          v-if="card.png"
          class="detail-portrait"
          :src="`${base}${card.png}`"
          :alt="card.name"
        />
        <div class="detail-head-info">
          <h2 class="detail-name">{{ card.name }}</h2>
          <p v-if="card.author" class="detail-author">投稿者：{{ card.author }}</p>
          <p v-if="card.world" class="detail-world">世界观：{{ card.world }}</p>
          <div v-if="card.tags?.length" class="detail-tags">
            <span v-for="tag in card.tags" :key="tag" class="card-tag">{{ tag }}</span>
          </div>
        </div>
      </div>

      <p v-if="card.summary" class="detail-summary">{{ card.summary }}</p>

      <div class="detail-section">
        <h3>获取这张角色卡</h3>
        <p class="detail-desc">
          这是一张 SillyTavern 格式的角色卡，角色名、人设、开场白等完整数据内嵌在
          PNG 图片中。复制或下载后导入 SillyTavern（酒馆）即可使用。
        </p>
        <div class="detail-actions">
          <button class="detail-btn" type="button" @click="copyImage">
            {{ copied ? '已复制 ✓' : '复制图片' }}
          </button>
          <a
            class="detail-btn detail-btn--primary"
            :href="`${base}${card.png}`"
            :download="`${card.name}.png`"
            >下载角色卡 PNG ↓</a
          >
        </div>
      </div>

      <p v-if="card.hasEmbeddedData" class="detail-note">
        ✓ 已检测到内嵌角色卡数据
      </p>

      <div class="detail-foot">
        <p v-if="card.license" class="detail-license">授权：{{ card.license }}</p>
        <a
          v-if="card.issueUrl"
          class="app-link"
          :href="card.issueUrl"
          target="_blank"
          rel="noreferrer"
          >查看投稿 Issue →</a
        >
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.detail-mask {
  position: fixed;
  inset: 0;
  background: rgba(3, 8, 20, 0.78); backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 100;
}

.detail {
  position: relative;
  background: $color-surface;
  border-radius: $radius;
  max-width: 560px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 28px;
  box-shadow: $shadow-md;
}

.detail-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  color: $color-text-muted;
  cursor: pointer;
  border-radius: 50%;

  &:hover {
    background: $color-bg;
  }
}

.detail-head {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.detail-portrait {
  width: 108px;
  height: 144px;
  border-radius: $radius;
  object-fit: cover;
  flex-shrink: 0;
  background: $color-primary-soft;
}

.detail-head-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-name {
  margin: 0;
  font-size: 24px;
}

.detail-author,
.detail-world {
  margin: 0;
  font-size: 13px;
  color: $color-text-muted;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.card-tag {
  font-size: $fs-small;
  padding: 3px 10px;
  border-radius: 999px;
  background: $color-primary-soft;
  color: $color-text;
}

.detail-summary {
  font-size: 15px;
  margin: 0 0 20px;
  padding: 14px 16px;
  background: $color-bg;
  border-radius: $radius;
}

.detail-section {
  margin-bottom: 20px;

  h3 {
    margin: 0 0 8px;
    font-size: 15px;
  }
}

.detail-desc {
  margin: 0 0 14px;
  font-size: 14px;
  color: $color-text-muted;
  line-height: 1.7;
}

.detail-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.detail-btn {
  display: inline-block;
  padding: 10px 22px;
  border-radius: 999px;
  border: 1px solid $color-accent;
  background: transparent;
  color: $color-accent;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  font-family: inherit;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: $color-accent-soft;
    text-decoration: none;
  }

  &--primary {
    background: $color-accent;
    color: #0b1225;

    &:hover {
      background: color-mix(in srgb, $color-accent 88%, black);
    }
  }
}

.detail-note {
  font-size: $fs-muted;
  color: $color-success;
  margin: 0 0 16px;
}

.detail-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid $color-border;
}

.detail-license {
  margin: 0;
  font-size: 12px;
  color: $color-text-muted;
}
</style>
