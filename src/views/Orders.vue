<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-h1">Orders</div>
        <div class="page-desc">Track and manage all customer orders</div>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary">📊 Export CSV</button>
      </div>
    </div>

    <!-- Order Stats -->
    <div class="stats-grid mb-24">
      <div class="stat-card warning"><div class="stat-icon warning">⏳</div><div><div class="stat-value">{{ orderStats.pending ?? 0 }}</div><div class="stat-label">Pending</div></div></div>
      <div class="stat-card info">   <div class="stat-icon info">📦</div>   <div><div class="stat-value">{{ orderStats.processing ?? 0 }}</div><div class="stat-label">Processing</div></div></div>
      <div class="stat-card success"><div class="stat-icon success">✅</div>  <div><div class="stat-value">{{ orderStats.completed?.toLocaleString() ?? 0 }}</div><div class="stat-label">Completed</div></div></div>
      <div class="stat-card danger"> <div class="stat-icon danger">❌</div>   <div><div class="stat-value">{{ orderStats.cancelled ?? 0 }}</div><div class="stat-label">Cancelled</div></div></div>
    </div>

    <!-- Filters -->
    <div class="card mb-24">
      <div class="card-body" style="padding:14px 20px;">
        <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
          <input class="form-control" style="max-width:220px;" placeholder="🔍 Search by name or ID..."
                 v-model="search" @keyup.enter="fetchOrders" />
          <select class="form-control" style="width:140px;" v-model="statusFilter" @change="fetchOrders">
            <option value="">All Status</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
          <select class="form-control" style="width:140px;" v-model="timeFilter" @change="fetchOrders">
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button class="btn btn-primary btn-sm" @click="fetchOrders">🔎 Filter</button>
          <button class="btn btn-ghost btn-sm" @click="clearFilters">Clear</button>
        </div>
      </div>
    </div>

    <div class="loading-state" v-if="loading">⏳ Loading orders...</div>
    <div class="error-state"   v-else-if="error">{{ error }}</div>

    <div class="card" v-else>
      <div class="table-wrapper">
        <table>
          <thead><tr>
            <th><input type="checkbox" style="accent-color:var(--accent);" /></th>
            <th>Order ID</th><th>Customer</th><th>Items</th><th>Date</th>
            <th>Total</th><th>Payment</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id">
              <td><input type="checkbox" style="accent-color:var(--accent);" /></td>
              <td><span style="font-family:var(--font-mono); font-size:12px; color:var(--accent);">#{{ o.id }}</span></td>
              <td>
                <div class="flex-cell">
                  <div class="table-avatar">{{ o.customer_name?.[0] ?? '?' }}</div>
                  <div>
                    <div class="cell-title">{{ o.customer_name }}</div>
                    <div class="cell-sub">{{ o.customer_email }}</div>
                  </div>
                </div>
              </td>
              <td>{{ o.item_count }} item(s)</td>
              <td><span style="font-size:12.5px; color:var(--text-muted);">{{ formatDate(o.created_at) }}</span></td>
              <td><strong style="font-family:var(--font-display); font-size:15px;">${{ o.total }}</strong></td>
              <td><span class="badge badge-info">{{ o.payment_method }}</span></td>
              <td>
                <span class="badge" :class="statusColor(o.status)">
                  <span class="badge-dot"></span>{{ o.status }}
                </span>
              </td>
              <td>
                <div style="display:flex; gap:2px;">
                  <button class="btn btn-ghost btn-icon btn-sm" @click="viewOrder(o)" title="View">👁</button>
                  <select style="font-size:12px; border:1px solid var(--border); border-radius:var(--radius-sm); background:var(--bg-base); color:var(--text-primary); padding:3px 6px; cursor:pointer;"
                          :value="o.status" @change="changeStatus(o, $event.target.value)">
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" v-if="orders.length === 0 && !loading">
        <div class="empty-icon">🛒</div>
        <div>No orders match your filters</div>
      </div>

      <!-- Pagination -->
      <div class="card-footer" style="justify-content:space-between;">
        <span style="font-size:12.5px; color:var(--text-muted);">
          Showing {{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, totalCount) }} of {{ totalCount }} orders
        </span>
        <div class="pagination">
          <button class="btn btn-secondary btn-sm" :disabled="page === 1" @click="goPage(page - 1)">← Prev</button>
          <button class="btn btn-sm"
                  v-for="p in Math.min(totalPages, 5)" :key="p"
                  :class="p === page ? 'btn-primary' : 'btn-secondary'"
                  @click="goPage(p)">{{ p }}</button>
          <button class="btn btn-secondary btn-sm" :disabled="page === totalPages" @click="goPage(page + 1)">Next →</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getOrders, updateOrder } from '@/api'

const orders      = ref([])
const orderStats  = ref({})
const loading     = ref(true)
const error       = ref(null)
const search      = ref('')
const statusFilter = ref('')
const timeFilter  = ref('')
const page        = ref(1)
const perPage     = ref(10)
const totalCount  = ref(0)
const totalPages  = ref(1)

async function fetchOrders() {
  loading.value = true
  error.value   = null
  try {
    const params = { page: page.value, per_page: perPage.value }
    if (search.value)       params.search = search.value
    if (statusFilter.value) params.status = statusFilter.value
    if (timeFilter.value)   params.range  = timeFilter.value

    const res = await getOrders(params)
    orders.value      = res.data.items ?? res.data
    totalCount.value  = res.data.total ?? orders.value.length
    totalPages.value  = res.data.total_pages ?? 1
    orderStats.value  = res.data.stats ?? {}
  } catch (e) {
    error.value = 'Could not load orders.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function changeStatus(order, newStatus) {
  try {
    await updateOrder(order.id, { status: newStatus })
    order.status = newStatus   // update locally without refetch
  } catch (e) {
    alert('Could not update order status.')
  }
}

function viewOrder(order) {
  // TODO: navigate to order detail page or open detail modal
  console.log('View order', order.id)
}

function clearFilters() {
  search.value = ''
  statusFilter.value = ''
  timeFilter.value   = ''
  page.value = 1
  fetchOrders()
}

function goPage(p) { page.value = p; fetchOrders() }

function statusColor(status) {
  const map = { Pending: 'badge-warning', Processing: 'badge-info', Shipped: 'badge-warning', Delivered: 'badge-success', Cancelled: 'badge-danger' }
  return map[status] ?? 'badge-muted'
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(fetchOrders)
</script>
