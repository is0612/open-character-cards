<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { ManifestCard } from '../types/card'
import CardTile from './CardTile.vue'
import CardTool from './CardTool.vue'
import { REPO_URL } from '../config'

defineProps<{
  cards: ManifestCard[]
  loading: boolean
  error: string
}>()

const emit = defineEmits<{
  (e: 'select', card: ManifestCard): void
  (e: 'browse'): void
  (e: 'viewAll'): void
}>()

const base = import.meta.env.BASE_URL
const bannerUrl = ref('')
const bannerLoaded = ref(false)

// banner 是整张图，放在 public/images/banner.webp（也兼容 png / jpg）。
// 没有图片时保留深色渐变兜底，不额外叠加任何装饰元素。
const bannerCandidates = ['images/banner.webp', 'images/banner.png', 'images/banner.jpg', 'images/banner.jpeg']

function probeBanner(index = 0) {
  if (index >= bannerCandidates.length) return
  const image = new Image()
  image.onload = () => {
    bannerUrl.value = base + bannerCandidates[index]
    bannerLoaded.value = true
  }
  image.onerror = () => probeBanner(index + 1)
  image.src = base + bannerCandidates[index]
}

onMounted(() => probeBanner())
</script>

<template>
  <main class="home">
    <section
      class="hero"
      :class="{ 'has-banner': bannerLoaded }"
      :style="{ '--hero-banner': bannerUrl ? `url(${bannerUrl})` : 'none' }"
      aria-label="Open Character Cards"
    >
      <span class="hero-moon" aria-hidden="true"></span>
      <span class="hero-disc" aria-hidden="true"></span>

      <div class="hero-inner">
        <div class="hero-copy">
          <p class="hero-eyebrow"><i aria-hidden="true"></i>OPEN SOURCE · MOONLIT ARCHIVE</p>
          <h1>Open Character Cards</h1>
          <p class="hero-subtitle">开源的角色卡片分享平台</p>
          <p class="hero-description">发现更多有趣的角色，享受二次元的无限可能。<br />每张卡都是完整的人设，下载即用。</p>
          <div class="hero-actions">
            <button class="button button-primary" type="button" @click="emit('browse')">
              浏览角色卡 <span aria-hidden="true">→</span>
            </button>
            <a class="button button-secondary" :href="REPO_URL" target="_blank" rel="noreferrer">
              <svg class="github-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4.3 1.3-4.3-2.4-6-2.9M15 21v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6A4.7 4.7 0 0 0 18.4 6 4.3 4.3 0 0 0 18.3 3S17.2 2.7 15 4.2a12.7 12.7 0 0 0-6 0C6.8 2.7 5.7 3 5.7 3A4.3 4.3 0 0 0 5.6 6 4.7 4.7 0 0 0 4.3 9.3c0 4.7 2.8 5.7 5.5 6A3 3 0 0 0 9 17.6V21" /></svg>
              在 GitHub 查看
            </a>
          </div>
        </div>
      </div>

      <!-- 没有 banner 时用立绘 + 月晕撑起右侧，有 banner 时退回整图铺底 -->
      <div v-if="!bannerLoaded" class="hero-art" aria-hidden="true">
        <img :src="base + 'images/moon_catgirl_dark_ui.png'" alt="" />
      </div>
    </section>

    <section class="featured" aria-labelledby="featured-title">
      <div class="section-inner">
        <div class="featured-head">
          <div>
            <h2 id="featured-title"><span aria-hidden="true">✦</span>精选角色卡</h2>
            <p>从众多创作者中精选的优质角色卡片</p>
          </div>
          <button class="view-all" type="button" @click="emit('viewAll')">查看全部 <span aria-hidden="true">→</span></button>
        </div>

        <p v-if="loading" class="featured-state">正在整理角色档案…</p>
        <div v-else-if="error" class="featured-state featured-state--error">{{ error }}</div>
        <div v-else-if="cards.length === 0" class="featured-state">
          还没有角色卡，<a :href="REPO_URL + '/issues/new?template=card-submission.yml'" target="_blank" rel="noreferrer">投稿第一张</a>。
        </div>
        <div v-else class="featured-grid">
          <CardTile
            v-for="(card, index) in cards.slice(0, 6)"
            :key="card.id"
            :card="card"
            variant="featured"
            :eager="index < 3"
            @select="emit('select', $event)"
          />
        </div>
      </div>
    </section>

    <section id="guide" class="guide" aria-labelledby="guide-title">
      <div class="section-inner">
        <div class="section-heading">
          <div>
            <div class="section-kicker"><span aria-hidden="true">✦</span> HOW TO TAKE A CHARACTER HOME</div>
            <h2 id="guide-title">使用指南</h2>
            <p>三步，把喜欢的角色带进你的故事。</p>
          </div>
        </div>

        <div class="guide-grid">
          <article class="guide-card">
            <span class="guide-number">01</span>
            <span class="guide-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 4.3 4.3" /></svg>
            </span>
            <h3>挑选角色</h3>
            <p>按名称、标签或分类找到喜欢的角色，先看看 TA 的故事。</p>
            <span class="guide-line" aria-hidden="true"></span>
          </article>

          <article class="guide-card">
            <span class="guide-number">02</span>
            <span class="guide-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 3.5v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" /></svg>
            </span>
            <h3>带走 PNG</h3>
            <p>在详情里下载原始 PNG，角色设定会完整保留在文件中。</p>
            <span class="guide-line" aria-hidden="true"></span>
          </article>

          <article class="guide-card">
            <span class="guide-number">03</span>
            <span class="guide-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M20 11.5c0 4-3.6 7.2-8 7.2-1 0-2-.2-2.9-.5L4.5 20l1.4-3.8A6.9 6.9 0 0 1 4 11.5c0-4 3.6-7.2 8-7.2s8 3.2 8 7.2Z" /><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" /></svg>
            </span>
            <h3>在酒馆开聊</h3>
            <p>导入 SillyTavern 或其他兼容前端，就可以开始新的故事。</p>
            <span class="guide-line" aria-hidden="true"></span>
          </article>
        </div>

        <div id="tool" class="tool-panel">
          <div class="tool-head">
            <div>
              <div class="section-kicker"><span aria-hidden="true">✦</span> LITTLE HELPER'S DESK</div>
              <h3>角色卡工具箱</h3>
              <p>把 PNG 内嵌的角色数据提取为 JSON；所有解析都在浏览器本地完成。</p>
            </div>
            <span class="tool-note">LOCAL · PRIVATE · OPEN SOURCE</span>
          </div>
          <CardTool />
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.home { background: $color-bg; }

