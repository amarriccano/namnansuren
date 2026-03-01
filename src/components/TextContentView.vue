<!-- src/components/TextContentView.vue
     Reusable base for Articles, Interviews, and Talks.
     Pass `contentType` = 'article' | 'interview' | 'talk'
-->
<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-h1">{{ pageTitle }}</div>
        <div class="page-desc">{{ pageDesc }}</div>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary">📥 Import</button>
        <button class="btn btn-primary" @click="openAdd">＋ Add {{ singularLabel }}</button>
      </div>
    </div>

    <!-- Filters -->
    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
      <input class="form-control" style="width:240px;" :placeholder="'Search ' + pageTitle.toLowerCase() + '...'"
             v-model="search" @keyup.enter="fetchItems" />
      <select class="form-control" style="width:140px;" v-model="statusFilter" @change="fetchItems">
        <option value="">All Status</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>
      <button class="btn btn-ghost btn-sm" @click="clearFilters">Clear</button>
    </div>

    <div class="loading-state" v-if="loading">⏳ Loading {{ pageTitle.toLowerCase() }}...</div>
    <div class="error-state"   v-else-if="error">{{ error }}</div>

    <div class="card" v-else>
      <div class="table-wrapper">
        <table>
          <thead><tr>
            <th>Title</th>
            <th>Professor</th>
            <th v-if="contentType === 'interview'">Interviewer</th>
            <th v-if="contentType === 'talk'">Venue</th>
            <th>Published</th>
            <th>Views</th>
            <th>Status</th>
            <th>Actions</th>
          </tr></thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>
                <div class="flex-cell">
                  <div class="table-avatar" :style="thumbStyle">{{ thumbEmoji }}</div>
                  <div>
                    <div class="cell-title">{{ item.title }}</div>
                    <div class="cell-sub">{{ item.read_time ?? '—' }}</div>
                  </div>
                </div>
              </td>
              <td><span style="font-size:13px;">{{ item.professor_name }}</span></td>
              <td v-if="contentType === 'interview'">
                <span style="font-size:12.5px; color:var(--text-muted);">{{ item.interviewer ?? '—' }}</span>
              </td>
              <td v-if="contentType === 'talk'">
                <span style="font-size:12.5px; color:var(--text-muted);">{{ item.venue ?? '—' }}</span>
              </td>
              <td><span style="font-size:12.5px; color:var(--text-muted);">{{ formatDate(item.published_at) }}</span></td>
              <td><span style="font-family:var(--font-mono); font-size:12.5px;">{{ item.views ?? 0 }}</span></td>
              <td>
                <span class="badge" :class="item.published ? 'badge-success' : 'badge-warning'">
                  <span class="badge-dot"></span>{{ item.published ? 'Published' : 'Draft' }}
                </span>
              </td>
              <td>
                <div style="display:flex; gap:4px;">
                  <button class="btn btn-ghost btn-icon btn-sm" @click="openEdit(item)" title="Edit">✏️</button>
                  <button class="btn btn-ghost btn-icon btn-sm" title="Preview">👁</button>
                  <button class="btn btn-danger-ghost btn-icon btn-sm" @click="remove(item.id)" title="Delete">🗑</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" v-if="items.length === 0 && !loading">
        <div class="empty-icon">{{ thumbEmoji }}</div>
        <div>No {{ pageTitle.toLowerCase() }} yet. Add the first one!</div>
      </div>

      <!-- Pagination -->
      <div class="card-footer" style="justify-content:space-between;" v-if="totalPages > 1">
        <span style="font-size:12.5px; color:var(--text-muted);">
          {{ totalCount }} total {{ pageTitle.toLowerCase() }}
        </span>
        <div class="pagination">
          <button class="btn btn-secondary btn-sm" :disabled="page===1" @click="goPage(page-1)">← Prev</button>
          <button class="btn btn-sm" v-for="p in totalPages" :key="p"
                  :class="p===page ? 'btn-primary' : 'btn-secondary'" @click="goPage(p)">{{ p }}</button>
          <button class="btn btn-secondary btn-sm" :disabled="page===totalPages" @click="goPage(page+1)">Next →</button>
        </div>
      </div>
    </div>

    <!-- Add / Edit Modal -->
    <AppModal :title="editTarget ? 'Edit ' + singularLabel : 'Add ' + singularLabel"
              :open="showModal" @close="showModal = false">
      <div class="form-group">
        <label class="form-label">Title *</label>
        <input class="form-control" v-model="form.title" :placeholder="singularLabel + ' title...'" />
      </div>
      <div class="form-grid">
        <div class="form-group" v-if="contentType === 'interview'">
          <label class="form-label">Interviewer / Publication</label>
          <input class="form-control" v-model="form.interviewer" placeholder="e.g. Journal of Philosophy" />
        </div>
        <div class="form-group" v-if="contentType === 'talk'">
          <label class="form-label">Venue / Event</label>
          <input class="form-control" v-model="form.venue" placeholder="e.g. TEDx, Berlin Conference" />
        </div>
        <div class="form-group" v-if="contentType === 'article'">
          <label class="form-label">Publication / Journal</label>
          <input class="form-control" v-model="form.publication" placeholder="e.g. Academic Review" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Body / Content *</label>
        <textarea class="form-control" rows="6" v-model="form.body"
                  placeholder="Paste or type the full text content here..."></textarea>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Publication Date</label>
          <input class="form-control" type="date" v-model="form.published_at" />
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" v-model="form.published">
            <option :value="false">Draft</option>
            <option :value="true">Published</option>
          </select>
        </div>
      </div>
      <div class="error-state" v-if="formError">{{ formError }}</div>
      <template #footer>
        <button class="btn btn-secondary" @click="showModal = false">Cancel</button>
        <button class="btn btn-primary" @click="save" :disabled="saving">
          {{ saving ? '⏳ Saving...' : editTarget ? 'Save Changes' : 'Add ' + singularLabel }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getTextContent, createTextContent, updateTextContent, deleteTextContent } from '@/api'
