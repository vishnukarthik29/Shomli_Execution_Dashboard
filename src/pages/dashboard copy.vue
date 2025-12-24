<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 class="text-3xl font-bold text-gray-900">Project Execution Dashboard</h1>

        <!-- Tabs -->
        <div class="mt-4 flex space-x-4 border-b">
          <button
            @click="activeTab = 'dashboard'"
            :class="[
              'pb-2 px-4 font-medium transition-colors',
              activeTab === 'dashboard'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800',
            ]"
          >
            Dashboard
          </button>
          <button
            @click="activeTab = 'upload'"
            :class="[
              'pb-2 px-4 font-medium transition-colors',
              activeTab === 'upload'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800',
            ]"
          >
            Upload Excel
          </button>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      <div
        class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded flex justify-between items-center"
      >
        <span>{{ error }}</span>
        <button @click="error = ''" class="text-red-800 hover:text-red-900">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Dashboard Tab -->
      <div v-if="activeTab === 'dashboard'">
        <!-- Site Filter -->
        <div class="mb-6 flex items-center gap-4">
          <label class="font-medium text-gray-700">Filter by Site:</label>
          <select
            v-model="selectedSite"
            @change="fetchData"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Sites</option>
            <option v-for="site in sites" :key="site" :value="site">
              {{ site }}
            </option>
          </select>
        </div>

        <!-- Summary Cards -->
        <div v-if="summary" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-sm font-medium text-gray-600 mb-2">Total Project Value</h3>
            <p class="text-3xl font-bold text-gray-900">
              {{ formatCurrency(summary.totalProjectValue) }}
            </p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-sm font-medium text-gray-600 mb-2">Work Completion %</h3>
            <p class="text-3xl font-bold text-green-600">
              {{ summary.totalWorkCompletionPercentage }}%
            </p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-sm font-medium text-gray-600 mb-2">Work Completion Amount</h3>
            <p class="text-3xl font-bold text-blue-600">
              {{ formatCurrency(summary.totalWorkCompletionAmount) }}
            </p>
          </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
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
                    {{ formatCurrency(item.rate) }}
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap text-sm font-medium">
                    {{ formatCurrency(item.amount) }}
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap text-sm">
                    <span
                      :class="[
                        'px-2 py-1 rounded-full text-xs',
                        item.materialStatus === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : item.materialStatus === 'In Progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800',
                      ]"
                    >
                      {{ item.materialStatus }}
                    </span>
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap text-sm">{{ item.workStatusInUnits }}</td>
                  <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {{ item.workCompletionPercentage }}%
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {{ formatCurrency(item.workCompletionAmount) }}
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap text-sm">
                    <div class="flex gap-1">
                      <button
                        @click="openPhotoModal(item, 'materialPhoto')"
                        class="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Material Photos"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span class="text-xs">{{ item.materialPhoto.length }}</span>
                      </button>
                      <button
                        @click="openPhotoModal(item, 'workCompletionPhoto')"
                        class="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Work Photos"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span class="text-xs">{{ item.workCompletionPhoto.length }}</span>
                      </button>
                      <button
                        @click="openPhotoModal(item, 'finishedPhoto')"
                        class="p-1 text-purple-600 hover:bg-purple-50 rounded"
                        title="Finished Photos"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span class="text-xs">{{ item.finishedPhoto.length }}</span>
                      </button>
                    </div>
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
                        @click="deleteLineItem(item._id)"
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

          <div v-if="lineItems.length === 0 && !loading" class="text-center py-12 text-gray-500">
            No line items found. Upload an Excel file to get started.
          </div>
        </div>
      </div>

      <!-- Upload Tab -->
      <div v-if="activeTab === 'upload'" class="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Upload Excel File</h2>

        <div class="space-y-6">
          <!-- Site Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Site Name * </label>
            <div class="space-y-3">
              <div class="flex items-center">
                <input
                  type="radio"
                  id="existing"
                  value="existing"
                  v-model="uploadMode"
                  class="mr-2"
                />
                <label for="existing" class="text-sm">Select Existing Site</label>
              </div>

              <select
                v-if="uploadMode === 'existing'"
                v-model="uploadSiteName"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a site...</option>
                <option v-for="site in sites" :key="site" :value="site">
                  {{ site }}
                </option>
              </select>

              <div class="flex items-center">
                <input type="radio" id="new" value="new" v-model="uploadMode" class="mr-2" />
                <label for="new" class="text-sm">Enter New Site</label>
              </div>

              <input
                v-if="uploadMode === 'new'"
                type="text"
                v-model="uploadNewSite"
                placeholder="Enter new site name"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- File Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Excel File * </label>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <svg
                class="mx-auto h-12 w-12 text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <input
                type="file"
                accept=".xlsx,.xls"
                @change="handleFileChange"
                class="hidden"
                id="file-upload"
                ref="fileInput"
              />
              <label
                for="file-upload"
                class="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
              >
                Click to upload
              </label>
              <p class="text-sm text-gray-500 mt-1">or drag and drop</p>
              <p class="text-xs text-gray-400 mt-2">Excel files only (.xlsx, .xls)</p>

              <div v-if="uploadFile" class="mt-4 text-sm text-gray-700">
                Selected: <strong>{{ uploadFile.name }}</strong>
              </div>
            </div>
          </div>

          <!-- Expected Headers Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="font-medium text-blue-900 mb-2">Expected Excel Headers:</h4>
            <p class="text-sm text-blue-800">
              S.NO, Project Name, Category, Item Description, Quantity, Units, Rate, Amount,
              Material Status, Work Status in Units, Work Completion %
            </p>
          </div>

          <!-- Submit Button -->
          <button
            @click="handleExcelUpload"
            :disabled="loading || !uploadFile"
            class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {{ loading ? 'Uploading...' : 'Upload Excel File' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="editingItem"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
        <h3 class="text-xl font-bold mb-4">Edit Line Item</h3>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Material Status</label>
            <select v-model="editingItem.materialStatus" class="w-full px-3 py-2 border rounded-lg">
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
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

          <div>
            <label class="block text-sm font-medium mb-1">Work Completion %</label>
            <input
              type="number"
              min="0"
              max="100"
              v-model.number="editingItem.workCompletionPercentage"
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

    <!-- Photo Modal -->
    <div
      v-if="photoModal.open"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">
            {{
              photoModal.type === 'materialPhoto'
                ? 'Material Photos'
                : photoModal.type === 'workCompletionPhoto'
                  ? 'Work Completion Photos'
                  : 'Finished Photos'
            }}
          </h3>
          <button @click="photoModal.open = false">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="mb-4">
          <input
            type="file"
            accept="image/*"
            multiple
            @change="handlePhotoUpload"
            class="hidden"
            id="photo-upload"
            ref="photoInput"
          />
          <label
            for="photo-upload"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Photos
          </label>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="(photo, idx) in photoModal.item[photoModal.type]"
            :key="idx"
            class="relative group"
          >
            <img
              :src="`${apiBaseUrl.replace('/api', '')}${photo}`"
              :alt="`Photo ${idx + 1}`"
              class="w-full h-48 object-cover rounded-lg"
            />
            <button
              @click="deletePhoto(photo)"
              class="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
        </div>

        <p
          v-if="photoModal.item[photoModal.type].length === 0"
          class="text-center text-gray-500 py-8"
        >
          No photos uploaded yet
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      apiBaseUrl: '/gateway/api',
      activeTab: 'dashboard',
      loading: false,
      error: '',

      // Dashboard data
      summary: null,
      lineItems: [],
      sites: [],
      selectedSite: '',

      // Upload data
      uploadFile: null,
      uploadSiteName: '',
      uploadNewSite: '',
      uploadMode: 'existing',

      // Modals
      editingItem: null,
      photoModal: {
        open: false,
        item: null,
        type: '',
      },
    }
  },
  mounted() {
    this.fetchSites()
    this.fetchData()
  },
  methods: {
    async fetchSites() {
      try {
        const response = await fetch(`${this.apiBaseUrl}/sites`)
        this.sites = await response.json()
      } catch (err) {
        console.error('Failed to fetch sites:', err)
      }
    },

    async fetchData() {
      await this.fetchSummary()
      await this.fetchLineItems()
    },

    async fetchSummary() {
      this.loading = true
      try {
        const url = this.selectedSite
          ? `${this.apiBaseUrl}/dashboard/summary?siteName=${encodeURIComponent(this.selectedSite)}`
          : `${this.apiBaseUrl}/dashboard/summary`
        const response = await fetch(url)
        this.summary = await response.json()
      } catch (err) {
        this.error = 'Failed to fetch summary'
      } finally {
        this.loading = false
      }
    },

    async fetchLineItems() {
      this.loading = true
      try {
        const url = this.selectedSite
          ? `${this.apiBaseUrl}/line-items?siteName=${encodeURIComponent(this.selectedSite)}`
          : `${this.apiBaseUrl}/line-items`
        const response = await fetch(url)
        this.lineItems = await response.json()
      } catch (err) {
        this.error = 'Failed to fetch line items'
      } finally {
        this.loading = false
      }
    },

    handleFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          this.uploadFile = file
          this.error = ''
        } else {
          this.error = 'Please upload an Excel file (.xlsx or .xls)'
          this.uploadFile = null
        }
      }
    },

    async handleExcelUpload() {
      const siteName = this.uploadMode === 'existing' ? this.uploadSiteName : this.uploadNewSite

      if (!this.uploadFile || !siteName) {
        this.error = 'Please select a file and enter site name'
        return
      }

      this.loading = true
      this.error = ''

      const formData = new FormData()
      formData.append('file', this.uploadFile)
      formData.append('siteName', siteName)

      try {
        const response = await fetch(`${this.apiBaseUrl}/upload/excel`, {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (response.ok) {
          alert(`${data.message}${data.errors ? '\n\nWarnings:\n' + data.errors.join('\n') : ''}`)
          this.uploadFile = null
          this.uploadSiteName = ''
          this.uploadNewSite = ''
          this.$refs.fileInput.value = ''
          await this.fetchSites()
          this.activeTab = 'dashboard'
          await this.fetchData()
        } else {
          this.error = data.error || 'Upload failed'
        }
      } catch (err) {
        this.error = 'Failed to upload file: ' + err.message
      } finally {
        this.loading = false
      }
    },

    openEditModal(item) {
      this.editingItem = { ...item }
    },

    async updateLineItem() {
      this.loading = true
      try {
        const response = await fetch(`${this.apiBaseUrl}/line-items/${this.editingItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.editingItem),
        })

        if (response.ok) {
          await this.fetchData()
          this.editingItem = null
        } else {
          const data = await response.json()
          this.error = data.error || 'Update failed'
        }
      } catch (err) {
        this.error = 'Failed to update line item'
      } finally {
        this.loading = false
      }
    },

    //     async deleteLineItem(id) {
    //       if (!confirm('Are you sure you want to delete this line item?')) return;

    //       this.loading = true;
    //       try {
    //         const response = await fetch(`${this.apiBaseUrl}/line-items/${id}`, {
    //           method: 'DELETE',
    //         });

    //         if (response.ok) {
    //           await this.fetchData();
    //         } else {
    //           this.error = 'Failed to delete line item';}
    //           finally {
    // this.loading = false;
    // }
    // },
    openPhotoModal(item, type) {
      this.photoModal = {
        open: true,
        item: { ...item },
        type,
      }
    },

    async handlePhotoUpload(event) {
      const files = event.target.files
      if (files.length === 0) return

      const formData = new FormData()
      formData.append('lineItemId', this.photoModal.item._id)
      formData.append('photoType', this.photoModal.type)

      for (let i = 0; i < files.length; i++) {
        formData.append('photos', files[i])
      }

      try {
        const response = await fetch(`${this.apiBaseUrl}/upload/photos`, {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          await this.fetchLineItems()
          this.photoModal.open = false
          this.$refs.photoInput.value = ''
        } else {
          const data = await response.json()
          this.error = data.error || 'Photo upload failed'
        }
      } catch (err) {
        this.error = 'Failed to upload photos'
      }
    },

    async deletePhoto(photoUrl) {
      if (!confirm('Delete this photo?')) return

      try {
        const response = await fetch(`${this.apiBaseUrl}/upload/photos`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lineItemId: this.photoModal.item._id,
            photoType: this.photoModal.type,
            photoUrl,
          }),
        })

        if (response.ok) {
          await this.fetchLineItems()
          // Update modal data
          const updatedItem = this.lineItems.find((item) => item._id === this.photoModal.item._id)
          if (updatedItem) {
            this.photoModal.item = { ...updatedItem }
          }
        } else {
          this.error = 'Failed to delete photo'
        }
      } catch (err) {
        this.error = 'Failed to delete photo'
      }
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
      }).format(value)
    },
  },
}
</script>
