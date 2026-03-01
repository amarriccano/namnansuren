<template>
  <!-- data-theme on the root div applies CSS variables for light/dark -->
  <div id="app" :data-theme="theme">
    <AppSidebar />
    <div class="main-wrapper">
      <AppTopbar />
      <!-- router-view renders whichever view matches the current URL -->
      <main class="page-content">
        <RouterView v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" :key="$route.path" />
          </transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar  from '@/components/AppTopbar.vue'
import { useTheme } from '@/composables/useTheme'

const { theme } = useTheme()
</script>
