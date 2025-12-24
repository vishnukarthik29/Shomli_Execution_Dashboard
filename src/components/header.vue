<!-- components/AppHeader.vue -->
<template>
  <div class="bg-white shadow">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">Project Execution Dashboard</h1>

        <!-- Navigation Buttons -->
        <div class="flex gap-3">
          <RouterLink to="/" :class="[baseBtnClass, isActive('/') ? activeClass : inactiveClass]">
            Dashboard
          </RouterLink>

          <RouterLink
            to="/uploadsite"
            :class="[baseBtnClass, isActive('/uploadsite') ? activeClass : inactiveClass]"
          >
            Upload Excel
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'

export default {
  name: 'AppHeader',
  setup() {
    const route = useRoute()

    const isActive = (path) => route.path === path

    return {
      isActive,
      baseBtnClass: 'px-6 py-2 rounded-lg text-sm font-medium transition-all',
      activeClass: 'bg-blue-600 text-white shadow-md',
      inactiveClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    }
  },
}
</script>
