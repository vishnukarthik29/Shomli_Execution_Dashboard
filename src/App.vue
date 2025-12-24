<!-- App.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header (hide only on detail pages if needed) -->
    <AppHeader v-if="!isDetailPage" />

    <!-- Error Display -->
    <div v-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      <div
        class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded flex justify-between items-center"
      >
        <span>{{ error }}</span>
        <button @click="error = ''" class="text-red-800 hover:text-red-900">✕</button>
      </div>
    </div>

    <!-- Main Router View -->
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <router-view @error="error = $event" />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/header.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
  },
  setup() {
    const route = useRoute()

    const isDetailPage = computed(() =>
      ['site-line-items', 'site-line-items-upload'].includes(route.name),
    )

    return {
      isDetailPage,
    }
  },
  data() {
    return {
      error: '',
    }
  },
}
</script>