.hero {
  position: relative;
  display: flex;
  align-items: center;
  min-height: clamp(400px, 29vw, 460px);
  overflow: hidden;
  isolation: isolate;
  background: #071120;
}

.hero:not(.has-banner) {
  background:
    radial-gradient(ellipse at 74% 42%, rgba(255, 205, 112, .10), transparent 36%),
    radial-gradient(ellipse at 58% 44%, rgba(54, 86, 150, .26), transparent 46%),
    linear-gradient(108deg, #040c1a 0%, #071528 52%, #0c1e3a 100%);
}

/* 人物身后的月晕与月盘：给深色底一个光源方向，避免整块平涂 */
.hero-moon {
  position: absolute;
  right: 40px;
  top: -86px;
  z-index: 1;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(196, 218, 255, .20) 0%, rgba(150, 182, 255, .09) 40%, transparent 68%);
  pointer-events: none;
}

.hero-disc {
  position: absolute;
  right: 130px;
  top: 40px;
  z-index: 1;
  width: 392px;
  height: 392px;
  border: 1px solid rgba(214, 230, 255, .10);
  border-radius: 50%;
  background: radial-gradient(circle at 38% 32%, rgba(255, 246, 220, .14), rgba(200, 218, 255, .06) 55%, transparent 72%);
  pointer-events: none;
}

