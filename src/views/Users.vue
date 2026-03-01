<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-h1">Users</div>
        <div class="page-desc">Manage registered users and permissions</div>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary">📥 Export</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid mb-24">
      <div class="stat-card success"><div class="stat-icon success">✅</div><div><div class="stat-value">{{ stats.active ?? 0 }}</div><div class="stat-label">Active Users</div></div></div>
      <div class="stat-card warning"><div class="stat-icon warning">⏸</div>  <div><div class="stat-value">{{ stats.inactive ?? 0 }}</div><div class="stat-label">Inactive</div></div></div>
      <div class="stat-card info">   <div class="stat-icon info">📧</div>    <div><div class="stat-value">{{ stats.pending ?? 0 }}</div><div class="stat-label">Pending Invite</div></div></div>
      <div class="stat-card danger"> <div class="stat-icon danger">🚫</div>  <div><div class="stat-value">{{ stats.banned ?? 0 }}</div><div class="stat-label">Banned</div></div></div>
    </div>

    <!-- Filters -->
    <div class="card mb-24">
      <div class="card-body" style="padding:14px 20px;">
        <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
          <input class="form-control" style="width:220px;" placeholder="Search by name or email..."
                 v-model="search" @keyup.enter="fetchUsers" />
          <select class="form-control" style="width:140px;" v-model="roleFilter" @change="fetchUsers">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="customer">Customer</option>
          </select>
          <button class="btn btn-ghost btn-sm" @click="clearFilters">Clear</button>
        </div>
      </div>
    </div>

    <div class="loading-state" v-if="loading">⏳ Loading users...</div>
    <div class="error-state"   v-else-if="error">{{ error }}</div>

    <div class="card" v-else>
      <div class="table-wrapper">
        <table>
          <thead><tr>
            <th>User</th><th>Role</th><th>Orders</th>
            <th>Joined</th><th>Last Active</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>
                <div class="flex-cell">
                  <div class="table-avatar">{{ u.name?.[0] ?? '?' }}</div>
                  <div>
                    <div class="cell-title">{{ u.name }}</div>
                    <div class="cell-sub">{{ u.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge"
                      :class="u.role === 'admin' ? 'badge-danger' : u.role === 'editor' ? 'badge-info' : 'badge-muted'">
                  {{ capitalize(u.role) }}
                </span>
              </td>
              <td><strong>{{ u.orders_count ?? 0 }}</strong></td>
              <td><span style="font-size:12.5px; color:var(--text-muted);">{{ formatDate(u.created_at) }}</span></td>
              <td><span style="font-size:12.5px; color:var(--text-muted);">{{ formatDate(u.last_active_at) }}</span></td>
              <td>
                <span class="badge" :class="u.active ? 'badge-success' : 'badge-muted'">
                  <span class="badge-dot"></span>{{ u.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <div style="display:flex; gap:4px;">
                  <button class="btn btn-ghost btn-icon btn-sm" @click="openEdit(u)" title="Edit Role">✏️</button>
                  <button class="btn btn-danger-ghost btn-icon btn-sm" @click="ban(u)" title="Ban User">🚫</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="empty-state" v-if="users.length === 0 && !loading">
        <div class="empty-icon">👥</div><div>No users found.</div>
      </div>
      <div class="card-footer" style="justify-content:space-between;" v-if="totalPages > 1">
        <span style="font-size:12.5px; color:var(--text-muted);">{{ totalCount }} total users</span>
        <div class="pagination">
          <button class="btn btn-secondary btn-sm" :disabled="page===1" @click="goPage(page-1)">← Prev</button>
          <button class="btn btn-sm" v-for="p in totalPages" :key="p"
                  :class="p===page ? 'btn-primary' : 'btn-secondary'" @click="goPage(p)">{{ p }}</button>
          <button class="btn btn-secondary btn-sm" :disabled="page===totalPages" @click="goPage(page+1)">Next →</button>
        </div>
      </div>
    </div>

    <!-- Edit Role Modal -->
    <AppModal title="Edit User Role" :open="showModal" @close="showModal = false">
      <div class="form-group">
        <label class="form-label">User</label>
        <div style="font-size:14px; font-weight:500; padding:8px 0;">{{ editTarget?.name }}</div>
      </div>
      <div class="form-group">
        <label class="form-label">Role *</label>
        <select class="form-control" v-model="form.role">
          <option value="customer">Customer</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Account Status</label>
        <select class="form-control" v-model="form.active">
          <option :value="true">Active</option>
          <option :value="false">Inactive</option>
        </select>
      </div>
      <div class="error-state" v-if="formError">{{ formError }}</div>
      <template #footer>
        <button class="btn btn-secondary" @click="showModal = false">Cancel</button>
        <button class="btn btn-primary" @click="save" :disabled="saving">
          {{ saving ? '⏳ Saving...' : 'Save Changes' }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUsers, updateUser, banUser } from '@/api'
import AppModal from '@/components/AppModal.vue'

const users      = ref([])
const stats      = ref({})
const loading    = ref(true)
const error      = ref(null)
const showModal  = ref(false)
const saving     = ref(false)
const formError  = ref(null)
const editTarget = ref(null)
const search     = ref('')
const roleFilter = ref('')
const page       = ref(1)
const totalCount = ref(0)
const totalPages = ref(1)
const form       = ref({ role: 'customer', active: true })

async function fetchUsers() {
  loading.value = true; error.value = null
  try {
    const params = { page: page.value }
    if (search.value)     params.search = search.value
    if (roleFilter.value) params.role   = roleFilter.value
    const res    = await getUsers(params)
    users.value  = res.data.items ?? res.data
    stats.value  = res.data.stats ?? {}
    totalCount.value = res.data.total ?? users.value.length
    totalPages.value = res.data.total_pages ?? 1
  } catch (e) {
    error.value = 'Could not load users.'; console.error(e)
  } finally { loading.value = false }
}

async function save() {
  saving.value = true; formError.value = null
  try {
    await updateUser(editTarget.value.id, form.value)
    // update locally
    const idx = users.value.findIndex(u => u.id === editTarget.value.id)
    if (idx > -1) users.value[idx] = { ...users.value[idx], ...form.value }
    showModal.value = false
  } catch (e) {
    formError.value = e.response?.data?.message ?? 'Save failed.'
  } finally { saving.value = false }
}

async function ban(user) {
  if (!confirm(`Ban ${user.name}? They will lose access.`)) return
  try {
    await banUser(user.id)
    user.active = false
  } catch { alert('Could not ban user.') }
}

function openEdit(u)   { editTarget.value = u; form.value = { role: u.role, active: u.active }; showModal.value = true }
function clearFilters() { search.value = ''; roleFilter.value = ''; fetchUsers() }
function goPage(p)     { page.value = p; fetchUsers() }
function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : '' }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' }

onMounted(fetchUsers)
</script>
