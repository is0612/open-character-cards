<script setup lang="ts">
import { REPO_URL } from '../config'

withDefaults(defineProps<{
  /** 已收录角色卡数量，用于右侧数据条 */
  count?: number
}>(), {
  count: 0,
})

const base = import.meta.env.BASE_URL
</script>

<template>
  <main class="about-page">
    <div class="about-shell">
      <section class="about-panel" aria-labelledby="about-title">
        <div class="about-copy">
          <h1 id="about-title">关于本项目</h1>
          <p class="about-lead">
            <strong>Open Character Cards</strong> 是一个基于 GitHub 的开源项目，<br />
            旨在收集和分享优质的二次元角色卡片。<br />
            你可以在这里找到喜欢的角色卡，并下载用于个人使用。
          </p>

          <div class="about-stats">
            <div><b>{{ count || '—' }}</b><span>已收录角色卡</span></div>
            <div><b>MIT</b><span>源代码授权协议</span></div>
            <div><b>100%</b><span>静态站点 · 无后端</span></div>
          </div>

          <div class="about-features">
            <article class="about-feature">
              <span class="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M9 19c-4.3 1.3-4.3-2.4-6-2.9M15 21v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6A4.7 4.7 0 0 0 18.4 6 4.3 4.3 0 0 0 18.3 3S17.2 2.7 15 4.2a12.7 12.7 0 0 0-6 0C6.8 2.7 5.7 3 5.7 3A4.3 4.3 0 0 0 5.6 6 4.7 4.7 0 0 0 4.3 9.3c0 4.7 2.8 5.7 5.5 6A3 3 0 0 0 9 17.6V21" /></svg>
              </span>
              <h2>开源免费</h2>
              <p>所有角色卡均为开源分享，<br />可自由使用。</p>
            </article>

            <article class="about-feature">
              <span class="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M9 19c-4.3 1.3-4.3-2.4-6-2.9M15 21v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6A4.7 4.7 0 0 0 18.4 6 4.3 4.3 0 0 0 18.3 3S17.2 2.7 15 4.2a12.7 12.7 0 0 0-6 0C6.8 2.7 5.7 3 5.7 3A4.3 4.3 0 0 0 5.6 6 4.7 4.7 0 0 0 4.3 9.3c0 4.7 2.8 5.7 5.5 6A3 3 0 0 0 9 17.6V21" /></svg>
              </span>
              <h2>GitHub 托管</h2>
              <p>项目托管在 GitHub，欢迎提交 PR 和 issue。</p>
            </article>

            <article class="about-feature">
              <span class="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></svg>
              </span>
              <h2>社区共建</h2>
              <p>如果你有优质的角色卡，欢迎通过 GitHub 分享。</p>
            </article>
          </div>

          <a class="about-cta" :href="REPO_URL" target="_blank" rel="noreferrer">
            前往 GitHub <span aria-hidden="true">→</span>
          </a>
        </div>

        <div class="about-art" aria-hidden="true">
          <span class="about-moon"></span>
          <span class="about-star about-star--a">✦</span>
          <span class="about-star about-star--b">✧</span>
          <span class="about-star about-star--c">✦</span>
          <img :src="base + 'images/moon_catgirl_dark_ui.png'" alt="" loading="lazy" />
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.about-page {
  min-height: calc(100vh - 74px);
  padding: 32px 0 72px;
  background: $color-bg;
}

.about-shell {
  width: min($max-width, calc(100% - 56px));
  margin: 0 auto;
}

