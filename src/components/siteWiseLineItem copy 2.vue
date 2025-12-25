<!-- components/siteWiseLineItem.vue -->
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

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <!-- Header -->
    <div class="mb-6" v-if="!loading">
      <h1 class="text-2xl font-bold text-gray-800">
        {{ $route.params.siteName || 'All Sites' }} - Line Items
      </h1>
      <p class="text-gray-600 mt-1">Total Items: {{ filteredLineItems.length }}</p>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6" v-if="!loading">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Total Items</p>
            <p class="text-2xl font-bold text-gray-800">{{ statistics.totalItems }}</p>
          </div>
          <div class="bg-blue-100 p-3 rounded-full">
            <svg
              class="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Material Not Delivered</p>
            <p class="text-2xl font-bold text-red-600">
              {{ statistics.materialNotDeliveredCount }}
            </p>
            <p class="text-xs text-gray-500">Delayed items</p>
          </div>
          <div class="bg-red-100 p-3 rounded-full">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Delivered but Incomplete</p>
            <p class="text-2xl font-bold text-orange-600">
              {{ statistics.deliveredIncompleteCount }}
            </p>
            <p class="text-xs text-gray-500">Work in progress</p>
          </div>
          <div class="bg-orange-100 p-3 rounded-full">
            <svg
              class="w-6 h-6 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Materials Delivered</p>
            <p class="text-2xl font-bold text-green-600">{{ statistics.deliveredCount }}</p>
            <p class="text-xs text-gray-500">{{ statistics.deliveredPercentage }}% of total</p>
          </div>
          <div class="bg-green-100 p-3 rounded-full">
            <svg
              class="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Overall Work Completion</p>
            <p class="text-2xl font-bold text-blue-600">{{ statistics.overallCompletion }}%</p>
            <p class="text-xs text-gray-500">Average across all items</p>
          </div>
          <div class="bg-blue-100 p-3 rounded-full">
            <svg
              class="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Second Row Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" v-if="!loading">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Total Completed Amount</p>
            <p class="text-2xl font-bold text-purple-600">
              {{ formatCurrency(statistics.completedAmount) }}
            </p>
            <p class="text-xs text-gray-500">Total: {{ formatCurrency(statistics.totalAmount) }}</p>
          </div>
          <div class="bg-purple-100 p-3 rounded-full">
            <svg
              class="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6" v-if="!loading">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
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

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Material Status</label>
          <select
            v-model="filters.materialStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="Delivered">Delivered</option>
            <option value="Not Delivered">Not Delivered</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Completion Range</label>
          <select
            v-model="filters.completionRange"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="0-25">0-25%</option>
            <option value="26-50">26-50%</option>
            <option value="51-75">51-75%</option>
            <option value="76-100">76-100%</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Week Filter (Mon-Sat)</label>
          <select
            v-model="filters.weekFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Weeks</option>
            <option v-for="week in availableWeeks" :key="week.value" :value="week.value">
              {{ week.label }}
            </option>
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
                Rate
              </th>
              <th
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Amount
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
            <tr
              v-for="(item, index) in filteredLineItems"
              :key="item._id"
              :class="[isDelayed(item) ? 'bg-red-50' : '']"
            >
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ item.sno }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ item.siteName }}</td>
              <td class="px-3 py-4 text-sm">{{ item.category }}</td>
              <td class="px-3 py-4 text-sm min-w-75 whitespace-normal">
                {{ item.itemDescription }}
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ item.quantity }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ item.units }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ formatCurrency(item.rate) }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm font-medium">
                {{ formatCurrency(item.amount) }}
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs',
                    item.materialStatus === 'Intialized/Delivered'
                      ? 'bg-green-100 text-green-800'
                      : item.materialStatus === 'Not Delivered'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800',
                  ]"
                >
                  {{ item.materialStatus }}
                </span>
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">{{ item.workStatusInUnits }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-sm">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-blue-600"
                    >{{ item.workCompletionPercentage }}%</span
                  >
                </div>
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                {{ formatCurrency(item.workCompletionAmount) }}
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-sm font-medium">
                {{ formatDate(item.startDate) }}
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-sm font-medium">
                {{ formatDate(item.endDate) }}
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="openPhotos(item)"
                  class="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg"
                >
                  View Photos
                </button>
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
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">Edit Line Item</h3>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              v-model="editingItem.startDate"
              class="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              v-model="editingItem.endDate"
              class="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              v-model.number="editingItem.quantity"
              class="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Material Status</label>
            <select v-model="editingItem.materialStatus" class="w-full px-3 py-2 border rounded-lg">
              <option>Not Delivered</option>
              <option>Intialized/Delivered</option>
            </select>
          </div>
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
    </div>

    <!-- Photo Manager Component -->
    <PhotoManager
      :is-open="photoState.open"
      :line-item-id="photoState.lineItemId"
      :item-data="photoState.itemData"
      :asset-base="ASSET_BASE_URL"
      @close="closePhotos"
      @photos-updated="handlePhotosUpdated"
      @error="handleError"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import PhotoManager from '@/components/PhotoManager.vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const lineItems = ref([])
