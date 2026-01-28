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
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Materials Tracking</h1>
      <p class="text-gray-600 mt-1">View all unique materials across projects</p>
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
                Total Quantity
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
                Used In
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(item, index) in filteredMaterials" :key="index">
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ index + 1 }}</td>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ item.materialName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                {{ item.quantity.toFixed(2) }} {{ item.unit }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  @click="handleTdsClick(item)"
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': item.tdsCertificate === 'yes',
                    'bg-blue-100 text-blue-800': item.tdsCertificate === 'Submitted',
                    'bg-yellow-100 text-yellow-800': item.tdsCertificate === 'no',
                    'bg-red-100 text-red-800': item.tdsCertificate === 'Rejected',
                  }"
                >
                  {{ item.tdsCertificate }}
                </button>
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  @click="handleSampleClick(item)"
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': item.samples === 'yes',
                    'bg-blue-100 text-blue-800': item.samples === 'Submitted',
                    'bg-yellow-100 text-yellow-800': item.samples === 'no',
                    'bg-red-100 text-red-800': item.samples === 'Rejected',
                  }"
                >
                  {{ item.samples }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  @click="handleShopDrawingClick(item)"
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="{
                    'bg-purple-100 text-purple-800': item.shopDrawing === 'Internal',
                    'bg-indigo-100 text-indigo-800': item.shopDrawing === 'External',
                    'bg-gray-100 text-gray-800': item.shopDrawing === 'Not Required',
                  }"
                >
                  {{ item.shopDrawing }}
                </button>
              </td>
              <td class="px-6 py-4 text-sm">
                <button
                  @click="toggleExpanded(index)"
                  class="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>{{ item.usedInItems.length }} items</span>
                  <svg
                    class="w-4 h-4 transition-transform"
                    :class="{ 'rotate-180': expandedRow === index }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </td>
            </tr>
            <!-- Expanded Row Details -->
            <tr v-if="expandedRow === index" :key="`expanded-${index}`">
              <td colspan="7" class="px-6 py-4 bg-gray-50">
                <div class="space-y-2">
                  <p class="text-sm font-medium text-gray-700 mb-2">Used in following items:</p>
                  <div
                    v-for="(usage, usageIndex) in item.usedInItems"
                    :key="usageIndex"
                    class="text-sm text-gray-600 pl-4"
                  >
                    <span class="font-medium">{{ usage.itemDescription }}</span> - Qty:
                    {{ usage.quantity }}
                  </div>
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
    <TDSCertificate
      :show="showTdsModal"
      :material="selectedMaterial"
      @close="showTdsModal = false"
      @send="handleSendMail"
    />
    <Sample
      :show="showSampleModal"
      :material="selectedMaterial"
      @close="showSampleModal = false"
      @submit="handleSampleSubmit"
    />
    <ShopDrawing
      :show="showShopDrawingModal"
      :material="selectedMaterial"
      @close="showShopDrawingModal = false"
      @submit="handleShopDrawingSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import TDSCertificate from './TDSCertificate.vue'
import Sample from './Sample.vue'
import ShopDrawing from './ShopDrawing.vue'

const props = defineProps({
  apiBaseUrl: {
    type: String,
    default: '/gateway/api',
  },
})
const showTdsModal = ref(false)
const showSampleModal = ref(false)
const showShopDrawingModal = ref(false)
const selectedMaterial = ref(null)
const activeTab = ref('mail')

const mailForm = ref({
  to: '',
  cc: '',
  subject: '',
  content: '',
  file: null,
})
const handleFileUpload = (e) => {
  mailForm.value.file = e.target.files[0]
}

const materials = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const expandedRow = ref(null)

const filters = ref({
  tdsCertificate: '',
  shopDrawing: '',
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
    const response = await axios.get(`${props.apiBaseUrl}/materials/unique`)
    materials.value = response.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to fetch materials'
    console.error('Error fetching materials:', err)
  } finally {
    loading.value = false
  }
}

const toggleExpanded = (index) => {
  expandedRow.value = expandedRow.value === index ? null : index
}

const handleTdsClick = (item) => {
  if (item.tdsCertificate !== 'yes') return

  selectedMaterial.value = item
  showTdsModal.value = true
}
const handleSampleClick = (item) => {
  if (item.samples !== 'yes') return

  selectedMaterial.value = item
  showSampleModal.value = true
}
const handleShopDrawingClick = (item) => {
  if (item.shopDrawing === 'Not Required') return

  selectedMaterial.value = item
  showShopDrawingModal.value = true
}

const handleSendMail = async (payload) => {
  const formData = new FormData()

  formData.append('to', payload.to)
  formData.append('cc', payload.cc)
  formData.append('subject', payload.subject)
  formData.append('content', payload.content)
  formData.append('file', payload.file)
  formData.append('material', payload.material.materialName)

  try {
    await axios.post(`${props.apiBaseUrl}/materials/send-tds-mail`, formData)
    alert('Mail sent successfully')
    showTdsModal.value = false
  } catch (err) {
    alert('Failed to send mail')
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