import AppModal from '@/components/AppModal.vue'

const props = defineProps({
  contentType: { type: String, required: true },  // 'article' | 'interview' | 'talk'
})

// ── Labels ────────────────────────────────────────────────────────────────────
const labels = {
  article:   { title: 'Articles',   singular: 'Article',   desc: 'Written academic articles authored by professors' },
  interview: { title: 'Interviews', singular: 'Interview', desc: 'Written and transcript-based professor interviews' },
  talk:      { title: 'Talks',      singular: 'Talk',      desc: 'Transcripts and summaries of professor talks & lectures' },
}
const thumbEmojis = { article: '📝', interview: '🎤', talk: '💬' }
const thumbColors = {
  article:   'background:var(--success-bg); color:var(--success)',
  interview: 'background:var(--info-bg); color:var(--info)',
  talk:      'background:var(--accent-light); color:var(--accent)',
}

const pageTitle    = computed(() => labels[props.contentType].title)
const pageDesc     = computed(() => labels[props.contentType].desc)
const singularLabel= computed(() => labels[props.contentType].singular)
const thumbEmoji   = computed(() => thumbEmojis[props.contentType])
const thumbStyle   = computed(() => thumbColors[props.contentType])

// ── State ─────────────────────────────────────────────────────────────────────
const items           = ref([])
const professors      = ref([])
const loading         = ref(true)
const error           = ref(null)
const showModal       = ref(false)
const saving          = ref(false)
const formError       = ref(null)
const editTarget      = ref(null)
const search          = ref('')
const professorFilter = ref('')
const statusFilter    = ref('')
const page            = ref(1)
const totalCount      = ref(0)
const totalPages      = ref(1)

const emptyForm = () => ({
  title: '', professor_id: '', body: '',
  published: false, published_at: '',
  interviewer: '', venue: '', publication: '',
})
const form = ref(emptyForm())

// ── API ───────────────────────────────────────────────────────────────────────
async function fetchItems() {
  loading.value = true
  error.value   = null
  try {
    const params = { type: props.contentType, page: page.value }
    if (search.value)          params.search       = search.value
    if (professorFilter.value) params.professor_id = professorFilter.value
    if (statusFilter.value)    params.published    = statusFilter.value === 'published'

    const res = await getTextContent(params)
    items.value      = res.data.items ?? res.data
    totalCount.value = res.data.total ?? items.value.length
    totalPages.value = res.data.total_pages ?? 1
  } catch (e) {
    error.value = `Could not load ${pageTitle.value.toLowerCase()}.`
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function save() {
  formError.value = null
  if (!form.value.title || !form.value.professor_id || !form.value.body) {
    formError.value = 'Title, professor and content body are required.'; return
  }
  saving.value = true
  try {
    const payload = { ...form.value, type: props.contentType }
    if (editTarget.value) await updateTextContent(editTarget.value.id, payload)
    else                  await createTextContent(payload)
    showModal.value = false
    fetchItems()
  } catch (e) {
    formError.value = e.response?.data?.message ?? 'Save failed.'
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  if (!confirm('Delete this item?')) return
  try {
    await deleteTextContent(id)
    items.value = items.value.filter(i => i.id !== id)
  } catch { alert('Delete failed.') }
}

function openAdd()   { editTarget.value = null; form.value = emptyForm(); showModal.value = true }
function openEdit(i) { editTarget.value = i; form.value = { ...i }; showModal.value = true }
function goPage(p)   { page.value = p; fetchItems() }
function clearFilters() { search.value = ''; professorFilter.value = ''; statusFilter.value = ''; fetchItems() }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' }

// onMounted(async () => {
//   const [, pRes] = await Promise.allSettled([fetchItems(), getProfessors()])
//   if (pRes.status === 'fulfilled') professors.value = pRes.value.data
// })
</script>