const loading = ref(false)
const error = ref(null)
const editingItem = ref(null)
const availableWeeks = ref([])

const filters = ref({
  search: '',
  category: '',
  materialStatus: '',
  completionRange: '',
  weekFilter: '',
})

const props = defineProps({
  apiBaseUrl: {
    type: String,
    default: '/gateway/api',
  },
})

// Helper function to get Monday of a given date
const getMonday = (date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday
}

// Helper function to get Saturday of a given week
const getSaturday = (monday) => {
  const saturday = new Date(monday)
  saturday.setDate(monday.getDate() + 5) // Monday + 5 days = Saturday
  saturday.setHours(23, 59, 59, 999)
  return saturday
}

// Format date for comparison
const formatDateKey = (date) => {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

// Format date for display
const formatWeekLabel = (monday, saturday) => {
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const monDate = monday.getDate()
  const monMonth = monthNames[monday.getMonth()]
  const monYear = monday.getFullYear()

  const satDate = saturday.getDate()
  const satMonth = monthNames[saturday.getMonth()]
  const satYear = saturday.getFullYear()

  if (monYear === satYear && monMonth === satMonth) {
    return `${monDate}-${satDate} ${monMonth} ${monYear}`
  } else if (monYear === satYear) {
    return `${monDate} ${monMonth} - ${satDate} ${satMonth} ${monYear}`
  } else {
    return `${monDate} ${monMonth} ${monYear} - ${satDate} ${satMonth} ${satYear}`
  }
}

// Generate week options based on line items dates
const generateWeekOptions = () => {
  if (lineItems.value.length === 0) {
    availableWeeks.value = []
    return
  }

  const weeksMap = new Map()

  lineItems.value.forEach((item) => {
    if (item.startDate) {
      const startDate = new Date(item.startDate)
      const monday = getMonday(startDate)
      const saturday = getSaturday(monday)

      const weekKey = `${formatDateKey(monday)}_${formatDateKey(saturday)}`

      if (!weeksMap.has(weekKey)) {
        weeksMap.set(weekKey, {
          value: weekKey,
          label: formatWeekLabel(monday, saturday),
          sortDate: monday.getTime(),
        })
      }
    }

    // Also check end dates
    if (item.endDate) {
      const endDate = new Date(item.endDate)
      const monday = getMonday(endDate)
      const saturday = getSaturday(monday)

      const weekKey = `${formatDateKey(monday)}_${formatDateKey(saturday)}`

      if (!weeksMap.has(weekKey)) {
        weeksMap.set(weekKey, {
          value: weekKey,
          label: formatWeekLabel(monday, saturday),
          sortDate: monday.getTime(),
        })
      }
    }
  })

  // Sort weeks by date (most recent first)
  availableWeeks.value = Array.from(weeksMap.values()).sort((a, b) => b.sortDate - a.sortDate)
}

// Computed: Unique categories for filter dropdown
const uniqueCategories = computed(() => {
  const categories = lineItems.value.map((item) => item.category)
  return [...new Set(categories)].sort()
})

// Computed: Filtered line items
const filteredLineItems = computed(() => {
  let filtered = [...lineItems.value]

  // Search filter
  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.itemDescription?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower) ||
        item.siteName?.toLowerCase().includes(searchLower),
    )
  }

  // Category filter
  if (filters.value.category) {
    filtered = filtered.filter((item) => item.category === filters.value.category)
  }

  // Material status filter
  if (filters.value.materialStatus) {
    filtered = filtered.filter((item) => item.materialStatus === filters.value.materialStatus)
  }

  // Completion range filter
  if (filters.value.completionRange) {
    const [min, max] = filters.value.completionRange.split('-').map(Number)
    filtered = filtered.filter((item) => {
      const completion = item.workCompletionPercentage || 0
      return completion >= min && completion <= max
    })
  }

  // Week filter (Monday to Saturday)
  if (filters.value.weekFilter) {
    const [weekStartStr, weekEndStr] = filters.value.weekFilter.split('_')
    const weekStart = new Date(weekStartStr)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekEndStr)
    weekEnd.setHours(23, 59, 59, 999)

    filtered = filtered.filter((item) => {
      if (!item.startDate) return false

      const startDate = new Date(item.startDate)
      startDate.setHours(0, 0, 0, 0)

      const endDate = item.endDate ? new Date(item.endDate) : null
      if (endDate) endDate.setHours(23, 59, 59, 999)

      // Check if start date is within the week
      const startInWeek = startDate >= weekStart && startDate <= weekEnd

      // Check if end date is within the week
      const endInWeek = endDate && endDate >= weekStart && endDate <= weekEnd

      // Check if the item's date range completely contains the week
      const weekWithinItem = endDate && weekStart >= startDate && weekEnd <= endDate

      // Check if there's any overlap between item dates and week
      const hasOverlap = endDate && startDate <= weekEnd && endDate >= weekStart

      return startInWeek || endInWeek || weekWithinItem || hasOverlap
    })
  }

  return filtered
})