.about-panel {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(300px, .82fr);
  gap: 34px;
  align-items: center;
  min-height: 480px;
  padding: 46px 48px;
  overflow: hidden;
  border: 1px solid #1a2a4a;
  border-radius: 18px;
  background:
    radial-gradient(ellipse at 88% 44%, rgba(255, 199, 92, .12), transparent 34%),
    radial-gradient(ellipse at 70% 100%, rgba(63, 92, 148, .16), transparent 45%),
    linear-gradient(120deg, #0c1b35, #0a1830 62%, #0c1c38);
  box-shadow: 0 24px 60px rgba(0, 0, 0, .2);

  &::before {
    content: '';
    position: absolute;
    inset: 11px;
    border: 1px solid rgba(255, 219, 107, .055);
    border-radius: 12px;
    pointer-events: none;
  }
}

.about-copy {
  position: relative;
  z-index: 2;
  min-width: 0;
}

h1 {
  margin: 0 0 16px;
  color: #f4f6fb;
  font-size: clamp(28px, 3vw, 38px);
  font-weight: 600;
  letter-spacing: .02em;
}

.about-lead {
  margin: 0;
  color: #a9b7cd;
  font-size: 14px;
  line-height: 2;
  letter-spacing: .01em;

  strong { color: #d6dfee; font-weight: 600; }
}

.about-stats {
  display: flex;
  margin-top: 26px;
  padding: 17px 0;
  border-top: 1px solid rgba(51, 76, 116, .5);
  border-bottom: 1px solid rgba(51, 76, 116, .5);

  div {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 5px;
    padding: 0 18px;

    &:first-child { padding-left: 0; }
    & + div { border-left: 1px solid rgba(51, 76, 116, .5); }
  }

  b {
    color: $color-accent;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 26px;
    font-weight: 700;
    line-height: 1;
  }

  span { color: #8a9bb8; font-size: 11.5px; }
}

.about-features {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 26px;
}

.about-feature {
  padding: 0 20px;

  &:first-child { padding-left: 0; }
  &:last-child { padding-right: 0; }
  & + & { border-left: 1px solid rgba(51, 76, 116, .5); }

  h2 {
    margin: 17px 0 6px;
    color: #e6eaf3;
    font-size: 15px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #8a9bb8;
    font-size: 11.5px;
    line-height: 1.75;
  }
}

.feature-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border: 1px solid rgba(255, 219, 107, .5);
  border-radius: 50%;
  color: $color-accent;
  background: rgba(255, 219, 107, .035);

  svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.55;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}

.about-cta {
  display: flex;
  width: max-content;
  max-width: 100%;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 44px;
  margin: 34px auto 0;
  padding: 0 24px;
  border-radius: 999px;
  background: #ffdb6b;
  color: #1c2432;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: transform .2s ease, background .2s ease, box-shadow .2s ease;

  span { font-size: 15px; }
  &:hover { background: #ffe491; transform: translateY(-2px); text-decoration: none; box-shadow: 0 10px 26px rgba(255, 200, 90, .2); }
}

.about-art {
  position: relative;
  z-index: 1;
  align-self: stretch;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  min-height: 390px;

  img {
    position: relative;
    z-index: 2;
    display: block;
    width: auto;
    height: 420px;
    max-width: 100%;
    object-fit: contain;
    object-position: center bottom;
    filter: drop-shadow(0 16px 34px rgba(0, 0, 0, .4));
  }
}

.about-moon {
  position: absolute;
  top: 6%;
  right: 12%;
  width: 148px;
  height: 148px;
  border-radius: 50%;
  border: 1px solid rgba(255, 219, 107, .22);
  background: radial-gradient(circle at 38% 38%, rgba(255, 236, 186, .2), rgba(120, 134, 177, .04) 62%, transparent 70%);
  box-shadow: 0 0 60px rgba(255, 199, 92, .1);
}

.about-star {
  position: absolute;
  z-index: 3;
  color: $color-accent;
  font-size: 20px;
  text-shadow: 0 0 16px rgba(255, 219, 107, .5);

  &--a { top: 16%; left: 10%; }
  &--b { top: 34%; right: 6%; font-size: 25px; color: #b9cafa; }
  &--c { top: 8%; right: 40%; font-size: 13px; }
}

@media (max-width: 1040px) {
  .about-panel { grid-template-columns: minmax(0, 1.2fr) minmax(260px, .8fr); padding: 38px 34px; }
  .about-feature { padding: 0 15px; }
  .about-art img { height: 360px; }
}

@media (max-width: 820px) {
  .about-panel { grid-template-columns: 1fr; gap: 12px; padding: 32px 26px 26px; }
  .about-art { min-height: 0; height: 300px; margin-top: 4px; }
  .about-art img { height: 300px; }
  .about-moon { top: 0; right: 18%; width: 118px; height: 118px; }
  .about-features { grid-template-columns: 1fr; gap: 22px; margin-top: 28px; }
  .about-feature {
    padding: 0;
    & + & { border-left: 0; padding-top: 20px; border-top: 1px solid rgba(51, 76, 116, .5); }
    p { max-width: 360px; }
  }
}

@media (max-width: 760px) {
  .about-page { padding: 20px 0 52px; }
  .about-shell { width: calc(100% - 28px); }
  .about-panel { padding: 26px 20px 22px; }
  h1 { font-size: 26px; }
  .about-lead { font-size: 13px; line-height: 1.95; }
  .about-art { height: 260px; }
  .about-art img { height: 260px; }
  .about-cta { margin-top: 26px; }
}
</style>
