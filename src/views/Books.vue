<template>
  <div>
    <div class="page-header">
      <div>
        <div class="page-h1">Book Catalog</div>
        <div class="page-desc">Manage your bookstore inventory and pricing</div>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary">📥 Import CSV</button>
        <button class="btn btn-primary" @click="openAdd">＋ Add Book</button>
      </div>
    </div>

    <!-- Category filter pills -->
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px; flex-wrap:wrap;">
      <div class="filter-pills">
        <div class="pill" v-for="cat in categories" :key="cat"
             :class="{ active: activeCategory === cat }"
             @click="setCategory(cat)">
          {{ cat }}
        </div>
      </div>
      <select class="form-control" style="width:150px; margin-left:auto;"
              v-model="sortBy" @change="fetchBooks">
        <option value="-created_at">Newest First</option>
        <option value="price">Price ↑</option>
        <option value="-price">Price ↓</option>
        <option value="title">Title A–Z</option>
      </select>
    </div>

    <div class="loading-state" v-if="loading">⏳ Loading books...</div>
    <div class="error-state"   v-else-if="error">{{ error }}</div>

    <template v-else>
      <div class="book-grid" v-if="books.length > 0">
        <div class="book-card" v-for="b in books" :key="b.id">
          <div class="book-cover" :style="{ background: bookGradient(b) }">
            <div class="book-cover-spine" :style="{ background: b.spine_color ?? '#C4873A' }"></div>
            <div class="book-cover-emoji">{{ b.emoji ?? '📖' }}</div>
            <div class="book-cover-title">{{ b.title }}</div>
          </div>
          <div class="book-info">
            <div class="book-author">{{ b.author }}</div>
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <div class="book-price">${{ b.price }}</div>
              <span class="badge"
                    :class="b.stock > 10 ? 'badge-success' : b.stock > 0 ? 'badge-warning' : 'badge-danger'">
                {{ b.stock > 10 ? 'In Stock' : b.stock > 0 ? 'Low Stock' : 'Out of Stock' }}
              </span>
            </div>
            <div style="font-size:11.5px; color:var(--text-muted); margin-top:4px;">
              {{ b.stock }} copies · {{ b.sold_count ?? 0 }} sold
            </div>
          </div>
          <div class="card-footer" style="padding:10px 14px;">
            <button class="btn btn-ghost btn-sm" style="flex:1;" @click="openEdit(b)">✏️ Edit</button>
            <button class="btn btn-primary btn-sm" style="flex:1;">Details</button>
          </div>
        </div>
      </div>
      <div class="empty-state" v-else>
        <div class="empty-icon">📚</div>
        <div>No books found. Add your first book!</div>
      </div>

      <!-- Pagination -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:24px;" v-if="totalPages > 1">
        <span style="font-size:12.5px; color:var(--text-muted);">
          Showing {{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, totalCount) }} of {{ totalCount }}
        </span>
        <div class="pagination">
          <button class="btn btn-secondary btn-sm" :disabled="page === 1" @click="goPage(page - 1)">← Prev</button>
          <button class="btn btn-sm" v-for="p in totalPages" :key="p"
                  :class="p === page ? 'btn-primary' : 'btn-secondary'"
                  @click="goPage(p)">{{ p }}</button>
          <button class="btn btn-secondary btn-sm" :disabled="page === totalPages" @click="goPage(page + 1)">Next →</button>
        </div>
      </div>
    </template>

    <!-- Add / Edit Modal -->
    <AppModal :title="editTarget ? 'Edit Book' : 'Add New Book'" :open="showModal" @close="showModal = false">
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Title *</label>
          <input class="form-control" v-model="form.title" placeholder="Book title" />
        </div>
        <div class="form-group">
          <label class="form-label">Author *</label>
          <input class="form-control" v-model="form.author" placeholder="Author name" />
        </div>
        <div class="form-group">
          <label class="form-label">ISBN</label>
          <input class="form-control" v-model="form.isbn" placeholder="978-0-..." />
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-control" v-model="form.category">
            <option>Philosophy</option>
            <option>Literature</option>
            <option>Science</option>
            <option>History</option>
            <option>Arts</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Price ($) *</label>
          <input class="form-control" type="number" step="0.01" v-model="form.price" placeholder="29.99" />
        </div>
        <div class="form-group">
          <label class="form-label">Stock Count *</label>
          <input class="form-control" type="number" v-model="form.stock" placeholder="50" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-control" rows="3" v-model="form.description" placeholder="Brief book description..."></textarea>
      </div>
      <div class="error-state" v-if="formError">{{ formError }}</div>
      <template #footer>
        <button class="btn btn-secondary" @click="showModal = false">Cancel</button>
        <button class="btn btn-primary" @click="saveBook" :disabled="saving">
          {{ saving ? '⏳ Saving...' : editTarget ? 'Save Changes' : 'Add Book' }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getBooks, createBook, updateBook } from '@/api'
import AppModal from '@/components/AppModal.vue'

// ── State ─────────────────────────────────────────────────────────────────────
const books          = ref([])
const loading        = ref(true)
const error          = ref(null)
const showModal      = ref(false)
const saving         = ref(false)
const formError      = ref(null)
const editTarget     = ref(null)   // null = adding, object = editing
const activeCategory = ref('All')
const sortBy         = ref('-created_at')
const page           = ref(1)
const perPage        = ref(20)
const totalCount     = ref(0)
const totalPages     = ref(1)

const categories = ['All', 'Philosophy', 'Literature', 'Science', 'History', 'Arts']

const emptyForm = () => ({ title: '', author: '', isbn: '', category: 'Philosophy', price: '', stock: '', description: '' })
const form = ref(emptyForm())

// ── API calls ─────────────────────────────────────────────────────────────────
async function fetchBooks() {
  loading.value = true
  error.value   = null
  try {
    const params = {
      sort: sortBy.value,
      page: page.value,
      per_page: perPage.value,
    }
    if (activeCategory.value !== 'All') params.category = activeCategory.value

    const res         = await getBooks(params)
    // Adjust to match what your backend actually returns:
    books.value       = res.data.items ?? res.data   // array of books
    totalCount.value  = res.data.total ?? books.value.length
    totalPages.value  = res.data.total_pages ?? 1
  } catch (e) {
    error.value = 'Could not load books.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function saveBook() {
  formError.value = null
  if (!form.value.title || !form.value.author || !form.value.price) {
    formError.value = 'Title, author and price are required.'
    return
  }
  saving.value = true
  try {
    if (editTarget.value) {
      await updateBook(editTarget.value.id, form.value)
    } else {
      await createBook(form.value)
    }
    showModal.value = false
    fetchBooks()   // reload list
  } catch (e) {
    formError.value = e.response?.data?.message ?? 'Save failed. Please try again.'
  } finally {
    saving.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function setCategory(cat) {
  activeCategory.value = cat
  page.value = 1
  fetchBooks()
}

function goPage(p) {
  page.value = p
  fetchBooks()
}

function openAdd() {
  editTarget.value = null
  form.value       = emptyForm()
  showModal.value  = true
}

function openEdit(book) {
  editTarget.value = book
  form.value = { ...book }  // copy fields into form
  showModal.value  = true
}

// Deterministic gradient from book title
function bookGradient(book) {
  return book.cover_gradient ?? 'linear-gradient(160deg, #2A2418 0%, #1A1410 100%)'
}

onMounted(fetchBooks)
</script>
