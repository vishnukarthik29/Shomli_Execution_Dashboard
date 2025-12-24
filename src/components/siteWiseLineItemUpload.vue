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
        <span>Back to Summary</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <!-- Header -->
    <div class="mb-6" v-if="!loading">
      <h1 class="text-2xl font-bold text-gray-800">
        {{ $route.params.siteName || 'All Sites' }} - Line Items
      </h1>
      <p class="text-gray-600 mt-1">Total Items: {{ lineItems.length }}</p>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden" v-if="!loading">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 sticky top-0">
            <tr>
              <th
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                S.NO
              </th>
              <th
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Site
              </th>
              <th
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Project Name
              </th>
              <th
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Item Description
              </th>
              <th
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Quantity
              </th>
              <th
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Units
              </th>
              <th
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Material Status
              </th>
              <th
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Work Status
              </th>
              <th
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Completion %
              </th>
              <th
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Completion Amt
              </th>
              <th
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Start Date
              </th>
              <th
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                End Date
              </th>
              <th
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Photos
              </th>
              <th
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in lineItems" :key="item._id" class="hover:bg-gray-50">
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ item.sno }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ item.siteName }}</td>
              <td class="px-3 py-4 text-sm">{{ item.projectName }}</td>
              <td class="px-3 py-4 text-sm">{{ item.category }}</td>
              <td class="px-3 py-4 text-sm">{{ item.itemDescription }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ item.quantity }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ item.units }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs',
                    item.materialStatus === 'Intialized/Delivered'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800',
                  ]"
                >
                  {{ item.materialStatus }}
                </span>
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ formatDate(item.startDate) }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ formatDate(item.endDate) }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ item.workStatusInUnits }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                {{ item.workCompletionPercentage }}%
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                {{ formatCurrency(item.workCompletionAmount) }}
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">
                <button
                  @click="openPhotoManager(item)"
                  class="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span class="text-xs font-medium">{{ getTotalPhotoCount(item) }}</span>
                </button>
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">
                <button @click="openEditModal(item)" class="text-blue-600 hover:text-blue-800">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="lineItems.length === 0" class="text-center py-12 text-gray-500">
        No line items found
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="editingItem"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h3 class="text-xl font-bold mb-4">Edit Line Item</h3>
        <div class="grid grid-cols-2 gap-4">
          <!-- <div>
            <label class="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              v-model.number="editingItem.quantity"
              class="w-full px-3 py-2 border rounded-lg"
            />
          </div> -->
          <!-- <div>
            <label class="block text-sm font-medium mb-1">Material Status</label>
            <select v-model="editingItem.materialStatus" class="w-full px-3 py-2 border rounded-lg">
              <option>Not Delivered</option>
              <option>Intialized/Delivered</option>
            </select>
          </div> -->
          <div>
            <label class="block text-sm font-medium mb-1">Work Status (Units)</label>
            <input
              type="number"
              v-model.number="editingItem.workStatusInUnits"
              class="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
        <div class="mt-6 flex gap-3 justify-end">
          <button @click="editingItem = null" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            @click="updateLineItem"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Photo Manager Component -->
    <PhotoManager
      :is-open="photoManagerState.open"
      :line-item-id="photoManagerState.lineItemId"
      :item-data="photoManagerState.itemData"
      :asset-base="ASSET_BASE"
      @close="closePhotoManager"
      @photos-updated="handlePhotosUpdated"
      @error="handlePhotoError"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import PhotoManager from './PhotoManager.vue'

const route = useRoute()
const lineItems = ref([])
const loading = ref(false)
const error = ref(null)
const editingItem = ref(null)

// Asset base URL - can be moved to config
const ASSET_BASE = 'http://192.168.29.237:7001'

// Photo manager state
const photoManagerState = ref({
  open: false,
  lineItemId: null,
  itemData: null,
})

// Fetch line items
const fetchLineItems = async () => {
  loading.value = true
  error.value = null
  try {
    const siteName = route.params.siteName
    const params = siteName ? { siteName } : {}
    const response = await axios.get(`/gateway/api/line-items/site`, { params })
    lineItems.value = response.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to fetch line items'
  } finally {
    loading.value = false
  }
}

// Format functions
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value || 0)
}

const getTotalPhotoCount = (item) => {
  return (
    (item.materialPhoto?.length || 0) +
    (item.workCompletionPhoto?.length || 0) +
    (item.finishedPhoto?.length || 0)
  )
}

// Edit modal functions
const openEditModal = (item) => {
  editingItem.value = { ...item }
}

const updateLineItem = async () => {
  loading.value = true
  try {
    const response = await axios.put(
      `/gateway/api/line-items/${editingItem.value._id}`,
      editingItem.value,
    )
    if (response.status === 200) {
      await fetchLineItems()
      editingItem.value = null
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to update line item'
  } finally {
    loading.value = false
  }
}

// Photo manager functions
const openPhotoManager = (item) => {
  photoManagerState.value = {
    open: true,
    lineItemId: item._id,
    itemData: item,
  }
}

const closePhotoManager = () => {
  photoManagerState.value = {
    open: false,
    lineItemId: null,
    itemData: null,
  }
}

const handlePhotosUpdated = () => {
  // Optionally refresh the line items to get updated photo counts
  fetchLineItems()
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const handlePhotoError = (errorMsg) => {
  error.value = errorMsg
  setTimeout(() => {
    error.value = null
  }, 5000)
}

// Initialize on mount
onMounted(() => {
  fetchLineItems()
})
</script>