.hero-art {
  position: absolute;
  right: 96px;
  bottom: -132px;
  z-index: 2;
  height: 536px;
  filter: drop-shadow(0 22px 60px rgba(0, 0, 0, .55));
  /* 立绘自己淡出到 hero 底边，底部渐隐层就不必盖在文案上了 */
  mask-image: linear-gradient(180deg, #000 62%, transparent 76%);
  -webkit-mask-image: linear-gradient(180deg, #000 62%, transparent 76%);
  pointer-events: none;

  img { display: block; height: 100%; width: auto; }
}

/* 底部渐隐，让 hero 融进下方精选区而不是硬切一条线。
 * 必须压在文案（z-index 3）下面，否则会把主按钮染成暗金色。 */
.hero::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  height: 150px;
  background: linear-gradient(0deg, #081426 6%, rgba(8, 20, 38, .55) 46%, transparent 100%);
  pointer-events: none;
}

.hero.has-banner {
  background-image:
    linear-gradient(90deg, rgba(4, 11, 23, .95) 0%, rgba(4, 11, 23, .86) 23%, rgba(4, 11, 23, .44) 48%, rgba(4, 11, 23, .06) 76%, transparent 100%),
    linear-gradient(0deg, rgba(4, 10, 20, .58), transparent 34%),
    var(--hero-banner);
  background-size: cover;
  background-position: center 52%;
  background-repeat: no-repeat;
}

.hero-inner {
  position: relative;
  z-index: 3;
  width: min($max-width, calc(100% - 56px));
  margin: 0 auto;
  padding: clamp(40px, 4.4vw, 62px) 0;
}

.hero-copy { max-width: 720px; }

.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 18px;
  color: #93a6c4;
  font-size: 10px;
  font-weight: 650;
  letter-spacing: .19em;

  i {
    width: 5px;
    height: 5px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: $color-accent;
  }
}

h1 {
  margin: 0;
  color: #f8f2e4;
  font-family: Georgia, 'Times New Roman', 'Noto Serif SC', serif;
  font-size: clamp(36px, 3.9vw, 56px);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: .002em;
  text-shadow: 0 6px 36px rgba(0, 0, 0, .42);
  white-space: nowrap;
}

.hero-subtitle {
  margin: 15px 0 0;
  color: #f1d69a;
  font-size: clamp(19px, 1.65vw, 23px);
  font-weight: 600;
  letter-spacing: .03em;
  text-shadow: 0 3px 20px rgba(0, 0, 0, .35);
}

.hero-description {
  margin: 13px 0 0;
  color: #b9c7de;
  font-size: 14px;
  line-height: 1.7;
  letter-spacing: .02em;
  text-shadow: 0 2px 14px rgba(0, 0, 0, .4);
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 28px;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 26px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: transform .2s ease, background .2s ease, border-color .2s ease, box-shadow .2s ease;

  &:hover { transform: translateY(-2px); text-decoration: none; }
}

.button-primary {
  border: 1px solid #ffdb6b;
  background: #ffdb6b;
  color: #1c2432;
  box-shadow: 0 10px 28px rgba(255, 200, 90, .18);

  span { font-size: 17px; line-height: 1; }
  &:hover { background: #ffe491; border-color: #ffe491; box-shadow: 0 12px 32px rgba(255, 200, 90, .28); }
}

.button-secondary {
  border: 1px solid rgba(241, 214, 154, .62);
  background: rgba(7, 18, 36, .54);
  color: #f2e7d1;
  backdrop-filter: blur(10px);

  &:hover { border-color: #f1d69a; background: rgba(15, 31, 56, .78); }
}

.github-icon {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.featured {
  position: relative;
  padding: 52px 0 74px;
  background: #081426;
}

.section-inner {
  width: min($max-width, calc(100% - 56px));
  margin: 0 auto;
}

.featured-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 26px;

  h2 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    color: #f2ead9;
    font-size: 23px;
    font-weight: 600;
    letter-spacing: .01em;

    span { color: $color-accent; font-size: 17px; }
  }

  p {
    margin: 7px 0 0;
    color: $color-text-muted;
    font-size: 13px;
  }
}

.view-all {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 0;
  border: 0;
  background: transparent;
  color: #d7c08a;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: color .2s ease;

  span { transition: transform .2s ease; }
  &:hover { color: $color-accent; }
  &:hover span { transform: translateX(3px); }
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 20px;
}

.featured-state {
  margin: 0;
  padding: 54px 0;
  color: $color-text-muted;
  font-size: 13px;

  a { color: $color-accent; }

  &--error { color: #d99a96; }
}

.guide {
  position: relative;
  padding: 56px 0 76px;
  border-top: 1px solid #12233f;
  background:
    radial-gradient(ellipse at 50% 100%, rgba(255, 205, 112, .04), transparent 48%),
    #050a14;
}

.section-heading {
  margin-bottom: 26px;

  h2 {
    margin: 0;
    color: #f2ead9;
    font-size: clamp(24px, 2.4vw, 29px);
    font-weight: 600;
    letter-spacing: .02em;
  }

  p {
    margin: 8px 0 0;
    color: $color-text-muted;
    font-size: 13px;
  }
}

.section-kicker {
  margin-bottom: 10px;
  color: #8a9bb8;
  font-size: 9.5px;
  font-weight: 650;
  letter-spacing: .16em;

  span { margin-right: 7px; color: $color-accent; }
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.guide-card {
  position: relative;
  min-height: 196px;
  padding: 24px 24px 23px;
  overflow: hidden;
  border: 1px solid #1a2a4a;
  border-radius: 14px;
  background: linear-gradient(150deg, #0c1c36, #0a1730);
  transition: transform .22s ease, border-color .22s ease, background .22s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 24px;
    right: 24px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 219, 107, .3), transparent);
  }

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(255, 219, 107, .34);
    background: linear-gradient(150deg, #102340, #0b1b36);
  }

  h3 {
    margin: 19px 0 7px;
    color: #eef2f9;
    font-size: 15.5px;
    font-weight: 600;
  }

  p {
    margin: 0;
    max-width: 300px;
    color: #8a9bb8;
    font-size: 12.5px;
    line-height: 1.85;
  }
}

.guide-number {
  position: absolute;
  top: 19px;
  right: 20px;
  color: rgba(255, 219, 107, .4);
  font-size: 12px;
  letter-spacing: .12em;
}

.guide-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(255, 219, 107, .3);
  border-radius: 12px;
  background: rgba(255, 219, 107, .055);
  color: $color-accent;

  svg {
    width: 21px;
    height: 21px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.55;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}

.guide-line {
  position: absolute;
  left: 24px;
  bottom: 0;
  width: 48px;
  height: 2px;
  background: linear-gradient(90deg, #ffdb6b, transparent);
}

.tool-panel {
  margin-top: 42px;
  padding: 30px;
  border: 1px solid #1a2a4a;
  border-radius: 18px;
  background:
    radial-gradient(ellipse at 92% 0%, rgba(255, 219, 107, .06), transparent 34%),
    #0b1a33;
  box-shadow: 0 18px 48px rgba(0, 0, 0, .18);
}

.tool-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 22px;
  margin-bottom: 22px;
  border-bottom: 1px solid rgba(31, 53, 87, .62);

  h3 {
    margin: 0;
    color: #f1e8d6;
    font-size: 22px;
    font-weight: 600;
  }

  p {
    margin: 8px 0 0;
    color: #8a9bb8;
    font-size: 12.5px;
    line-height: 1.8;
  }
}

.tool-note {
  flex: none;
  padding: 7px 11px;
  border: 1px solid rgba(255, 219, 107, .2);
  border-radius: 999px;
  color: #cfb57d;
  font-size: 8px;
  letter-spacing: .14em;
  white-space: nowrap;
}

.tool-panel :deep(.tool-lead) { display: none; }

.tool-panel :deep(.drop) {
  border-color: #2a436a;
  background: rgba(5, 12, 26, .46);
}

.tool-panel :deep(.drop:hover),
.tool-panel :deep(.drop:focus-visible),
.tool-panel :deep(.drop--over) {
  border-color: $color-accent;
  background: rgba(255, 219, 107, .045);
}

.tool-panel :deep(.drop-title) { color: #e6eaf3; }
.tool-panel :deep(.drop-sub) { color: #8a9bb8; }
.tool-panel :deep(.card) { border-color: #1a2a4a; background: #0e1f38; }

.tool-panel :deep(.btn) {
  border-color: #2a436a;
  background: #12233f;
  color: #e6eaf3;
}

.tool-panel :deep(.btn:hover) { border-color: $color-accent; color: $color-accent; }

.tool-panel :deep(.btn--primary) {
  border-color: $color-accent;
  background: $color-accent;
  color: #1c2432;
}

.tool-panel :deep(.btn--primary:hover) { background: #ffe491; color: #1c2432; }

.tool-panel :deep(.fields td) {
  border-color: rgba(42, 67, 106, .6);
  color: #c3cddd;
}

.tool-panel :deep(.fields td:first-child) { color: #8a9bb8; }
.tool-panel :deep(.raw) { border-color: #1a2a4a; }
.tool-panel :deep(.raw summary) { color: #8a9bb8; }
.tool-panel :deep(.raw summary:hover) { color: $color-accent; }
.tool-panel :deep(.raw pre) { color: #dce6f7; }

@media (max-width: 1180px) {
  .featured-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

@media (max-width: 980px) {
  .hero { min-height: 470px; }
  .hero.has-banner { background-position: 60% center; }
  .hero-art { right: 24px; height: 460px; bottom: -110px; }
  .hero-disc { right: 60px; top: 30px; width: 330px; height: 330px; }
  h1 { font-size: clamp(34px, 5.6vw, 50px); white-space: normal; }
  .hero-copy { max-width: 520px; }
}

@media (max-width: 760px) {
  .hero {
    align-items: flex-end;
    min-height: 596px;
  }

  .hero-moon {
    right: 50%;
    top: -30px;
    width: 440px;
    height: 440px;
    transform: translateX(50%);
  }

  .hero-disc {
    left: 50%;
    right: auto;
    top: 18px;
    width: 248px;
    height: 248px;
    transform: translateX(-50%);
  }

  .hero-art {
    left: 50%;
    right: auto;
    bottom: auto;
    top: 6px;
    height: 370px;
    transform: translateX(-50%);
  }

  .hero.has-banner {
    background-image:
      linear-gradient(0deg, rgba(4, 11, 23, .96) 4%, rgba(4, 11, 23, .88) 27%, rgba(4, 11, 23, .3) 58%, transparent 78%),
      linear-gradient(90deg, rgba(4, 11, 23, .3), transparent 52%),
      var(--hero-banner);
    background-position: 62% center, center, 62% center;
    background-size: cover;
  }

  .hero-inner {
    width: calc(100% - 38px);
    padding: 376px 0 40px;
  }

  .hero-copy { max-width: 100%; }

  .hero-eyebrow { margin-bottom: 12px; font-size: 8.5px; letter-spacing: .16em; }

  h1 {
    font-size: clamp(25px, 7.2vw, 34px);
    white-space: nowrap;
  }

  .hero-subtitle { margin-top: 11px; font-size: 18px; }
  .hero-description { margin-top: 10px; font-size: 12.5px; line-height: 1.75; }
  .hero-actions { margin-top: 22px; gap: 10px; }
  .button { min-height: 44px; padding: 0 19px; font-size: 12.5px; }

  .featured { padding: 40px 0 56px; }
  .section-inner { width: calc(100% - 36px); }
  .featured-head { margin-bottom: 20px; }
  .featured-head h2 { font-size: 20px; }
  .featured-head p { font-size: 12px; }
  .view-all { font-size: 12px; }
  .featured-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 14px; }

  .guide { padding: 40px 0 56px; }
  .section-heading { margin-bottom: 20px; }
  .section-heading h2 { font-size: 22px; }
  .guide-grid { grid-template-columns: 1fr; gap: 12px; }
  .guide-card { min-height: 0; padding: 20px; }
  .guide-card::before { left: 20px; right: 20px; }
  .guide-line { left: 20px; }
  .guide-number { top: 16px; right: 16px; }

  .tool-panel { margin-top: 30px; padding: 18px 14px; }
  .tool-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
    padding-bottom: 18px;
    margin-bottom: 18px;
  }
  .tool-head h3 { font-size: 19px; }
  .tool-note { font-size: 7.5px; }
}
</style>
