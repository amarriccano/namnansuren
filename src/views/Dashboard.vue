<template>
  <div>
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <div class="page-h1">Good morning, Admin 👋</div>
        <div class="page-desc">Here's what's happening with your store today.</div>
      </div>
      <div class="page-header-actions">
        <RouterLink to="/orders"><button class="btn btn-secondary">📊 View Orders</button></RouterLink>
        <RouterLink to="/books"><button class="btn btn-primary">＋ Add Book</button></RouterLink>
      </div>
    </div>

    <!-- Loading / Error -->
    <div class="loading-state" v-if="loading">⏳ Loading dashboard...</div>
    <div class="error-state"   v-else-if="error">{{ error }}</div>

    <template v-else>
      <!-- KPI Stats -->
      <div class="stats-grid">
        <div class="stat-card accent">
          <div class="stat-icon accent">📦</div>
          <div>
            <div class="stat-value">{{ stats.totalOrders?.toLocaleString() ?? '—' }}</div>
            <div class="stat-label">Total Orders</div>
          </div>
          <div class="stat-change up">↑ 12.4% this month</div>
        </div>
        <div class="stat-card success">
          <div class="stat-icon success">📚</div>
          <div>
            <div class="stat-value">{{ stats.totalBooks ?? '—' }}</div>
            <div class="stat-label">Books in Catalog</div>
          </div>
          <div class="stat-change up">↑ 8 new this week</div>
        </div>
        <div class="stat-card info">
          <div class="stat-icon info">🎬</div>
          <div>
            <div class="stat-value">{{ stats.totalMedia ?? '—' }}</div>
            <div class="stat-label">Media Archives</div>
          </div>
          <div class="stat-change up">↑ 3 added today</div>
        </div>
        <div class="stat-card danger">
          <div class="stat-icon danger">👥</div>
          <div>
            <div class="stat-value">{{ stats.totalUsers?.toLocaleString() ?? '—' }}</div>
            <div class="stat-label">Registered Users</div>
          </div>
          <div class="stat-change up">↑ 56 this week</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid-2 mb-24">
        <!-- Revenue Mini Chart -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Revenue Overview</div>
              <div class="card-subtitle">Monthly sales performance</div>
            </div>
          </div>
          <div class="card-body">
            <div style="display:flex; align-items:baseline; gap:10px; margin-bottom:16px;">
              <span style="font-family:var(--font-display); font-size:36px; font-weight:700;">
                ${{ stats.revenue?.toLocaleString() ?? '0' }}
              </span>
              <span class="stat-change up">↑ 18.2%</span>
            </div>
            <!-- Bar chart built with CSS — replace with Chart.js if needed -->
            <div class="mini-chart" style="height:80px;">
              <div
                class="chart-bar"
                v-for="(h, i) in revenueData"
                :key="i"
                :style="{ height: h + '%' }"
                :class="{ active: i === revenueData.length - 1 }"
              ></div>
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:8px;">
              <span v-for="m in ['Jan','Mar','May','Jul','Sep','Nov','Dec']" :key="m"
                    style="font-size:10px; color:var(--text-muted);">{{ m }}</span>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Recent Activity</div>
              <div class="card-subtitle">Latest store events</div>
            </div>
          </div>
          <div class="card-body" style="padding-top:8px; padding-bottom:8px;">
            <div class="activity-feed">
              <div class="activity-item" v-for="a in activities" :key="a.id">
                <div class="activity-dot" :style="{ background: a.color + '22', color: a.color }">{{ a.icon }}</div>
                <div>
                  <div class="activity-text" v-html="a.text"></div>
                  <div class="activity-time">{{ a.time }}</div>
                </div>
              </div>
              <div class="empty-state" v-if="activities.length === 0">
                <div class="empty-icon">📭</div>
                <div>No recent activity</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="card mb-24">
        <div class="card-header">
          <div class="card-title">Recent Orders</div>
          <RouterLink to="/orders"><button class="btn btn-ghost btn-sm">View All →</button></RouterLink>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr>
              <th>Customer</th><th>Book</th><th>Total</th><th>Status</th>
            </tr></thead>
            <tbody>
              <tr v-for="o in recentOrders" :key="o.id">
                <td>
                  <div class="flex-cell">
                    <div class="table-avatar">{{ o.customer_name?.[0] ?? '?' }}</div>
                    <div>
                      <div class="cell-title">{{ o.customer_name }}</div>
                      <div class="cell-sub">#{{ o.id }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ o.book_title }}</td>
                <td><strong style="font-family:var(--font-display); font-size:15px;">${{ o.total }}</strong></td>
                <td>
                  <span class="badge" :class="statusColor(o.status)">
                    <span class="badge-dot"></span>{{ o.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Archive Summary -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Archive Summary</div>
          <RouterLink to="/audio-video"><button class="btn btn-ghost btn-sm">Browse →</button></RouterLink>
        </div>
        <div class="card-body">
          <div v-for="cat in archiveSummary" :key="cat.name" style="margin-bottom:18px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span>{{ cat.icon }}</span>
                <span style="font-size:13.5px; font-weight:500;">{{ cat.name }}</span>
              </div>
              <span style="font-size:13px; font-weight:600; color:var(--text-secondary);">{{ cat.count }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :class="cat.colorClass" :style="{ width: cat.pct + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDashboardStats } from '@/api'

// ── State ────────────────────────────────────────────────────────────────────
const loading      = ref(true)
const error        = ref(null)
const stats        = ref({})
const recentOrders = ref([])
const activities   = ref([])

// Mini bar chart data (percentages 0–100)
const revenueData  = ref([45, 62, 48, 71, 55, 80, 67, 74, 58, 90, 72, 85])

// Archive summary — normally totals come from stats endpoint
const archiveSummary = ref([
  { name: 'Audio / Video', icon: '🎬', count: 0, pct: 0, colorClass: '' },
  { name: 'Articles',      icon: '📝', count: 0, pct: 0, colorClass: 'info' },
  { name: 'Interviews',    icon: '🎤', count: 0, pct: 0, colorClass: 'success' },
  { name: 'Talks',         icon: '💬', count: 0, pct: 0, colorClass: '' },
])

// ── Fetch data when page loads ────────────────────────────────────────────────
onMounted(async () => {
  try {
    const res = await getDashboardStats()
    // Destructure what your backend returns
    const { totalOrders, totalBooks, totalMedia, totalUsers, revenue,
            recent_orders, recent_activities,
            media_count, articles_count, interviews_count, talks_count } = res.data

    stats.value        = { totalOrders, totalBooks, totalMedia, totalUsers, revenue }
    recentOrders.value = recent_orders   ?? []
    activities.value   = recent_activities ?? []

    // Update archive summary counts
    const maxCount = Math.max(media_count, articles_count, interviews_count, talks_count, 1)
    archiveSummary.value = [
      { name: 'Audio / Video', icon: '🎬', count: media_count,       pct: Math.round(media_count / maxCount * 100),       colorClass: '' },
      { name: 'Articles',      icon: '📝', count: articles_count,    pct: Math.round(articles_count / maxCount * 100),    colorClass: 'info' },
      { name: 'Interviews',    icon: '🎤', count: interviews_count,  pct: Math.round(interviews_count / maxCount * 100),  colorClass: 'success' },
      { name: 'Talks',         icon: '💬', count: talks_count,       pct: Math.round(talks_count / maxCount * 100),       colorClass: '' },
    ]
  } catch (e) {
    error.value = 'Failed to load dashboard data. Is your backend running?'
    console.error(e)
  } finally {
    loading.value = false
  }
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusColor(status) {
  const map = { Pending: 'badge-warning', Processing: 'badge-info', Shipped: 'badge-warning', Delivered: 'badge-success', Cancelled: 'badge-danger' }
  return map[status] ?? 'badge-muted'
}
</script>
