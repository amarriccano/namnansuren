<template>
  <header class="topbar">
    <!-- Page title comes from the current route's meta.title or name -->
    <div class="topbar-title">{{ pageTitle }}</div>

    <div class="topbar-search">
      <span class="topbar-search-icon">🔍</span>
      <input type="text" placeholder="Search anything..." v-model="searchQuery" />
    </div>

    <div style="display:flex; align-items:center; gap:8px;">
      <button class="topbar-btn" title="Notifications">
        🔔<span class="notif-dot"></span>
      </button>
      <button class="theme-toggle" @click="toggleTheme" :title="theme === 'light' ? 'Dark mode' : 'Light mode'">
        {{ theme === 'light' ? '🌙' : '☀️' }}
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const { theme, toggleTheme } = useTheme()
const searchQuery = ref('')

// Map route names to display titles
const titles = {
  dashboard:  'Dashboard',
  books:      'Book Catalog',
  orders:     'Orders',
  media:      'Audio / Video',
  articles:   'Articles',
  interviews: 'Interviews',
  talks:      'Talks',
  users:      'Users',
  settings:   'Settings',
}

const pageTitle = computed(() => titles[route.name] || 'Academica Admin')
</script>
