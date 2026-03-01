// src/router/index.js
// Maps URL paths to page components.
// () => import(...) = lazy loading: each page only loads when visited.

import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/',             name: 'dashboard',   component: () => import('@/views/Dashboard.vue') },
  { path: '/books',        name: 'books',       component: () => import('@/views/Books.vue') },
  { path: '/orders',       name: 'orders',      component: () => import('@/views/Orders.vue') },
  { path: '/audio-video',  name: 'media',       component: () => import('@/views/AudioVideo.vue') },
  { path: '/articles',     name: 'articles',    component: () => import('@/views/Articles.vue') },
  { path: '/interviews',   name: 'interviews',  component: () => import('@/views/Interviews.vue') },
  { path: '/talks',        name: 'talks',       component: () => import('@/views/Talks.vue') },
  { path: '/users',        name: 'users',       component: () => import('@/views/Users.vue') },
  { path: '/settings',     name: 'settings',    component: () => import('@/views/Settings.vue') },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  // Scroll to top on every page change
  scrollBehavior: () => ({ top: 0 }),
})
