// src/composables/useTheme.js
// This composable manages light/dark theme across the whole app.
// Any component can call useTheme() to read or toggle the theme.

import { ref, watch } from 'vue'

// ref() outside the function = shared across ALL components (singleton)
const theme = ref(localStorage.getItem('theme') || 'light')

// Apply theme to <html> element whenever it changes
watch(theme, (val) => {
  document.documentElement.setAttribute('data-theme', val)
  localStorage.setItem('theme', val)
}, { immediate: true })

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { theme, toggleTheme }
}
