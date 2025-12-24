<!-- App.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader :active-tab="activeTab" @update:active-tab="activeTab = $event" />

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
      <DashboardView
        v-if="activeTab === 'dashboard'"
        :api-base-url="apiBaseUrl"
        @error="error = $event"
      />

      <UploadView
        v-if="activeTab === 'upload'"
        :api-base-url="apiBaseUrl"
        @error="error = $event"
        @upload-success="handleUploadSuccess"
      />
    </div>
  </div>
</template>

<script>
import AppHeader from '@/components/header.vue'
import DashboardView from '@/pages/dashboard.vue'
import UploadView from '@/components/UploadView.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    DashboardView,
    UploadView,
  },
  data() {
    return {
      apiBaseUrl: '/gateway/api',
      activeTab: 'dashboard',
      error: '',
    }
  },
  methods: {
    handleUploadSuccess() {
      this.activeTab = 'dashboard'
      this.error = ''
    },
  },
}
</script>
