<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ManifestCard } from './types/card'
import CardGrid from './components/CardGrid.vue'
import CardDetail from './components/CardDetail.vue'
import CardTool from './components/CardTool.vue'

const REPO_URL = 'https://github.com/is0612/open-character-cards'
const base = import.meta.env.BASE_URL
const cards = ref<ManifestCard[]>([])
const loading = ref(true)
const error = ref('')
const selected = ref<ManifestCard | null>(null)
const bannerLoaded = ref(false)
const cardCount = computed(() => cards.value.length)

const faqs = [
  {
    q: '角色卡是什么格式？',
    a: '每张角色卡都是 SillyTavern 格式的 PNG，角色名、人设、开场白等完整数据内嵌在图片中。下载后导入酒馆即可使用。',
  },
  {
    q: '我不会写代码，可以投稿吗？',
    a: '可以。打开 GitHub 的角色卡投稿模板，填写基础信息并上传角色卡 PNG，后续导入由仓库工作流处理。',
  },
  {
    q: '角色卡的授权如何确认？',
    a: '请优先查看每张卡片标注的授权协议。未单独标注的内容按仓库说明处理，二次使用或转载前请核实原作者授权。',
  },
]

async function loadCards() {
  try {
    const res = await fetch(base + 'data/manifest.json')
    if (res.status === 404) {
      error.value = '角色卡清单尚未生成。请在仓库根目录运行 npm run build:manifest，或使用 npm run dev 启动开发环境。'
      return
    }
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const data = await res.json()
    cards.value = data.cards ?? []
  } catch (e) {
    error.value = '暂时无法加载角色卡清单，请稍后重试。'
    console.error(e)
  } finally {
    loading.value = false
  }
}

function probeTavernBanner() {
  const image = new Image()
  image.onload = () => {
    bannerLoaded.value = true
  }
  image.onerror = () => {
    bannerLoaded.value = false
  }
  image.src = base + 'images/moonlit-tavern-banner.svg'
}

function openCard(card: ManifestCard) {
  selected.value = card
}

function closeCard() {
  selected.value = null
}

onMounted(() => {
  void loadCards()
  probeTavernBanner()
})
</script>

