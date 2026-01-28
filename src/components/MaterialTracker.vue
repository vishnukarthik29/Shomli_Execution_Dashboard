<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Back Button -->
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

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <!-- Header -->
    <div class="mb-6 flex items-center justify-between" v-if="!loading">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">
          {{ $route.params.siteName || 'All Sites' }} - Line Items
        </h1>
        <p class="text-gray-600 mt-1">Total Items: {{ filteredLineItems.length }}</p>
      </div>

      <!-- Material Tracker Button -->
      <router-link
        :to="{
          name: 'MaterialItems',
          params: { siteName: $route.params.siteName },
        }"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-cyan-700 transition flex items-center gap-2"
      >
        Materials Items
      </router-link>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6" v-if="!loading">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            type="text"
            v-model="filters.search"
            placeholder="Search description..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            v-model="filters.category"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option v-for="cat in uniqueCategories" :key="cat" :value="cat">{{ cat }}</option>
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
          <thead class="bg-gray-50 sticky top-0">
            <tr>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.NO</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Item Description
              </th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Quantity
              </th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in filteredLineItems" :key="item._id">
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ item.sno }}</td>
              <td class="px-3 py-4 text-sm">{{ item.category }}</td>
              <td class="px-3 py-4 text-sm">{{ item.itemDescription }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ item.quantity }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ item.units }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ formatCurrency(item.rate) }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm font-medium">
                {{ formatCurrency(item.amount) }}
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">
                <div class="flex gap-2">
                  <button
                    @click="openEditModal(item)"
                    class="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        v-if="filteredLineItems.length === 0 && !loading"
        class="text-center py-12 text-gray-500"
      >
        No line items found matching your filters.
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="editingItem"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold">Edit Line Item</h3>

          <div class="flex gap-3">
            <button
              @click="addMaterialRow"
              class="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Material
            </button>

            <button
              @click="editingItem = null"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              @click="updateLineItem"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>

        <!-- Materials Table -->
        <div class="w-full mb-6">
          <div class="border rounded-lg overflow-hidden">
            <table class="w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Material Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th
                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase w-32"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="!editingItem.materials || editingItem.materials.length === 0">
                  <td colspan="3" class="px-6 py-12 text-center text-sm text-gray-500">
                    No materials added yet. Click "Add Material" to begin.
                  </td>
                </tr>
                <tr v-for="(material, index) in editingItem.materials" :key="index">
                  <td class="px-6 py-4">
                    <input
                      type="text"
                      v-model="material.name"
                      placeholder="Enter material name"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td class="px-6 py-4">
                    <input
                      type="number"
                      v-model.number="material.quantity"
                      placeholder="0"
                      step="0.01"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td class="px-6 py-4 text-center">
                    <button
                      @click="removeMaterialRow(index)"
                      class="inline-flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Remove material"
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
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Shop Drawing, TDS, Samples Radio Buttons -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Shop Drawing -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label class="block text-sm font-medium text-gray-700 mb-3">Shop Drawing</label>
            <div class="flex gap-6">
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  v-model="editingItem.shopDrawing"
                  value="Internal"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Internal</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  v-model="editingItem.shopDrawing"
                  value="External"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">External</span>
              </label>
            </div>
          </div>

          <!-- TDS -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label class="block text-sm font-medium text-gray-700 mb-3">TDS</label>
            <div class="flex gap-6">
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  v-model="editingItem.TDS"
                  value="yes"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Yes</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  v-model="editingItem.TDS"
                  value="no"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          <!-- Samples -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label class="block text-sm font-medium text-gray-700 mb-3">Samples</label>
            <div class="flex gap-6">
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  v-model="editingItem.Samples"
                  value="yes"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Yes</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  v-model="editingItem.Samples"
                  value="no"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const lineItems = ref([])
const loading = ref(false)
const error = ref(null)
const editingItem = ref(null)

const filters = ref({
  search: '',
  category: '',
})

const props = defineProps({
  apiBaseUrl: {
    type: String,
    default: '/gateway/api',
  },
})

// Computed: Unique categories
const uniqueCategories = computed(() => {
  const categories = lineItems.value.map((item) => item.category)
  return [...new Set(categories)].sort()
})

// Computed: Filtered line items
const filteredLineItems = computed(() => {
  let filtered = [...lineItems.value]

  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.itemDescription?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower) ||
        item.siteName?.toLowerCase().includes(searchLower),
    )
  }

  if (filters.value.category) {
    filtered = filtered.filter((item) => item.category === filters.value.category)
  }

  return filtered
})

const fetchLineItems = async () => {
  loading.value = true
  error.value = null

  try {
    const siteName = route.params.siteName
    const params = siteName ? { siteName } : {}
    const response = await axios.get(`${props.apiBaseUrl}/line-items/site`, { params })
    lineItems.value = response.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to fetch line items'
    console.error('Error fetching line items:', err)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value || 0)
}

const clearFilters = () => {
  filters.value = {
    search: '',
    category: '',
  }
}

const openEditModal = (item) => {
  editingItem.value = {
    ...item,
    materials: item.materials && item.materials.length > 0 ? [...item.materials] : [],
    shopDrawing: item.shopDrawing || null,
    TDS: item.TDS || null,
    Samples: item.Samples || null,
  }
}

const addMaterialRow = () => {
  if (!editingItem.value.materials) {
    editingItem.value.materials = []
  }
  editingItem.value.materials.push({
    name: '',
    quantity: 0,
  })
}

const removeMaterialRow = (index) => {
  if (confirm('Are you sure you want to remove this material?')) {
    editingItem.value.materials.splice(index, 1)
  }
}

const updateLineItem = async () => {
  loading.value = true
  error.value = null

  try {
    const payload = {
      materials: editingItem.value.materials || [],
      shopDrawing: editingItem.value.shopDrawing,
      TDS: editingItem.value.TDS,
      Samples: editingItem.value.Samples,
    }

    const response = await axios.put(
      `${props.apiBaseUrl}/line-items/${editingItem.value._id}`,
      payload,
    )

    if (response.status === 200) {
      await fetchLineItems()
      editingItem.value = null
      error.value = null
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to update line item'
    console.error('Error updating line item:', err)
  } finally {
    loading.value = false
  }
}

const deleteItem = async (id) => {
  if (!confirm('Are you sure you want to delete this item?')) return

  try {
    await axios.delete(`${props.apiBaseUrl}/line-items/${id}`)
    await fetchLineItems()
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to delete item'
  }
}

onMounted(() => {
  fetchLineItems()
})
</script>
