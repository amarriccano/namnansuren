<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-h1">Audio / Video</div>
        <div class="page-desc">Professor recorded lectures, talks and audio sessions</div>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary">📥 Bulk Upload</button>
        <button class="btn btn-primary" @click="openAdd">＋ Add Media</button>
      </div>
    </div>

    <!-- Tabs + Filters -->
    <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
      <div class="tabs">
        <div class="tab-btn" :class="{ active: typeTab === '' }"      @click="setTab('')">All ({{ totalCount }})</div>
        <div class="tab-btn" :class="{ active: typeTab === 'video' }" @click="setTab('video')">🎬 Video</div>
        <div class="tab-btn" :class="{ active: typeTab === 'audio' }" @click="setTab('audio')">🎧 Audio</div>
      </div>
      <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        <input class="form-control" style="width:200px;" placeholder="Search..." v-model="search" @keyup.enter="fetchMedia" />
      </div>
    </div>

    <div class="loading-state" v-if="loading">⏳ Loading media...</div>
    <div class="error-state"   v-else-if="error">{{ error }}</div>

    <template v-else>
      <div class="media-grid" v-if="items.length > 0">
        <div class="media-card" v-for="m in items" :key="m.id">
          <div class="media-thumb" :class="m.type">
            <span>{{ m.type === 'video' ? '🎬' : '🎧' }}</span>
            <span class="media-type-tag" :class="m.type">{{ m.type.toUpperCase() }}</span>
            <span class="media-duration" v-if="m.duration">{{ m.duration }}</span>
          </div>
          <div class="media-info">
            <div class="media-title">{{ m.title }}</div>
          </div>
          <div class="media-footer">
            <div class="media-stats">
              <span>👁 {{ m.views ?? 0 }}</span>
              <span>❤️ {{ m.likes ?? 0 }}</span>
            </div>
            <div style="display:flex; gap:4px;">
              <button class="btn btn-ghost btn-icon btn-sm" @click="openEdit(m)">✏️</button>
              <button class="btn btn-danger-ghost btn-icon btn-sm" @click="remove(m.id)">🗑</button>
            </div>
          </div>
        </div>
      </div>
      <div class="empty-state" v-else>
        <div class="empty-icon">🎬</div>
        <div>No media found. Upload your first video or audio!</div>
      </div>
    </template>

    <!-- Add/Edit Modal -->
    <AppModal :title="editTarget ? 'Edit Media' : 'Add Audio / Video'" :open="showModal" @close="showModal = false">
      <div class="form-group">
        <label class="form-label">Type *</label>
        <div style="display:flex; gap:10px;">
          <div v-for="t in ['video','audio']" :key="t"
               style="flex:1; padding:10px; border-radius:var(--radius-md); border:1px solid var(--border); text-align:center; cursor:pointer; font-size:13px; transition:all 0.2s;"
               :style="{ borderColor: form.type===t ? 'var(--accent)' : '', background: form.type===t ? 'var(--accent-light)' : '', color: form.type===t ? 'var(--accent)' : '' }"
               @click="form.type = t">
            {{ t === 'video' ? '🎬 Video' : '🎧 Audio' }}
          </div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Title *</label>
        <input class="form-control" v-model="form.title" placeholder="Media title" />
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Duration (e.g. 1:24:30)</label>
          <input class="form-control" v-model="form.duration" placeholder="HH:MM:SS" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">File URL *</label>
        <input class="form-control" v-model="form.url" placeholder="https://..." />
      </div>
      <div class="error-state" v-if="formError">{{ formError }}</div>
      <template #footer>
        <button class="btn btn-secondary" @click="showModal = false">Cancel</button>
        <button class="btn btn-primary" @click="save" :disabled="saving">
          {{ saving ? '⏳ Saving...' : editTarget ? 'Save Changes' : 'Add Media' }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMedia, createMedia, updateMedia, deleteMedia } from '@/api'
import AppModal from '@/components/AppModal.vue'

const items           = ref([])
const loading         = ref(true)
const error           = ref(null)
const showModal       = ref(false)
const saving          = ref(false)
const formError       = ref(null)
const editTarget      = ref(null)
const typeTab         = ref('')
const search          = ref('')
const totalCount      = ref(0)

const emptyForm = () => ({ type: 'video', title: '', duration: '', url: '' })
const form = ref(emptyForm())

async function fetchMedia() {
  loading.value = true
  error.value   = null
  try {
    const params = {}
    if (typeTab.value)         params.type         = typeTab.value
    if (search.value)          params.search        = search.value
    const res    = await getMedia(params)
    items.value  = res.data.items ?? res.data
    totalCount.value = res.data.total ?? items.value.length
  } catch (e) {
    error.value = 'Could not load media.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function save() {
  formError.value = null
  if (!form.value.title || !form.value.url) {
    formError.value = 'Title and URL are required.'; return
  }
  saving.value = true
  try {
    if (editTarget.value) await updateMedia(editTarget.value.id, form.value)
    else                  await createMedia(form.value)
    showModal.value = false
    fetchMedia()
  } catch (e) {
    formError.value = e.response?.data?.message ?? 'Save failed.'
  } finally {
    saving.value = false
  }
}

async function remove(id) {
  if (!confirm('Delete this media item?')) return
  try {
    await deleteMedia(id)
    items.value = items.value.filter(m => m.id !== id)
  } catch { alert('Delete failed.') }
}

function setTab(t)   { typeTab.value = t;  fetchMedia() }
function openAdd()   { editTarget.value = null; form.value = emptyForm(); showModal.value = true }
function openEdit(m) { editTarget.value = m; form.value = { ...m }; showModal.value = true }

// onMounted(async () => {
//   const [, pRes] = await Promise.allSettled([fetchMedia(), getProfessors()])
//   if (pRes.status === 'fulfilled') professors.value = pRes.value.data
// })
</script>
