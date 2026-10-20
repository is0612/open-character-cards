<script setup lang="ts">
import { ref } from 'vue'
import { REPO_URL } from '../config'

type PageName = 'home' | 'cards' | 'about'

defineProps<{
  active: PageName
  query: string
}>()

const emit = defineEmits<{
  (e: 'update:query', value: string): void
  (e: 'search'): void
}>()

const menuOpen = ref(false)

function onInput(event: Event) {
  emit('update:query', (event.target as HTMLInputElement).value)
}

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="#/" aria-label="Open Character Cards 首页" @click="closeMenu">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="25" r="16.4" fill="#0b1a33" stroke="#e6eaf3" stroke-width="1.8" />
            <path d="M11.6 18.2 8.9 7.1 19.9 13.5M28.1 13.5 39.1 7.1 36.4 18.2" stroke="#e6eaf3" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M30.6 8.1a7 7 0 1 0 6.7 10.7 7.2 7.2 0 0 1-6.7-10.7Z" fill="#ffdb6b" />
            <path d="m23.8 18.6 1.9 4.1 4.2 1.9-4.2 1.9-1.9 4.2-2-4.2-4.1-1.9 4.1-1.9 2-4.1Z" fill="#ffdb6b" />
            <path d="M17.5 27.4c1.5 3.2 4 4.9 6.5 4.9s5-1.7 6.5-4.9" stroke="#8a9bb8" stroke-width="1.3" stroke-linecap="round" />
          </svg>
        </span>
        <span class="brand-text"><b>Open</b><b>Character Cards</b></span>
      </a>

      <nav class="nav" :class="{ 'is-open': menuOpen }" aria-label="主导航">
        <a href="#/" :class="{ 'is-active': active === 'home' }" @click="closeMenu">首页</a>
        <a href="#/cards" :class="{ 'is-active': active === 'cards' }" @click="closeMenu">角色卡</a>
        <a href="#/about" :class="{ 'is-active': active === 'about' }" @click="closeMenu">关于</a>
      </nav>

      <form class="search" role="search" @submit.prevent="emit('search')">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4.2 4.2" />
        </svg>
        <input
          :value="query"
          type="search"
          placeholder="搜索角色..."
          aria-label="搜索角色卡"
          @input="onInput"
        />
      </form>

      <a class="github-link" :href="REPO_URL" target="_blank" rel="noreferrer" aria-label="在 GitHub 查看项目">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4.3 1.3-4.3-2.4-6-2.9M15 21v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6A4.7 4.7 0 0 0 18.4 6 4.3 4.3 0 0 0 18.3 3S17.2 2.7 15 4.2a12.7 12.7 0 0 0-6 0C6.8 2.7 5.7 3 5.7 3A4.3 4.3 0 0 0 5.6 6 4.7 4.7 0 0 0 4.3 9.3c0 4.7 2.8 5.7 5.5 6A3 3 0 0 0 9 17.6V21" /></svg>
      </a>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-label="打开导航菜单"
        @click="menuOpen = !menuOpen"
      >
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use '../styles/variables' as *;

.site-header {
  position: sticky;
  top: 0;
  z-index: 60;
  background: rgba(6, 16, 33, 0.94);
  border-bottom: 1px solid rgba(26, 42, 74, 0.85);
  backdrop-filter: blur(18px);
}

.header-inner {
  width: min($max-width, calc(100% - 56px));
  min-height: 74px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 34px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
  color: $color-text;
  text-decoration: none;

  &:hover { text-decoration: none; }
}

.brand-mark {
  width: 42px;
  height: 42px;
  display: block;
  flex: 0 0 auto;

  svg { width: 100%; height: 100%; display: block; }
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: .015em;
  color: #f1f4fa;

  b { font-weight: 600; }
}

.nav {
  display: flex;
  align-items: center;
  gap: 30px;
  align-self: stretch;

  a {
    position: relative;
    display: flex;
    align-items: center;
    color: $color-text-muted;
    font-size: 14px;
    text-decoration: none;
    transition: color .2s ease;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 19px;
      width: 0;
      height: 2px;
      border-radius: 2px;
      background: $color-accent;
      transform: translateX(-50%);
      transition: width .2s ease;
    }

    &:hover { color: #f3e6c7; }
    &.is-active { color: $color-accent; }
    &.is-active::after { width: 22px; }
  }
}

.search {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 250px;
  height: 40px;
  margin-left: auto;
  padding: 0 14px;
  border: 1px solid #1d3558;
  border-radius: 999px;
  background: rgba(15, 32, 58, .82);
  transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;

  &:focus-within {
    border-color: rgba(255, 219, 107, .55);
    background: rgba(18, 38, 68, .92);
    box-shadow: 0 0 0 3px rgba(255, 219, 107, .07);
  }

  svg {
    width: 17px;
    height: 17px;
    flex: 0 0 auto;
    fill: none;
    stroke: #8a9bb8;
    stroke-width: 1.8;
    stroke-linecap: round;
  }

  input {
    width: 100%;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: $color-text;
    font: inherit;
    font-size: 13px;

    &::placeholder { color: #7f8fac; }
    &::-webkit-search-cancel-button { display: none; }
  }
}

.github-link {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  color: #e6eaf3;
  border-radius: 50%;
  transition: color .2s ease, transform .2s ease;

  svg {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &:hover { color: $color-accent; transform: translateY(-1px); }
}

.menu-toggle {
  display: none;
  width: 38px;
  height: 38px;
  padding: 9px;
  border: 1px solid #243a5c;
  border-radius: 9px;
  background: rgba(15, 32, 58, .8);
  cursor: pointer;

  span {
    display: block;
    height: 1.5px;
    margin: 4px 0;
    border-radius: 2px;
    background: #dbe4f5;
  }
}

@media (max-width: 1040px) {
  .header-inner { gap: 24px; }
  .nav { gap: 20px; }
  .search { width: 210px; }
}

@media (max-width: 860px) {
  .header-inner {
    width: calc(100% - 32px);
    min-height: 68px;
    flex-wrap: wrap;
    gap: 0 10px;
    padding: 12px 0 14px;
  }

  .brand-mark { width: 36px; height: 36px; }
  .brand-text { font-size: 11.5px; }

  .menu-toggle {
    display: block;
    order: 3;
    margin-left: 0;
  }

  .github-link { order: 2; margin-left: auto; }

  .nav {
    order: 5;
    display: none;
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    margin-top: 10px;
    border: 1px solid #1d3558;
    border-radius: 12px;
    background: #0b1a33;
    overflow: hidden;

    &.is-open { display: flex; }

    a {
      padding: 12px 14px;
      border-top: 1px solid rgba(29, 53, 88, .55);

      &:first-child { border-top: 0; }
      &::after { display: none; }
      &.is-active { background: rgba(255, 219, 107, .06); }
    }
  }

  .search {
    order: 4;
    width: 100%;
    margin: 12px 0 0;
    height: 42px;
  }
}
</style>
