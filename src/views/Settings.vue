<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-h1">Settings</div>
        <div class="page-desc">Configure your store and platform preferences</div>
      </div>
    </div>

    <div class="grid-2">
      <!-- Store Settings -->
      <div class="card">
        <div class="card-header"><div class="card-title">🏪 Store Settings</div></div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Store Name</label>
            <input class="form-control" v-model="store.name" />
          </div>
          <div class="form-group">
            <label class="form-label">Contact Email</label>
            <input class="form-control" type="email" v-model="store.email" />
          </div>
          <div class="form-group">
            <label class="form-label">Currency</label>
            <select class="form-control" v-model="store.currency">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="IRR">IRR (﷼)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Store Description</label>
            <textarea class="form-control" rows="3" v-model="store.description"></textarea>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary" @click="saveStore" :disabled="savingStore">
            {{ savingStore ? '⏳ Saving...' : '💾 Save Changes' }}
          </button>
          <span class="save-feedback" v-if="storeSaved">✅ Saved!</span>
        </div>
      </div>

      <!-- Appearance -->
      <div class="card">
        <div class="card-header"><div class="card-title">🎨 Appearance</div></div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Theme</label>
            <div style="display:flex; gap:12px; margin-top:4px;">
              <div v-for="t in ['light','dark']" :key="t"
                   @click="setTheme(t)"
                   style="cursor:pointer; border-radius:10px; border:2px solid; overflow:hidden; width:80px; transition:border-color 0.2s;"
                   :style="{ borderColor: theme === t ? 'var(--accent)' : 'var(--border)' }">
                <div style="height:40px;" :style="{ background: t === 'light' ? '#F7F5F0' : '#1A1814' }"></div>
                <div style="height:20px;" :style="{ background: t === 'light' ? '#1A1814' : '#111009' }"></div>
                <div style="padding:4px; text-align:center; font-size:11px; font-weight:600; color:var(--text-secondary);">
                  {{ t.charAt(0).toUpperCase() + t.slice(1) }}
                </div>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Accent Color</label>
            <div style="display:flex; gap:8px; margin-top:4px; flex-wrap:wrap;">
              <div v-for="c in accentColors" :key="c.value"
                   @click="setAccent(c.value)"
                   :title="c.name"
                   style="width:30px; height:30px; border-radius:50%; cursor:pointer; border:2px solid transparent; transition:all 0.2s;"
                   :style="{ background: c.value, borderColor: activeAccent === c.value ? 'var(--text-primary)' : 'transparent' }">
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Items per Page (tables)</label>
            <select class="form-control" v-model="appearance.perPage">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Archive Settings -->
      <div class="card">
        <div class="card-header"><div class="card-title">📂 Archive Settings</div></div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Max Upload Size (MB)</label>
            <input class="form-control" type="number" v-model="archive.maxUploadMb" />
          </div>
          <div class="form-group">
            <label class="form-label">Allowed Video Formats</label>
            <input class="form-control" v-model="archive.videoFormats" placeholder="mp4, webm, mov" />
          </div>
          <div class="form-group">
            <label class="form-label">Allowed Audio Formats</label>
            <input class="form-control" v-model="archive.audioFormats" placeholder="mp3, wav, ogg" />
          </div>
          <!-- Toggle row -->
          <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-top:1px solid var(--border);">
            <div>
              <div style="font-size:13.5px; font-weight:500;">Auto-generate transcripts</div>
              <div style="font-size:12px; color:var(--text-muted);">For audio and video uploads</div>
            </div>
            <div class="toggle"
                 :style="{ background: archive.autoTranscript ? 'var(--accent)' : 'var(--border)' }"
                 @click="archive.autoTranscript = !archive.autoTranscript">
              <div class="toggle-knob" :style="{ transform: archive.autoTranscript ? 'translateX(20px)' : 'translateX(0)' }"></div>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary" @click="saveArchive" :disabled="savingArchive">
            {{ savingArchive ? '⏳ Saving...' : '💾 Save' }}
          </button>
          <span class="save-feedback" v-if="archiveSaved">✅ Saved!</span>
        </div>
      </div>

      <!-- Notifications -->
      <div class="card">
        <div class="card-header"><div class="card-title">🔔 Notifications</div></div>
        <div class="card-body">
          <div v-for="n in notifications" :key="n.key"
               style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border);">
            <div>
              <div style="font-size:13.5px; font-weight:500;">{{ n.label }}</div>
              <div style="font-size:12px; color:var(--text-muted);">{{ n.desc }}</div>
            </div>
            <div class="toggle"
                 :style="{ background: n.on ? 'var(--accent)' : 'var(--border)' }"
                 @click="n.on = !n.on">
              <div class="toggle-knob" :style="{ transform: n.on ? 'translateX(20px)' : 'translateX(0)' }"></div>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary" @click="saveNotifications">💾 Save Preferences</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()

// ── Accent color management ───────────────────────────────────────────────────
const activeAccent = ref(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#C4873A')
const accentColors = [
  { name: 'Amber',  value: '#C4873A' },
  { name: 'Forest', value: '#4A8C6F' },
  { name: 'Ocean',  value: '#4A7FA8' },
  { name: 'Ruby',   value: '#B85555' },
  { name: 'Violet', value: '#8A6FC4' },
]

function setTheme(t)  { if (t !== theme.value) toggleTheme() }
function setAccent(c) {
  activeAccent.value = c
  document.documentElement.style.setProperty('--accent', c)
  localStorage.setItem('accent', c)
}

// ── Store settings ────────────────────────────────────────────────────────────
const store = ref({ name: 'Academica Bookstore', email: 'admin@academica.com', currency: 'USD', description: '' })
const savingStore = ref(false)
const storeSaved  = ref(false)

async function saveStore() {
  savingStore.value = true
  try {
    // await updateSettings('store', store.value)  ← uncomment when API ready
    await new Promise(r => setTimeout(r, 600))  // simulate API
    storeSaved.value = true
    setTimeout(() => storeSaved.value = false, 2000)
  } finally { savingStore.value = false }
}

// ── Archive settings ──────────────────────────────────────────────────────────
const archive = ref({ maxUploadMb: 500, videoFormats: 'mp4, webm, mov', audioFormats: 'mp3, wav, ogg', autoTranscript: true })
const savingArchive = ref(false)
const archiveSaved  = ref(false)

async function saveArchive() {
  savingArchive.value = true
  try {
    await new Promise(r => setTimeout(r, 600))
    archiveSaved.value = true
    setTimeout(() => archiveSaved.value = false, 2000)
  } finally { savingArchive.value = false }
}

// ── Appearance ────────────────────────────────────────────────────────────────
const appearance = ref({ perPage: 25 })

// ── Notifications ─────────────────────────────────────────────────────────────
const notifications = ref([
  { key: 'new_order',  label: 'New Order Alerts',         desc: 'Get notified for every new order',       on: true  },
  { key: 'low_stock',  label: 'Low Stock Warnings',       desc: 'Alert when book stock drops below 5',    on: true  },
  { key: 'new_user',   label: 'New User Registration',    desc: 'Daily digest of new signups',            on: false },
  { key: 'upload_done',label: 'Media Upload Completion',  desc: 'Notify when upload processing is done',  on: true  },
])

async function saveNotifications() {
  // await updateSettings('notifications', notifications.value)
  alert('Notification preferences saved!')
}
</script>

<style scoped>
.save-feedback {
  font-size: 13px;
  color: var(--success);
  font-weight: 500;
  animation: fadeInUp 0.3s ease;
}
</style>
