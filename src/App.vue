<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ManifestCard } from './types/card'
import CardGrid from './components/CardGrid.vue'
import CardDetail from './components/CardDetail.vue'

const REPO_URL = 'https://github.com/is0612/open-character-cards'

// 从构建产物 /data/manifest.json 加载角色卡清单
const cards = ref<ManifestCard[]>([])
const loading = ref(true)
const error = ref('')

const selected = ref<ManifestCard | null>(null)
const cardCount = computed(() => cards.value.length)

// 导航锚点
const navItems = [
  { href: '#about', label: '项目简介' },
  { href: '#usage', label: '如何使用' },
  { href: '#contribute', label: '如何投稿' },
  { href: '#gallery', label: '角色卡画廊' },
  { href: '#faq', label: '常见问题' },
]

// FAQ
const faqs = [
  {
    q: '角色卡是什么格式？',
    a: '每张角色卡是一张 SillyTavern 格式的 PNG，角色名、人设、开场白等完整数据内嵌在图片里。下载导入酒馆即可使用。',
  },
  {
    q: '我不会写代码，能投稿吗？',
    a: '可以。通过 GitHub Issue 选择「角色卡投稿」模板，上传你的角色卡 PNG 即可，维护者会帮你合入仓库。',
  },
  {
    q: '角色卡有版权问题吗？',
    a: '角色卡默认遵循各卡标注的授权协议，未标注按 CC BY-SA 4.0 处理。使用他人作品前请核实授权。',
  },
  {
    q: '角色卡能导入哪些客户端？',
    a: 'SillyTavern（酒馆）原生支持 PNG 角色卡。其他支持该格式的前端也可以直接导入。',
  },
]