// Computed: Statistics
const statistics = computed(() => {
  const items = filteredLineItems.value

  const totalItems = items.length
  const deliveredCount = items.filter(
    (item) => item.materialStatus === 'Intialized/Delivered',
  ).length
  const deliveredPercentage = totalItems > 0 ? Math.round((deliveredCount / totalItems) * 100) : 0

  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0)
  const completedAmount = items.reduce((sum, item) => sum + (item.workCompletionAmount || 0), 0)

  // Calculate overall completion based on amount ratio (matching backend logic)
  const overallCompletion =
    totalAmount > 0 ? Number(((completedAmount / totalAmount) * 100).toFixed(2)) : 0

  // Count items where material is not delivered and item is delayed (end date passed)
  const materialNotDeliveredCount = items.filter((item) => {
    return isDelayed(item) && item.materialStatus === 'Not Delivered'
  }).length

  // Count items where material is delivered but work is not 100% complete
  const deliveredIncompleteCount = items.filter((item) => {
    return (
      isDelayed(item) &&
      item.materialStatus === 'Delivered' &&
      (item.workCompletionPercentage || 0) < 100
    )
  }).length

  return {
    totalItems,
    deliveredCount,
    deliveredPercentage,
    overallCompletion,
    totalAmount,
    completedAmount,
    materialNotDeliveredCount,
    deliveredIncompleteCount,
  }
})

const fetchLineItems = async () => {
  loading.value = true
  error.value = null

  try {
    const siteName = route.params.siteName
    const params = siteName ? { siteName } : {}
    const response = await axios.get(`${props.apiBaseUrl}/line-items/site`, { params })
    lineItems.value = response.data
    generateWeekOptions()
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

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const clearFilters = () => {
  filters.value = {
    search: '',
    category: '',
    materialStatus: '',
    completionRange: '',
    weekFilter: '',
  }
}

const openEditModal = (item) => {
  editingItem.value = {
    ...item,
    startDate: item.startDate ? item.startDate.split('T')[0] : '',
    endDate: item.endDate ? item.endDate.split('T')[0] : '',
  }
}

const updateLineItem = async () => {
  loading.value = true
  try {
    const response = await axios.put(
      `${props.apiBaseUrl}/line-items/${editingItem.value._id}`,
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

const deleteItem = async (id) => {
  if (!confirm('Are you sure you want to delete this item?')) return

  try {
    await axios.delete(`${props.apiBaseUrl}/line-items/${id}`)
    await fetchLineItems()
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to delete item'
  }
}

// Check if item is delayed (end date passed but not 100% complete)
const isDelayed = (item) => {
  if (!item.endDate) return false
  const endDate = new Date(item.endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)

  return endDate < today && (item.workCompletionPercentage || 0) < 100
}

// photos start
const photoState = ref({
  open: false,
  lineItemId: null,
  itemData: null,
})

const ASSET_BASE_URL = props.apiBaseUrl

const openPhotos = (item) => {
  photoState.value = {
    open: true,
    lineItemId: item._id,
    itemData: item,
  }
}

const closePhotos = () => {
  photoState.value = {
    open: false,
    lineItemId: null,
    itemData: null,
  }
}

const handlePhotosUpdated = () => {
  console.log('Photos updated - refresh your data')
  fetchLineItems()
}

const handleError = (errorMsg) => {
  error.value = errorMsg
}
// photos end

onMounted(() => {
  fetchLineItems()
})
</script>
