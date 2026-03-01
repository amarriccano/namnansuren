<template>
  <aside class="sidebar">
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="sidebar-brand-icon">📚</div>
      <div class="sidebar-brand-name">Оохнойн Батсайхан</div>
      <div class="sidebar-brand-sub">Admin Panel</div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <div class="nav-section-label">Overview</div>
      <RouterLink to="/" custom v-slot="{ isActive, navigate }">
        <div class="nav-item" :class="{ active: isActive }" @click="navigate">
          <span class="nav-icon">⊞</span> Статистик
        </div>
      </RouterLink>

      <div class="nav-section-label">Дэлгүүр</div>
      <RouterLink to="/books" custom v-slot="{ isActive, navigate }">
        <div class="nav-item" :class="{ active: isActive }" @click="navigate">
          <span class="nav-icon">📖</span> Номын Catalog
        </div>
      </RouterLink>
      <RouterLink to="/orders" custom v-slot="{ isActive, navigate }">
        <div class="nav-item" :class="{ active: isActive }" @click="navigate">
          <span class="nav-icon">🛒</span> Захиалгууд
          <span class="nav-badge" v-if="pendingOrders > 0">{{ pendingOrders }}</span>
        </div>
      </RouterLink>

      <div class="nav-section-label">Архив</div>
      <RouterLink to="/audio-video" custom v-slot="{ isActive, navigate }">
        <div class="nav-item" :class="{ active: isActive }" @click="navigate">
          <span class="nav-icon">🎬</span> Audio / Video
        </div>
      </RouterLink>
      <RouterLink to="/articles" custom v-slot="{ isActive, navigate }">
        <div class="nav-item" :class="{ active: isActive }" @click="navigate">
          <span class="nav-icon">📝</span> Нийтлэлүүд
        </div>
      </RouterLink>
      <RouterLink to="/interviews" custom v-slot="{ isActive, navigate }">
        <div class="nav-item" :class="{ active: isActive }" @click="navigate">
          <span class="nav-icon">🎤</span> Ярилцлагууд
        </div>
      </RouterLink>
      <RouterLink to="/talks" custom v-slot="{ isActive, navigate }">
        <div class="nav-item" :class="{ active: isActive }" @click="navigate">
          <span class="nav-icon">💬</span> Яриа/Лекц
        </div>
      </RouterLink>

      <div class="nav-section-label">System</div>
      <RouterLink to="/users" custom v-slot="{ isActive, navigate }">
        <div class="nav-item" :class="{ active: isActive }" @click="navigate">
          <span class="nav-icon">👥</span> Хэрэглэгчид
        </div>
      </RouterLink>
      <RouterLink to="/settings" custom v-slot="{ isActive, navigate }">
        <div class="nav-item" :class="{ active: isActive }" @click="navigate">
          <span class="nav-icon">⚙</span> Settings
        </div>
      </RouterLink>
    </nav>

    <!-- User -->
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="user-avatar">A</div>
        <div class="user-info">
          <div class="user-name">Admin User</div>
          <div class="user-role">Super Admin</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
// You can fetch the pending orders count from your API here
// and show it as a badge on the Orders link
const pendingOrders = ref(0) //TODO order count api
</script>
