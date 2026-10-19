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
const cardCount = computed(() => cards.value.length)

const faqs = [
  {
    q: '角色卡是什么格式？',
    a: '每张角色卡都是 SillyTavern 格式的 PNG，角色名、人设、开场白等完整数据内嵌在图片中。下载后导入酒馆即可使用。',
  },
  {
    q: '我不会写代码，可以投稿吗？',
    a: '可以。打开 GitHub 的角色卡投稿模板，填写基础信息并上传角色卡 PNG，维护者会帮你完成后续处理。',
  },
  {
    q: '角色卡的授权如何确认？',
    a: '每张卡尽量注明授权协议。未单独标注的内容按仓库说明处理，二次使用或转载前请核实原作者的授权。',
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

function openCard(card: ManifestCard) {
  selected.value = card
}

function closeCard() {
  selected.value = null
}

onMounted(loadCards)
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
            <small>角色卡共享档案馆</small>
          </span>
        </a>
        <div class="top-links">
          <a href="#gallery">角色画廊</a>
          <a href="#guide">如何使用</a>
          <a href="#tool">卡牌工具</a>
          <a class="top-contribute" :href="REPO_URL + '/issues/new?template=card-submission.yml'" target="_blank" rel="noreferrer">投稿角色 <span aria-hidden="true">↗</span></a>
          <a class="github-link" :href="REPO_URL" target="_blank" rel="noreferrer" aria-label="在 GitHub 查看项目">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4.3 1.3-4.3-2.4-6-2.9M15 21v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6A4.7 4.7 0 0 0 18.4 6 4.3 4.3 0 0 0 18.3 3S17.2 2.7 15 4.2a12.7 12.7 0 0 0-6 0C6.8 2.7 5.7 3 5.7 3A4.3 4.3 0 0 0 5.6 6 4.7 4.7 0 0 0 4.3 9.3c0 4.7 2.8 5.7 5.5 6A3 3 0 0 0 9 17.6V21" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>
      </div>
    </nav>

    <main>
      <section id="top" class="hero">
        <div class="hero-stars" aria-hidden="true"></div>
        <div class="hero-glow hero-glow-one" aria-hidden="true"></div>
        <div class="hero-glow hero-glow-two" aria-hidden="true"></div>
        <div class="hero-inner">
          <div class="hero-copy">
            <div class="eyebrow"><span class="eyebrow-star">✦</span> AN OPEN LIBRARY FOR STORYTELLERS</div>
            <h1>把故事与灵魂，<br><span>收藏成一张卡。</span></h1>
            <p class="hero-description">这里收藏着无数个等待相遇的角色。找到让你心动的那一个，下载角色卡，把 TA 带进你的故事里。</p>
            <div class="hero-actions">
              <a class="button button-primary" href="#gallery">探索角色卡 <span aria-hidden="true">↗</span></a>
              <a class="button button-secondary" href="#guide">第一次使用？</a>
            </div>
            <div class="hero-proof">
              <div><span class="proof-icon">✧</span><span><strong>PNG 原生角色卡</strong><small>下载即可导入酒馆</small></span></div>
              <i aria-hidden="true"></i>
              <div><span class="proof-icon">☾</span><span><strong>开源共享</strong><small>与创作者一起共建</small></span></div>
            </div>
          </div>

          <div class="hero-art" aria-label="平台蓝白猫娘形象">
            <div class="art-orbit orbit-a" aria-hidden="true"></div>
            <div class="art-orbit orbit-b" aria-hidden="true"></div>
            <div class="art-moon" aria-hidden="true"><span></span></div>
            <div class="art-stars" aria-hidden="true"><b>✦</b><b>✧</b><b>·</b><b>✧</b><b>·</b></div>
            <img class="hero-character" :src="base + 'images/moon-catgirl.avif'" alt="蓝白猫娘——Open Character Cards 的星夜引路人" fetchpriority="high" />
            <div class="art-caption"><span class="caption-pulse"></span><span><strong>MOONLIGHT COMPANION</strong><small>愿每个故事，都能遇见灵魂</small></span></div>
          </div>
        </div>
        <div class="hero-bottomline"><span>OCC — OPEN CHARACTER CARDS</span><span>MADE FOR IMAGINED WORLDS <b>✦</b></span></div>
      </section>

      <section id="gallery" class="section gallery-section">
        <div class="section-inner">
          <div class="section-heading">
            <div>
              <div class="section-kicker"><span>01</span> THE CHARACTER ARCHIVE</div>
              <h2>寻找下一段故事</h2>
              <p>每张卡片，都是一扇通往新世界的门。</p>
            </div>
            <div class="collection-count"><strong>{{ cardCount.toString().padStart(2, '0') }}</strong><span>张已收录角色卡</span></div>
          </div>
          <p v-if="loading" class="status-message"><span class="status-spinner"></span>正在整理星夜档案…</p>
          <div v-else-if="error" class="empty-notice">
            <span class="notice-icon">☾</span><strong>档案暂时不可用</strong><p>{{ error }}</p>
          </div>
          <div v-else-if="cards.length === 0" class="empty-notice">
            <span class="notice-icon">✧</span><strong>这里还在等待第一张角色卡</strong><p>成为第一位分享故事的人，让角色档案馆亮起第一颗星。</p>
            <a :href="REPO_URL + '/issues/new?template=card-submission.yml'" target="_blank" rel="noreferrer">投稿第一张角色卡 ↗</a>
          </div>
          <CardGrid v-else :cards="cards" @select="openCard" />
        </div>
      </section>

      <section id="guide" class="section guide-section">
        <div class="section-inner">
          <div class="section-heading compact-heading">
            <div><div class="section-kicker"><span>02</span> TAKE THEM INTO YOUR WORLD</div><h2>让相遇，简单一点</h2><p>从发现到开始对话，只需三个小步骤。</p></div>
          </div>
          <div class="guide-grid">
            <article class="guide-card"><span class="guide-number">01</span><span class="guide-icon">⌕</span><h3>发现角色</h3><p>通过关键词与标签，探索不同性格、世界观与故事设定。</p><span class="guide-line"></span></article>
            <article class="guide-card"><span class="guide-number">02</span><span class="guide-icon">↓</span><h3>下载卡片</h3><p>打开角色详情，下载完整的 PNG 角色卡，数据会保留在图片里。</p><span class="guide-line"></span></article>
            <article class="guide-card"><span class="guide-number">03</span><span class="guide-icon">✦</span><h3>导入酒馆</h3><p>把 PNG 导入 SillyTavern（酒馆）等兼容前端，即可开启故事。</p><span class="guide-line"></span></article>
          </div>
        </div>
      </section>

      <section id="contribute" class="contribute-section">
        <div class="contribute-stars" aria-hidden="true">✧　·　✦　 ·　✧</div>
        <div class="contribute-inner">
          <div class="contribute-seal" aria-hidden="true"><span>✦</span><i></i><b></b></div>
          <div class="contribute-copy"><div class="section-kicker">03 / SHARE YOUR IMAGINATION</div><h2>你的故事，也值得被收藏。</h2><p>不需要懂代码。带上你的角色卡加入档案馆，让更多人认识 TA。</p></div>
          <a class="button contribute-button" :href="REPO_URL + '/issues/new?template=card-submission.yml'" target="_blank" rel="noreferrer">分享一张角色卡 <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section id="tool" class="section tool-section">
        <div class="section-inner">
          <div class="section-heading compact-heading">
            <div><div class="section-kicker"><span>04</span> SMALL TOOLS, BIG STORIES</div><h2>角色卡工具箱</h2><p>处理角色卡时用得上的小工具，都放在这里。</p></div>
          </div>
          <CardTool />
        </div>
      </section>

      <section id="faq" class="section faq-section">
        <div class="section-inner faq-inner">
          <div class="section-heading compact-heading"><div><div class="section-kicker"><span>05</span> A FEW QUESTIONS</div><h2>你可能还想知道</h2></div></div>
          <div class="faq-list">
            <details v-for="faq in faqs" :key="faq.q" class="faq-item"><summary>{{ faq.q }}<span>＋</span></summary><p>{{ faq.a }}</p></details>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-inner">
        <a class="footer-brand" href="#top"><span class="footer-mark">☾</span><span><strong>OPEN CHARACTER CARDS</strong><small>角色卡共享档案馆</small></span></a>
        <p>一个由创作者共同点亮的角色卡档案馆。<br><span>角色内容遵循各自授权协议，使用前请确认许可。</span></p>
        <div class="footer-links"><a href="#gallery">浏览档案</a><a href="#contribute">参与共建</a><a :href="REPO_URL" target="_blank" rel="noreferrer">GitHub ↗</a></div>
      </div>
      <div class="footer-lastline"><span>© OPEN CHARACTER CARDS</span><span>KEEP CREATING STORIES <b>✦</b></span></div>
    </footer>

    <CardDetail v-if="selected" :card="selected" @close="closeCard" />
  </div>
</template>

<style scoped>
.app-shell{min-height:100vh;background:#0b1225;color:#edf3ff;overflow:hidden}
.topbar{position:sticky;top:0;z-index:50;background:rgba(9,16,33,.88);backdrop-filter:blur(18px);border-bottom:1px solid rgba(158,183,237,.13)}
.topbar-inner{width:min(1240px,calc(100% - 56px));height:76px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:24px}
.brand{display:flex;align-items:center;gap:11px;color:#edf3ff;text-decoration:none;min-width:250px}
.brand-mark{width:44px;height:44px;display:grid;place-items:center;color:#a9c4ff}
.brand-mark svg{width:100%;height:100%}
.brand-copy,.footer-brand>span:last-child{display:flex;flex-direction:column;gap:4px}
.brand-copy strong,.footer-brand strong{font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:12px;letter-spacing:.12em;font-weight:760}
.brand-copy small,.footer-brand small{font-size:11px;letter-spacing:.12em;color:#899abc}
.top-links{display:flex;align-items:center;gap:28px}
.top-links>a{color:#a5b3d0;text-decoration:none;font-size:12px;transition:color .2s}
.top-links>a:hover{color:#f1d69a}
.top-links .top-contribute{border:1px solid rgba(220,196,137,.42);background:rgba(220,196,137,.07);padding:10px 15px;border-radius:9px;color:#f0dba8}
.top-contribute span{padding-left:6px}
.github-link{width:34px;height:34px;display:grid;place-items:center;border:1px solid rgba(164,187,239,.2);border-radius:10px}
.github-link svg{width:19px;height:19px}
.hero{position:relative;isolation:isolate;min-height:650px;background:radial-gradient(ellipse at 72% 47%,rgba(55,83,148,.22),transparent 34%),radial-gradient(ellipse at 24% 16%,rgba(40,71,130,.16),transparent 38%),linear-gradient(115deg,#0b1225 0%,#0d1730 56%,#111c35 100%);overflow:hidden;border-bottom:1px solid rgba(153,181,240,.13)}
.hero-stars{position:absolute;inset:0;z-index:-1;opacity:.36;background-image:radial-gradient(circle at 12% 21%,#d9e7ff 0 1px,transparent 1.5px),radial-gradient(circle at 30% 66%,#a9c4ff 0 1px,transparent 1.5px),radial-gradient(circle at 47% 19%,#d9e7ff 0 1px,transparent 1.5px),radial-gradient(circle at 66% 12%,#a9c4ff 0 1px,transparent 1.5px),radial-gradient(circle at 89% 40%,#d9e7ff 0 1px,transparent 1.5px),radial-gradient(circle at 81% 78%,#a9c4ff 0 1px,transparent 1.5px),radial-gradient(circle at 8% 81%,#d9e7ff 0 1px,transparent 1.5px);background-size:100% 100%}
.hero-glow{position:absolute;z-index:-1;pointer-events:none;border-radius:50%;filter:blur(2px)}
.hero-glow-one{width:360px;height:360px;right:9%;top:11%;background:rgba(99,132,207,.08);box-shadow:0 0 100px 65px rgba(76,108,181,.08)}
.hero-glow-two{width:200px;height:200px;right:30%;bottom:-90px;background:rgba(70,106,182,.08);box-shadow:0 0 80px 60px rgba(70,106,182,.07)}
.hero-inner{position:relative;width:min(1240px,calc(100% - 56px));min-height:600px;margin:0 auto;display:grid;grid-template-columns:1fr .9fr;align-items:center;gap:12px;padding:52px 0 38px}
.hero-copy{position:relative;z-index:3;padding:24px 0 46px}
.eyebrow{display:inline-flex;align-items:center;gap:9px;font-size:10px;letter-spacing:.2em;color:#a9c4ff;font-weight:700;margin-bottom:25px}
.eyebrow-star{color:#e9ce8e;font-size:15px}
.hero h1{margin:0 0 24px;font-size:clamp(38px,4.1vw,59px);line-height:1.27;letter-spacing:.035em;font-weight:800;color:#f0f4ff}
.hero h1 span{color:#b8cbf8;text-shadow:0 0 30px rgba(113,151,233,.18)}
.hero-description{max-width:490px;margin:0;color:#a4b2cf;font-size:14px;line-height:2.05;letter-spacing:.025em}
.hero-actions{display:flex;align-items:center;gap:13px;margin-top:30px;flex-wrap:wrap}
.button{display:inline-flex;justify-content:center;align-items:center;gap:17px;min-height:47px;padding:0 20px;border-radius:9px;text-decoration:none;font-size:12px;font-weight:720;letter-spacing:.035em;transition:transform .2s,background .2s,border-color .2s,box-shadow .2s}
.button:hover{transform:translateY(-2px);text-decoration:none}
.button-primary{background:linear-gradient(130deg,#e8d39b,#d7bd7b);color:#1d2942;box-shadow:0 8px 26px rgba(214,190,124,.12)}
.button-primary:hover{background:#f1dfa9;box-shadow:0 10px 30px rgba(214,190,124,.2)}
.button-secondary{border:1px solid rgba(164,187,239,.26);background:rgba(20,34,62,.42);color:#c3d0ed}
.button-secondary:hover{border-color:rgba(164,187,239,.5);background:rgba(33,49,82,.65)}
.hero-proof{display:flex;align-items:center;gap:22px;margin-top:44px;color:#c6d2eb}
.hero-proof>div{display:flex;align-items:center;gap:10px}
.proof-icon{display:grid;place-items:center;width:31px;height:31px;border:1px solid rgba(163,188,247,.18);border-radius:9px;color:#e6ce91;background:rgba(158,184,242,.045);font-size:16px}
.hero-proof strong,.hero-proof small{display:block}
.hero-proof strong{font-size:11px;font-weight:650}
.hero-proof small{margin-top:4px;color:#7889af;font-size:10px}
.hero-proof>i{height:27px;width:1px;background:rgba(167,190,238,.2)}
.hero-art{position:relative;align-self:stretch;min-height:540px;display:flex;align-items:flex-end;justify-content:center;overflow:visible}
.hero-character{position:relative;z-index:2;display:block;height:min(585px,calc(100% + 20px));max-height:585px;max-width:100%;width:auto;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 20px 34px rgba(0,0,0,.28));margin-bottom:-1px;transform-origin:50% 88%;animation:companion-float 7s ease-in-out infinite;will-change:transform}
.art-moon{animation:moon-breathe 8s ease-in-out infinite;transform-origin:center}
.art-orbit{animation:orbit-glimmer 10s ease-in-out infinite}
.orbit-b{animation-delay:-5s}
.art-stars b{animation:star-twinkle 3.8s ease-in-out infinite}
.art-stars b:nth-child(2){animation-delay:-1.1s}
.art-stars b:nth-child(3){animation-delay:-2.4s}
.art-stars b:nth-child(4){animation-delay:-.7s}
.art-stars b:nth-child(5){animation-delay:-1.8s}
.art-caption{animation:caption-drift 6s ease-in-out infinite}
@keyframes companion-float{0%,100%{transform:translate3d(0,0,0) rotate(-.25deg)}50%{transform:translate3d(0,-8px,0) rotate(.25deg)}}
@keyframes moon-breathe{0%,100%{opacity:.76;scale:.98}50%{opacity:1;scale:1.035}}
@keyframes orbit-glimmer{0%,100%{opacity:.42}50%{opacity:.9}}
@keyframes star-twinkle{0%,100%{opacity:.5;filter:drop-shadow(0 0 0 rgba(169,196,255,0))}50%{opacity:1;filter:drop-shadow(0 0 7px rgba(169,196,255,.55))}}
@keyframes caption-drift{0%,100%{translate:0 0}50%{translate:0 -4px}}
.art-moon{position:absolute;z-index:0;width:250px;height:250px;top:44px;left:calc(50% - 125px);border-radius:50%;background:radial-gradient(circle at 42% 40%,rgba(193,213,255,.2),rgba(86,120,188,.1) 55%,rgba(39,58,99,.02) 74%);border:1px solid rgba(174,200,255,.17);box-shadow:0 0 90px rgba(77,112,192,.12),inset 0 0 45px rgba(184,205,255,.05)}
.art-moon span{position:absolute;top:30px;right:36px;width:57px;height:57px;border:2px solid rgba(233,207,143,.92);border-radius:50%;box-shadow:0 0 22px rgba(233,207,143,.09)}
.art-moon span:after{content:"";position:absolute;top:-7px;left:10px;width:53px;height:53px;border-radius:50%;background:#111d36}
.art-orbit{position:absolute;z-index:1;border:1px solid rgba(160,186,242,.12);border-radius:50%;transform:rotate(-19deg)}
.orbit-a{width:360px;height:500px;top:22px;left:calc(50% - 180px)}
.orbit-b{width:410px;height:540px;top:10px;left:calc(50% - 205px);transform:rotate(25deg);border-style:dashed;border-color:rgba(160,186,242,.09)}
.art-stars{position:absolute;z-index:3;inset:20px 0 auto;height:180px;color:#e8d29b}
.art-stars b{position:absolute;font-size:20px;font-weight:400}
.art-stars b:nth-child(1){left:15%;top:45px}
.art-stars b:nth-child(2){right:13%;top:97px;font-size:26px;color:#a9c4ff}
.art-stars b:nth-child(3){left:25%;top:8px;font-size:26px}
.art-stars b:nth-child(4){left:7%;top:145px;color:#a9c4ff}
.art-stars b:nth-child(5){right:20%;top:15px;font-size:25px}
.art-caption{position:absolute;z-index:4;right:0;bottom:49px;display:flex;align-items:center;gap:10px;padding:12px 15px;border:1px solid rgba(170,194,242,.17);border-radius:12px;background:rgba(12,23,45,.72);backdrop-filter:blur(12px);box-shadow:0 10px 32px rgba(0,0,0,.12)}
.caption-pulse{width:7px;height:7px;border-radius:50%;background:#dfc687;box-shadow:0 0 0 4px rgba(223,198,135,.1)}
.art-caption strong,.art-caption small{display:block}
.art-caption strong{color:#dce6fc;font-size:9px;font-weight:700;letter-spacing:.13em}
.art-caption small{color:#8b9fc6;margin-top:4px;font-size:10px}
.hero-bottomline{position:absolute;bottom:0;left:0;right:0;height:35px;padding:0 max(28px,calc((100% - 1240px)/2));display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(153,181,240,.1);color:#66799f;font-size:8px;letter-spacing:.17em}
.hero-bottomline b{padding-left:6px;color:#d9c486;font-size:11px}
.section{padding:86px 0}
.section-inner{width:min(1240px,calc(100% - 56px));margin:0 auto}
.gallery-section{background:#0b1225}
.section-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:34px}
.section-kicker{color:#91a8d8;font-size:9px;letter-spacing:.2em;font-weight:750;margin-bottom:13px}
.section-kicker>span{display:inline-block;color:#e0c889;margin-right:11px}
.section-heading h2{margin:0;color:#edf3ff;font-size:clamp(27px,3vw,36px);font-weight:760;letter-spacing:.035em}
.section-heading p{margin:11px 0 0;color:#899abc;font-size:13px}
.collection-count{display:flex;align-items:center;gap:12px;padding:10px 14px;border:1px solid rgba(151,178,236,.16);background:rgba(18,31,57,.6);border-radius:10px;color:#8c9fc3;font-size:11px}
.collection-count strong{font-size:25px;line-height:1;color:#d9c486;font-weight:650;font-variant-numeric:tabular-nums}
.status-message{display:flex;align-items:center;gap:12px;min-height:150px;color:#91a2c7;font-size:13px}
.status-spinner{width:17px;height:17px;border:2px solid rgba(153,181,240,.2);border-top-color:#a9c4ff;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-notice{display:flex;align-items:center;flex-direction:column;text-align:center;justify-content:center;min-height:260px;border:1px dashed rgba(151,178,236,.24);border-radius:18px;background:rgba(17,29,52,.55);padding:34px}
.notice-icon{font-size:30px;color:#d9c486;margin-bottom:14px}
.empty-notice strong{color:#dfe8fb;font-size:15px}
.empty-notice p{max-width:500px;color:#8597bd;font-size:12px;line-height:1.8}
.empty-notice a{color:#d9c486;font-size:12px;text-decoration:none}
.empty-notice a:hover{text-decoration:underline}
.guide-section{border-top:1px solid rgba(151,178,236,.1);border-bottom:1px solid rgba(151,178,236,.1);background:radial-gradient(ellipse at 50% 100%,rgba(38,60,105,.12),transparent 55%),#0e172d}
.compact-heading{margin-bottom:28px}
.guide-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.guide-card{position:relative;min-height:207px;padding:25px 25px 23px;border:1px solid rgba(150,177,235,.15);border-radius:14px;background:linear-gradient(150deg,rgba(23,39,70,.72),rgba(15,27,51,.72));overflow:hidden;transition:transform .2s,border-color .2s}
.guide-card:hover{transform:translateY(-3px);border-color:rgba(155,184,248,.35)}
.guide-number{position:absolute;right:22px;top:19px;color:rgba(151,177,232,.28);font-size:12px;letter-spacing:.12em}
.guide-icon{display:grid;place-items:center;width:42px;height:42px;border:1px solid rgba(160,186,242,.23);border-radius:12px;background:rgba(126,158,222,.08);color:#dcca92;font-size:23px}
.guide-card h3{margin:21px 0 7px;color:#e5edfd;font-size:15px}
.guide-card p{margin:0;max-width:300px;color:#8799bc;font-size:12px;line-height:1.85}
.guide-line{position:absolute;left:25px;bottom:0;width:40px;height:2px;background:linear-gradient(90deg,#d8c387,transparent)}
.contribute-section{position:relative;background:linear-gradient(100deg,#121e39,#172646 52%,#121e39);border-bottom:1px solid rgba(151,178,236,.13);overflow:hidden}
.contribute-section:before,.contribute-section:after{content:"";position:absolute;width:360px;height:360px;border:1px solid rgba(167,191,242,.07);border-radius:50%;top:-180px}
.contribute-section:before{left:-70px}
.contribute-section:after{right:-80px}
.contribute-stars{position:absolute;inset:0;display:grid;place-items:center;color:rgba(217,196,134,.12);font-size:20px;letter-spacing:2em;pointer-events:none}
.contribute-inner{position:relative;z-index:1;width:min(1120px,calc(100% - 56px));min-height:206px;margin:0 auto;display:flex;align-items:center;gap:27px;padding:38px 0}
.contribute-seal{position:relative;flex:0 0 66px;height:66px;display:grid;place-items:center;border:1px solid rgba(218,196,135,.48);border-radius:50%;color:#e6cf92;font-size:24px;box-shadow:0 0 0 6px rgba(218,196,135,.035),inset 0 0 25px rgba(218,196,135,.05)}
.contribute-seal i,.contribute-seal b{position:absolute;width:5px;height:5px;background:#e6cf92;transform:rotate(45deg)}
.contribute-seal i{top:9px;right:14px}.contribute-seal b{bottom:11px;left:12px}
.contribute-copy{flex:1}
.contribute-copy .section-kicker{margin-bottom:10px;color:#b2c3e8}
.contribute-copy h2{margin:0;color:#f1f4fd;font-size:clamp(21px,2.6vw,29px);font-weight:750}
.contribute-copy p{margin:9px 0 0;color:#9baed3;font-size:12px;line-height:1.8}
.contribute-button{white-space:nowrap;background:#e1ca8e;color:#1c2944;padding:0 21px}
.contribute-button:hover{background:#f0dda5}
.tool-section{background:#0b1225}
.faq-section{padding-top:52px;border-top:1px solid rgba(151,178,236,.1);background:#0d162b}
.faq-inner{max-width:900px}
.faq-list{border-top:1px solid rgba(151,178,236,.16)}
.faq-item{border-bottom:1px solid rgba(151,178,236,.16)}
.faq-item summary{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:19px 2px;list-style:none;color:#dce6fb;font-size:13px;cursor:pointer}
.faq-item summary::-webkit-details-marker{display:none}
.faq-item summary span{color:#d8c387;font-size:20px;font-weight:300;transition:transform .2s}
.faq-item[open] summary span{transform:rotate(45deg)}
.faq-item p{margin:0;padding:0 32px 20px 2px;color:#91a2c5;font-size:12px;line-height:1.9}
.site-footer{background:#080f20;border-top:1px solid rgba(151,178,236,.1)}
.footer-inner{width:min(1240px,calc(100% - 56px));min-height:132px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:35px}
.footer-brand{display:flex;align-items:center;gap:12px;color:#dae5fc;text-decoration:none}
.footer-mark{display:grid;place-items:center;width:39px;height:39px;border:1px solid rgba(164,187,239,.23);border-radius:12px;color:#d9c486;font-size:22px}
.footer-brand strong{font-size:10px;letter-spacing:.1em}
.footer-brand small{font-size:10px}
.footer-inner>p{color:#a0b0ce;font-size:11px;line-height:1.9}
.footer-inner>p span{color:#6c7d9f}
.footer-links{display:flex;gap:18px;white-space:nowrap}
.footer-links a{color:#8d9fbe;text-decoration:none;font-size:11px}
.footer-links a:hover{color:#e5ce91}
.footer-lastline{height:34px;display:flex;align-items:center;justify-content:space-between;padding:0 max(28px,calc((100% - 1240px)/2));border-top:1px solid rgba(151,178,236,.08);color:#55678a;font-size:8px;letter-spacing:.16em}
.footer-lastline b{color:#d7c184;margin-left:7px}
@media(max-width:900px){.topbar-inner,.hero-inner,.section-inner,.footer-inner{width:min(100% - 36px,720px)}.top-links{gap:16px}.top-links>a:not(.top-contribute):not(.github-link){display:none}.hero-inner{grid-template-columns:1fr .75fr;gap:0;min-height:550px}.hero h1{font-size:clamp(34px,5vw,49px)}.hero-art{min-height:490px}.hero-character{height:min(525px,calc(100% + 15px))}.art-orbit{transform:scale(.85)}.orbit-b{transform:rotate(25deg) scale(.85)}.art-caption{right:-3px;bottom:32px;padding:10px}.hero-proof{gap:14px}.guide-grid{gap:11px}.guide-card{padding:20px}.guide-line{left:20px}.footer-inner{gap:18px}.footer-inner>p{max-width:310px}.footer-links{gap:12px}}
@media(max-width:640px){.topbar-inner{height:66px;width:calc(100% - 28px)}.brand{min-width:0;gap:7px}.brand-mark{width:38px;height:38px}.brand-copy strong{font-size:10px;letter-spacing:.06em}.brand-copy small{font-size:9px}.top-links{gap:8px}.top-links .top-contribute{padding:9px 10px;font-size:11px}.github-link{width:32px;height:32px}.hero{min-height:auto}.hero-inner{width:calc(100% - 36px);grid-template-columns:1fr;min-height:0;padding:48px 0 0}.hero-copy{padding:0 0 5px}.eyebrow{font-size:8px;letter-spacing:.16em;margin-bottom:19px}.hero h1{font-size:clamp(35px,10vw,49px);margin-bottom:17px}.hero-description{font-size:12px;line-height:1.9;max-width:480px}.hero-actions{margin-top:23px}.button{min-height:43px;padding:0 15px;font-size:11px}.hero-proof{margin-top:25px;gap:12px}.hero-proof>div{gap:7px}.proof-icon{width:27px;height:27px}.hero-proof strong{font-size:10px}.hero-proof small{font-size:9px}.hero-art{min-height:0;height:410px;margin-top:2px;overflow:hidden}.hero-character{height:420px;max-height:none;max-width:100%;margin:0 auto -2px}.art-moon{width:200px;height:200px;top:30px;left:calc(50% - 100px)}.art-moon span{transform:scale(.75);transform-origin:top right;right:28px;top:25px}.art-orbit{width:300px;height:380px;top:10px;left:calc(50% - 150px)}.orbit-b{width:330px;height:400px;left:calc(50% - 165px);top:0}.art-stars{height:150px}.art-stars b:nth-child(1){left:12%;top:44px}.art-stars b:nth-child(2){right:9%;top:82px}.art-stars b:nth-child(3){left:21%;top:10px}.art-stars b:nth-child(4){left:8%;top:115px}.art-stars b:nth-child(5){right:18%;top:15px}.art-caption{bottom:20px;right:3px}.hero-bottomline{position:relative;height:30px;padding:0 18px;font-size:7px;letter-spacing:.08em}.section{padding:58px 0}.section-inner{width:calc(100% - 32px)}.section-heading{align-items:flex-start;margin-bottom:24px;gap:12px}.section-heading h2{font-size:27px}.section-heading p{font-size:11px;line-height:1.7}.section-kicker{font-size:8px;letter-spacing:.13em}.collection-count{gap:7px;padding:8px 10px;font-size:9px;white-space:nowrap}.collection-count strong{font-size:21px}.guide-grid{grid-template-columns:1fr}.guide-card{min-height:0;padding:19px 20px 22px}.guide-icon{width:37px;height:37px}.guide-card h3{margin-top:14px}.guide-card p{max-width:unset}.guide-line{left:20px}.contribute-inner{width:calc(100% - 36px);padding:29px 0;gap:15px;flex-wrap:wrap}.contribute-seal{flex-basis:48px;height:48px;font-size:19px}.contribute-copy{flex:1 1 calc(100% - 65px)}.contribute-copy h2{font-size:21px}.contribute-copy p{font-size:11px}.contribute-button{margin-left:63px;min-height:40px}.faq-section{padding-top:42px}.footer-inner{width:calc(100% - 32px);padding:24px 0;align-items:flex-start;flex-direction:column;gap:14px}.footer-inner>p{margin:0}.footer-links{flex-wrap:wrap}.footer-lastline{padding:0 16px;font-size:7px;letter-spacing:.1em}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;transition-duration:.01ms!important}}
</style>