async function loadCards() {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/manifest.json`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    cards.value = data.cards ?? []
  } catch (e) {
    error.value = '加载角色卡失败，请确认 data/manifest.json 已生成。'
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openCard(card: ManifestCard) {
  selected.value = card
}

function closeCard() {
  selected.value = null
}

onMounted(loadCards)
</script>

<template>
  <div class="app">
    <!-- 顶部导航 -->
    <nav class="nav">
      <div class="nav-inner">
        <a class="nav-brand" href="#top">
          <span class="nav-logo" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="5" width="13" height="15" rx="2" fill="#4a3628" />
              <rect x="7" y="2" width="13" height="15" rx="2" fill="#c9762b" />
              <rect x="4.5" y="9" width="8" height="2.5" rx="1.25" fill="#fff" opacity="0.9" />
              <rect x="4.5" y="13.5" width="5" height="2" rx="1" fill="#fff" opacity="0.6" />
            </svg>
          </span>
          <span class="nav-title">Open Character Cards</span>
        </a>
        <div class="nav-links">
          <a v-for="item in navItems" :key="item.href" :href="item.href">{{ item.label }}</a>
          <a class="nav-gh" :href="REPO_URL" target="_blank" rel="noreferrer">
            GitHub
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M3 9L9 3M4 3h5v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <header id="top" class="hero">
      <div class="hero-inner">
        <span class="hero-eyebrow">开源 · 共享 · 共建</span>
        <h1 class="hero-title">开源角色卡<br />共享平台</h1>
        <p class="hero-sub">
          每张角色卡就是一张图片。下载它、导入酒馆，就能还原一个完整角色。<br />
          而你，也可以把喜欢的角色，分享给更多人。
        </p>
        <div class="hero-actions">
          <a class="hero-btn hero-btn--primary" href="#gallery">浏览角色卡</a>
          <a class="hero-btn hero-btn--ghost" :href="REPO_URL + '/issues/new/choose'" target="_blank" rel="noreferrer">去投稿 →</a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-num">{{ cardCount }}</span>
            <span class="hero-stat-label">张角色卡</span>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <span class="hero-stat-num">Git</span>
            <span class="hero-stat-label">文件即数据</span>
          </div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat">
            <span class="hero-stat-num">∞</span>
            <span class="hero-stat-label">人人可共建</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 项目简介 -->
    <section id="about" class="section">
      <div class="section-inner">
        <div class="section-head">
          <span class="section-index">01</span>
          <h2 class="section-title">这是什么</h2>
        </div>
        <p class="section-lead">一个把「分享角色卡」降到最低门槛的开源社区。</p>
        <div class="about-grid">
          <div class="about-card">
            <span class="about-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2v16M2 10h16" stroke="#c9762b" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </span>
            <h3>为什么做这个</h3>
            <p>国内的角色卡平台太少，类脑又难进去。我们想让「分享一张角色卡」，简单到只需要上传一张图。</p>
          </div>
          <div class="about-card">
            <span class="about-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7.5" stroke="#c9762b" stroke-width="1.6" />
                <path d="M7 10l2 2 4-4" stroke="#c9762b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <h3>完全开源</h3>
            <p>角色卡以文件形式存于 Git 仓库，任何人都能浏览、下载、二次创作，遵循各卡标注的授权协议。</p>
          </div>
          <div class="about-card">
            <span class="about-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="7" cy="10" r="2.4" stroke="#c9762b" stroke-width="1.6" />
                <circle cx="13" cy="6" r="2.4" stroke="#c9762b" stroke-width="1.6" />
                <circle cx="13" cy="14" r="2.4" stroke="#c9762b" stroke-width="1.6" />
              </svg>
            </span>
            <h3>人人可共建</h3>
            <p>不懂代码就发 Issue 投稿，会写代码就发 PR。没有门槛，也没有「官方垄断」，社区一起维护。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 如何使用 -->
    <section id="usage" class="section section--alt">
      <div class="section-inner">
        <div class="section-head">
          <span class="section-index">02</span>
          <h2 class="section-title">如何使用</h2>
        </div>
        <p class="section-lead">三步，把一张角色卡带回家。</p>
        <ol class="steps">
          <li class="step">
            <span class="step-num">1</span>
            <div class="step-body">
              <h4>找到喜欢的角色卡</h4>
              <p>在下方画廊浏览，点击任意卡片查看详情。</p>
            </div>
          </li>
          <li class="step">
            <span class="step-num">2</span>
            <div class="step-body">
              <h4>复制或下载图片</h4>
              <p>详情页点「复制图片」或「下载角色卡 PNG」，把这张图拿走。</p>
            </div>
          </li>
          <li class="step">
            <span class="step-num">3</span>
            <div class="step-body">
              <h4>导入酒馆</h4>
              <p>把图片导入 SillyTavern（酒馆）等前端，即可还原完整角色。</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- 如何投稿 -->
    <section id="contribute" class="section">
      <div class="section-inner">
        <div class="section-head">
          <span class="section-index">03</span>
          <h2 class="section-title">如何投稿</h2>
        </div>
        <p class="section-lead">两种方式，选你顺手的。</p>
        <div class="contribute-grid">
          <div class="contribute-card">
            <span class="contribute-tag">适合不会用 Git</span>
            <h3>Issue 投稿</h3>
            <p>打开 Issue，选「角色卡投稿」模板，填好信息、上传你的角色卡 PNG，维护者会帮你合入。</p>
            <a class="text-link" :href="REPO_URL + '/issues/new?template=card-submission.yml'" target="_blank" rel="noreferrer">提交角色卡 →</a>
          </div>
          <div class="contribute-card">
            <span class="contribute-tag">适合会用 Git</span>
            <h3>直接 PR</h3>
            <p>Fork 仓库，把 PNG 放进 cards/ 目录，可选加一份 meta.json，跑一次 build:manifest 再提交。</p>
            <a class="text-link" :href="REPO_URL" target="_blank" rel="noreferrer">查看仓库 →</a>
          </div>
        </div>
      </div>
    </section>

    <!-- 画廊 -->
    <section id="gallery" class="section section--alt">
      <div class="section-inner">
        <div class="section-head">
          <div class="section-head-left">
            <span class="section-index">04</span>
            <h2 class="section-title">角色卡画廊</h2>
          </div>
          <span class="section-count">{{ cardCount }} 张角色卡</span>
        </div>
        <p v-if="loading" class="status">加载中…</p>
        <p v-else-if="error" class="status status--error">{{ error }}</p>
        <CardGrid v-else :cards="cards" @select="openCard" />
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="section">
      <div class="section-inner section-inner--narrow">
        <div class="section-head">
          <span class="section-index">05</span>
          <h2 class="section-title">常见问题</h2>
        </div>
        <div class="faq-list">
          <details v-for="f in faqs" :key="f.q" class="faq">
            <summary>{{ f.q }}</summary>
            <p>{{ f.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="footer-logo" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="5" width="13" height="15" rx="2" fill="#4a3628" />
              <rect x="7" y="2" width="13" height="15" rx="2" fill="#c9762b" />
            </svg>
          </span>
          <span>Open Character Cards</span>
        </div>
        <p class="footer-meta">
          角色卡以文件形式存于 Git 仓库，遵循各卡标注的授权协议。
          如涉及侵权，请通过 <a :href="REPO_URL + '/issues/new?template=card-submission.yml'" target="_blank" rel="noreferrer">GitHub Issue</a> 联系。
        </p>
      </div>
    </footer>

    <CardDetail v-if="selected" :card="selected" @close="closeCard" />
  </div>
</template>

<style scoped lang="scss">
@use './styles/variables' as *;

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ============ 导航 ============ */
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba($color-surface, 0.88);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid $color-border;
}

.nav-inner {
  max-width: $max-width;
  margin: 0 auto;
  padding: 14px $gutter;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: $color-text;
  text-decoration: none;
}

.nav-logo {
  display: inline-flex;
}

.nav-title {
  font-size: 16px;
  letter-spacing: 0.01em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 22px;

  a {
    font-size: $fs-muted;
    color: $color-text-muted;
    text-decoration: none;
    transition: color 0.15s ease;

    &:hover {
      color: $color-primary;
    }
  }
}

.nav-gh {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: $color-primary !important;
}

/* ============ Hero ============ */
.hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse 60% 55% at 50% -12%, $color-accent-soft 0%, transparent 62%),
    radial-gradient(ellipse 45% 40% at 50% -8%, rgba(201, 118, 43, 0.08) 0%, transparent 70%),
    $color-bg;
  border-bottom: 1px solid $color-border;
}

.hero-inner {
  max-width: $max-width;
  margin: 0 auto;
  padding: 84px $gutter 72px;
  text-align: center;
}

.hero-eyebrow {
  display: inline-block;
  font-size: $fs-small;
  letter-spacing: 0.2em;
  color: $color-accent;
  font-weight: 600;
  margin-bottom: 20px;
}

.hero-title {
  margin: 0 0 20px;
  font-size: $fs-hero;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1.15;
}

.hero-sub {
  margin: 0 auto 32px;
  max-width: 560px;
  font-size: 17px;
  color: $color-text-muted;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  padding: 12px 28px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;

  &:hover {
    text-decoration: none;
    transform: translateY(-1px);
  }

  &--primary {
    background: $color-accent;
    color: #fff;
    box-shadow: 0 4px 14px rgba(201, 118, 43, 0.28);

    &:hover {
      background: color-mix(in srgb, $color-accent 90%, black);
      box-shadow: 0 6px 18px rgba(201, 118, 43, 0.34);
    }
  }

  &--ghost {
    border: 1px solid $color-border;
    color: $color-text;
    background: $color-surface;

    &:hover {
      border-color: $color-primary;
      color: $color-primary;
    }
  }
}

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  flex-wrap: wrap;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-stat-num {
  font-size: 26px;
  font-weight: 800;
  color: $color-primary;
}

.hero-stat-label {
  font-size: $fs-small;
  color: $color-text-muted;
  margin-top: 2px;
}

.hero-stat-divider {
  width: 1px;
  height: 32px;
  background: $color-border;
}

/* ============ 通用 section ============ */
.section {
  padding: 64px $gutter;

  &--alt {
    background: $color-surface;
    border-top: 1px solid $color-border;
    border-bottom: 1px solid $color-border;
  }
}

.section-inner {
  max-width: $max-width;
  margin: 0 auto;

  &--narrow {
    max-width: 760px;
  }
}

.section-head {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 12px;
}

.section-head-left {
  display: flex;
  align-items: baseline;
  gap: 14px;
}

.section-index {
  font-size: $fs-muted;
  font-weight: 700;
  color: $color-accent;
  letter-spacing: 0.05em;
}

.section-title {
  margin: 0;
  font-size: $fs-section;
  font-weight: 700;
}

.section-lead {
  margin: 0 0 32px;
  font-size: $fs-body;
  color: $color-text-muted;
}

.section-count {
  font-size: $fs-muted;
  color: $color-text-muted;
  margin-left: auto;
}

/* ============ 简介卡片 ============ */
.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.about-card {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: 28px;
  box-shadow: $shadow-sm;
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-3px);
  }

  h3 {
    margin: 16px 0 10px;
    font-size: $fs-card-title;
  }

  p {
    margin: 0;
    font-size: $fs-muted;
    color: $color-text-muted;
    line-height: 1.7;
  }
}

.about-icon {
  display: inline-flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: $radius-sm;
  background: $color-accent-soft;
}

/* ============ 使用步骤 ============ */
.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.step {
  display: flex;
  gap: 18px;
  padding: 20px 0;
  border-bottom: 1px dashed $color-border;

  &:last-child {
    border-bottom: none;
  }
}

.step-num {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: $color-primary;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}

.step-body {
  h4 {
    margin: 0 0 4px;
    font-size: $fs-body;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: $fs-muted;
    color: $color-text-muted;
  }
}

/* ============ 投稿 ============ */
.contribute-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.contribute-card {
  position: relative;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: 28px;
  box-shadow: $shadow-sm;

  h3 {
    margin: 14px 0 10px;
    font-size: $fs-card-title;
  }

  p {
    margin: 0 0 16px;
    font-size: $fs-muted;
    color: $color-text-muted;
    line-height: 1.7;
  }
}

.contribute-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 4px 10px;
  border-radius: 999px;
  background: $color-primary-soft;
  color: $color-primary;
}

.text-link {
  display: inline-block;
  font-size: $fs-muted;
  font-weight: 600;
  color: $color-accent;

  &:hover {
    text-decoration: underline;
  }
}

/* ============ FAQ ============ */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius;
  overflow: hidden;
  transition: border-color 0.15s ease;

  &[open] {
    border-color: $color-primary;
  }

  summary {
    cursor: pointer;
    padding: 18px 22px;
    font-weight: 600;
    font-size: $fs-body;
    list-style: none;
    position: relative;
    padding-right: 48px;
    user-select: none;

    &::-webkit-details-marker {
      display: none;
    }

    &::after {
      content: '+';
      position: absolute;
      right: 22px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 22px;
      font-weight: 300;
      color: $color-text-muted;
      transition: transform 0.2s ease;
    }
  }

  &[open] summary::after {
    transform: translateY(-50%) rotate(45deg);
  }

  p {
    margin: 0;
    padding: 0 22px 20px;
    font-size: $fs-muted;
    color: $color-text-muted;
    line-height: 1.7;
  }
}

/* ============ 状态 ============ */
.status {
  color: $color-text-muted;

  &--error {
    color: $color-accent;
  }
}

/* ============ 页脚 ============ */
.footer {
  background: $color-primary;
  color: rgba(255, 255, 255, 0.86);
}

.footer-inner {
  max-width: $max-width;
  margin: 0 auto;
  padding: 40px $gutter;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 16px;
  color: #fff;
}

.footer-logo {
  display: inline-flex;
}

.footer-meta {
  margin: 0;
  font-size: $fs-small;
  color: rgba(255, 255, 255, 0.6);

  a {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: underline;
  }
}

/* ============ 响应式 ============ */
@media (max-width: 640px) {
  .nav-inner {
    padding: 12px 20px;
  }

  .nav-links {
    gap: 14px;
    overflow-x: auto;
    white-space: nowrap;
  }

  .hero-inner {
    padding: 56px 20px 48px;
  }

  .hero-title {
    font-size: 32px;
  }

  .hero-stats {
    gap: 18px;
  }

  .hero-stat-divider {
    display: none;
  }

  .section {
    padding: 44px 20px;
  }

  .section-title {
    font-size: 24px;
  }

  .footer-inner {
    padding: 32px 20px;
  }
}
</style>
