<!-- components/AppHeader.vue -->
<template>
  <div class="bg-white shadow">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">Project Execution Dashboard</h1>

        <!-- Navigation Buttons -->
        <div class="flex gap-3">
          <button
            @click="$emit('update:active-tab', 'dashboard')"
            :class="[
              'px-6 py-2 rounded-lg font-small transition-all',
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            ]"
          >
            Dashboard
          </button>
          <button
            @click="$emit('update:active-tab', 'upload')"
            :class="[
              'px-6 py-2 rounded-lg font-small transition-all',
              activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            ]"
          >
            Upload Excel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
    activeTab: {
      type: String,
      required: true,
    },
  },
  emits: ['update:active-tab'],
}
</script>
