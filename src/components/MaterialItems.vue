<!-- components/MaterialsTracking.vue -->
<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="mb-4">
      <button
        @click="$router.back()"
        class="flex items-center gap-2 text-gray-600 hover:text-gray-800"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>Back</span>
      </button>
    </div>
    <!-- Header -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Materials Tracking</h1>
        <p class="text-gray-600 mt-1">Manage materials, certificates, samples, and shop drawings</p>
      </div>
      <button
        @click="openAddModal"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Material
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6" v-if="!loading">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Search Material</label>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search by material name..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">TDS Certificate</label>
          <select
            v-model="filters.tdsCertificate"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="Submitted">Submitted</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Shop Drawing</label>
          <select
            v-model="filters.shopDrawing"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="Internal">Internal</option>
            <option value="External">External</option>
            <option value="Not Required">Not Required</option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button
          @click="clearFilters"
          class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden" v-if="!loading">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Material Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Quantity
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                TDS Certificate
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Samples
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Shop Drawing
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, index) in filteredMaterials" :key="item._id">
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ index + 1 }}</td>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ item.materialName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                {{ item.quantity }} {{ item.unit }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  :class="{
                    'bg-green-100 text-green-800': item.tdsCertificate === 'Approved',
                    'bg-blue-100 text-blue-800': item.tdsCertificate === 'Submitted',
                    'bg-yellow-100 text-yellow-800': item.tdsCertificate === 'Pending',
                    'bg-red-100 text-red-800': item.tdsCertificate === 'Rejected',
                  }"
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ item.tdsCertificate }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  :class="{
                    'bg-green-100 text-green-800': item.samples === 'Approved',
                    'bg-blue-100 text-blue-800': item.samples === 'Submitted',
                    'bg-yellow-100 text-yellow-800': item.samples === 'Pending',
                    'bg-red-100 text-red-800': item.samples === 'Rejected',
                  }"
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ item.samples }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  :class="{
                    'bg-purple-100 text-purple-800': item.shopDrawing === 'Internal',
                    'bg-indigo-100 text-indigo-800': item.shopDrawing === 'External',
                    'bg-gray-100 text-gray-800': item.shopDrawing === 'Not Required',
                  }"
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ item.shopDrawing }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex gap-2">
                  <button
                    @click="openEditModal(item)"
                    class="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="deleteItem(item._id)"
                    class="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="filteredMaterials.length === 0 && !loading"
        class="text-center py-12 text-gray-500"
      >
        No materials found matching your filters.
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold mb-6">{{ isEditMode ? 'Edit Material' : 'Add Material' }}</h3>

        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Material Name *</label>
            <input
              type="text"
              v-model="formData.materialName"
              placeholder="Enter material name"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
            <input
              type="number"
              v-model.number="formData.quantity"
              placeholder="0"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Unit</label>
            <input
              type="text"
              v-model="formData.unit"
              placeholder="e.g., kg, m², pcs"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">TDS Certificate *</label>
            <select
              v-model="formData.tdsCertificate"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Pending">Pending</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Samples *</label>
            <select
              v-model="formData.samples"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Pending">Pending</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Shop Drawing *</label>
            <div class="flex gap-6">
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  v-model="formData.shopDrawing"
                  value="Internal"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Internal</span>
              </label>

              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  v-model="formData.shopDrawing"
                  value="External"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">External</span>
              </label>

              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  v-model="formData.shopDrawing"
                  value="Not Required"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Not Required</span>
              </label>
            </div>
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              v-model="formData.notes"
              rows="3"
              placeholder="Additional notes or comments..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>
        </div>

        <div class="mt-6 flex gap-3 justify-end">
          <button
            @click="closeModal"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="saveMaterial"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {{ isEditMode ? 'Update' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  apiBaseUrl: {
    type: String,
    default: '/gateway/api',
  },
})

const materials = ref([])
const loading = ref(false)
const error = ref(null)
const showModal = ref(false)
const isEditMode = ref(false)
const searchQuery = ref('')

const filters = ref({
  tdsCertificate: '',
  shopDrawing: '',
})

const formData = ref({
  materialName: '',
  quantity: 0,
  unit: '',
  tdsCertificate: 'Pending',
  samples: 'Pending',
  shopDrawing: 'Internal',
  notes: '',
})

// Computed: Filtered materials
const filteredMaterials = computed(() => {
  let filtered = [...materials.value]

  // Search filter
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    filtered = filtered.filter((item) => item.materialName?.toLowerCase().includes(search))
  }

  // TDS Certificate filter
  if (filters.value.tdsCertificate) {
    filtered = filtered.filter((item) => item.tdsCertificate === filters.value.tdsCertificate)
  }

  // Shop Drawing filter
  if (filters.value.shopDrawing) {
    filtered = filtered.filter((item) => item.shopDrawing === filters.value.shopDrawing)
  }

  return filtered
})

const fetchMaterials = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await axios.get(`${props.apiBaseUrl}/materials`)
    materials.value = response.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to fetch materials'
    console.error('Error fetching materials:', err)
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  isEditMode.value = false
  formData.value = {
    materialName: '',
    quantity: 0,
    unit: '',
    tdsCertificate: 'Pending',
    samples: 'Pending',
    shopDrawing: 'Internal',
    notes: '',
  }
  showModal.value = true
}

const openEditModal = (item) => {
  isEditMode.value = true
  formData.value = { ...item }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = {
    materialName: '',
    quantity: 0,
    unit: '',
    tdsCertificate: 'Pending',
    samples: 'Pending',
    shopDrawing: 'Internal',
    notes: '',
  }
}

const saveMaterial = async () => {
  if (!formData.value.materialName) {
    error.value = 'Material name is required'
    return
  }

  loading.value = true
  error.value = null

  try {
    if (isEditMode.value) {
      await axios.put(`${props.apiBaseUrl}/materials/${formData.value._id}`, formData.value)
    } else {
      await axios.post(`${props.apiBaseUrl}/materials`, formData.value)
    }
    await fetchMaterials()
    closeModal()
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to save material'
  } finally {
    loading.value = false
  }
}

const deleteItem = async (id) => {
  if (!confirm('Are you sure you want to delete this material?')) return

  loading.value = true
  try {
    await axios.delete(`${props.apiBaseUrl}/materials/${id}`)
    await fetchMaterials()
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to delete material'
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  filters.value = {
    tdsCertificate: '',
    shopDrawing: '',
  }
}

onMounted(() => {
  fetchMaterials()
})
</script>
