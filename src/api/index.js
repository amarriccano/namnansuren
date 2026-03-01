// src/api/index.js
// ALL backend communication lives here.
// Import functions from this file in your views — never use fetch/axios directly in components.

import axios from 'axios'

// ─── Axios instance ──────────────────────────────────────────────────────────
// baseURL comes from your .env file (VITE_API_URL=http://localhost:8000/api)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handler — log errors, redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
// GET /api/dashboard/stats
// Expected response: { orders, books, media, users, revenue, recentOrders, activities }
export const getDashboardStats = () => api.get('/dashboard/stats')

// ─── BOOKS ───────────────────────────────────────────────────────────────────
// GET    /api/books?category=philosophy&page=1&per_page=20
// POST   /api/books          body: { title, author, isbn, category, price, stock, description }
// PUT    /api/books/:id       body: same fields
// DELETE /api/books/:id
export const getBooks     = (params = {}) => api.get('/books', { params })
export const createBook   = (data)        => api.post('/books', data)
export const updateBook   = (id, data)    => api.put(`/books/${id}`, data)
export const deleteBook   = (id)          => api.delete(`/books/${id}`)

// ─── ORDERS ──────────────────────────────────────────────────────────────────
// GET /api/orders?status=pending&page=1
// PUT /api/orders/:id  body: { status }
export const getOrders   = (params = {}) => api.get('/orders', { params })
export const getOrder    = (id)           => api.get(`/orders/${id}`)
export const updateOrder = (id, data)     => api.put(`/orders/${id}`, data)

// ─── MEDIA (audio / video) ───────────────────────────────────────────────────
// GET    /api/media?type=video&page=1
// POST   /api/media          body: { title, type (video|audio), url, duration }
// DELETE /api/media/:id
export const getMedia    = (params = {}) => api.get('/media', { params })
export const createMedia = (data)        => api.post('/media', data)
export const updateMedia = (id, data)    => api.put(`/media/${id}`, data)
export const deleteMedia = (id)          => api.delete(`/media/${id}`)

// ─── TEXT CONTENT (articles / interviews / talks) ────────────────────────────
// GET    /api/content?type=article&page=1
// POST   /api/content        body: { title, type, body, published, date, venue, interviewer }
// PUT    /api/content/:id
// DELETE /api/content/:id
export const getTextContent    = (params = {}) => api.get('/content', { params })
export const createTextContent = (data)        => api.post('/content', data)
export const updateTextContent = (id, data)    => api.put(`/content/${id}`, data)
export const deleteTextContent = (id)          => api.delete(`/content/${id}`)

// ─── USERS ───────────────────────────────────────────────────────────────────
// GET /api/users?role=customer&page=1
// PUT /api/users/:id  body: { role, active }
export const getUsers  = (params = {}) => api.get('/users', { params })
export const updateUser = (id, data)   => api.put(`/users/${id}`, data)
export const banUser    = (id)         => api.put(`/users/${id}/ban`)

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const login  = (credentials) => api.post('/auth/login', credentials)
export const logout = ()            => api.post('/auth/logout')