<template>
  <div class="app-shell">
    <nav class="topbar">
      <div class="topbar-inner">
        <a class="brand" href="#top" aria-label="Open Character Cards 首页">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 44 44" fill="none">
              <path d="M10.8 16.1 8.2 5.3 19.5 12.2M24.5 12.2 35.8 5.3 33.2 16.1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="22" cy="25" r="13.4" fill="currentColor" fill-opacity=".1"/>
              <circle cx="22" cy="25" r="13.4" stroke="currentColor" stroke-width="2.2"/>
              <path d="M28.7 8.9a6.4 6.4 0 1 0 6.1 9.6 6.6 6.6 0 0 1-6.1-9.6Z" fill="#E7CE91"/>
              <path d="m22 18.1 2.1 4.7 4.7 2.2-4.7 2.1-2.1 4.7-2.2-4.7-4.7-2.1 4.7-2.2 2.2-4.7Z" fill="#E7CE91"/>
            </svg>
          </span>
          <span class="brand-copy">
            <strong>OPEN CHARACTER CARDS</strong>
            <small>月下酒馆 · 角色卡档案馆</small>
          </span>
        </a>
        <div class="top-links">
          <a class="top-link-active" href="#top">首页</a>
          <a href="#gallery">角色卡</a>
          <a href="#about">关于项目</a>
          <a href="#guide">使用指南</a>
          <a href="#tool">卡牌工具</a>
          <a class="top-contribute" :href="REPO_URL + '/issues/new?template=card-submission.yml'" target="_blank" rel="noreferrer">投稿角色 <span aria-hidden="true">↗</span></a>
          <a class="github-link" :href="REPO_URL" target="_blank" rel="noreferrer" aria-label="在 GitHub 查看项目">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4.3 1.3-4.3-2.4-6-2.9M15 21v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6A4.7 4.7 0 0 0 18.4 6 4.3 4.3 0 0 0 18.3 3S17.2 2.7 15 4.2a12.7 12.7 0 0 0-6 0C6.8 2.7 5.7 3 5.7 3A4.3 4.3 0 0 0 5.6 6 4.7 4.7 0 0 0 4.3 9.3c0 4.7 2.8 5.7 5.5 6A3 3 0 0 0 9 17.6V21" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>
      </div>
    </nav>

    <main>
      <section
        id="top"
        class="hero"
        :class="{ 'has-banner': bannerLoaded }"
        :style="{ '--tavern-banner': 'url(' + base + 'images/moonlit-tavern-banner.svg)' }"
      >
        <div class="tavern-fallback" aria-hidden="true">
          <div class="tavern-window">
            <div class="window-moon"></div>
            <div class="window-tower tower-one"></div>
            <div class="window-tower tower-two"></div>
            <div class="window-tower tower-three"></div>
            <span class="window-star star-one">✦</span><span class="window-star star-two">✧</span>
          </div>
          <div class="tavern-shelf shelf-back"></div>
          <div class="tavern-shelf shelf-front"></div>
          <div class="tavern-lantern lantern-left"><i></i></div>
          <div class="tavern-lantern lantern-right"><i></i></div>
          <div class="tavern-counter"></div>
        </div>
        <div class="hero-vignette" aria-hidden="true"></div>
        <div class="hero-inner">
          <div class="hero-copy">
            <div class="eyebrow"><span class="eyebrow-star">✦</span> WELCOME TO THE MOONLIT TAVERN</div>
            <h1>推开酒馆的门，<br><span>遇见新的故事。</span></h1>
            <p class="hero-description">这里收藏着来自不同世界的角色。挑一张喜欢的角色卡，把 TA 带进 SillyTavern，开启属于你的下一段故事。</p>
            <div class="hero-actions">
              <a class="button button-primary" href="#gallery">看看今晚的角色 <span aria-hidden="true">↘</span></a>
              <a class="button button-secondary" :href="REPO_URL" target="_blank" rel="noreferrer"><span class="github-mini" aria-hidden="true">⌘</span> 在 GitHub 查看</a>
            </div>
            <div class="hero-proof">
              <div><span class="proof-icon">▧</span><span><strong>PNG 原生角色卡</strong><small>完整数据内嵌于图片</small></span></div>
              <i aria-hidden="true"></i>
              <div><span class="proof-icon">✧</span><span><strong>开源共建</strong><small>浏览、下载、提交 PR</small></span></div>
            </div>
          </div>

          <div class="hero-art" aria-label="星夜酒馆的猫娘店员">
            <div class="art-window" aria-hidden="true"><span>☾</span><i></i><b></b></div>
            <div class="art-glow" aria-hidden="true"></div>
            <div class="art-stars" aria-hidden="true"><b>✦</b><b>✧</b><b>·</b><b>✧</b><b>·</b></div>
            <img class="hero-character" :src="base + 'images/moon_catgirl_dark_ui.png'" alt="银白猫娘——月下酒馆的引路人" fetchpriority="high" />
            <div class="art-caption"><span class="caption-pulse"></span><span><strong>TONIGHT'S SHELF</strong><small>每个角色，都有自己的故事</small></span></div>
          </div>
        </div>
        <div class="hero-bottomline"><span>OCC — OPEN CHARACTER CARDS</span><span>GOOD STORIES ARE ALWAYS ON THE HOUSE <b>✦</b></span></div>
      </section>

      <section id="about" class="about-section">
        <div class="section-inner">
          <div class="about-card">
            <div class="about-copy">
              <div class="section-kicker"><span>✦</span> ABOUT THIS PROJECT</div>
              <h2>不只是收藏卡片，<br><span>也是故事的共同起点。</span></h2>
              <p>Open Character Cards 是一个基于 GitHub 的开源角色卡分享项目。角色卡以 PNG 文件保存，完整数据内嵌在图片里；你可以在这里发现喜欢的角色，也可以把自己的创作分享给更多人。</p>
              <a class="about-github" :href="REPO_URL" target="_blank" rel="noreferrer">了解项目与源代码 <span aria-hidden="true">↗</span></a>
            </div>
            <div class="about-features">
              <article class="about-feature"><span class="feature-icon">⌕</span><div><strong>开放的角色档案</strong><small>按名称、简介和标签寻找角色</small></div></article>
              <article class="about-feature"><span class="feature-icon">◈</span><div><strong>GitHub 托管</strong><small>文件与源代码公开可查</small></div></article>
              <article class="about-feature"><span class="feature-icon">✧</span><div><strong>社区共同完善</strong><small>通过 Issue 投稿，或提交 PR</small></div></article>
            </div>
            <div class="about-mascot-wrap" aria-hidden="true">
              <div class="about-moon"></div>
              <span class="about-spark spark-a">✦</span><span class="about-spark spark-b">✧</span>
              <img class="about-mascot" :src="base + 'images/moon_catgirl_dark_ui.png'" alt="" loading="lazy" />
              <div class="mascot-label"><span>☾</span> THE TAVERN KEEPER</div>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" class="section gallery-section">
        <div class="section-inner">
          <div class="section-heading">
            <div>
              <div class="section-kicker"><span>01</span> TONIGHT'S CHARACTER SHELF</div>
              <h2>今晚，想遇见谁？</h2>
              <p>挑选一张角色卡，带着 TA 进入你的故事。</p>
            </div>
            <div class="collection-count"><strong>{{ cardCount.toString().padStart(2, '0') }}</strong><span>张已收录角色卡</span></div>
          </div>
          <p v-if="loading" class="status-message"><span class="status-spinner"></span>正在整理酒馆的角色档案…</p>
          <div v-else-if="error" class="empty-notice">
            <span class="notice-icon">☾</span><strong>档案暂时不可用</strong><p>{{ error }}</p>
          </div>
          <div v-else-if="cards.length === 0" class="empty-notice">
            <span class="notice-icon">✧</span><strong>酒馆的第一张角色卡，等你来点亮</strong><p>成为第一位分享故事的人，让更多人遇见你的角色。</p>
            <a :href="REPO_URL + '/issues/new?template=card-submission.yml'" target="_blank" rel="noreferrer">投稿第一张角色卡 ↗</a>
          </div>
          <CardGrid v-else :cards="cards" @select="openCard" />
        </div>
      </section>

      <section id="guide" class="section guide-section">
        <div class="section-inner">
          <div class="section-heading compact-heading">
            <div><div class="section-kicker"><span>02</span> HOW TO TAKE A CHARACTER HOME</div><h2>把相遇，变成你的故事</h2><p>三步就好，酒馆已经为你准备好了。</p></div>
          </div>
          <div class="guide-grid">
            <article class="guide-card"><span class="guide-number">01</span><span class="guide-icon">⌕</span><h3>挑选角色</h3><p>通过关键词与标签，找到符合你喜好的角色、性格与世界观。</p><span class="guide-line"></span></article>
            <article class="guide-card"><span class="guide-number">02</span><span class="guide-icon">↓</span><h3>带走 PNG</h3><p>从角色详情下载原始 PNG，角色设定会完整保留在文件中。</p><span class="guide-line"></span></article>
            <article class="guide-card"><span class="guide-number">03</span><span class="guide-icon">✦</span><h3>在酒馆开聊</h3><p>将 PNG 导入 SillyTavern 或其他兼容前端，开始你的故事。</p><span class="guide-line"></span></article>
          </div>
        </div>
      </section>

      <section id="contribute" class="contribute-section">
        <div class="contribute-inner">
          <div class="contribute-seal" aria-hidden="true"><span>✦</span><i></i><b></b></div>
          <div class="contribute-copy"><div class="section-kicker">03 / SHARE YOUR IMAGINATION</div><h2>下一张被遇见的角色卡，也许来自你。</h2><p>不懂代码也没关系，通过 GitHub Issue 上传角色卡 PNG，就能参与档案馆共建。</p></div>
          <a class="button contribute-button" :href="REPO_URL + '/issues/new?template=card-submission.yml'" target="_blank" rel="noreferrer">分享一张角色卡 <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section id="tool" class="section tool-section">
        <div class="section-inner">
          <div class="section-heading compact-heading">
            <div><div class="section-kicker"><span>04</span> LITTLE HELPER'S DESK</div><h2>角色卡工具箱</h2><p>处理角色卡时用得上的小工具，都放在这里。</p></div>
          </div>
          <CardTool />
        </div>
      </section>

      <section id="faq" class="section faq-section">
        <div class="section-inner faq-inner">
          <div class="section-heading compact-heading"><div><div class="section-kicker"><span>05</span> A FEW QUESTIONS</div><h2>吧台边的几个小问题</h2></div></div>
          <div class="faq-list">
            <details v-for="faq in faqs" :key="faq.q" class="faq-item"><summary>{{ faq.q }}<span>＋</span></summary><p>{{ faq.a }}</p></details>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-inner">
        <a class="footer-brand" href="#top"><span class="footer-mark">☾</span><span><strong>OPEN CHARACTER CARDS</strong><small>月下酒馆 · 角色卡档案馆</small></span></a>
        <p>一个由创作者共同点亮的角色卡档案馆。<br><span>角色内容遵循各自授权协议，使用前请确认许可。</span></p>
        <div class="footer-links"><a href="#gallery">浏览角色</a><a href="#contribute">参与共建</a><a :href="REPO_URL" target="_blank" rel="noreferrer">GitHub ↗</a></div>
      </div>
      <div class="footer-lastline"><span>© OPEN CHARACTER CARDS</span><span>GOOD STORIES, SHARED OPENLY <b>✦</b></span></div>
    </footer>

    <CardDetail v-if="selected" :card="selected" @close="closeCard" />
  </div>
