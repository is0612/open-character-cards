<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { ManifestCard } from './types/card'
import SiteHeader from './components/SiteHeader.vue'
import HomePage from './components/HomePage.vue'
import CardsPage from './components/CardsPage.vue'
import AboutPage from './components/AboutPage.vue'
import CardDetail from './components/CardDetail.vue'
import { REPO_URL } from './config'

type PageName = 'home' | 'cards' | 'about'

interface RouteState {
  name: PageName
  cardId?: string
  q: string
  section?: string
}

const base = import.meta.env.BASE_URL
const cards = ref<ManifestCard[]>([])
const loading = ref(true)
const error = ref('')
const route = ref<RouteState>({ name: 'home', q: '' })
const searchQuery = ref('')

const selectedCard = computed(() => {
  if (!route.value.cardId) return null
  return cards.value.find((card) => card.id === route.value.cardId) ?? null
})

function parseHash(): RouteState {
  const raw = window.location.hash.replace(/^#/, '')
  const [pathPart, queryPart = ''] = raw.split('?')
  const parts = pathPart.split('/').filter(Boolean)
  const params = new URLSearchParams(queryPart)

  if (parts[0] === 'cards') {
    let cardId: string | undefined
    if (parts[1]) {
      try {
        cardId = decodeURIComponent(parts[1])
      } catch {
        cardId = parts[1]
      }
    }
    return {
      name: 'cards',
      cardId,
      q: params.get('q') ?? '',
    }
  }
  if (parts[0] === 'about') return { name: 'about', q: '' }
  return { name: 'home', q: '', section: params.get('section') ?? undefined }
}

function scrollToHomeSection(section: string) {
  nextTick(() => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const target = document.getElementById(section)
        if (!target) return
        const top = target.getBoundingClientRect().top + window.scrollY - 88
        window.scrollTo({ top, behavior: 'auto' })
      })
    })
  })
}

function syncRoute() {
  const next = parseHash()
  const previouslyFocusedSection = route.value.section
  const pageChanged = next.name !== route.value.name
  route.value = next
  if (next.name === 'cards' && next.q) searchQuery.value = next.q
  if (pageChanged) window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  if (next.name === 'home' && next.section) {
    if (!loading.value) scrollToHomeSection(next.section)
  } else if (next.name === 'home' && previouslyFocusedSection) {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }
  updateTitle()
}

function updateTitle() {
  const suffix = 'Open Character Cards'
  if (selectedCard.value) {
    document.title = `${selectedCard.value.name} · ${suffix}`
  } else if (route.value.name === 'cards') {
    document.title = `角色卡画廊 · ${suffix}`
  } else if (route.value.name === 'about') {
    document.title = `关于 · ${suffix}`
  } else {
    document.title = `${suffix} · 开源的角色卡片分享平台`
  }
}

function navigate(path: string) {
  if (window.location.hash === path) {
    syncRoute()
    return
  }
  window.location.hash = path
}

function browseCards() {
  searchQuery.value = ''
  navigate('#/cards')
}

function handleSearch() {
  if (route.value.name === 'cards') return
  const keyword = searchQuery.value.trim()
  navigate(keyword ? `#/cards?q=${encodeURIComponent(keyword)}` : '#/cards')
}

function openCard(card: ManifestCard) {
  const suffix = route.value.q ? `?q=${encodeURIComponent(route.value.q)}` : ''
  navigate(`#/cards/${encodeURIComponent(card.id)}${suffix}`)
}

function closeCard() {
  const suffix = route.value.q ? `?q=${encodeURIComponent(route.value.q)}` : ''
  navigate(`#/cards${suffix}`)
}

async function loadCards() {
  try {
    const res = await fetch(base + 'data/manifest.json')
    if (res.status === 404) {
      error.value = '角色卡清单尚未生成（npm run build:manifest）。'
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

watch(selectedCard, updateTitle)
watch(route, updateTitle, { deep: true })
watch(loading, (value) => {
  if (!value && route.value.name === 'home' && route.value.section) {
    scrollToHomeSection(route.value.section)
  }
})

onMounted(() => {
  syncRoute()
  void loadCards()
  window.addEventListener('hashchange', syncRoute)
})

onUnmounted(() => {
  window.removeEventListener('hashchange', syncRoute)
})
</script>

<template>
  <div class="app-shell">
    <SiteHeader
      :active="route.name"
      :query="searchQuery"
      @update:query="searchQuery = $event"
      @search="handleSearch"
    />

    <HomePage
      v-if="route.name === 'home'"
      :cards="cards"
      :loading="loading"
      :error="error"
      @select="openCard"
      @browse="browseCards"
      @view-all="browseCards"
    />
    <CardsPage
      v-else-if="route.name === 'cards'"
      :cards="cards"
      :loading="loading"
      :error="error"
      :query="searchQuery"
      @select="openCard"
      @clear-query="searchQuery = ''"
    />
    <AboutPage v-else :count="cards.length" />

    <footer class="site-footer">
      <div class="footer-inner">
        <a class="footer-brand" href="#/"><span aria-hidden="true">☾</span> Open Character Cards</a>
        <p>开源的角色卡片分享平台 · 由创作者共同点亮的档案馆</p>
        <nav class="footer-links" aria-label="页脚导航">
          <a href="#/">首页</a>
          <a href="#/cards">角色卡</a>
          <a href="#/?section=guide">使用指南</a>
          <a href="#/?section=tool">卡牌工具</a>
          <a href="#/about">关于</a>
          <a :href="REPO_URL" target="_blank" rel="noreferrer">GitHub ↗</a>
        </nav>
      </div>
    </footer>

    <CardDetail v-if="selectedCard" :card="selectedCard" @close="closeCard" />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #050a14;
}

.site-footer {
  margin-top: auto;
  border-top: 1px solid #142645;
  background: #050a14;
}

.footer-inner {
  width: min(1240px, calc(100% - 56px));
  min-height: 66px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  color: #7587a4;
  font-size: 11.5px;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #b8c5da;
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
}

.footer-brand span {
  color: #ffdb6b;
  font-size: 16px;
}

.footer-brand:hover {
  color: #ffe4a6;
  text-decoration: none;
}

.footer-inner p {
  margin: 0;
  text-align: center;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 18px;
  white-space: nowrap;
}

.footer-links a {
  color: #8a9bb8;
  text-decoration: none;
}

.footer-links a:hover {
  color: #ffdb6b;
  text-decoration: none;
}

@media (max-width: 760px) {
  .footer-inner {
    width: calc(100% - 32px);
    flex-direction: column;
    gap: 13px;
    padding: 20px 0;
  }

  .footer-inner p {
    order: 3;
    font-size: 10.5px;
  }

  .footer-links {
    gap: 15px;
  }
}
</style>
