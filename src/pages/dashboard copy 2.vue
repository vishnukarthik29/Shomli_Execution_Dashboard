<!-- components/DashboardView.vue -->
<template>
  <div>
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

    <!-- Statistics Cards -->
    <StatisticsCards v-if="summary" :summary="summary" />

    <!-- Data Table -->
    <SummaryTable
      :line-items="lineItems"
      :loading="loading"
      @open-edit-modal="openEditModal"
      @open-photo-modal="openPhotoModal"
      @delete-item="deleteLineItem"
    />

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
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
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
import StatisticsCards from '@/components/StatisticsCard.vue'
import SummaryTable from '@/components/summaryTable.vue'

export default {
  name: 'DashboardView',
  components: {
    StatisticsCards,
    SummaryTable,
  },
  props: {
    apiBaseUrl: {
      type: String,
      required: true,
    },
  },
  emits: ['error'],
  data() {
    return {
      loading: false,
      summary: null,
      lineItems: [],
      sites: [],
      selectedSite: '',
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
        this.$emit('error', 'Failed to fetch summary')
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
        this.$emit('error', 'Failed to fetch line items')
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
          this.$emit('error', data.error || 'Update failed')
        }
      } catch (err) {
        this.$emit('error', 'Failed to update line item')
      } finally {
        this.loading = false
      }
    },

    async deleteLineItem(id) {
      if (!confirm('Are you sure you want to delete this line item?')) return

      this.loading = true
      try {
        const response = await fetch(`${this.apiBaseUrl}/line-items/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await this.fetchData()
        } else {
          this.$emit('error', 'Failed to delete line item')
        }
      } catch (err) {
        this.$emit('error', 'Failed to delete line item')
      } finally {
        this.loading = false
      }
    },

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
          this.$emit('error', data.error || 'Photo upload failed')
        }
      } catch (err) {
        this.$emit('error', 'Failed to upload photos')
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
          const updatedItem = this.lineItems.find((item) => item._id === this.photoModal.item._id)
          if (updatedItem) {
            this.photoModal.item = { ...updatedItem }
          }
        } else {
          this.$emit('error', 'Failed to delete photo')
        }
      } catch (err) {
        this.$emit('error', 'Failed to delete photo')
      }
    },
  },
}
</script>