</template>

<style scoped>
.app-shell{min-height:100vh;background:#090f1e;color:#edf3ff;overflow:hidden;--ink:#edf3ff;--muted:#a0adc8;--gold:#efcb83;--gold-bright:#ffdfa0;--panel:#101a2e;--line:rgba(215,190,132,.2)}
.topbar{position:sticky;top:0;z-index:50;background:rgba(8,14,28,.9);backdrop-filter:blur(18px);border-bottom:1px solid rgba(190,175,139,.13)}
.topbar-inner{width:min(1240px,calc(100% - 56px));height:74px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:22px}
.brand{display:flex;align-items:center;gap:10px;color:#edf3ff;text-decoration:none;min-width:260px}
.brand-mark{width:42px;height:42px;display:grid;place-items:center;color:#b6c9f5;flex:0 0 auto}
.brand-mark svg{width:100%;height:100%}
.brand-copy,.footer-brand>span:last-child{display:flex;flex-direction:column;gap:4px}
.brand-copy strong,.footer-brand strong{font-family:Georgia,'Times New Roman',serif;font-size:12px;letter-spacing:.085em;font-weight:700}
.brand-copy small,.footer-brand small{font-size:10px;letter-spacing:.08em;color:#b7a77f}
.top-links{display:flex;align-items:center;gap:22px}
.top-links>a{color:#aab5cb;text-decoration:none;font-size:12px;transition:color .2s}
.top-links>a:hover,.top-links .top-link-active{color:#f4d89d}
.top-links .top-link-active{position:relative}
.top-links .top-link-active:after{content:"";position:absolute;height:2px;left:0;right:0;bottom:-12px;background:#e5c57e}
.top-links .top-contribute{border:1px solid rgba(235,199,123,.45);background:rgba(223,185,104,.09);padding:10px 13px;border-radius:9px;color:#f0d39a;white-space:nowrap}
.top-contribute span{padding-left:6px}
.github-link{width:34px;height:34px;display:grid;place-items:center;border:1px solid rgba(164,187,239,.2);border-radius:10px;flex:0 0 auto}
.github-link svg{width:19px;height:19px}
.hero{position:relative;isolation:isolate;min-height:604px;overflow:hidden;border-bottom:1px solid rgba(206,177,113,.27);background:radial-gradient(ellipse at 78% 43%,rgba(241,172,82,.18),transparent 28%),radial-gradient(ellipse at 61% 35%,rgba(58,92,158,.3),transparent 36%),linear-gradient(110deg,#090f1e 0%,#0c172e 53%,#111a2a 100%)}
.hero.has-banner{background-image:linear-gradient(90deg,rgba(7,12,25,.9) 0%,rgba(7,13,28,.78) 27%,rgba(7,13,28,.25) 57%,rgba(7,12,25,.08) 100%),linear-gradient(0deg,rgba(6,10,19,.72),transparent 24%,rgba(5,9,18,.08)),var(--tavern-banner);background-size:cover;background-position:center 48%}
.hero-vignette{position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(0deg,rgba(5,10,20,.7),transparent 27%),linear-gradient(90deg,rgba(7,12,24,.12),transparent 50%,rgba(4,8,16,.08))}
.hero:not(.has-banner) .hero-vignette{background:radial-gradient(ellipse at 74% 40%,rgba(234,172,87,.07),transparent 37%),linear-gradient(0deg,rgba(5,10,20,.72),transparent 25%)}
.tavern-fallback{position:absolute;z-index:0;inset:0;overflow:hidden;pointer-events:none;background:radial-gradient(ellipse at 76% 38%,rgba(255,190,103,.13),transparent 22%),linear-gradient(180deg,rgba(16,14,22,.16),transparent 46%,rgba(9,12,22,.5))}
.tavern-fallback:before{content:"";position:absolute;inset:0 0 35% 0;background:repeating-linear-gradient(90deg,rgba(83,46,28,.18) 0 3px,transparent 3px 104px),linear-gradient(180deg,rgba(3,7,15,.3),transparent);border-bottom:1px solid rgba(219,178,103,.22)}
.tavern-window{position:absolute;top:36px;right:8%;width:39%;height:410px;border:10px solid rgba(67,43,34,.58);border-bottom-width:18px;border-radius:48% 48% 8px 8px / 26% 26% 6px 6px;background:radial-gradient(circle at 50% 18%,rgba(244,204,130,.7) 0 3px,transparent 4px),radial-gradient(circle at 67% 36%,rgba(244,204,130,.8) 0 2px,transparent 3px),radial-gradient(circle at 19% 31%,rgba(244,204,130,.7) 0 2px,transparent 3px),linear-gradient(180deg,#14294d,#1c2b49 53%,#11182b);box-shadow:0 0 0 3px rgba(226,183,109,.09),inset 0 0 60px rgba(4,8,18,.72),0 0 80px rgba(0,0,0,.3)}
.tavern-window:before{content:"";position:absolute;top:0;bottom:0;left:50%;width:10px;background:rgba(72,49,37,.72);box-shadow:-140px 0 rgba(72,49,37,.65),140px 0 rgba(72,49,37,.65)}
.tavern-window:after{content:"";position:absolute;left:0;right:0;top:61%;height:9px;background:rgba(72,49,37,.8);box-shadow:0 7px 0 rgba(12,17,29,.2)}
.window-moon{position:absolute;top:49px;left:calc(50% - 28px);width:56px;height:56px;border-radius:50%;background:#f7dca2;box-shadow:0 0 38px rgba(249,211,142,.38)}
.window-moon:after{content:"";position:absolute;top:-9px;left:15px;width:55px;height:55px;border-radius:50%;background:#14294d}
.window-tower{position:absolute;bottom:72px;width:36px;background:linear-gradient(90deg,#0a1224,#202a42,#0a1224);clip-path:polygon(0 100%,0 28%,22% 28%,22% 15%,36% 15%,50% 0,64% 15%,78% 15%,78% 28%,100% 28%,100% 100%)}
.tower-one{height:165px;left:22%}.tower-two{height:228px;left:46%;width:52px}.tower-three{height:137px;right:16%}
.window-star{position:absolute;color:#e8c982;text-shadow:0 0 14px rgba(232,201,130,.7)}
.star-one{left:17%;top:92px;font-size:18px}.star-two{right:18%;top:150px;font-size:22px}
.tavern-shelf{position:absolute;right:0;width:15%;height:150px;border-top:1px solid rgba(218,177,111,.27);border-bottom:8px solid rgba(94,55,32,.7);background:linear-gradient(180deg,rgba(57,37,31,.55),rgba(21,24,35,.35));box-shadow:0 10px 24px rgba(0,0,0,.16)}
.shelf-back{top:0;right:0;width:16%;height:170px;background:repeating-linear-gradient(90deg,transparent 0 24px,rgba(244,183,97,.14) 24px 29px,transparent 29px 48px),linear-gradient(180deg,rgba(28,23,32,.7),rgba(57,36,27,.52));border-bottom:10px solid rgba(128,78,42,.54)}
.shelf-front{top:180px;right:0;width:13%;height:115px;background:repeating-linear-gradient(90deg,transparent 0 15px,rgba(239,185,107,.2) 15px 19px,transparent 19px 34px),linear-gradient(180deg,rgba(32,27,37,.68),rgba(57,37,28,.5))}
.tavern-lantern{position:absolute;top:7px;width:28px;height:43px;border:1px solid rgba(235,191,111,.55);border-radius:8px;background:linear-gradient(90deg,rgba(104,68,35,.6),rgba(253,203,112,.38),rgba(99,60,34,.6));box-shadow:0 0 30px rgba(243,172,75,.19)}
.tavern-lantern:before{content:"";position:absolute;left:50%;bottom:100%;height:26px;width:1px;background:rgba(227,189,124,.45)}
.tavern-lantern i{position:absolute;inset:6px 7px;background:rgba(255,224,156,.4);border-radius:50%;filter:blur(4px)}
.lantern-left{right:31%;top:36px}.lantern-right{right:4%;top:52px;transform:scale(.85)}
.tavern-counter{position:absolute;bottom:34px;left:0;right:0;height:71px;background:linear-gradient(180deg,rgba(133,82,47,.32),rgba(26,22,27,.88)),repeating-linear-gradient(0deg,rgba(234,183,112,.13) 0 1px,transparent 1px 17px);border-top:2px solid rgba(222,179,111,.28);box-shadow:0 -10px 30px rgba(0,0,0,.18)}
.hero-inner{position:relative;z-index:2;width:min(1240px,calc(100% - 56px));min-height:570px;margin:0 auto;display:grid;grid-template-columns:1.02fr .98fr;align-items:center;gap:18px;padding:43px 0 42px}
.hero-copy{position:relative;z-index:4;padding:22px 0 44px;max-width:620px}
.eyebrow{display:inline-flex;align-items:center;gap:9px;padding:8px 11px;border:1px solid rgba(222,190,131,.25);border-radius:999px;background:rgba(8,14,27,.5);font-size:9px;letter-spacing:.16em;color:#e4c98f;font-weight:750;margin-bottom:24px;backdrop-filter:blur(8px)}
.eyebrow-star{font-size:14px}
.hero h1{margin:0 0 22px;font-family:Georgia,'Noto Serif SC','Songti SC',serif;font-size:clamp(37px,4.25vw,59px);line-height:1.26;letter-spacing:.02em;font-weight:700;color:#fff4dd;text-shadow:0 3px 22px rgba(0,0,0,.25)}
.hero h1 span{color:#f0d294;text-shadow:0 0 27px rgba(241,195,109,.12)}
.hero-description{max-width:490px;margin:0;color:#c6cede;font-size:14px;line-height:2;letter-spacing:.02em;text-shadow:0 2px 12px rgba(0,0,0,.55)}
.hero-actions{display:flex;align-items:center;gap:12px;margin-top:29px;flex-wrap:wrap}
.button{display:inline-flex;justify-content:center;align-items:center;gap:12px;min-height:46px;padding:0 19px;border-radius:9px;text-decoration:none;font-size:12px;font-weight:750;letter-spacing:.025em;transition:transform .2s,background .2s,border-color .2s,box-shadow .2s}
.button:hover{transform:translateY(-2px);text-decoration:none}
.button-primary{background:linear-gradient(135deg,#ffdf9b,#e8bf71);color:#1e2940;box-shadow:0 8px 26px rgba(234,187,103,.15)}
.button-primary:hover{background:#ffe8b8;box-shadow:0 10px 30px rgba(234,187,103,.24)}
.button-secondary{border:1px solid rgba(232,203,147,.5);background:rgba(9,17,33,.54);color:#f1e5c9;backdrop-filter:blur(10px)}
.button-secondary:hover{border-color:rgba(248,221,162,.8);background:rgba(24,33,51,.76)}
.github-mini{display:grid;place-items:center;width:18px;height:18px;border-radius:50%;font-size:15px}
.hero-proof{display:flex;align-items:center;gap:18px;margin-top:36px;color:#e6e8ec}
.hero-proof>div{display:flex;align-items:center;gap:9px}
.proof-icon{display:grid;place-items:center;width:32px;height:32px;border:1px solid rgba(225,193,131,.35);border-radius:10px;color:#f0d18d;background:rgba(8,15,29,.46);font-size:16px}
.hero-proof strong,.hero-proof small{display:block}
.hero-proof strong{font-size:11px;font-weight:700}
.hero-proof small{margin-top:4px;color:#a9b3c5;font-size:10px}
.hero-proof>i{height:28px;width:1px;background:rgba(236,210,159,.24)}
.hero-art{position:relative;align-self:stretch;min-height:480px;display:flex;align-items:flex-end;justify-content:center;overflow:visible}
.hero-character{position:relative;z-index:2;display:block;height:min(540px,calc(100% + 20px));max-height:540px;max-width:100%;width:auto;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 18px 28px rgba(0,0,0,.36));margin-bottom:5px;transform-origin:50% 88%;animation:companion-float 7s ease-in-out infinite;will-change:transform}
.art-window{position:absolute;top:18px;left:calc(50% - 145px);width:290px;height:335px;border:1px solid rgba(237,193,111,.24);border-radius:48% 48% 10px 10px / 28% 28% 8px 8px;background:radial-gradient(circle at 50% 22%,rgba(255,218,146,.17),transparent 31%),linear-gradient(180deg,rgba(22,42,73,.82),rgba(13,23,43,.76));box-shadow:0 0 0 7px rgba(57,42,35,.16),0 0 55px rgba(244,176,80,.07),inset 0 0 45px rgba(0,0,0,.24)}
.art-window:before{content:"";position:absolute;top:0;bottom:0;left:50%;width:1px;background:rgba(234,193,124,.19);box-shadow:-96px 0 rgba(234,193,124,.1),96px 0 rgba(234,193,124,.1)}
.art-window:after{content:"";position:absolute;top:58%;left:0;right:0;height:1px;background:rgba(234,193,124,.2)}
.art-window span{position:absolute;top:33px;right:44px;color:#f5d99a;font-size:38px;text-shadow:0 0 20px rgba(245,217,154,.25)}
.art-window i,.art-window b{position:absolute;bottom:0;background:#090f1e;clip-path:polygon(0 100%,0 35%,18% 35%,18% 18%,35% 18%,50% 0,65% 18%,82% 18%,82% 35%,100% 35%,100% 100%)}
.art-window i{left:17%;width:48px;height:135px}.art-window b{right:17%;width:64px;height:185px}
.art-glow{position:absolute;z-index:1;right:7%;bottom:90px;width:230px;height:250px;border-radius:50%;background:rgba(241,175,88,.12);filter:blur(48px)}
.art-stars{position:absolute;z-index:3;inset:20px 0 auto;height:180px;color:#f2d28b}
.art-stars b{position:absolute;font-size:20px;font-weight:400;text-shadow:0 0 14px rgba(244,205,126,.48);animation:star-twinkle 3.8s ease-in-out infinite}
.art-stars b:nth-child(1){left:12%;top:65px}.art-stars b:nth-child(2){right:10%;top:115px;font-size:26px;animation-delay:-1.1s}.art-stars b:nth-child(3){left:28%;top:14px;font-size:26px;animation-delay:-2.4s}.art-stars b:nth-child(4){left:7%;top:175px;color:#b8ceff;animation-delay:-.7s}.art-stars b:nth-child(5){right:21%;top:22px;font-size:25px;animation-delay:-1.8s}
.art-caption{position:absolute;z-index:4;right:0;bottom:40px;display:flex;align-items:center;gap:10px;padding:12px 15px;border:1px solid rgba(222,193,133,.3);border-radius:12px;background:rgba(8,16,31,.78);backdrop-filter:blur(12px);box-shadow:0 10px 32px rgba(0,0,0,.2)}
.caption-pulse{width:7px;height:7px;border-radius:50%;background:#e9c47d;box-shadow:0 0 0 4px rgba(223,198,135,.1)}
.art-caption strong,.art-caption small{display:block}
.art-caption strong{color:#f3dca8;font-size:9px;font-weight:750;letter-spacing:.13em}
.art-caption small{color:#a9b7d0;margin-top:4px;font-size:10px}
.hero.has-banner .hero-inner{grid-template-columns:1.02fr .98fr}
.hero.has-banner .hero-copy{max-width:570px}
.hero.has-banner .tavern-fallback{display:none}
.hero-bottomline{position:absolute;z-index:3;bottom:0;left:0;right:0;height:34px;padding:0 max(28px,calc((100% - 1240px)/2));display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(222,193,133,.18);color:#a5a8b6;font-size:8px;letter-spacing:.15em;background:linear-gradient(90deg,rgba(5,10,20,.48),rgba(5,10,20,.06))}
.hero-bottomline b{padding-left:6px;color:#e7c67f;font-size:11px}
.about-section{position:relative;padding:34px 0 10px;background:linear-gradient(180deg,#090f1e,#0d1424)}
.section-inner{width:min(1240px,calc(100% - 56px));margin:0 auto}
.about-card{position:relative;display:grid;grid-template-columns:1.1fr .9fr .68fr;align-items:center;gap:25px;min-height:252px;padding:28px 30px;border:1px solid rgba(225,190,121,.23);border-radius:18px;overflow:hidden;background:radial-gradient(ellipse at 90% 45%,rgba(235,174,86,.13),transparent 26%),linear-gradient(115deg,rgba(17,27,45,.98),rgba(12,23,42,.98));box-shadow:0 18px 48px rgba(0,0,0,.15),inset 0 1px rgba(255,255,255,.025)}
.about-card:before{content:"";position:absolute;inset:10px;border:1px solid rgba(225,190,121,.08);border-radius:12px;pointer-events:none}
.about-copy{position:relative;z-index:2}
.section-kicker{color:#a9b9d9;font-size:9px;letter-spacing:.17em;font-weight:750;margin-bottom:12px}
.section-kicker>span{display:inline-block;color:#e7c681;margin-right:8px}
.about-copy h2{margin:0 0 12px;color:#fff1d4;font-family:Georgia,'Noto Serif SC','Songti SC',serif;font-size:clamp(23px,2.4vw,31px);line-height:1.45;font-weight:650;letter-spacing:.02em}
.about-copy h2 span{color:#e6c987}
.about-copy p{max-width:490px;margin:0;color:#a9b4ca;font-size:12px;line-height:1.9}
.about-github{display:inline-flex;align-items:center;gap:12px;margin-top:15px;color:#f1d49a;font-size:11px;text-decoration:none}
.about-github:hover{color:#ffe8b8}
.about-features{position:relative;z-index:2;display:flex;flex-direction:column;gap:10px;padding-left:22px;border-left:1px solid rgba(222,193,133,.19)}
.about-feature{display:flex;align-items:center;gap:12px;padding:10px 11px;border:1px solid rgba(184,188,204,.1);border-radius:11px;background:rgba(4,10,21,.2)}
.feature-icon{display:grid;place-items:center;flex:0 0 34px;width:34px;height:34px;border:1px solid rgba(228,196,132,.28);border-radius:10px;color:#e9cc8f;font-size:19px}
.about-feature strong,.about-feature small{display:block}
.about-feature strong{color:#e9eef8;font-size:11px;font-weight:700}
.about-feature small{margin-top:4px;color:#91a1bf;font-size:10px;line-height:1.5}
.about-mascot-wrap{position:relative;z-index:1;align-self:stretch;display:flex;align-items:flex-end;justify-content:center;min-height:205px;overflow:hidden}
.about-moon{position:absolute;top:18px;right:22%;width:130px;height:130px;border-radius:50%;border:1px solid rgba(232,198,127,.26);background:radial-gradient(circle at 40% 40%,rgba(244,216,160,.14),rgba(114,131,177,.04) 64%,transparent 70%);box-shadow:0 0 50px rgba(225,184,100,.07)}
.about-spark{position:absolute;color:#f0d191;font-size:20px}.spark-a{top:40px;left:13%}.spark-b{top:94px;right:8%;font-size:24px;color:#b9cafa}
.about-mascot{position:relative;z-index:2;display:block;max-height:230px;max-width:100%;width:auto;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 9px 18px rgba(0,0,0,.24))}
.mascot-label{position:absolute;z-index:3;bottom:2px;left:50%;transform:translateX(-50%);white-space:nowrap;padding:6px 9px;border:1px solid rgba(225,190,121,.24);border-radius:999px;background:rgba(8,15,28,.8);color:#e4cb8f;font-size:8px;letter-spacing:.12em}
.mascot-label span{margin-right:4px}
.section{padding:78px 0}
.gallery-section{background:linear-gradient(180deg,#0d1424,#0a1120)}
.section-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:30px}
.section-heading h2{margin:0;color:#f4ead5;font-family:Georgia,'Noto Serif SC','Songti SC',serif;font-size:clamp(27px,3vw,36px);font-weight:700;letter-spacing:.025em}
.section-heading p{margin:10px 0 0;color:#98a7c1;font-size:13px}
.collection-count{display:flex;align-items:center;gap:12px;padding:10px 14px;border:1px solid rgba(222,193,133,.22);background:rgba(18,27,44,.72);border-radius:10px;color:#a2b0c8;font-size:11px;white-space:nowrap}
.collection-count strong{font-size:25px;line-height:1;color:#e8c983;font-weight:650;font-variant-numeric:tabular-nums}
.status-message{display:flex;align-items:center;gap:12px;min-height:150px;color:#a3b0c8;font-size:13px}
.status-spinner{width:17px;height:17px;border:2px solid rgba(153,181,240,.2);border-top-color:#e8ca87;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-notice{display:flex;align-items:center;flex-direction:column;text-align:center;justify-content:center;min-height:260px;border:1px dashed rgba(222,193,133,.24);border-radius:18px;background:rgba(17,27,45,.55);padding:34px}
.notice-icon{font-size:30px;color:#e7c681;margin-bottom:14px}
.empty-notice strong{color:#f0e8d7;font-size:15px}
.empty-notice p{max-width:500px;color:#97a6c2;font-size:12px;line-height:1.8}
.empty-notice a{color:#e9cb8c;font-size:12px;text-decoration:none}
.empty-notice a:hover{text-decoration:underline}
.guide-section{border-top:1px solid rgba(222,193,133,.12);border-bottom:1px solid rgba(222,193,133,.12);background:radial-gradient(ellipse at 50% 100%,rgba(107,77,48,.1),transparent 55%),#0d1525}
.compact-heading{margin-bottom:28px}
.guide-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.guide-card{position:relative;min-height:202px;padding:24px 24px 23px;border:1px solid rgba(222,193,133,.16);border-radius:14px;background:linear-gradient(150deg,rgba(29,36,51,.86),rgba(16,25,42,.8));overflow:hidden;transition:transform .2s,border-color .2s,background .2s}
.guide-card:before{content:"";position:absolute;top:0;left:24px;right:24px;height:1px;background:linear-gradient(90deg,transparent,rgba(230,198,131,.32),transparent)}
.guide-card:hover{transform:translateY(-3px);border-color:rgba(230,198,131,.35);background:linear-gradient(150deg,rgba(38,42,55,.9),rgba(18,29,48,.84))}
.guide-number{position:absolute;right:20px;top:17px;color:rgba(210,186,133,.35);font-size:12px;letter-spacing:.12em}
.guide-icon{display:grid;place-items:center;width:41px;height:41px;border:1px solid rgba(222,193,133,.27);border-radius:12px;background:rgba(216,178,102,.07);color:#edcc83;font-size:23px}
.guide-card h3{margin:19px 0 7px;color:#f1e8d5;font-size:15px}
.guide-card p{margin:0;max-width:300px;color:#99a7bf;font-size:12px;line-height:1.85}
.guide-line{position:absolute;left:24px;bottom:0;width:48px;height:2px;background:linear-gradient(90deg,#e4c37d,transparent)}
.contribute-section{position:relative;background:linear-gradient(100deg,#121b2d,#1a2437 52%,#101a2b);border-top:1px solid rgba(222,193,133,.18);border-bottom:1px solid rgba(222,193,133,.13);overflow:hidden}
.contribute-section:before,.contribute-section:after{content:"";position:absolute;width:340px;height:340px;border:1px solid rgba(222,193,133,.08);border-radius:50%;top:-180px}
.contribute-section:before{left:-70px}.contribute-section:after{right:-80px}
.contribute-inner{position:relative;z-index:1;width:min(1120px,calc(100% - 56px));min-height:198px;margin:0 auto;display:flex;align-items:center;gap:25px;padding:36px 0}
.contribute-seal{position:relative;flex:0 0 62px;height:62px;display:grid;place-items:center;border:1px solid rgba(230,198,131,.5);border-radius:50%;color:#ebce8f;font-size:24px;box-shadow:0 0 0 6px rgba(218,196,135,.035),inset 0 0 25px rgba(218,196,135,.05)}
.contribute-seal i,.contribute-seal b{position:absolute;width:5px;height:5px;background:#e6cf92;transform:rotate(45deg)}
.contribute-seal i{top:9px;right:14px}.contribute-seal b{bottom:11px;left:12px}
.contribute-copy{flex:1}
.contribute-copy .section-kicker{margin-bottom:10px;color:#d6c292}
.contribute-copy h2{margin:0;color:#fff0d0;font-family:Georgia,'Noto Serif SC','Songti SC',serif;font-size:clamp(21px,2.6vw,29px);font-weight:700}
.contribute-copy p{margin:9px 0 0;color:#a6b2c6;font-size:12px;line-height:1.8}
.contribute-button{white-space:nowrap;background:linear-gradient(135deg,#ffdfa0,#e6bd70);color:#222c40;padding:0 21px}
.contribute-button:hover{background:#ffe8b6}
.tool-section{background:#0a1120}
.faq-section{padding-top:52px;border-top:1px solid rgba(222,193,133,.11);background:#0c1424}
.faq-inner{max-width:900px}
.faq-list{border-top:1px solid rgba(222,193,133,.16)}
.faq-item{border-bottom:1px solid rgba(222,193,133,.16)}
.faq-item summary{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:19px 2px;list-style:none;color:#ebe7dd;font-size:13px;cursor:pointer}
.faq-item summary::-webkit-details-marker{display:none}
.faq-item summary span{color:#e4c47f;font-size:20px;font-weight:300;transition:transform .2s}
.faq-item[open] summary span{transform:rotate(45deg)}
.faq-item p{margin:0;padding:0 32px 20px 2px;color:#a1aec5;font-size:12px;line-height:1.9}
.site-footer{background:#070d19;border-top:1px solid rgba(222,193,133,.12)}
.footer-inner{width:min(1240px,calc(100% - 56px));min-height:132px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:35px}
.footer-brand{display:flex;align-items:center;gap:12px;color:#e9e5db;text-decoration:none}
.footer-mark{display:grid;place-items:center;width:39px;height:39px;border:1px solid rgba(222,193,133,.24);border-radius:12px;color:#e6c681;font-size:22px}
.footer-brand strong{font-size:10px;letter-spacing:.1em}
.footer-brand small{font-size:10px}
.footer-inner>p{color:#a0adc3;font-size:11px;line-height:1.9}
.footer-inner>p span{color:#76849d}
.footer-links{display:flex;gap:18px;white-space:nowrap}
.footer-links a{color:#9ca9bf;text-decoration:none;font-size:11px}
.footer-links a:hover{color:#efce8c}
.footer-lastline{height:34px;display:flex;align-items:center;justify-content:space-between;padding:0 max(28px,calc((100% - 1240px)/2));border-top:1px solid rgba(222,193,133,.08);color:#66738a;font-size:8px;letter-spacing:.15em}
.footer-lastline b{color:#d7c184;margin-left:7px}
@keyframes companion-float{0%,100%{transform:translate3d(0,0,0) rotate(-.25deg)}50%{transform:translate3d(0,-7px,0) rotate(.25deg)}}
@keyframes star-twinkle{0%,100%{opacity:.5;filter:drop-shadow(0 0 0 rgba(244,205,126,0))}50%{opacity:1;filter:drop-shadow(0 0 7px rgba(244,205,126,.55))}}
@media(max-width:1080px){.topbar-inner,.hero-inner,.section-inner,.footer-inner{width:min(100% - 40px,900px)}.top-links{gap:14px}.brand{min-width:220px}.hero-inner{grid-template-columns:1fr .72fr;gap:0;min-height:540px}.hero h1{font-size:clamp(36px,5vw,52px)}.hero-art{min-height:470px}.hero-character{height:min(500px,calc(100% + 10px))}.art-window{transform:scale(.85);transform-origin:top center}.about-card{grid-template-columns:1fr .9fr;gap:20px}.about-mascot-wrap{display:none}.about-features{padding-left:20px}.about-copy h2{font-size:28px}.guide-grid{gap:12px}.guide-card{padding:20px}.guide-line{left:20px}.footer-inner{gap:18px}.footer-inner>p{max-width:310px}.footer-links{gap:12px}}
@media(max-width:760px){.topbar-inner{height:66px;width:calc(100% - 28px)}.brand{min-width:0;gap:7px}.brand-mark{width:36px;height:36px}.brand-copy strong{font-size:10px;letter-spacing:.05em}.brand-copy small{font-size:9px}.top-links{gap:8px}.top-links>a:not(.top-contribute):not(.github-link){display:none}.top-links .top-contribute{padding:9px 10px;font-size:11px}.github-link{width:31px;height:31px}.hero{min-height:auto}.hero-inner{width:calc(100% - 36px);grid-template-columns:1fr;min-height:0;padding:44px 0 0}.hero-copy{padding:0 0 4px}.eyebrow{font-size:8px;letter-spacing:.12em;margin-bottom:19px}.hero h1{font-size:clamp(34px,9.5vw,47px);margin-bottom:17px}.hero-description{font-size:12px;line-height:1.9;max-width:480px}.hero-actions{margin-top:22px}.button{min-height:42px;padding:0 14px;font-size:11px}.hero-proof{margin-top:24px;gap:11px}.hero-proof>div{gap:7px}.proof-icon{width:27px;height:27px}.hero-proof strong{font-size:10px}.hero-proof small{font-size:9px}.hero-art{min-height:0;height:345px;margin-top:5px;overflow:hidden}.hero-character{height:360px;max-height:none;max-width:100%;margin:0 auto 0}.art-window{width:250px;height:285px;left:calc(50% - 125px);top:5px;transform:none}.art-window span{top:27px;right:35px;font-size:31px}.art-window i{height:105px}.art-window b{height:142px}.art-glow{bottom:54px;right:9%;width:180px;height:170px}.art-stars{height:120px}.art-stars b:nth-child(1){left:9%;top:35px}.art-stars b:nth-child(2){right:7%;top:68px}.art-stars b:nth-child(3){left:21%;top:4px}.art-stars b:nth-child(4){left:6%;top:95px}.art-stars b:nth-child(5){right:18%;top:8px}.art-caption{bottom:15px;right:0;padding:9px 11px}.hero.has-banner .hero-inner{min-height:490px;padding:53px 0 44px}.hero.has-banner .hero-copy{max-width:460px}.hero.has-banner{background-position:62% center}.hero-bottomline{position:relative;height:30px;padding:0 16px;font-size:7px;letter-spacing:.06em}.tavern-window{right:4%;width:60%;height:300px;top:22px}.shelf-back{width:20%;height:140px}.shelf-front{width:18%;top:150px}.tavern-lantern{transform:scale(.75)}.lantern-left{right:27%;top:20px}.lantern-right{right:2%;top:30px}.tavern-counter{bottom:29px;height:51px}.about-section{padding:20px 0 0}.section-inner{width:calc(100% - 30px)}.about-card{grid-template-columns:1fr;gap:22px;padding:24px 20px}.about-copy h2{font-size:26px}.about-copy p{font-size:11px}.about-features{padding:0;border-left:0;display:grid;grid-template-columns:1fr;gap:8px}.about-feature{padding:9px}.about-mascot-wrap{display:flex;min-height:160px;max-height:175px;margin-top:-8px}.about-mascot{max-height:190px}.about-moon{width:105px;height:105px;top:4px;right:calc(50% - 70px)}.about-spark{top:20px}.section{padding:55px 0}.section-heading{align-items:flex-start;margin-bottom:22px;gap:12px}.section-heading h2{font-size:27px}.section-heading p{font-size:11px;line-height:1.7}.section-kicker{font-size:8px;letter-spacing:.12em}.collection-count{gap:7px;padding:8px 10px;font-size:9px;white-space:nowrap}.collection-count strong{font-size:21px}.guide-grid{grid-template-columns:1fr}.guide-card{min-height:0;padding:18px 19px 21px}.guide-icon{width:37px;height:37px}.guide-card h3{margin-top:14px}.guide-card p{max-width:unset}.guide-line{left:19px}.contribute-inner{width:calc(100% - 34px);padding:27px 0;gap:14px;flex-wrap:wrap}.contribute-seal{flex-basis:48px;height:48px;font-size:19px}.contribute-copy{flex:1 1 calc(100% - 62px)}.contribute-copy h2{font-size:21px}.contribute-copy p{font-size:11px}.contribute-button{margin-left:62px;min-height:40px}.faq-section{padding-top:40px}.footer-inner{width:calc(100% - 30px);padding:24px 0;align-items:flex-start;flex-direction:column;gap:14px}.footer-inner>p{margin:0}.footer-links{flex-wrap:wrap}.footer-lastline{padding:0 14px;font-size:7px;letter-spacing:.06em}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;transition-duration:.01ms!important}}
</style>